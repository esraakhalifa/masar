import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { validateCSRFToken, CSRF_COOKIE } from '@/app/lib/security/csrf';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

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

    const { price, productName } = await request.json();
    console.log('Creating checkout session', { price, productName });

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: productName,
            },
            unit_amount: price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${request.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/payment`,
    });

    console.log('Checkout session created', { sessionId: session.id });
    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create checkout session' },
      { status: 500 }
    );
  }
} 