"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Layout from "@/components/Layout";

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ password: "", confirmPassword: "" });

  useEffect(() => {
    setToken(searchParams.get("token") || "");
    setEmail(searchParams.get("email") || "");
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const errors = { password: "", confirmPassword: "" };
    let hasError = false;

    if (!password) {
      errors.password = "Password is required";
      hasError = true;
    }
    if (password && password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
      hasError = true;
    }
    setFieldErrors(errors);
    if (hasError) return;

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Something went wrong");
    } else {
      setSuccess("Password reset successful! Redirecting to login...");
      setTimeout(() => router.push("/login"), 2000);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center px-4 mt-4 bg-gradient-to-b from-purple-100 to-white">
        <main className="flex flex-col items-center w-full max-w-lg px-2">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-purple-100 p-8">
            <div className="flex flex-col items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Reset Password</h1>
              <p className="text-gray-500 text-sm text-center">Enter your new password below.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2 text-gray-700">New Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-gray-100 text-gray-900 p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all duration-300"
                  placeholder="New Password"
                />
                {fieldErrors.password && <div className="text-red-500 text-xs mt-1">{fieldErrors.password}</div>}
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2 text-gray-700">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-100 text-gray-900 p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all duration-300"
                  placeholder="Confirm New Password"
                />
                {fieldErrors.confirmPassword && <div className="text-red-500 text-xs mt-1">{fieldErrors.confirmPassword}</div>}
              </div>
              {error && <div className="text-red-500 text-center">{error}</div>}
              {success && <div className="text-green-500 text-center">{success}</div>}
              <button
                type="submit"
                className="w-full text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-all duration-300 transform hover:scale-105 shadow-lg"
                style={{background: 'linear-gradient(135deg, #2434B3 0%, #1a2a8a 100%)'}}
              >
                Reset Password
              </button>
            </form>
          </div>
        </main>
      </div>
    </Layout>
  );
} 