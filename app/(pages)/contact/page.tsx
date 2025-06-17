'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { validateContactForm, type ContactFormData } from '@/app/lib/validation/contactValidation';
import { sanitizeObjectForSQL } from '@/app/lib/security/sqlInjection';
import { CSRF_HEADER } from '@/app/lib/security/csrf';
import Layout from '../../../components/Layout';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { motion } from 'framer-motion';

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

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const inputVariants = {
    initial: { borderColor: '#D1D5DB' }, // gray-300
    focus: { borderColor: '#8B5CF6', boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.3)' }, // purple-500 with shadow
  };

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
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="text-center mb-12 bg-white p-6 rounded-xl shadow-lg"
          >
            <h1 className="text-4xl font-extrabold text-gray-900 leading-tight mb-3">Get in Touch</h1>
            <p className="mt-2 text-lg text-gray-700 max-w-2xl mx-auto">Have questions about our career analysis service? We&#39;re here to help you succeed.</p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-10"
          >
            {/* Contact Form */}
            <motion.div
              variants={itemVariants}
              className="bg-white p-8 rounded-xl shadow-2xl border border-purple-100 transform hover:scale-[1.01] transition-transform duration-300 ease-in-out"
            >
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600"></div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <motion.div variants={itemVariants}>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                    <motion.input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className={`mt-1 block w-full rounded-md shadow-sm text-gray-900 placeholder-gray-400 py-2 px-3 border ${errors.name ? 'border-red-500' : 'border-gray-300'} focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 ease-in-out`}
                      placeholder="Your full name"
                      variants={inputVariants}
                      whileFocus="focus"
                    />
                    {errors.name && (
                      <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-1 text-sm text-red-600">{errors.name}</motion.p>
                    )}
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <motion.input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className={`mt-1 block w-full rounded-md shadow-sm text-gray-900 placeholder-gray-400 py-2 px-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 ease-in-out`}
                      placeholder="your.email@example.com"
                      variants={inputVariants}
                      whileFocus="focus"
                    />
                    {errors.email && (
                      <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-1 text-sm text-red-600">{errors.email}</motion.p>
                    )}
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                    <motion.input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className={`mt-1 block w-full rounded-md shadow-sm text-gray-900 placeholder-gray-400 py-2 px-3 border ${errors.subject ? 'border-red-500' : 'border-gray-300'} focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 ease-in-out`}
                      placeholder="What is this regarding?"
                      variants={inputVariants}
                      whileFocus="focus"
                    />
                    {errors.subject && (
                      <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-1 text-sm text-red-600">{errors.subject}</motion.p>
                    )}
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                    <motion.textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className={`mt-1 block w-full rounded-md shadow-sm text-gray-900 placeholder-gray-400 py-2 px-3 border ${errors.message ? 'border-red-500' : 'border-gray-300'} focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 ease-in-out`}
                      placeholder="Your message here..."
                      variants={inputVariants}
                      whileFocus="focus"
                    />
                    {errors.message && (
                      <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-1 text-sm text-red-600">{errors.message}</motion.p>
                    )}
                  </motion.div>

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-[#FF4B36] text-white rounded-lg font-semibold shadow-md hover:bg-[#FF4B36] transition-colors text-lg"
                  >
                    Send Message
                  </motion.button>
                </form>
              )}
            </motion.div>

            {/* Contact Information */}
            <motion.div
              variants={itemVariants}
              className="bg-white p-8 rounded-xl shadow-2xl border border-purple-100 transform hover:scale-[1.01] transition-transform duration-300 ease-in-out"
            >
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Contact Information</h2>
              <p className="text-gray-700 mb-8">Reach out to us through the following channels. We're always happy to hear from you!</p>

              <div className="space-y-6">
                <motion.div variants={itemVariants} className="flex items-start space-x-4 bg-purple-50 p-4 rounded-lg shadow-sm border border-purple-100">
                  <Mail className="flex-shrink-0 w-7 h-7 text-[#2434B3]" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Email Us</h3>
                    <p className="text-gray-600 mt-1">ITIinfo@iti.gov.eg</p>
                  </div>
                </motion.div>
                <motion.div variants={itemVariants} className="flex items-start space-x-4 bg-purple-50 p-4 rounded-lg shadow-sm border border-purple-100">
                  <Phone className="flex-shrink-0 w-7 h-7 text-[#2434B3]" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Call Us</h3>
                    <p className="text-gray-600 mt-1">(+20) 235355690</p>
                  </div>
                </motion.div>
                <motion.div variants={itemVariants} className="flex items-start space-x-4 bg-purple-50 p-4 rounded-lg shadow-sm border border-purple-100">
                  <MapPin className="flex-shrink-0 w-7 h-7 text-[#2434B3]" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Visit Us</h3>
                    <p className="text-gray-600 mt-1">Information Technology Institute (Knowledge City)</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </Layout>
  );
} 