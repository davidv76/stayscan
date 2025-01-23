import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import  prisma  from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-09-30.acacia',
    appInfo: {
      name: 'StayScan Stripe Integration',
      version: '1.0.0',
    },
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  console.log('webhook being called💥💥');
  const rawBody = await req.text()
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'No Stripe signature found' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, sig, webhookSecret)
    console.log('Webhook verified:', event.type)
  } catch (err: unknown) {
    const error = err as Error
    console.error('Webhook signature verification failed:', error.message)
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionChange(subscription)
        break
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutSessionCompleted(session)
        break
      default:
        console.log(`Unhandled event type ${event.type}`)
    }
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  console.log('Processing subscription change:', subscription.id)

  const customerId = subscription.customer as string
  const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer

  if (!customer.metadata.userId) {
    console.error('No userId found in customer metadata')
    return
  }

  const userId = customer.metadata.userId

  const price = await stripe.prices.retrieve(subscription.items.data[0].price.id)
  const productId = price.product as string
  const product = await stripe.products.retrieve(productId);

  console.log('webhook propertry: ', customer.metadata.propertyLimit);
  console.log('webhook product: ', product);

  const subscriptionData = {
    stripeSubscriptionId: subscription.id,
    stripePriceId: subscription.items.data[0].price.id,
    stripeCustomerId: customerId,
    status: subscription.status,
    name: product.name,
    price: price.unit_amount ? price.unit_amount / 100 : 0,
    propertyLimit: parseInt(customer.metadata.propertyLimit || '1'),
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
  }

  try {
    console.log('pushing database')
    const updatedSubscription = await prisma.subscription.upsert({
      where: { userId: userId },
      update: subscriptionData,
      create: { userId, ...subscriptionData },
    })
    console.log('Subscription updated:', JSON.stringify(updatedSubscription, null, 2))
  } catch (error) {
    console.error('Error updating subscription:', error)
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Processing checkout.session.completed:', session.id)
  
  if (session.mode !== 'subscription') {
    console.log('Not a subscription checkout session')
    return
  }

  const subscriptionId = session.subscription as string
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  await handleSubscriptionChange(subscription)
}

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'