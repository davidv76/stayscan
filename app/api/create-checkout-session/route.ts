import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from "@clerk/nextjs/server"
import Stripe from 'stripe'
import prisma from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-09-30.acacia',
})

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { priceId, name, price, propertyLimit} = body;

    console.log("plaen name: ", name)
    if (!priceId || !name) {
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { subscription: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let customer;
    if (user.subscription?.stripeCustomerId) {
      customer = await stripe.customers.retrieve(user.subscription.stripeCustomerId)
    } else {
      // Fetch the user's email from Clerk
      const clerkUser = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        },
      }).then(res => res.json())

      customer = await stripe.customers.create({
        email: clerkUser.email_addresses[0].email_address,
        metadata: {
          userId: user.id,
        },
      });


   await prisma.subscription.upsert({
        where: { userId: user.id },
        update: { stripeCustomerId: customer.id },
        create: {
          userId: user.id,
          stripeCustomerId: customer.id,
          stripePriceId: priceId,
          status: name !== 'free' ? 'active' : 'inactive',
          name: name,
          price: price,
          propertyLimit: propertyLimit,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        },
      })
    };



    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      // success_url: `http://localhost:3000/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      // cancel_url: `http://localhost:3000/dashboard`,
      metadata: {
        userId: user.id,
      },
    });

    console.log('session: ',session);

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

export const runtime = 'edge'

