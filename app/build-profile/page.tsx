'use client';

import ProfileForm from '@/app/components/profile/ProfileForm';
import type { UserProfile, Skill, CareerPreference } from '@/app/lib/types/profile';
import { validateStep, ValidationError } from '@/app/lib/utils/validation';
import { 
  handleValidationError, 
  handleProfileError, 
  handleExportError,
} from '@/app/lib/utils/clientError';

export default function BuildProfilePage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Build Your Profile</h1>
          <p className="mt-2 text-gray-600">Complete your profile to get started with your career journey.</p>
        </div>
        <ProfileForm />
      </div>
    </main>
  );
} 