'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";

export default function HomePage() {
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkProfile = async () => {
      const email = localStorage.getItem('userEmail');
      if (email) {
        try {
          const response = await fetch(`/api/profile?email=${email}`);
          setHasProfile(response.ok);
        } catch (error) {
          setHasProfile(false);
        }
      } else {
        setHasProfile(false);
      }
    };

    checkProfile();
  }, []);

  if (hasProfile === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Welcome to Masar</h1>
        <p className="text-xl text-gray-600 mb-8">
          Your career journey starts here. Build your professional profile and take the next step in your career.
        </p>
        
        <div className="space-y-4">
          {hasProfile ? (
            <button
              onClick={() => router.push('/profile')}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View My Profile
            </button>
          ) : (
            <button
              onClick={() => router.push('/build-profile')}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Build My Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
