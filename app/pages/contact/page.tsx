'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { validateContactForm, type ContactFormData } from '@/app/lib/validation/contactValidation';
import { sanitizeObjectForSQL } from '@/app/lib/security/sqlInjection';
import { CSRF_HEADER } from '@/app/lib/security/csrf';
import Layout from '../../../components/Layout';
import { Mail, Phone, MapPin } from 'lucide-react';

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

  const initializeCSRFToken = useCallback(async () => {
    console.log('CSRF initialization started.');
    try {
      setIsLoading(true);
      console.log('Fetching CSRF token...');
      
      // Always fetch the CSRF token from the dedicated API endpoint
      const response = await fetch('/api/csrf', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to initialize CSRF token from API: ${response.status} ${response.statusText}`);
      }
      
      const { token } = await response.json();
      console.log('Received token from API:', token);
      
      if (token) {
        setCsrfToken(token);
        setIsInitialized(true);
        console.log('CSRF Token and initialized state set.');
      } else {
        throw new Error('CSRF token missing in API response');
      }
    } catch (error) {
      console.error('Error initializing CSRF token:', error);
      toast.error('Failed to initialize form security. Please refresh the page.');
      setIsInitialized(false); // Ensure initialization is marked as false on error
    } finally {
      console.log('CSRF initialization finished. isLoading set to false.');
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }
  }, []);

  useEffect(() => {
    initializeCSRFToken();
  }, [initializeCSRFToken]);

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
    <Layout>
      <main className="min-h-screen bg-gradient-to-br from-purple-50 to-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Get in Touch</h1>
            <p className="mt-2 text-gray-600">Have questions about our career analysis service? We&#39;re here to help you succeed.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Form */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
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
                      className={`mt-1 block w-full rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-gray-900 ${
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
                      className={`mt-1 block w-full rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-gray-900 ${
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
                      className={`mt-1 block w-full rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-gray-900 ${
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
                      className={`mt-1 block w-full rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-gray-900 ${
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
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                      isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>

            {/* Project Information */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact Information</h2>
              <p className="text-gray-600 mb-6">Reach out to us through the following channels:</p>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="flex-shrink-0 w-6 h-6 text-purple-600" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">Email Us</h3>
                    <p className="text-gray-600">ITIinfo@iti.gov.eg</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="flex-shrink-0 w-6 h-6 text-purple-600" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">Call Us</h3>
                    <p className="text-gray-600">(+20) 235355690</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="flex-shrink-0 w-6 h-6 text-purple-600" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">Visit Us</h3>
                    <p className="text-gray-600">Information Technology Institute (Knowledge City)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
} 