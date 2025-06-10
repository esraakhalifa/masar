"use client";
import { useState } from "react";
import Header from "../components/Header";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
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
    <div className="bg-gray-900 min-h-screen text-white">
      <Header />
      <main className="max-w-md mx-auto py-16 px-6">
        <h1 className="text-4xl font-bold mb-6 text-center">Forgot Password</h1>
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-gray-700 text-white p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all duration-300"
                placeholder="Your Email"
                required
              />
            </div>
            {error && <div className="text-red-400 text-center">{error}</div>}
            {success && <div className="text-green-400 text-center">{success}</div>}
            <button
              type="submit"
              className="w-full bg-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-purple-500 transition-all duration-300 transform hover:scale-105"
            >
              Send Reset Link
            </button>
          </form>
        </div>
      </main>
    </div>
  );
} 