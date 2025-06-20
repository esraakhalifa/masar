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
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    password: ""
  });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const errors = {
      email: "",
      password: ""
    };
    let hasError = false;

    if (!email.trim()) {
      errors.email = "Email is required";
      hasError = true;
    } else if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
      errors.email = "Invalid email address";
      hasError = true;
    }
    if (!password) {
      errors.password = "Password is required";
      hasError = true;
    }
    setFieldErrors(errors);
    if (hasError) return;

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
    <div className="min-h-screen flex items-center justify-center px-4 mt-4">
      <main className="flex flex-col items-center justify-center w-full max-w-lg px-2">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-blue-100 p-8">
          <div className="flex flex-col items-center mb-6">

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
                className="w-full bg-blue-50 text-gray-900 p-3 rounded-md border border-blue-200 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300"
                placeholder="Your Email"
              />
              {fieldErrors.email && <div className="text-red-500 text-xs mt-1">{fieldErrors.email}</div>}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2 text-gray-700">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-blue-50 text-gray-900 p-3 rounded-md border border-blue-200 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300"
                placeholder="Your Password"
              />
              {fieldErrors.password && <div className="text-red-500 text-xs mt-1">{fieldErrors.password}</div>}
            </div>
            
            {error && <div className="text-red-500 text-center">{error}</div>}
            {success && <div className="text-green-500 text-center">{success}</div>}
            
            <button
              type="submit"
              className="w-full text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-all duration-300 transform hover:scale-105 shadow-lg"
              style={{background: 'linear-gradient(135deg, #2434B3 0%, #1a2a8a 100%)'}}
            >
              Login
            </button>
          </form>
            
          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="mx-2 text-gray-400 text-xs">OR</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>
          
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-2 bg-white border-2 text-gray-700 px-6 py-3 rounded-full font-semibold hover:bg-orange-50 transition-all duration-300 shadow"
            style={{borderColor: '#FF4B36'}}
          >
            <FcGoogle className="text-xl" />
            Sign in with Google
          </button>
            
          <div className="flex flex-col items-center mt-4 space-y-2 text-center">
            <Link href="/forgot-password" className="hover:underline text-sm" style={{ color: '#2434B3' }}>
              Forgot Password?
            </Link>
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <Link href="/register" className="hover:underline" style={{ color: '#FF4B36' }}>
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
    </Layout>
  );
} 