"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
// import Header from "../components/Header";
import Layout from '../../components/Layout';


export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const getCsrfToken = async (): Promise<string> => {
    const res = await fetch('/api/csrf', { credentials: 'include' });
    const data = await res.json();
    return data.token;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    const csrfToken = await getCsrfToken();
    const res = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": csrfToken,
      },
      body: JSON.stringify({ firstName, lastName, email, password }),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Registration failed");
    } else {
      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => router.push("/login"), 1500);
    }
  };

  return (
    <Layout>
      <main className="flex flex-col items-center justify-center min-h-[80vh] px-2">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-purple-100 p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-800 rounded-full flex items-center justify-center mb-2">
              <span className="text-white font-bold text-2xl">M</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Sign Up</h1>
            <p className="text-gray-500 text-sm">Create your account to get started.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium mb-2 text-gray-700">First Name</label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                className="w-full bg-gray-100 text-gray-900 p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all duration-300"
                placeholder="Your First Name"
                required
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium mb-2 text-gray-700">Last Name</label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                className="w-full bg-gray-100 text-gray-900 p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all duration-300"
                placeholder="Your Last Name"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-gray-100 text-gray-900 p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all duration-300"
                placeholder="Your Email"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2 text-gray-700">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-gray-100 text-gray-900 p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all duration-300"
                placeholder="Your Password"
                required
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2 text-gray-700">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-100 text-gray-900 p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all duration-300"
                placeholder="Confirm Your Password"
                required
              />
            </div>
            {error && <div className="text-red-500 text-center">{error}</div>}
            {success && <div className="text-green-500 text-center">{success}</div>}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-purple-500 text-white px-6 py-3 rounded-full font-semibold hover:from-purple-700 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow"
            >
              Register
            </button>
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-gray-500">
                Already have an account?{' '}
                <a href="/login" className="text-purple-600 hover:underline">Sign in</a>
              </p>
            </div>
          </form>
        </div>
      </main>
    </Layout>
  );
} 