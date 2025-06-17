'use client';

import ProfileForm from '@/app/components/profile/ProfileForm';
import Layout from '../../../components/Layout';

export default function BuildProfilePage() {
  return (
    <Layout>
      <main className="min-h-screen bg-gradient-to-br from-[#2434B3]/5 to-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#2434B3]">Build Your Profile</h1>
            <p className="mt-2 text-gray-600">Complete your profile to get started with your career journey.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <ProfileForm />
          </div>
        </div>
      </main>
    </Layout>
  );
} 