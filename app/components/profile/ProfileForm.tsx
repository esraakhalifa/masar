'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import type { UserProfile, Skill, CareerPreference } from '@/app/lib/types/profile';
import { ValidationError } from '@/app/lib/validation/validation';
import {
  createValidationError,
  createServerError,
} from '@/app/lib/errors/clientError';
import { CSRF_HEADER, CSRF_COOKIE } from '@/app/lib/security/csrf';
import SkillsAssessment from './SkillsAssessment';
import CareerPreferences from './CareerPreferences';
import EducationForm from './EducationForm';
import ExperienceForm from './ExperienceForm';
import { exportProfileToPdf } from '@/app/lib/services/pdfExport';
import { generateCalendarEvents } from '@/app/lib/services/calendarExport';

export default function ProfileForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [careerPreferences, setCareerPreferences] = useState<CareerPreference>({
    industry: '',
    preferredSalary: 0,
    workType: 'remote',
    location: ''
  });
  const [education, setEducation] = useState<UserProfile['education']>([]);
  const [experience, setExperience] = useState<UserProfile['experience']>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Initialize CSRF token
  useEffect(() => {
    const initializeCSRFToken = async () => {
      try {
        // Get CSRF token from cookie
        const cookies = document.cookie.split(';');
        const csrfCookie = cookies.find(cookie => cookie.trim().startsWith(`${CSRF_COOKIE}=`));
        const storedToken = csrfCookie ? csrfCookie.split('=')[1] : null;

        if (!storedToken) {
          // If no token exists, generate a new one
          const response = await fetch('/api/csrf', {
            method: 'GET',
            credentials: 'include',
          });
          
          if (!response.ok) {
            throw new Error('Failed to initialize CSRF token');
          }
          
          const { token } = await response.json();
          setCsrfToken(token);
        } else {
          setCsrfToken(storedToken);
        }
      } catch (error) {
        console.error('Failed to initialize CSRF token:', error);
        toast.error('Failed to initialize security token. Please refresh the page.');
      }
    };

    initializeCSRFToken();
  }, []);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<UserProfile>({
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      email: '',
    }
  });
  const fullName = watch('fullName');
  const email = watch('email');

  const handleValidationError = (error: ValidationError) => {
    toast.error(error.message);
    return false;
  };

  const validateCurrentStep = () => {
    // Check if there are any form errors first
    if (Object.keys(errors).length > 0) {
      toast.error('Please fix all errors before proceeding');
      return false;
    }

    // Validate required fields for each step
    switch (step) {
      case 1:
        if (!fullName?.trim()) {
          toast.error('Full name is required');
          return false;
        }
        if (!email?.trim()) {
          toast.error('Email is required');
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          toast.error('Invalid email format');
          return false;
        }
        break;

      case 2:
        if (!skills.length) {
          toast.error('At least one skill is required');
          return false;
        }
        break;

      case 3:
        if (!careerPreferences.industry?.trim()) {
          toast.error('Industry is required');
          return false;
        }
        if (!careerPreferences.workType) {
          toast.error('Work type is required');
          return false;
        }
        break;

      case 4:
        if (!education.length) {
          toast.error('At least one education entry is required');
          return false;
        }
        // Validate each education entry
        for (const edu of education) {
          if (!edu.institution?.trim()) {
            toast.error('Institution is required for all education entries');
            return false;
          }
          if (!edu.degree?.trim()) {
            toast.error('Degree is required for all education entries');
            return false;
          }
          if (!edu.fieldOfStudy?.trim()) {
            toast.error('Field of study is required for all education entries');
            return false;
          }
          if (!edu.graduationYear) {
            toast.error('Graduation year is required for all education entries');
            return false;
          }
        }
        break;

      case 5:
        if (!experience.length) {
          toast.error('At least one experience entry is required');
          return false;
        }
        // Validate each experience entry
        for (const exp of experience) {
          if (!exp.title?.trim()) {
            toast.error('Title is required for all experience entries');
            return false;
          }
          if (!exp.company?.trim()) {
            toast.error('Company is required for all experience entries');
            return false;
          }
          if (!exp.startDate) {
            toast.error('Start date is required for all experience entries');
            return false;
          }
        }
        break;
    }

    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setStep(step + 1);
    }
  };

  const onSubmit = async (data: UserProfile) => {
    try {
      setIsSaving(true);

      // Validate all required fields before submission
      if (!validateCurrentStep()) {
        return;
      }

      // Check CSRF token
      if (!csrfToken) {
        // Try to reinitialize CSRF token
        const response = await fetch('/api/csrf', {
          method: 'GET',
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw createValidationError('csrf', 'Failed to initialize security token. Please refresh the page.');
        }
        
        const { token } = await response.json();
        setCsrfToken(token);
        
        if (!token) {
          throw createValidationError('csrf', 'Security token missing. Please refresh the page and try again.');
        }
      }

      // Prepare the data for submission
      const formData = {
        fullName: data.fullName.trim(),
        email: data.email.trim(),
        skills: skills.map(skill => ({
          name: skill.name.trim(),
          level: skill.level || 1,
          category: skill.category || 'General'
        })),
        careerPreferences: {
          industry: careerPreferences.industry.trim(),
          preferredSalary: careerPreferences.preferredSalary || 0,
          workType: careerPreferences.workType,
          location: careerPreferences.location?.trim() || ''
        },
        education: education.map(edu => ({
          institution: edu.institution.trim(),
          degree: edu.degree.trim(),
          fieldOfStudy: edu.fieldOfStudy.trim(),
          graduationYear: edu.graduationYear.toString()
        })),
        experience: experience.map(exp => ({
          title: exp.title.trim(),
          company: exp.company.trim(),
          startDate: exp.startDate,
          endDate: exp.endDate || null,
          description: exp.description?.trim() || ''
        }))
      };

      // Log the exact structure of the form data
      console.log('Form data structure:', formData);

      // Submit the form data
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          [CSRF_HEADER]: csrfToken || '',
        },
        body: JSON.stringify(formData),
      });

      console.log('Submitting form data:', formData);

      if (!response.ok) {
        const responseData = await response.json();
        console.error('API Error:', responseData);
        
        if (response.status === 403) {
          // CSRF token issue - try to refresh it
          const csrfResponse = await fetch('/api/csrf', {
            method: 'GET',
            credentials: 'include',
          });
          
          if (csrfResponse.ok) {
            const { token } = await csrfResponse.json();
            setCsrfToken(token);
            // Retry the submission
            if (retryCount < 3) {
              setRetryCount(prev => prev + 1);
              return onSubmit(data);
            }
          }
          throw createValidationError('csrf', 'Security token invalid. Please refresh the page and try again.');
        }

        if (response.status === 409) {
          // Profile already exists - redirect to profile page
          toast.success('Profile already exists. Redirecting...');
          localStorage.setItem('userEmail', data.email);
          router.push('/profile');
          return;
        }

        if (response.status === 400) {
          // Validation error
          const errors = responseData.details || [];
          const errorMessage = errors.map((err: { message: string }) => err.message).join(', ');
          throw createValidationError('form', errorMessage);
        }

        // Handle other errors
        const errorMessage = responseData.error || 'Failed to create profile';
        const errorDetails = responseData.details || '';
        throw createServerError(`${errorMessage}${errorDetails ? `: ${errorDetails}` : ''}`);
      }

      // Success - store email and redirect
      localStorage.setItem('userEmail', data.email);
      toast.success('Profile created successfully!');
      router.push('/profile');
    } catch (error) {
      console.error('Form submission error:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPDF = async () => {
    if (!isFormComplete()) {
      toast.error('Please complete all required fields before exporting.');
      return;
    }
    setIsExporting(true);
    try {
      const completeProfile: UserProfile = {
        fullName: fullName,
        email: email,
        skills: skills,
        careerPreferences: careerPreferences,
        education: education,
        experience: experience,
      };

      // The html2canvas part is commented out in pdfExport.ts, so we'll just call the pdf generation
      await exportProfileToPdf(completeProfile);
      toast.success('PDF exported successfully!');
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error('Failed to export PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCalendar = () => {
    try {
      const completeProfile: UserProfile = {
        fullName: watch('fullName') || '',
        email: watch('email') || '',
        skills,
        careerPreferences,
        education,
        experience
      };
      
      generateCalendarEvents(completeProfile);
      toast.success('Calendar events exported successfully!');
    } catch (error) {
      handleValidationError(error as ValidationError);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  {...register('fullName', { 
                    required: 'Full name is required',
                    minLength: {
                      value: 3,
                      message: 'Full name must be at least 3 characters long'
                    },
                    maxLength: {
                      value: 50,
                      message: 'Full name must be less than 50 characters'
                    },
                    pattern: {
                      value: /^[A-Za-z\s]+$/,
                      message: 'Full name can only contain letters and spaces'
                    }
                  })}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-400 ${
                    errors.fullName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-400 ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <SkillsAssessment
            skills={skills}
            onChange={setSkills}
          />
        );
      case 3:
        return (
          <CareerPreferences
            preferences={careerPreferences}
            onChange={setCareerPreferences}
          />
        );
      case 4:
        return (
          <EducationForm
            education={education}
            onChange={setEducation}
          />
        );
      case 5:
        return (
          <ExperienceForm
            experience={experience}
            onChange={setExperience}
          />
        );
      default:
        return null;
    }
  };

  const isFormComplete = () => {
    return (
      watch('fullName')?.trim() &&
      watch('email')?.trim() &&
      skills.length > 0 &&
      careerPreferences.industry?.trim() &&
      careerPreferences.location?.trim() &&
      education.length > 0 &&
      experience.length > 0
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Build Your Profile</h1>
        <p className="mt-2 text-gray-600">Let&apos;s create your professional profile to help us generate your career roadmap.</p>
      </div>

      <form id="profile-form" onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(onSubmit)(e);
      }} className="space-y-8">
        {/* Progress Indicator */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3, 4, 5].map((stepNumber) => (
            <div
              key={stepNumber}
              className={`flex-1 text-center ${
                stepNumber < step
                  ? 'text-green-600'
                  : stepNumber === step
                  ? 'text-blue-600 font-semibold'
                  : 'text-gray-400'
              }`}
            >
              <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                stepNumber < step ? 'bg-green-600 text-white' :
                stepNumber === step ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                {stepNumber}
              </div>
              <span className="text-sm mt-2 block">
                {stepNumber === 1 ? 'Basic Info' : 
                 stepNumber === 2 ? 'Skills' : 
                 stepNumber === 3 ? 'Preferences' :
                 stepNumber === 4 ? 'Education' : 'Experience'}
              </span>
            </div>
          ))}
        </div>

        {renderStep()}

        {/* Export Buttons */}
        <div className="flex justify-end space-x-4 mt-8">
          <button
            type="button"
            onClick={handleExportPDF}
            disabled={isExporting || !isFormComplete()}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
              isExporting || !isFormComplete() 
                ? 'bg-red-400 cursor-not-allowed' 
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isExporting ? 'Exporting...' : 'Export PDF'}
          </button>
          <button
            type="button"
            onClick={handleExportCalendar}
            disabled={!isFormComplete()}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
              !isFormComplete()
                ? 'bg-green-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            Export Calendar
          </button>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={isSaving}
            >
              Previous
            </button>
          )}
          {step < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              disabled={isSaving}
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={!isFormComplete() || isSaving}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md flex items-center space-x-2 ${
                isFormComplete() && !isSaving
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Saving Profile...</span>
                </>
              ) : (
                <span>{!isFormComplete() ? 'Complete All Fields' : 'Save Profile'}</span>
              )}
            </button>
          )}
        </div>

        {/* Cancel Button */}
        <div className="flex justify-end space-x-4 mt-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
