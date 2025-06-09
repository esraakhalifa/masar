'use client';

import { useState, useEffect } from 'react';
import type { Experience } from '@/app/lib/types/profile';
import { toast } from 'react-hot-toast';

const JOB_TITLES = [
  // Software Development
  'Software Engineer',
  'Senior Software Engineer',
  'Lead Software Engineer',
  'Principal Software Engineer',
  'Software Architect',
  // Frontend
  'Frontend Developer',
  'Senior Frontend Developer',
  'UI Developer',
  'JavaScript Developer',
  'React Developer',
  // Backend
  'Backend Developer',
  'Senior Backend Developer',
  'API Developer',
  'Node.js Developer',
  'Python Developer',
  // Full Stack
  'Full Stack Developer',
  'Senior Full Stack Developer',
  'Web Developer',
  // DevOps & Cloud
  'DevOps Engineer',
  'Cloud Engineer',
  'Site Reliability Engineer',
  'Infrastructure Engineer',
  // Data & AI
  'Data Scientist',
  'Machine Learning Engineer',
  'AI Engineer',
  'Data Engineer',
  'Business Intelligence Developer',
  // Management
  'Engineering Manager',
  'Technical Lead',
  'Product Manager',
  'Project Manager',
  'Scrum Master',
  // Design
  'UI/UX Designer',
  'Product Designer',
  'Interaction Designer',
  // QA & Testing
  'QA Engineer',
  'Test Engineer',
  'Automation Engineer',
  // Other
  'Other'
] as const;

const COMPANIES = [
  // Tech Giants
  'Google',
  'Microsoft',
  'Amazon',
  'Apple',
  'Meta',
  'IBM',
  'Oracle',
  'Salesforce',
  'Adobe',
  'Intel',
  'Cisco',
  'Dell',
  // Cloud & Infrastructure
  'AWS',
  'Google Cloud',
  'Microsoft Azure',
  'DigitalOcean',
  'Cloudflare',
  // Software & Services
  'GitHub',
  'GitLab',
  'Atlassian',
  'Slack',
  'Zoom',
  'Dropbox',
  // Social & Media
  'Twitter',
  'LinkedIn',
  'Netflix',
  'Spotify',
  'Pinterest',
  // E-commerce
  'Shopify',
  'eBay',
  'PayPal',
  'Stripe',
  // Other
  'Other'
] as const;

interface ExperienceFormProps {
  experience: Experience[];
  onChange: (experience: Experience[]) => void;
}

export default function ExperienceForm({ experience, onChange }: ExperienceFormProps) {
  const [newExperience, setNewExperience] = useState<Partial<Experience>>({
    title: '',
    company: '',
    startDate: '',
    endDate: '',
    description: ''
  });

  const [customTitle, setCustomTitle] = useState('');
  const [customCompany, setCustomCompany] = useState('');

  const [errors, setErrors] = useState<{
    title?: string;
    company?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }>({});

  // Initialize custom values when editing existing experience
  useEffect(() => {
    if (newExperience.title && !JOB_TITLES.includes(newExperience.title as any)) {
      setCustomTitle(newExperience.title);
    }
    if (newExperience.company && !COMPANIES.includes(newExperience.company as any)) {
      setCustomCompany(newExperience.company);
    }
  }, [newExperience.title, newExperience.company]);

  const validateExperience = (exp: Partial<Experience>): boolean => {
    const newErrors: typeof errors = {};

    if (!exp.title?.trim()) {
      newErrors.title = 'Job title is required';
    }

    if (!exp.company?.trim()) {
      newErrors.company = 'Company name is required';
    }

    if (!exp.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    const checkbox = document.querySelector('input[type="checkbox"]') as HTMLInputElement | null;
    if (!exp.endDate && !(checkbox && checkbox.checked)) {
      newErrors.endDate = 'End date is required';
    }

    if (exp.startDate && exp.endDate && new Date(exp.startDate) > new Date(exp.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (exp.description && exp.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addExperience = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    if (validateExperience(newExperience)) {
      onChange([...experience, newExperience as Experience]);
      setNewExperience({
        title: '',
        company: '',
        startDate: '',
        endDate: '',
        description: ''
      });
      setCustomTitle('');
      setCustomCompany('');
      setErrors({});
      toast.success('Experience added successfully');
    } else {
      toast.error('Please fill in all required fields correctly');
    }
  };

  const removeExperience = (index: number) => {
    const updatedExperience = experience.filter((_, i) => i !== index);
    onChange(updatedExperience);
  };

  const handleTitleChange = (value: string) => {
    if (value === 'Other') {
      setNewExperience({ ...newExperience, title: customTitle || 'Other' });
    } else {
      setNewExperience({ ...newExperience, title: value });
      setCustomTitle(''); // Clear custom title when selecting a predefined option
    }
  };

  const handleCompanyChange = (value: string) => {
    if (value === 'Other') {
      setNewExperience({ ...newExperience, company: customCompany || 'Other' });
    } else {
      setNewExperience({ ...newExperience, company: value });
      setCustomCompany(''); // Clear custom company when selecting a predefined option
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Work Experience</h2>
      
      {/* Add New Experience */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Job Title
          </label>
          <select
            id="title"
            value={JOB_TITLES.includes(newExperience.title as any) ? newExperience.title : 'Other'}
            onChange={(e) => handleTitleChange(e.target.value)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900 ${
              errors.title ? 'border-red-300' : ''
            }`}
          >
            <option value="">Select a job title</option>
            {JOB_TITLES.map((title) => (
              <option key={title} value={title}>
                {title}
              </option>
            ))}
          </select>
          {(newExperience.title === 'Other' || !JOB_TITLES.includes(newExperience.title as any)) && (
            <input
              type="text"
              value={customTitle}
              onChange={(e) => {
                setCustomTitle(e.target.value);
                setNewExperience({ ...newExperience, title: e.target.value });
              }}
              placeholder="Enter custom job title"
              className={`mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900 ${
                errors.title ? 'border-red-300' : ''
              }`}
            />
          )}
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700">
            Company
          </label>
          <select
            id="company"
            value={COMPANIES.includes(newExperience.company as any) ? newExperience.company : 'Other'}
            onChange={(e) => handleCompanyChange(e.target.value)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900 ${
              errors.company ? 'border-red-300' : ''
            }`}
          >
            <option value="">Select a company</option>
            {COMPANIES.map((company) => (
              <option key={company} value={company}>
                {company}
              </option>
            ))}
          </select>
          {(newExperience.company === 'Other' || !COMPANIES.includes(newExperience.company as any)) && (
            <input
              type="text"
              value={customCompany}
              onChange={(e) => {
                setCustomCompany(e.target.value);
                setNewExperience({ ...newExperience, company: e.target.value });
              }}
              placeholder="Enter custom company"
              className={`mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900 ${
                errors.company ? 'border-red-300' : ''
              }`}
            />
          )}
          {errors.company && (
            <p className="mt-1 text-sm text-red-600">{errors.company}</p>
          )}
        </div>

        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            value={newExperience.startDate}
            onChange={(e) => setNewExperience({ ...newExperience, startDate: e.target.value })}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900 ${
              errors.startDate ? 'border-red-300' : ''
            }`}
          />
          {errors.startDate && (
            <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
          )}
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            value={newExperience.endDate}
            onChange={(e) => setNewExperience({ ...newExperience, endDate: e.target.value })}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900 ${
              errors.endDate ? 'border-red-300' : ''
            }`}
          />
          <div className="mt-2">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={!newExperience.endDate}
                onChange={(e) => setNewExperience({ ...newExperience, endDate: e.target.checked ? '' : new Date().toISOString().split('T')[0] })}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-600">I currently work here</span>
            </label>
          </div>
          {errors.endDate && (
            <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description (Optional)
          </label>
          <textarea
            id="description"
            value={newExperience.description}
            onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900 ${
              errors.description ? 'border-red-300' : ''
            }`}
            rows={3}
            placeholder="Describe your responsibilities and achievements (optional)..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <button
            type="button"
            onClick={addExperience}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Add Experience
          </button>
        </div>
      </div>

      {/* Experience List */}
      <div className="space-y-4">
        {experience.map((exp, index) => (
          <div key={index} className="p-4 bg-gray-50 rounded-md border border-gray-200">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-medium text-gray-900">{exp.title}</h3>
                <p className="text-sm text-gray-600">{exp.company}</p>
                <p className="text-sm text-gray-500">
                  {new Date(exp.startDate).toLocaleDateString()} - 
                  {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'Present'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeExperience(index)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
            {exp.description && (
              <p className="text-sm text-gray-700 mt-2">{exp.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 