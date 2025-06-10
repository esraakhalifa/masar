'use client';

import { useState } from 'react';
import type { Education } from '@/app/lib/types/profile';
import { toast } from 'react-hot-toast';

const DEGREES = [
  'High School',
  'Associate',
  'Bachelor',
  'Master',
  'Doctorate',
  'Other'
] as const;

const FIELDS_OF_STUDY = [
  'Computer Science',
  'Engineering',
  'Business',
  'Medicine',
  'Arts',
  'Social Sciences',
  'Natural Sciences',
  'Other'
] as const;

interface EducationFormProps {
  education: Education[];
  onChange: (education: Education[]) => void;
}

export default function EducationForm({ education, onChange }: EducationFormProps) {
  const [newEducation, setNewEducation] = useState<Partial<Education>>({
    degree: '',
    fieldOfStudy: '',
    institution: '',
    graduationYear: new Date().getFullYear().toString()
  });

  const [customDegree, setCustomDegree] = useState('');
  const [customField, setCustomField] = useState('');

  const [institutionError, setInstitutionError] = useState<string>('');

  // Generate years array from 1970 to 2025
  const years = Array.from(
    { length: 2025 - 1970 + 1 },
    (_, i) => (1970 + i).toString()
  ).reverse();

  const handleDegreeChange = (value: string) => {
    if (value === 'Other') {
      setNewEducation({ ...newEducation, degree: '' });
    } else {
      setNewEducation({ ...newEducation, degree: value });
    }
  };

  const handleFieldChange = (value: string) => {
    if (value === 'Other') {
      setNewEducation({ ...newEducation, fieldOfStudy: '' });
    } else {
      setNewEducation({ ...newEducation, fieldOfStudy: value });
    }
  };

  const validateInstitution = (institution: string): boolean => {
    if (!institution.trim()) {
      setInstitutionError('Institution is required');
      return false;
    }
    if (institution.length < 3) {
      setInstitutionError('Institution must be at least 3 letters long');
      return false;
    }
    if (!/^[A-Za-z .'-]+$/.test(institution)) {
      setInstitutionError('Institution can only contain letters, spaces, dots, apostrophes, and hyphens');
      return false;
    }
    setInstitutionError('');
    return true;
  };

  const handleInstitutionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewEducation({ ...newEducation, institution: value });
    validateInstitution(value);
  };

  const addEducation = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent form submission
    
    if (newEducation.degree === 'Other' && !customDegree.trim()) {
      toast.error('Please enter a custom degree');
      return;
    }
    if (newEducation.fieldOfStudy === 'Other' && !customField.trim()) {
      toast.error('Please enter a custom field of study');
      return;
    }
    if (newEducation.degree && newEducation.fieldOfStudy && newEducation.institution && newEducation.graduationYear) {
      const educationToAdd = {
        ...newEducation,
        degree: newEducation.degree === 'Other' ? customDegree : newEducation.degree,
        fieldOfStudy: newEducation.fieldOfStudy === 'Other' ? customField : newEducation.fieldOfStudy
      } as Education;
      
      onChange([...education, educationToAdd]);
      setNewEducation({
        degree: '',
        fieldOfStudy: '',
        institution: '',
        graduationYear: new Date().getFullYear().toString()
      });
      setCustomDegree('');
      setCustomField('');
      setInstitutionError('');
    } else {
      toast.error('Please fill in all fields');
    }
  };

  const removeEducation = (index: number) => {
    const updatedEducation = [...education];
    updatedEducation.splice(index, 1);
    onChange(updatedEducation);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Education History</h2>

      {/* Form for adding new education */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="degree" className="block text-sm font-medium text-gray-700">
            Degree
          </label>
          <select
            id="degree"
            value={newEducation.degree}
            onChange={(e) => handleDegreeChange(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 bg-white text-gray-900"
          >
            <option value="">Select a degree</option>
            {DEGREES.map((degree) => (
              <option key={degree} value={degree}>
                {degree}
              </option>
            ))}
          </select>
          {newEducation.degree === 'Other' && (
            <input
              type="text"
              value={customDegree}
              onChange={(e) => setCustomDegree(e.target.value)}
              placeholder="Enter custom degree"
              className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 bg-white text-gray-900 placeholder-gray-400"
            />
          )}
        </div>

        <div>
          <label htmlFor="fieldOfStudy" className="block text-sm font-medium text-gray-700">
            Field of Study
          </label>
          <select
            id="fieldOfStudy"
            value={newEducation.fieldOfStudy}
            onChange={(e) => handleFieldChange(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 bg-white text-gray-900"
          >
            <option value="">Select a field</option>
            {FIELDS_OF_STUDY.map((field) => (
              <option key={field} value={field}>
                {field}
              </option>
            ))}
          </select>
          {newEducation.fieldOfStudy === 'Other' && (
            <input
              type="text"
              value={customField}
              onChange={(e) => setCustomField(e.target.value)}
              placeholder="Enter custom field"
              className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 bg-white text-gray-900 placeholder-gray-400"
            />
          )}
        </div>

        <div>
          <label htmlFor="institution" className="block text-sm font-medium text-gray-700">
            Institution
          </label>
          <input
            type="text"
            id="institution"
            value={newEducation.institution}
            onChange={handleInstitutionChange}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900 placeholder-gray-400 ${
              institutionError ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter your institution (letters only, min 3)"
          />
          {institutionError && (
            <p className="mt-1 text-sm text-red-600">{institutionError}</p>
          )}
        </div>

        <div>
          <label htmlFor="graduationYear" className="block text-sm font-medium text-gray-700">
            Graduation Year
          </label>
          <select
            id="graduationYear"
            value={newEducation.graduationYear}
            onChange={(e) => setNewEducation({ ...newEducation, graduationYear: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 bg-white text-gray-900"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="button" // Add type="button" to prevent form submission
        onClick={addEducation}
        className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors mb-6"
      >
        Add Education
      </button>

      {/* List of added education entries */}
      {education.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800">Added Education</h3>
          {education.map((edu, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-700">Education #{index + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeEducation(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Degree</label>
                  <p className="mt-1 text-gray-900">{edu.degree}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Field of Study</label>
                  <p className="mt-1 text-gray-900">{edu.fieldOfStudy}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Institution</label>
                  <p className="mt-1 text-gray-900">{edu.institution}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Graduation Year</label>
                  <p className="mt-1 text-gray-900">{edu.graduationYear}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 