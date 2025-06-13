'use client';

import { useState, useEffect } from 'react';
import type { CareerPreference } from '@/app/lib/types/profile';

const INDUSTRIES = [
  // Technology & Software
  'Software Engineering',
  'Web Development',
  'Mobile Development',
  'Data Science',
  'Artificial Intelligence',
  'Cloud Computing',
  'DevOps',
  'Cybersecurity',
  'IT Infrastructure',
  'Quality Assurance',
  // Other Industries
  'Healthcare',
  'Finance',
  'Education',
  'Manufacturing',
  'Retail',
  'Media',
  'Government',
  'Non-profit',
  'Other'
] as const;

const WORK_TYPES = ['remote', 'hybrid', 'onsite'] as const;

interface CareerPreferencesProps {
  preferences: CareerPreference;
  onChange: (preferences: CareerPreference) => void;
}

export default function CareerPreferences({ preferences, onChange }: CareerPreferencesProps) {
  const [customIndustry, setCustomIndustry] = useState('');
  const [locationError, setLocationError] = useState<string>('');
  const [salaryError, setSalaryError] = useState<string>('');
  const [customIndustryError, setCustomIndustryError] = useState<string>('');

  // Initialize customIndustry when preferences.industry is not in INDUSTRIES
  useEffect(() => {
    if (preferences.industry && !(INDUSTRIES as readonly string[]).includes(preferences.industry)) {
      setCustomIndustry(preferences.industry);
    }
  }, [preferences.industry]);

  const handleIndustryChange = (value: string) => {
    if (value === 'Other') {
      // Keep the current custom industry value if it exists
      onChange({ ...preferences, industry: customIndustry || 'Other' });
    } else {
      onChange({ ...preferences, industry: value });
      setCustomIndustry(''); // Clear custom industry when selecting a predefined option
    }
  };

  const handleCustomIndustryChange = (value: string) => {
    setCustomIndustry(value);
    onChange({ ...preferences, industry: value });
    validateCustomIndustry(value); // Validate on change
  };

  const validateLocation = (location: string): boolean => {
    if (!location.trim()) {
      setLocationError('Location is required');
      return false;
    }
    if (location.length < 3) {
      setLocationError('Location must be at least 3 characters long');
      return false;
    }
    if (!/^[A-Za-z\s]+$/.test(location)) {
      setLocationError('Location can only contain letters and spaces');
      return false;
    }
    setLocationError('');
    return true;
  };

  const validateSalary = (salary: string): boolean => {
    if (!salary.trim()) {
      setSalaryError('Salary is required');
      return false;
    }
    if (!/^\d+$/.test(salary)) {
      setSalaryError('Salary must contain only numbers');
      return false;
    }
    const numSalary = parseInt(salary);
    if (numSalary === 0) {
      setSalaryError('Salary cannot be zero');
      return false;
    }
    if (numSalary < 100) {
      setSalaryError('Salary must be at least 100');
      return false;
    }
    setSalaryError('');
    return true;
  };

  const validateCustomIndustry = (industry: string): boolean => {
    if (!industry.trim()) {
      setCustomIndustryError('Custom industry is required');
      return false;
    }
    if (industry.trim().length < 3) {
      setCustomIndustryError('Custom industry must be at least 3 characters long');
      return false;
    }
    setCustomIndustryError('');
    return true;
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLocation = e.target.value;
    onChange({ ...preferences, location: newLocation });
    validateLocation(newLocation);
  };

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSalary = e.target.value;
    onChange({ ...preferences, preferredSalary: newSalary ? parseInt(newSalary) : 0 });
    validateSalary(newSalary);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Career Preferences</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
            Industry
          </label>
          <select
            id="industry"
            value={(INDUSTRIES as readonly string[]).includes(preferences.industry) ? preferences.industry : 'Other'}
            onChange={(e) => {
              handleIndustryChange(e.target.value);
              if (e.target.value === 'Other') {
                // If switching to 'Other', validate the current customIndustry value
                validateCustomIndustry(customIndustry);
              } else {
                setCustomIndustryError(''); // Clear error if not 'Other'
              }
            }}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF4B36] focus:ring-[#FF4B36] bg-white text-gray-900"
          >
            <option value="">Select an industry</option>
            {INDUSTRIES.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
          {(preferences.industry === 'Other' || !(INDUSTRIES as readonly string[]).includes(preferences.industry)) && (
            <div>
              <input
                type="text"
                value={customIndustry}
                onChange={(e) => handleCustomIndustryChange(e.target.value)}
                onBlur={(e) => validateCustomIndustry(e.target.value)} // Validate on blur
                className={`mt-2 block w-full rounded-md shadow-sm focus:ring-[#FF4B36] focus:border-[#FF4B36] bg-white text-gray-900 placeholder-gray-400 ${
                  customIndustryError ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter custom industry"
              />
              {customIndustryError && (
                <p className="mt-1 text-sm text-red-600">{customIndustryError}</p>
              )}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Preferred Location
          </label>
          <input
            type="text"
            id="location"
            value={preferences.location}
            onChange={handleLocationChange}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-[#FF4B36] focus:border-[#FF4B36] bg-white text-gray-900 placeholder-gray-400 ${
              locationError ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter your preferred location"
          />
          {locationError && (
            <p className="mt-1 text-sm text-red-600">{locationError}</p>
          )}
        </div>

        <div>
          <label htmlFor="workType" className="block text-sm font-medium text-gray-700">
            Work Type
          </label>
          <select
            id="workType"
            value={preferences.workType}
            onChange={(e) => onChange({ ...preferences, workType: e.target.value as CareerPreference['workType'] })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF4B36] focus:ring-[#FF4B36] bg-white text-gray-900"
          >
            {WORK_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="salary" className="block text-sm font-medium text-gray-700">
            Preferred Salary (EGP)
          </label>
          <input
            type="text"
            id="salary"
            value={preferences.preferredSalary || ''}
            onChange={handleSalaryChange}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-[#FF4B36] focus:border-[#FF4B36] bg-white text-gray-900 placeholder-gray-400 ${
              salaryError ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter your preferred salary"
          />
          {salaryError && (
            <p className="mt-1 text-sm text-red-600">{salaryError}</p>
          )}
        </div>
      </div>
    </div>
  );
} 