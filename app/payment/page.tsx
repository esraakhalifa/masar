'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import Layout from '../../components/Layout';
import { CreditCard, Loader2 } from 'lucide-react';

// Initialize Stripe
console.log('Stripe key:', process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function PaymentPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  // Fetch CSRF token on component mount
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch('/api/csrf', {
          credentials: 'include', // Important: This ensures cookies are sent with the request
        });
        if (!response.ok) {
          throw new Error('Failed to fetch CSRF token');
        }
        const data = await response.json();
        setCsrfToken(data.token);
      } catch (err) {
        console.error('Failed to fetch CSRF token:', err);
        setError('Failed to initialize payment system');
      }
    };
    fetchCsrfToken();
  }, []);

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!csrfToken) {
        throw new Error('Payment system not initialized');
      }

      console.log('Creating checkout session...');
      // Create a checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({
          price: selectedPlan === 'monthly' ? 1000 : 10000,
          productName: `Career Roadmap Premium - ${selectedPlan === 'monthly' ? 'Monthly' : 'Yearly'} Plan`,
        }),
      });

      const data = await response.json();
      console.log('Checkout session response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      const { sessionId } = data;
      console.log('Initializing Stripe...');
      const stripe = await stripePromise;

      if (!stripe) {
        throw new Error('Stripe failed to initialize');
      }

      console.log('Redirecting to Stripe Checkout...');
      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (error) {
        console.error('Stripe redirect error:', error);
        throw error;
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4" style={{background: 'linear-gradient(to right, #2434B3, #1e29a3)'}}>
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Plan</h1>
            <p className="text-gray-600">Select the plan that best fits your needs</p>
          </div>

          {/* Plan Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 p-1 rounded-lg inline-flex">
              <button
                onClick={() => setSelectedPlan('monthly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedPlan === 'monthly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setSelectedPlan('yearly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedPlan === 'yearly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Yearly
                <span className="ml-1 text-xs text-green-600">Save 20%</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Monthly Plan */}
            <div className={`bg-gray-50 rounded-lg p-6 border-2 transition-all ${
              selectedPlan === 'monthly' ? 'border-blue-500' : 'border-transparent'
            }`}>
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Monthly Plan</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">$10</div>
                <p className="text-gray-600">per month</p>
              </div>

              <ul className="mt-6 space-y-4">
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{color: '#2434B3'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Personalized career roadmap
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{color: '#2434B3'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Skill gap analysis
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{color: '#2434B3'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Learning resources
                </li>

              </ul>
            </div>

            {/* Yearly Plan */}
            <div className={`bg-gray-50 rounded-lg p-6 border-2 transition-all ${
              selectedPlan === 'yearly' ? 'border-blue-500' : 'border-transparent'
            }`}>
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Yearly Plan</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">$100</div>
                <p className="text-gray-600">per year</p>
                {/* <p className="text-sm text-green-600 mt-1">Save $20 compared to monthly</p> */}
              </div>

              <ul className="mt-6 space-y-4">
                  <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{color: '#2434B3'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  All Monthly Plan features
                </li>

                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{color: '#2434B3'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Save $20 compared to monthly
                </li>
              </ul>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-lg mb-6" style={{backgroundColor: '#ffebe9', color: '#FF4B36'}}>
              {error}
            </div>
          )}

          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full text-white py-4 px-6 rounded-lg font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all duration-200"
            style={{
              background: loading 
                ? '#9ca3af' 
                : 'linear-gradient(to right, #2434B3, #FF4B36)'
            }}
            onMouseEnter={(e) => {
              const target = e.target as HTMLButtonElement;
              if (!target.disabled) {
                target.style.background = 'linear-gradient(to right, #1e29a3, #e6412d)';
              }
            }}
            onMouseLeave={(e) => {
              const target = e.target as HTMLButtonElement;
              if (!target.disabled) {
                target.style.background = 'linear-gradient(to right, #2434B3, #FF4B36)';
              }
            }}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                <span>Subscribe Now</span>
              </>
            )}
          </button>

          <p className="text-center text-sm text-gray-500 mt-4">
            Secure payment powered by Stripe. Cancel anytime.
          </p>
        </div>
      </div>
    </Layout>
  );
} 