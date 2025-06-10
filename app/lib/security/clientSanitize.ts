'use client';

import { UserProfile, Skill, Education, Experience } from '../types/profile';

// Simple sanitization utility
export function sanitizeString(input: string): string {
  if (!input) return '';
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and > characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove on* attributes
    .replace(/data:/gi, ''); // Remove data: protocol
}

export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeString(item) : sanitizeObject(item as Record<string, unknown>)
      );
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}

export function sanitizeProfile(profile: UserProfile): UserProfile {
  const sanitized: UserProfile = { ...profile };
  
  // Sanitize string fields
  sanitized.fullName = sanitizeString(sanitized.fullName);
  sanitized.email = sanitizeString(sanitized.email);
  
  // Sanitize skills
  sanitized.skills = sanitized.skills.map((skill: Skill) => ({
    ...skill,
    name: sanitizeString(skill.name),
    category: skill.category ? sanitizeString(skill.category) : undefined // Ensure category is handled
  }));
  
  // Sanitize education
  sanitized.education = sanitized.education.map((edu: Education) => ({
    ...edu,
    degree: sanitizeString(edu.degree),
    fieldOfStudy: sanitizeString(edu.fieldOfStudy),
    institution: sanitizeString(edu.institution),
    description: edu.description ? sanitizeString(edu.description) : undefined
  }));
  
  // Sanitize experience
  sanitized.experience = sanitized.experience.map((exp: Experience) => ({
    ...exp,
    title: sanitizeString(exp.title),
    company: sanitizeString(exp.company),
    description: exp.description ? sanitizeString(exp.description) : undefined
  }));
  
  return sanitized;
} 