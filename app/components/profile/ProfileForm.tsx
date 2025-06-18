'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import type { UserProfile, Skill } from '@/app/lib/types/profile';
import {
  createValidationError,
  createServerError,
  handleValidationError,
  ClientError,
  ErrorCodes,
} from '@/app/lib/errors/clientError';
import { CSRF_HEADER, CSRF_COOKIE } from '@/app/lib/security/csrf';
import SkillsAssessment from './SkillsAssessment';
import EducationForm from './EducationForm';
import ExperienceForm from './ExperienceForm';
import { exportProfileToPdf } from '@/app/lib/services/pdfExport';
import { motion } from 'framer-motion';
import { User, ClipboardList, Briefcase, GraduationCap } from 'lucide-react';
import Link from 'next/link';

export default function ProfileForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const [step, setStep] = useState(1);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [education, setEducation] = useState<UserProfile['education']>([]);
  const [experience, setExperience] = useState<UserProfile['experience']>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [isEditingExperience, setIsEditingExperience] = useState(false);
  const [isEditingEducation, setIsEditingEducation] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<UserProfile>({
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
    }
  });
  const firstName = watch('firstName');
  const lastName = watch('lastName');
  const email = watch('email');

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const stepIcons = [
    { icon: User, name: 'Basic Info' },
    { icon: ClipboardList, name: 'Skills' },
    { icon: GraduationCap, name: 'Education' },
    { icon: Briefcase, name: 'Experience' },
  ];

  useEffect(() => {
    const initializeCSRFToken = async () => {
      try {
        const cookies = document.cookie.split(';');
        const csrfCookie = cookies.find(cookie => cookie.trim().startsWith(`${CSRF_COOKIE}=`));
        const storedToken = csrfCookie ? csrfCookie.split('=')[1] : null;

        if (!storedToken) {
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

  useEffect(() => {
    if (session?.user) {
      setValue('firstName', session.user.firstName || '');
      setValue('lastName', session.user.lastName || '');
      setValue('email', session.user.email || '');
    }
  }, [session, setValue]);

  const validateCurrentStep = () => {
    if (Object.keys(errors).length > 0) {
      console.warn('Please fix all errors before proceeding', { context: 'Form Navigation' });
      toast.error('Please fix all errors before proceeding');
      return false;
    }

    switch (step) {
      case 1:
        if (!firstName?.trim()) {
          console.warn('First name is required', { context: 'Step 1 Validation' });
          toast.error('First name is required');
          return false;
        }
        if (!lastName?.trim()) {
          console.warn('Last name is required', { context: 'Step 1 Validation' });
          toast.error('Last name is required');
          return false;
        }
        if (!email?.trim()) {
          console.warn('Email is required', { context: 'Step 1 Validation' });
          toast.error('Email is required');
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          console.warn('Invalid email format', { context: 'Step 1 Validation' });
          toast.error('Invalid email format');
          return false;
        }
        break;
      case 2:
        if (!skills.length) {
          console.warn('At least one skill is required', { context: 'Step 2 Validation' });
          toast.error('At least one skill is required');
          return false;
        }
        break;
      case 3:
        if (!education.length) {
          console.warn('At least one education entry is required', { context: 'Step 3 Validation' });
          toast.error('At least one education entry is required');
          return false;
        }
        for (const edu of education) {
          if (!edu.institution?.trim()) {
            console.warn('Institution is required for all education entries', { context: 'Education Entry Validation' });
            toast.error('Institution is required for all education entries');
            return false;
          }
          if (!edu.degree?.trim()) {
            console.warn('Degree is required for all education entries', { context: 'Education Entry Validation' });
            toast.error('Degree is required for all education entries');
            return false;
          }
          if (!edu.fieldOfStudy?.trim()) {
            console.warn('Field of study is required for all education entries', { context: 'Education Entry Validation' });
            toast.error('Field of study is required for all education entries');
            return false;
          }
          if (!edu.graduationYear) {
            console.warn('Graduation year is required for all education entries', { context: 'Education Entry Validation' });
            toast.error('Graduation year is required for all education entries');
            return false;
          }
        }
        break;
      case 4:
        if (!experience.length) {
          console.warn('At least one experience entry is required', { context: 'Step 4 Validation' });
          toast.error('At least one experience entry is required');
          return false;
        }
        for (const exp of experience) {
          if (!exp.title?.trim()) {
            console.warn('Title is required for all experience entries', { context: 'Experience Entry Validation' });
            toast.error('Title is required for all experience entries');
            return false;
          }
          if (!exp.company?.trim()) {
            console.warn('Company is required for all experience entries', { context: 'Experience Entry Validation' });
            toast.error('Company is required for all experience entries');
            return false;
          }
          if (!exp.startDate) {
            console.warn('Start date is required for all experience entries', { context: 'Experience Entry Validation' });
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
      console.info(`Navigating to next step: ${step + 1}`, { context: 'Form Navigation' });
      setStep(step + 1);
    }
  };

  const onSubmit = async (data: UserProfile) => {
    try {
      setIsSaving(true);
      if (!validateCurrentStep()) {
        setIsSaving(false);
        return;
      }
      if (!csrfToken) {
        const response = await fetch('/api/csrf', {
          method: 'GET',
          credentials: 'include',
        });
        if (!response.ok) {
          setIsSaving(false);
          throw createValidationError('csrf', 'Failed to initialize security token. Please refresh the page.');
        }
        const { token } = await response.json();
        setCsrfToken(token);
        if (!token) {
          setIsSaving(false);
          throw createValidationError('csrf', 'Security token missing. Please refresh the page and try again.');
        }
      }
      const formData = {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim(),
        skills: skills.map(skill => ({
          name: skill.name.trim(),
          level: skill.level || 1,
          category: skill.category || 'General'
        })),
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
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          [CSRF_HEADER]: csrfToken || '',
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        setIsSaving(false);
        const errorData = await response.json();
        const errorMessage = errorData.message || 'An unexpected error occurred.';
        if (response.status === 400 && errorData.errorType === 'ValidationError') {
          handleValidationError({ field: errorData.field || 'unknown', message: errorMessage });
        } else if (response.status === 409) {
          toast.success('Profile already exists. Redirecting to your profile page!');
          localStorage.setItem('userEmail', data.email.trim());
          setShowSuccessModal(true);
          return;
        } else if (response.status === 403 && errorData.errorType === 'CSRFError') {
          toast.error('Security token mismatch. Please refresh and try again.');
        } else {
          createServerError(errorMessage);
        }
        return;
      }
      const result = await response.json();
      localStorage.setItem('userEmail', result.email);
      setShowSuccessModal(true);
      setIsSaving(false);
    } catch (error) {
      setIsSaving(false);
      if (error instanceof ClientError && error.code === ErrorCodes.VALIDATION_ERROR) {
        handleValidationError({ field: (error as ClientError).field || 'unknown', message: error.message });
      } else {
        createServerError('Failed to save profile. Please try again.');
      }
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const profileData: UserProfile = {
        firstName: firstName,
        lastName: lastName,
        fullName: `${firstName} ${lastName}`.trim(),
        email: email,
        skills: skills,
        education: education,
        experience: experience,
      } as any;
      await exportProfileToPdf(profileData);
      console.info('Profile exported to PDF successfully!', { context: 'PDF Export' });
      toast.success('Profile exported to PDF successfully!');
    } catch (error) {
      console.error(error as Error, { context: 'PDF Export' });
      toast.error('Failed to export profile to PDF. Please try again later.');
    } finally {
      setIsExporting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={itemVariants}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-[#2434B3]">Personal Information</h2>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="text-[#FF4B36] hover:text-[#FF4B36]/80 transition-colors"
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  {...register('firstName', {
                    required: 'First name is required',
                    minLength: {
                      value: 3,
                      message: 'First name must be at least 3 characters long'
                    },
                    maxLength: {
                      value: 50,
                      message: 'First name must be less than 50 characters'
                    },
                    pattern: {
                      value: /^[A-Za-z\s]+$/,
                      message: 'First name can only contain letters and spaces'
                    }
                  })}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900 placeholder-gray-400 ${
                    errors.firstName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your first name"
                  disabled={!!session?.user}
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  {...register('lastName', {
                    required: 'Last name is required',
                    minLength: {
                      value: 3,
                      message: 'Last name must be at least 3 characters long'
                    },
                    maxLength: {
                      value: 50,
                      message: 'Last name must be less than 50 characters'
                    },
                    pattern: {
                      value: /^[A-Za-z\s]+$/,
                      message: 'Last name can only contain letters and spaces'
                    }
                  })}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900 placeholder-gray-400 ${
                    errors.lastName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your last name"
                  disabled={!!session?.user}
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
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
                  className={`mt-1 block w-full rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900 placeholder-gray-400 ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                  disabled={!!session?.user}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            key="step2"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={itemVariants}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-[#2434B3]">Skills</h2>
              <button
                type="button"
                onClick={() => setIsEditingSkills(!isEditingSkills)}
                className="text-[#FF4B36] hover:text-[#FF4B36]/80 transition-colors"
              >
                {isEditingSkills ? 'Cancel' : 'Edit'}
              </button>
            </div>
            <SkillsAssessment
              skills={skills}
              onChange={setSkills}
            />
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            key="step3"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={itemVariants}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-[#2434B3]">Education</h2>
              <button
                type="button"
                onClick={() => setIsEditingEducation(!isEditingEducation)}
                className="text-[#FF4B36] hover:text-[#FF4B36]/80 transition-colors"
              >
                {isEditingEducation ? 'Cancel' : 'Edit'}
              </button>
            </div>
            <EducationForm
              education={education}
              onChange={setEducation}
            />
          </motion.div>
        );
      case 4:
        return (
          <motion.div
            key="step4"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={itemVariants}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-[#2434B3]">Experience</h2>
              <button
                type="button"
                onClick={() => setIsEditingExperience(!isEditingExperience)}
                className="text-[#FF4B36] hover:text-[#FF4B36]/80 transition-colors"
              >
                {isEditingExperience ? 'Cancel' : 'Edit'}
              </button>
            </div>
            <ExperienceForm
              experience={experience}
              onChange={setExperience}
            />
          </motion.div>
        );
      default:
        return null;
    }
  };

  const isFormComplete = () => {
    return (
      watch('firstName')?.trim() &&
      watch('lastName')?.trim() &&
      watch('email')?.trim() &&
      skills.length > 0 &&
      education.length > 0 &&
      experience.length > 0
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-lg w-full text-center">
            <h2 className="text-2xl font-bold text-green-600 mb-4">Profile Created!</h2>
            <p className="mb-6 text-lg text-gray-700">Your profile has been created!<br/>Please go to the <span className="font-semibold text-[#2434B3]">Upload CV</span> page. You can check your profile after uploading your CV.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/upload" className="flex-1 px-6 py-3 bg-[#2434B3] text-white rounded-lg font-semibold hover:bg-[#2434B3]/90 transition">Go to Upload CV</Link>
              <Link href="/profile" className="flex-1 px-6 py-3 bg-gray-200 text-[#2434B3] rounded-lg font-semibold hover:bg-gray-300 transition">Check Profile</Link>
            </div>
          </div>
        </div>
      )}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Build Your Profile</h1>
        <p className="mt-2 text-gray-600">Let&apos;s create your professional profile to help us generate your career roadmap.</p>
      </div>

      <form id="profile-form" onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(onSubmit)(e);
      }} className="space-y-8">
        <div className="flex justify-between mb-8">
          {[1, 2, 3, 4].map((stepNumber) => {
            const IconComponent = stepIcons[stepNumber - 1].icon;
            return (
              <motion.div
                key={stepNumber}
                className={`flex-1 text-center ${
                  stepNumber < step
                    ? 'text-green-600'
                    : stepNumber === step
                    ? 'text-[#FF4B36] font-semibold'
                    : 'text-gray-400'
                }`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: stepNumber * 0.1 }}
              >
                <motion.div
                  className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2 transition-all duration-300 ease-in-out ${
                    stepNumber < step ? 'bg-green-600 text-white scale-110' :
                    stepNumber === step ? 'bg-[#FF4B36] text-white scale-110 shadow-lg' : 'bg-gray-200 text-gray-600'
                  }`}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <IconComponent className="w-5 h-5" />
                </motion.div>
                <span className="text-sm mt-2 block">
                  {stepIcons[stepNumber - 1].name}
                </span>
              </motion.div>
            );
          })}
        </div>

        {renderStep()}

        <div className="flex justify-between">
          {step > 1 && (
            <motion.button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-all duration-200"
              disabled={isSaving}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Previous
            </motion.button>
          )}

          <div className="flex space-x-4 ml-auto">
            {step === 4 && (
              <motion.button
                type="button"
                onClick={handleExportPDF}
                disabled={isExporting || !isFormComplete()}
                className={`px-6 py-3 text-sm font-medium text-white rounded-md ${
                  isExporting || !isFormComplete()
                    ? 'bg-red-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isExporting ? 'Exporting...' : 'Export PDF'}
              </motion.button>
            )}
            <motion.button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cancel
            </motion.button>
            {step < 4 ? (
              <motion.button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 text-sm font-medium text-white bg-[#FF4B36] rounded-md hover:bg-[#FF4B36]/90 transition-all duration-200"
                disabled={isSaving}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Next
              </motion.button>
            ) : (
              <motion.button
                type="submit"
                disabled={!isFormComplete() || isSaving}
                className={`px-6 py-3 text-sm font-medium text-white rounded-md flex items-center space-x-2 ${
                  isFormComplete() && !isSaving
                    ? 'bg-[#FF4B36] hover:bg-[#FF4B36]/90'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
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
              </motion.button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
