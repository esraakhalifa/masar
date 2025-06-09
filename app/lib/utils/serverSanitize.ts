// Server-side sanitization utility
export function sanitizeString(input: string): string {
  if (!input) return '';
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and > characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove on* attributes
    .replace(/data:/gi, ''); // Remove data: protocol
}

export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeString(item) : sanitizeObject(item)
      );
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}

export function sanitizeProfile(profile: any): any {
  const sanitized = { ...profile };
  
  // Sanitize string fields
  if (typeof sanitized.fullName === 'string') {
    sanitized.fullName = sanitizeString(sanitized.fullName);
  }
  if (typeof sanitized.email === 'string') {
    sanitized.email = sanitizeString(sanitized.email);
  }
  
  // Sanitize skills
  if (Array.isArray(sanitized.skills)) {
    sanitized.skills = sanitized.skills.map((skill: any) => ({
      ...skill,
      name: typeof skill.name === 'string' ? sanitizeString(skill.name) : '',
      category: typeof skill.category === 'string' ? sanitizeString(skill.category) : 'General'
    }));
  }
  
  // Sanitize preferences
  if (sanitized.preferences) {
    sanitized.preferences = {
      ...sanitized.preferences,
      industry: typeof sanitized.preferences.industry === 'string' ? sanitizeString(sanitized.preferences.industry) : '',
      location: typeof sanitized.preferences.location === 'string' ? sanitizeString(sanitized.preferences.location) : ''
    };
  }
  
  // Sanitize education
  if (Array.isArray(sanitized.education)) {
    sanitized.education = sanitized.education.map((edu: any) => ({
      ...edu,
      degree: typeof edu.degree === 'string' ? sanitizeString(edu.degree) : '',
      fieldOfStudy: typeof edu.fieldOfStudy === 'string' ? sanitizeString(edu.fieldOfStudy) : '',
      institution: typeof edu.institution === 'string' ? sanitizeString(edu.institution) : ''
    }));
  }
  
  // Sanitize experience
  if (Array.isArray(sanitized.experience)) {
    sanitized.experience = sanitized.experience.map((exp: any) => ({
      ...exp,
      title: typeof exp.title === 'string' ? sanitizeString(exp.title) : '',
      company: typeof exp.company === 'string' ? sanitizeString(exp.company) : '',
      description: typeof exp.description === 'string' ? sanitizeString(exp.description) : ''
    }));
  }
  
  return sanitized;
} 