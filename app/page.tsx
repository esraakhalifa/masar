"use client";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function HomePage() {
  const { data: session } = useSession();
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">Welcome to Masar</h1>
        {session ? (
          <>
            <p className="mb-4 text-gray-700">Hello, {session.user?.name || session.user?.email}!</p>
            <button onClick={() => signOut()} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-semibold">Logout</button>
          </>
        ) : (
          <>
            <p className="mb-4 text-gray-700">Please login or register to continue.</p>
            <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-semibold mr-2">Login</Link>
            <Link href="/register" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-semibold">Register</Link>
          </>
        )}
      </div>
    </div>
  );
}
