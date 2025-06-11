/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Layout from '../../components/Layout';
import { Upload, FileText, CheckCircle, AlertCircle, ArrowRight, XCircle } from 'lucide-react';
import { fetchWithCsrf } from '../lib/fetchWithCsrf';

interface FormData {
  jobRole: string;
  additionalInfo?: string;
}

interface UploadStatus {
  type: 'success' | 'error';
  message: string;
}

interface ParsedData {
  skills: string[];
  rawData?: unknown; 
}

const MAX_WORDS = 100; // Maximum number of words allowed

export default function CVUploadPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus | null>(null);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [showParsedData, setShowParsedData] = useState<boolean>(false);
  const [wordCount, setWordCount] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<FormData>();

  const jobRoles: string[] = [
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'Mobile App Developer',
    'DevOps Engineer',
    'Data Scientist',
    'Machine Learning Engineer',
    'UI/UX Designer',
    'Product Manager',
    'Software Architect',
    'Quality Assurance Engineer',
    'Cybersecurity Specialist',
    'Cloud Engineer',
    'Database Administrator',
    'System Administrator'
  ];

  const selectedRole = watch('jobRole');

  const additionalInfo = watch('additionalInfo', '');
  
  useEffect(() => {
    const words = (additionalInfo || '').trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [additionalInfo]);

  const removeFile = () => {
    setUploadedFile(null);
    setParsedData(null);
    setShowParsedData(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getCsrfToken = async (): Promise<string> => {
    const res = await fetch('/api/csrf', { credentials: 'include' });
    const data = await res.json();
    return data.token;
  };

  const onSubmit = async (data: FormData) => {
    if (!uploadedFile) {
      setUploadStatus({ type: 'error', message: 'Please upload your CV first' });
      return;
    }

    setIsUploading(true);
    setUploadStatus(null);

    try {
      
      
      setUploadStatus({ 
        type: 'success', 
        message: 'CV processed successfully! Moving to next steps.....' 
      });
      
      setTimeout(() => {
        window.location.href = '/test';
      }, 2000);
      
    } catch (error) {
      setUploadStatus({ 
        type: 'error', 
        message: 'Failed to process CV. Please try again.' 
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type === 'application/pdf') {
      setIsParsing(true);
      setUploadStatus(null);
      setParsedData(null);
      setShowParsedData(false);

      try {
        const csrfToken = await getCsrfToken();
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetchWithCsrf('/api/parse-resume', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          throw new Error('Failed to parse resume');
        }

        const result = await res.json();

        if (result.success) {
          setParsedData({
            skills: result.data.skills || [],
            rawData: result.data 
          });

          setUploadedFile(file);
          setUploadStatus({ type: 'success', message: 'CV parsed successfully!' });
          setShowParsedData(true);
        } else {
          throw new Error(result.error || 'Failed to parse resume');
        }
      } catch (error) {
        console.error('Parsing failed:', error);
        setUploadStatus({
          type: 'error',
          message: 'Failed to parse CV. Ensure it\'s a text-based PDF.'
        });
      } finally {
        setIsParsing(false);
      }
    }
  };

  return (
<Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4" style={{background: 'linear-gradient(to right, #2434B3, #1e29a3)'}}>
              <Upload className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Your CV</h1>
            <p className="text-gray-600">Let AI analyze your skills and create a personalized career roadmap</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* File Upload Section */}
            <div className="border-2 border-dashed rounded-xl p-8 text-center transition-colors" style={{borderColor: '#2434B3'}} onMouseEnter={(e) => (e.target as HTMLElement).style.borderColor = '#FF4B36'} onMouseLeave={(e) => (e.target as HTMLElement).style.borderColor = '#2434B3'}>
              <input
                type="file"
                id="cv-upload"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
                ref={fileInputRef}
                disabled={isParsing}

              />
              <label
                htmlFor="cv-upload"
                className={`cursor-pointer flex flex-col items-center space-y-4 ${isParsing ? 'opacity-70' : ''}`}
              >
                {isParsing ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 mb-4" style={{borderColor: '#2434B3'}}></div>
                    <div className="text-gray-600">Analyzing your CV...</div>
                  </div>
                ) : uploadedFile ? (
                  <div className="relative w-full">
                    <div className="absolute top-0 right-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          removeFile();
                          setUploadStatus(null);
                        }}
                        className="rounded-full p-1 transition-colors" 
                        style={{backgroundColor: '#ffebe9'}}
                        onMouseEnter={(e) => ((e.target as HTMLButtonElement).style.backgroundColor = '#ffd6d1')}
                        onMouseLeave={(e) => ((e.target as HTMLButtonElement).style.backgroundColor = '#ffebe9')}
                      >
                        <XCircle className="w-5 h-5" style={{color: '#FF4B36'}} />
                      </button>
                    </div>
                    <FileText className="w-12 h-12 mx-auto" style={{color: '#2434B3'}} />
                    <div className="font-medium truncate max-w-xs mx-auto" style={{color: '#2434B3'}}>
                      {uploadedFile.name}
                    </div>
                    <div className="text-sm text-gray-500 mt-2">Click to change file</div>
                  </div>
                ) : (
                  <>
                    <Upload className="w-12 h-12" style={{color: '#2434B3'}} />
                    <div className="text-lg font-medium text-gray-700">
                      Drop your CV here or click to browse
                    </div>
                    <div className="text-sm text-gray-500">
                      Supports PDF, DOC, DOCX (Max 10MB)
                    </div>
                  </>
                )}
              </label>

            </div>

            {/* Parsed Data Preview */}
            {showParsedData && parsedData && (
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Extracted Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-md font-medium text-gray-700 mb-2 flex items-center">
                      <span>Skills</span>
                      <span className="ml-2 text-xs px-2 py-1 rounded-full text-white" style={{backgroundColor: '#2434B3'}}>
                        {parsedData.skills.length} found
                      </span>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {parsedData.skills.map((skill, index) => (
                        <span 
                          key={index} 
                          className="text-sm px-3 py-1 rounded-full text-white"
                          style={{backgroundColor: '#FF4B36'}}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                </div>
                
                <button
                  type="button"
                  onClick={() => setShowParsedData(false)}
                  className="mt-4 text-sm text-gray-500 hover:text-gray-700 flex items-center"
                >
                  Hide details
                </button>
              </div>
            )}



            {/* Job Role Selection */}
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-3">
                Select Your Target Job Role
              </label>
              <select
                {...register('jobRole', { required: 'Please select a job role' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900"
                style={{'--tw-ring-color': '#2434B3'} as React.CSSProperties}
                onFocus={(e) => {
                  e.target.style.outline = 'none';
                  e.target.style.borderColor = '#2434B3';
                  e.target.style.boxShadow = '0 0 0 2px rgba(36, 52, 179, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="">Choose a role...</option>
                {jobRoles.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              {errors.jobRole && (
                <p className="mt-2 text-sm flex items-center" style={{color: '#FF4B36'}}>
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.jobRole.message}
                </p>
              )}
            </div>

            {/* Additional Information */}
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-3">
                Additional Information (Optional)
              </label>
              <div className="relative">
                <textarea
                  {...register('additionalInfo', {
                    validate: (value) => {
                      const words = value?.trim().split(/\s+/).filter(word => word.length > 0) || [];
                      return words.length <= MAX_WORDS || `Maximum ${MAX_WORDS} words allowed`;
                    }
                  })}
                  rows={4}
                  placeholder="Tell us about your career goals, preferred technologies, extra skills, or any specific requirements..."
                  className={`w-full px-4 py-3 border ${
                    wordCount > MAX_WORDS ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg resize-none`}
                  onFocus={(e) => {
                    if (wordCount <= MAX_WORDS) {
                      e.target.style.outline = 'none';
                      e.target.style.borderColor = '#2434B3';
                      e.target.style.boxShadow = '0 0 0 2px rgba(36, 52, 179, 0.2)';
                    }
                  }}
                  onBlur={(e) => {
                    if (wordCount <= MAX_WORDS) {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                />
                <div className="absolute bottom-2 right-2 text-sm text-gray-500">
                  {wordCount}/{MAX_WORDS} words
                </div>
              </div>
              {errors.additionalInfo && (
                <p className="mt-2 text-sm flex items-center" style={{color: '#FF4B36'}}>
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.additionalInfo.message}
                </p>
              )}
            </div>

            {/* Status Messages */}
            {uploadStatus && (
              <div className={`flex items-center p-4 rounded-lg border ${
                uploadStatus.type === 'success' 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'bg-red-50 border-red-200'
              }`} style={{
                color: uploadStatus.type === 'success' ? '#2434B3' : '#FF4B36'
              }}>
                {uploadStatus.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 mr-2" />
                ) : (
                  <AlertCircle className="w-5 h-5 mr-2" />
                )}
                {uploadStatus.message}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isUploading || !uploadedFile || !selectedRole}
              className="w-full text-white py-4 px-6 rounded-lg font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all duration-200"
              style={{
                background: isUploading || !uploadedFile || !selectedRole 
                  ? '#9ca3af' 
                  : 'linear-gradient(to right, #2434B3, #FF4B36)'
              }}
              onMouseEnter={(e) => {
                if (!(e.target as HTMLButtonElement).disabled) {
                  (e.target as HTMLButtonElement).style.background = 'linear-gradient(to right, #1e29a3, #e6412d)';
                }
              }}
              onMouseLeave={(e) => {
                if (!(e.target as HTMLButtonElement).disabled) {
                  (e.target as HTMLButtonElement).style.background = 'linear-gradient(to right, #2434B3, #FF4B36)';
                }
              }}
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processing CV...</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}