import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Get the user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.error('No user session found');
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    // Retrieve the Stripe session
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (stripeSession.payment_status !== 'paid') {
      console.error('Payment not completed', { sessionId, status: stripeSession.payment_status });
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Verify that the session belongs to the current user
    if (stripeSession.metadata?.userId !== session.user.id) {
      console.error('Session user mismatch', { 
        sessionUserId: stripeSession.metadata?.userId, 
        currentUserId: session.user.id 
      });
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 403 }
      );
    }

    // Get the payment intent details
    const paymentIntent = await stripe.paymentIntents.retrieve(stripeSession.payment_intent as string);

    // Find the subscription plan
    const plan = await prisma.subscriptionPlan.findFirst({
      where: {
        id: stripeSession.metadata?.planId,
      },
    });

    if (!plan) {
      console.error('Subscription plan not found', { planId: stripeSession.metadata?.planId });
      return NextResponse.json(
        { error: 'Subscription plan not found' },
        { status: 400 }
      );
    }

    // Calculate subscription period
    const now = new Date();
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1); // Assuming monthly subscription

    // Save payment details in the database
    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        planId: plan.id,
        stripePaymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount / 100, // Convert from cents to dollars
        currency: paymentIntent.currency.toUpperCase(),
        status: 'completed',
        paymentDate: now,
        periodStart: now,
        periodEnd: periodEnd,
      },
    });

    console.log('Payment saved successfully', {
      paymentId: payment.id,
      userId: session.user.id,
      planId: plan.id,
      amount: payment.amount
    });

    return NextResponse.json({ 
      success: true,
      payment: {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        periodEnd: payment.periodEnd,
      }
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
} 