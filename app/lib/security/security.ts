import { z } from 'zod';
import { sanitizeSQLInput } from './sqlInjection';

// Rate limiting configuration
export const RATE_LIMIT = {
  windowMs: 60 * 1000, // 1 minute
  max: 1000, // Limit each IP to 1000 requests per minute
};

// CSRF token validation
export const validateCSRFToken = (token: string, storedToken: string): boolean => {
  if (!token || !storedToken) return false;
  return token === storedToken;
};

// Input sanitization
export const sanitizeInput = (input: string): string => {
  return sanitizeSQLInput(input);
};

// Profile validation schema
export const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50).transform(sanitizeInput),
  lastName: z.string().min(1, 'Last name is required').max(50).transform(sanitizeInput),
  email: z.string().email('Invalid email format'),
  skills: z.array(z.object({
    name: z.string().min(1, 'Skill name is required').max(50).transform(sanitizeInput),
    level: z.number().min(1).max(5).optional(),
    category: z.string().max(50).optional(),
  })).min(1, 'At least one skill is required'),
  education: z.array(z.object({
    institution: z.string().min(1, 'Institution is required').max(100).transform(sanitizeInput),
    degree: z.string().min(1, 'Degree is required').max(100).transform(sanitizeInput),
    fieldOfStudy: z.string().min(1, 'Field of study is required').max(100).transform(sanitizeInput),
    graduationYear: z.string().min(1, 'Graduation year is required')
      .transform((val) => {
        const year = parseInt(val);
        if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 10) {
          throw new Error('Invalid graduation year');
        }
        return year;
      })
  })).min(1, 'At least one education entry is required'),
  experience: z.array(z.object({
    title: z.string().min(1, 'Title is required').max(100).transform(sanitizeInput),
    company: z.string().min(1, 'Company is required').max(100).transform(sanitizeInput),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format').optional().nullable(),
    description: z.string().max(500).transform(sanitizeInput).optional(),
  })).min(1, 'At least one experience entry is required'),
}).strict(); 