import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from "@clerk/nextjs/server"
import prisma from '@/lib/prisma'

// Helper function to handle errors
const handleError = (error: unknown, message: string) => {
  console.error(`${message}:`, error)
  if (error instanceof Error) {
    return NextResponse.json({ error: `${message}: ${error.message}` }, { status: 500 })
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
      console.warn(`Retrying operation, attempt ${i + 1} of ${maxRetries}`)
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
    }
  }
  throw lastError
}

// Helper function to get user with subscription
const getUserWithSubscription = (clerkId: string) => {
  return prisma.user.findUnique({
    where: { clerkId },
    include: { subscription: true },
  })
}

// Helper function to upsert user with subscription
const upsertUserWithSubscription = (clerkId: string) => {
  return prisma.user.upsert({
    where: { clerkId },
    update: {},
    create: { 
      clerkId,
      subscription: {
        create: {
          name: 'Free',
          price: 0,
          propertyLimit: 1,
          status: 'active',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        },
      },
    },
    include: {
      subscription: true,
    },
  })
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Attempting to fetch user with clerkId:', userId)
    const user = await retryOperation(() => getUserWithSubscription(userId))

    if (!user) {
      console.log('User not found for clerkId:', userId)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('User fetched:', JSON.stringify(user, null, 2))
    return NextResponse.json(user)
  } catch (error) {
    return handleError(error, 'Failed to fetch user')
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Attempting to upsert user with clerkId:', userId)
    const user = await retryOperation(() => upsertUserWithSubscription(userId))

    console.log('User created/updated:', JSON.stringify(user, null, 2))
    return NextResponse.json(user)
  } catch (error) {
    return handleError(error, 'Failed to create/update user')
  }
}

export const runtime = "nodejs"