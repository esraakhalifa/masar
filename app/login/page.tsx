"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Layout from "../../components/Layout";
import { FcGoogle } from "react-icons/fc";

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
      callbackUrl: "/",
    });
    if (res?.error) {
      setError(res.error === "CredentialsSignin" ? "Invalid email or password." : res.error);
    } else {
      setSuccess("Login successful! Redirecting...");
      setTimeout(() => router.push("/"), 1500);
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
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Login</h1>
            <p className="text-gray-500 text-sm">Welcome back! Please sign in to your account.</p>
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
            {error && <div className="text-red-500 text-center">{error}</div>}
            {success && <div className="text-green-500 text-center">{success}</div>}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-purple-500 text-white px-6 py-3 rounded-full font-semibold hover:from-purple-700 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow"
            >
              Login
            </button>
            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="mx-2 text-gray-400 text-xs">OR</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-full font-semibold hover:bg-gray-50 transition-all duration-300 shadow"
            >
              <FcGoogle className="text-xl" />
              Sign in with Google
            </button>
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-gray-500">
                Don&apos;t have an account?{' '}
                <a href="/register" className="text-purple-600 hover:underline">Sign up</a>
              </p>
              <Link href="/forgot-password" className="text-purple-500 hover:underline text-sm">
                Forgot Password?
              </Link>
            </div>
          </form>
        </div>
      </main>
    </Layout>
  );
} 