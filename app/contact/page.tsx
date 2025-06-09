'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { validateContactForm, type ContactFormData } from '@/app/lib/utils/contactValidation';
import { sanitizeObjectForSQL } from '@/app/lib/utils/sqlInjection';
import { CSRF_HEADER, CSRF_COOKIE, generateCSRFToken } from '@/app/lib/utils/csrf';

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeCSRFToken = async () => {
      try {
        setIsLoading(true);
        
        // Get the CSRF token from the cookie
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('csrf_token='))
          ?.split('=')[1];
        
        if (token) {
          setCsrfToken(token);
          setIsInitialized(true);
        } else {
          // If no token exists, make a request to initialize one
          const response = await fetch('/api/contact', {
            method: 'GET',
            credentials: 'include'
          });
          
          if (response.ok) {
            const newToken = document.cookie
              .split('; ')
              .find(row => row.startsWith('csrf_token='))
              ?.split('=')[1];
            
            if (newToken) {
              setCsrfToken(newToken);
              setIsInitialized(true);
            }
          }
        }
      } catch (error) {
        console.error('Error initializing CSRF token:', error);
        toast.error('Failed to initialize form security. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeCSRFToken();
  }, []);

  const validateField = (name: keyof ContactFormData, value: string) => {
    const validationError = validateContactForm({ ...formData, [name]: value });
    if (validationError && validationError.field === name) {
      setErrors(prev => ({ ...prev, [name]: validationError.message }));
      return false;
    }
    setErrors(prev => ({ ...prev, [name]: undefined }));
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name as keyof ContactFormData, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isInitialized) {
      toast.error('Form is not ready. Please wait a moment and try again.');
      return;
    }

    if (!csrfToken) {
      toast.error('Security token not found. Please refresh the page and try again.');
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    // Validate all fields
    const validationError = validateContactForm(formData);
    if (validationError) {
      setErrors(prev => ({ ...prev, [validationError.field]: validationError.message }));
      toast.error(validationError.message);
      setIsSubmitting(false);
      return;
    }

    try {
      // Sanitize data for SQL injection
      const sanitizedData = sanitizeObjectForSQL(formData);

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          [CSRF_HEADER]: csrfToken,
        },
        body: JSON.stringify(sanitizedData),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }

      toast.success('Message sent successfully!');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">Contact Us</h1>
          <p className="mt-2 text-gray-600">Get in touch with us for any questions or support</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Your name (letters only)"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="your.email@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${
                      errors.subject ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="What is this regarding?"
                  />
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${
                      errors.message ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Your message here..."
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>

          {/* Project Information */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">About Masar</h2>
              <p className="text-gray-600 mb-4">
                Masar is a career development platform that helps professionals build their career roadmap,
                track their skills, and achieve their career goals.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">Key Features</h3>
                  <ul className="mt-2 space-y-2 text-gray-600">
                    <li>• Professional Profile Building</li>
                    <li>• Skills Assessment & Tracking</li>
                    <li>• Career Path Planning</li>
                    <li>• Education & Experience Management</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Get in Touch</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">Email</h3>
                  <p className="text-gray-600">support@masar.com</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Follow Us</h3>
                  <div className="flex space-x-4 mt-2">
                    <a href="#" className="text-gray-600 hover:text-blue-600">
                      LinkedIn
                    </a>
                    <a href="#" className="text-gray-600 hover:text-blue-600">
                      Twitter
                    </a>
                    <a href="#" className="text-gray-600 hover:text-blue-600">
                      GitHub
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 