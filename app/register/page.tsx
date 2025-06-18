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
  const [fieldErrors, setFieldErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
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
    let errors = {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: ""
    };
    let hasError = false;

    if (!firstName.trim()) {
      errors.firstName = "First name is required";
      hasError = true;
    }
    if (!lastName.trim()) {
      errors.lastName = "Last name is required";
      hasError = true;
    }
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
    if (password && password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
      hasError = true;
    }
    setFieldErrors(errors);
    if (hasError) return;
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
      setSuccess("Registration successful! Please check your email for verification code.");
      setTimeout(() => router.push(`/verify-email?email=${encodeURIComponent(email)}`), 2000);
    }
  };

  return (
<Layout>
    <div className="min-h-screen flex items-center justify-center px-4 mt-4">
      <main className="flex flex-col items-center justify-center w-full max-w-lg px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-blue-100 p-8">
          <div className="flex flex-col items-center mb-6">
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
                className="w-full bg-blue-50 text-gray-900 p-3 rounded-md border border-blue-200 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300"
                placeholder="Your First Name"
              />
              {fieldErrors.firstName && <div className="text-red-500 text-xs mt-1">{fieldErrors.firstName}</div>}
            </div>
            
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium mb-2 text-gray-700">Last Name</label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                className="w-full bg-blue-50 text-gray-900 p-3 rounded-md border border-blue-200 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300"
                placeholder="Your Last Name"
              />
              {fieldErrors.lastName && <div className="text-red-500 text-xs mt-1">{fieldErrors.lastName}</div>}
            </div>
            
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
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2 text-gray-700">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full bg-blue-50 text-gray-900 p-3 rounded-md border border-blue-200 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300"
                placeholder="Confirm Your Password"
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
              Register
            </button>
            
            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="mx-2 text-gray-400 text-xs">OR</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>
            
            {/* <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="w-full flex items-center justify-center gap-2 bg-white border-2 text-gray-700 px-6 py-3 rounded-full font-semibold hover:bg-orange-50 transition-all duration-300 shadow"
              style={{borderColor: '#FF4B36'}}
            >
              <FcGoogle className="text-xl" />
              Sign up with Google
            </button> */}
            
            <div className="flex justify-center items-center mt-4">
              <p className="text-sm text-gray-500">
                Already have an account?{' '}
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