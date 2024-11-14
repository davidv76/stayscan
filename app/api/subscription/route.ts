import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@clerk/nextjs/server"
import prisma from '@/lib/prisma'
import { Prisma, User, Subscription } from '@prisma/client'
import { Stripe } from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-09-30.acacia',
})

// Helper function to handle errors
const handleError = (error: unknown, message: string) => {
  console.error(`${message}:`, error)
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return NextResponse.json({ error: `Prisma error: ${error.message}`, code: error.code }, { status: 400 })
  } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    return NextResponse.json({ error: `Unknown Prisma error: ${error.message}` }, { status: 500 })
  }
  return NextResponse.json({ error: message }, { status: 500 })
}

// Helper function to retry database operations
const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  let lastError: unknown
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      if (error instanceof Prisma.PrismaClientKnownRequestError &&
          (error.code === 'P2024' || error.message.includes('prepared statement'))) {
        console.warn(`Retrying operation, attempt ${i + 1} of ${maxRetries}`)
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
      throw error
    }
  }
  throw lastError
}

// Middleware to check authentication
const checkAuth = (handler: (userId: string, request: NextRequest) => Promise<NextResponse>) => {
  return async (request: NextRequest) => {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return handler(userId, request)
  }
}

// Helper function to create a free subscription
const createFreeSubscription = async (userId: User['id']): Promise<Subscription> => {
  return await retryOperation(() =>
    prisma.subscription.create({
      data: {
        userId,
        name: 'Free',
        price: 0,
        propertyLimit: 1,
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      },
    })
  )
}

// Helper function to update subscription from Stripe
const updateSubscriptionFromStripe = async (subscription: Subscription): Promise<Subscription> => {
  const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId!)
  const price = await stripe.prices.retrieve(stripeSubscription.items.data[0].price.id)
  const product = await stripe.products.retrieve(price.product as string)

  return await retryOperation(() =>
    prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        name: product.name,
        price: price.unit_amount ? price.unit_amount / 100 : 0,
        propertyLimit: parseInt(product.metadata.propertyLimit || '1'),
        status: stripeSubscription.status,
        stripePriceId: price.id,
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      },
    })
  )
}

export const GET = checkAuth(async (userId: string) => {
  try {
    const user = await retryOperation<(User & { subscription: Subscription | null }) | null>(() =>
      prisma.user.findUnique({
        where: { clerkId: userId },
        include: { subscription: true },
      })
    )

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!user.subscription) {
      const freeSubscription = await createFreeSubscription(user.id)
      return NextResponse.json(freeSubscription)
    }

    if (user.subscription.stripeSubscriptionId) {
      const updatedSubscription = await updateSubscriptionFromStripe(user.subscription)
      console.log('Subscription updated from Stripe:', JSON.stringify(updatedSubscription, null, 2))
      return NextResponse.json(updatedSubscription)
    }

    return NextResponse.json(user.subscription)
  } catch (error) {
    return handleError(error, 'Failed to fetch subscription')
  }
})

export const POST = checkAuth(async (userId: string, request: NextRequest) => {
  try {
    const body = await request.json()
    const { stripeCustomerId } = body

    if (!stripeCustomerId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const user = await retryOperation<User | null>(() =>
      prisma.user.findUnique({
        where: { clerkId: userId },
      })
    )

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const subscription = await retryOperation(() =>
      prisma.subscription.upsert({
        where: { userId: user.id },
        update: { stripeCustomerId },
        create: {
          userId: user.id,
          stripeCustomerId,
          name: 'Free',
          price: 0,
          propertyLimit: 1,
          status: 'active',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        },
      })
    )

    console.log('Subscription created/updated:', JSON.stringify(subscription, null, 2))
    return NextResponse.json(subscription)
  } catch (error) {
    return handleError(error, 'Failed to update subscription')
  }
})

export const runtime = 'nodejs'