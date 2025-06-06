"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Header from "../components/Header";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (res?.error) {
      setError(res.error === "CredentialsSignin" ? "Invalid email or password." : res.error);
    } else {
      setSuccess("Login successful! Redirecting...");
      setTimeout(() => router.push("/"), 1500);
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <Header />
      <main className="max-w-md mx-auto py-16 px-6">
        <h1 className="text-4xl font-bold mb-6 text-center animate-fade-in">Login</h1>
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg animate-fade-in animation-delay-300">
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
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-gray-700 text-white p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all duration-300"
                placeholder="Your Password"
                required
              />
            </div>
            {error && <div className="text-red-400 text-center">{error}</div>}
            {success && <div className="text-green-400 text-center">{success}</div>}
            <button
              type="submit"
              className="w-full bg-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-purple-500 transition-all duration-300 transform hover:scale-105"
            >
              Login
            </button>
            <p className="text-center text-sm text-gray-400 mt-4">
              Don&apos;t have an account?{' '}
              <a href="/register" className="text-purple-400 hover:underline">Sign up</a>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
} 