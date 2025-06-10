'use client';

import ProfileForm from '@/app/components/profile/ProfileForm';
import Layout from '../../../components/Layout';
// Removed unused imports: UserProfile, Skill, CareerPreference, validateStep, ValidationError, handleValidationError, handleProfileError, handleExportError
// import type { UserProfile, Skill, CareerPreference } from '@/app/lib/types/profile';
// import { validateStep, ValidationError } from '@/app/lib/validation/validation';
// import { 
//   handleValidationError, 
//   handleProfileError, 
//   handleExportError,
// } from '@/app/lib/errors/clientError';

export default function BuildProfilePage() {
  return (
    <Layout>
      <main className="min-h-screen bg-gradient-to-br from-purple-50 to-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Build Your Profile</h1>
            <p className="mt-2 text-gray-600">Complete your profile to get started with your career journey.</p>
          </div>
          <ProfileForm />
        </div>
      </main>
    </Layout>
  );
} 