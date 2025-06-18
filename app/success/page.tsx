'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Layout from '../../components/Layout';
import { CheckCircle } from 'lucide-react';

export default function SuccessPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      return;
    }

    // Verify the payment status
    const verifyPayment = async () => {
      try {
        const response = await fetch(`/api/verify-payment?session_id=${sessionId}`);
        if (!response.ok) {
          throw new Error('Payment verification failed');
        }
        setStatus('success');
      } catch (error) {
        console.error('Error verifying payment:', error);
        setStatus('error');
      }
    };

    verifyPayment();
  }, [sessionId]);

  return (
<Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 mx-auto mb-4" style={{borderColor: '#2434B3'}}></div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment</h1>
              <p className="text-gray-600">Please wait while we confirm your payment...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{backgroundColor: 'rgba(36, 52, 179, 0.1)'}}>
                <CheckCircle className="w-8 h-8" style={{color: '#2434B3'}} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
              <p className="text-gray-600 mb-6">Thank you for your purchase</p>
              <a
                href="/dashboard"
                className="inline-block text-white px-6 py-3 rounded-lg font-medium transition-colors"
                style={{
                  background: 'linear-gradient(to right, #2434B3, #FF4B36)'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.background = 'linear-gradient(to right, #1e29a3, #e6412d)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.background = 'linear-gradient(to right, #2434B3, #FF4B36)';
                }}
              >
                Show Your Roadmap
              </a>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{backgroundColor: 'rgba(255, 75, 54, 0.1)'}}>
                <svg className="w-8 h-8" style={{color: '#FF4B36'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Verification Failed</h1>
              <p className="text-gray-600 mb-6">There was an error verifying your payment. Please contact support.</p>
              <a
                href="/payment"
                className="inline-block text-white px-6 py-3 rounded-lg font-medium transition-colors"
                style={{
                  background: 'linear-gradient(to right, #2434B3, #FF4B36)'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.background = 'linear-gradient(to right, #1e29a3, #e6412d)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.background = 'linear-gradient(to right, #2434B3, #FF4B36)';
                }}
              >
                Try Again
              </a>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
} 