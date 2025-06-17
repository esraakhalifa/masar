import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { validateCSRFToken, CSRF_COOKIE } from '@/app/lib/security/csrf';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Validate CSRF token
    const csrfToken = request.headers.get('X-CSRF-Token');
    const storedToken = request.cookies.get(CSRF_COOKIE)?.value;

    if (!csrfToken || !storedToken) {
      console.error('CSRF token missing', { csrfToken, storedToken });
      return NextResponse.json(
        { error: 'CSRF token is required' },
        { status: 403 }
      );
    }

    const isValid = validateCSRFToken(csrfToken, storedToken);
    if (!isValid) {
      console.error('CSRF token invalid', { csrfToken, storedToken });
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }

    // Get the user session
    const session = await getServerSession(authOptions);
    console.log('Session:', session); // Debug log

    if (!session?.user?.id) {
      console.error('No user session found');
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    const { price, productName } = await request.json();
    console.log('Creating checkout session', { price, productName, userId: session.user.id });

    // Find the subscription plan
    const plan = await prisma.subscriptionPlan.findFirst({
      where: {
        amount: price,
        currency: 'USD',
      },
    });

    if (!plan) {
      console.error('Subscription plan not found', { price });
      return NextResponse.json(
        { error: 'Subscription plan not found' },
        { status: 400 }
      );
    }

    // Create a checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: productName,
            },
            unit_amount: price, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${request.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/payment`,
      metadata: {
        planId: plan.id,
        userId: session.user.id,
      },
      customer_email: session.user.email || undefined,
    });

    console.log('Checkout session created', { 
      sessionId: stripeSession.id,
      userId: session.user.id,
      planId: plan.id 
    });

    return NextResponse.json({ sessionId: stripeSession.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create checkout session' },
      { status: 500 }
    );
  }
} 