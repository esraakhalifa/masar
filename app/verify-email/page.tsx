"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Layout from '../components/Layout';
import OTPInput from '../components/OTPInput';


export default function VerifyEmail() {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !email) {
      setError("Please enter the verification code");
      return;
    }

    if (otp.length !== 6) {
      setError("Please enter a 6-digit verification code");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Verification failed");
      } else {
        setSuccess("Email verified successfully! Redirecting to login...");
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      setError("Email is required");
      return;
    }

    setIsResending(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to resend verification code");
      } else {
        setSuccess("Verification code resent successfully!");
        setCountdown(60); // 60 seconds cooldown
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center px-4 mt-4">
        <main className="flex flex-col items-center justify-center w-full max-w-lg px-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-blue-100 p-8">
            <div className="flex flex-col items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Verify Email</h1>
              <p className="text-gray-500 text-sm text-center">
                We've sent a verification code to your email address.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-blue-50 text-gray-900 p-3 rounded-md border border-blue-200 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-4 text-gray-700 text-center">
                  Verification Code
                </label>
                <OTPInput
                  value={otp}
                  onChange={setOtp}
                  disabled={isLoading}
                  length={6}
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Enter the 6-digit code sent to your email
                </p>
              </div>

              {error && <div className="text-red-500 text-center text-sm">{error}</div>}
              {success && <div className="text-green-500 text-center text-sm">{success}</div>}

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #2434B3 0%, #1a2a8a 100%)' }}
              >
                {isLoading ? "Verifying..." : "Verify Email"}
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">
                  Didn't receive the code?
                </p>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isResending || countdown > 0}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResending
                    ? "Sending..."
                    : countdown > 0
                    ? `Resend in ${countdown}s`
                    : "Resend Code"}
                </button>
              </div>

              <div className="flex justify-center items-center mt-4">
                <p className="text-sm text-gray-500">
                  Already verified?{' '}
                  <a href="/login" className="hover:underline" style={{ color: '#FF4B36' }}>
                    Sign in
                  </a>
                </p>
              </div>
            </form>
          </div>
        </main>
      </div>
    </Layout>
  );
} 