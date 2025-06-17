"use client";
import { useState } from "react";
import Layout from "@/components/Layout";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ email: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const errors = { email: "" };
    let hasError = false;

    if (!email.trim()) {
      errors.email = "Email is required";
      hasError = true;
    } else if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
      errors.email = "Invalid email address";
      hasError = true;
    }
    setFieldErrors(errors);
    if (hasError) return;

    let data;
    let res;
    try {
      res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      data = await res.json();
    } catch (err) {
      setError("Server error. Please try again later.");
      return;
    }
    if (!res.ok) {
      setError(data?.error || "Something went wrong");
    } else {
      setSuccess("If an account with that email exists, a reset link has been sent.");
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center px-4 mt-4 bg-gradient-to-b from-purple-100 to-white">
        <main className="flex flex-col items-center w-full max-w-lg px-2">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-purple-100 p-8">
            <div className="flex flex-col items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Forgot Password</h1>
              <p className="text-gray-500 text-sm text-center">Enter your email to receive a password reset link.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-700">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-gray-100 text-gray-900 p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all duration-300"
                  placeholder="Your Email"
                />
                {fieldErrors.email && <div className="text-red-500 text-xs mt-1">{fieldErrors.email}</div>}
              </div>
              {error && <div className="text-red-500 text-center">{error}</div>}
              {success && <div className="text-green-500 text-center">{success}</div>}
              <button
                type="submit"
                className="w-full text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-all duration-300 transform hover:scale-105 shadow-lg"
                style={{background: 'linear-gradient(135deg, #2434B3 0%, #1a2a8a 100%)'}}
              >
                Send Reset Link
              </button>
            </form>
          </div>
        </main>
      </div>
    </Layout>
  );
} 