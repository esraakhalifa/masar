import { UserProfile, Skill, CareerPreference } from '../types/profile';

export interface ValidationError {
  field: string;
  message: string;
  details?: unknown;
}

export const validateFullName = (fullName: string): ValidationError | null => {
  if (!fullName?.trim()) {
    return { field: 'fullName', message: 'Full name is required' };
  }
  if (fullName.length < 3) {
    return { field: 'fullName', message: 'Full name must be at least 3 characters long' };
  }
  if (fullName.length > 50) {
    return { field: 'fullName', message: 'Full name must be less than 50 characters' };
  }
  if (!/^[A-Za-z\s]+$/.test(fullName)) {
    return { field: 'fullName', message: 'Full name can only contain letters and spaces' };
  }
  return null;
};

export const validateEmail = (email: string): ValidationError | null => {
  if (!email?.trim()) {
    return { field: 'email', message: 'Email is required' };
  }
  if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
    return { field: 'email', message: 'Please enter a valid email address' };
  }
  return null;
};

export const validateSkills = (skills: Skill[]): ValidationError | null => {
  if (skills.length === 0) {
    return { field: 'skills', message: 'Please add at least one skill' };
  }
  if (skills.some(skill => !skill.name.trim())) {
    return { field: 'skills', message: 'All skills must have a name' };
  }
  if (skills.some(skill => skill.name.length < 2)) {
    return { field: 'skills', message: 'Skill names must be at least 2 characters long' };
  }
  if (skills.some(skill => skill.name.length > 50)) {
    return { field: 'skills', message: 'Skill names must be less than 50 characters' };
  }
  if (skills.some(skill => skill.level === undefined || skill.level === null || skill.level < 1 || skill.level > 5)) {
    return { field: 'skills', message: 'Skill levels must be between 1 and 5' };
  }
  return null;
};

export const validateCareerPreferences = (preferences: CareerPreference): ValidationError | null => {
  if (!preferences.industry || preferences.industry.trim() === '') {
    return { field: 'careerPreferences.industry', message: 'Industry is required' };
  }

  // If 'Other' is selected, validate the custom industry input
  if (preferences.industry === 'Other' || preferences.industry.trim() === '') { // The second condition handles cases where 'Other' was selected and then a blank custom industry was entered
    if (!preferences.industry.trim() || preferences.industry.trim().length < 3) {
      return { field: 'careerPreferences.industry', message: 'Custom industry must be at least 3 characters long' };
    }
  }

  if (!preferences.location?.trim()) {
    return { field: 'location', message: 'Location is required' };
  }
  if (preferences.location.length < 2) {
    return { field: 'location', message: 'Location must be at least 2 characters long' };
  }
  if (preferences.preferredSalary !== undefined && preferences.preferredSalary !== null && preferences.preferredSalary < 0) {
    return { field: 'salary', message: 'Salary cannot be negative' };
  }
  if (preferences.preferredSalary !== undefined && preferences.preferredSalary !== null && preferences.preferredSalary > 1000000) {
    return { field: 'salary', message: 'Please enter a realistic salary amount' };
  }
  if (!['remote', 'hybrid', 'onsite'].includes(preferences.workType)) {
    return { field: 'workType', message: 'Invalid work type selected' };
  }
  return null;
};

export const validateEducation = (education: UserProfile['education']): ValidationError | null => {
  if (education.length === 0) {
    return { field: 'education', message: 'Please add at least one education entry' };
  }
  if (education.some(edu => !edu.degree?.trim() || !edu.fieldOfStudy?.trim() || !edu.institution?.trim())) {
    return { field: 'education', message: 'All education entries must have degree, field of study, and institution' };
  }
  if (education.some(edu => edu.degree.length < 2 || edu.fieldOfStudy.length < 2 || edu.institution.length < 2)) {
    return { field: 'education', message: 'Degree, field of study, and institution must be at least 2 characters long' };
  }
  if (education.some(edu => edu.degree.length > 50 || edu.fieldOfStudy.length > 50 || edu.institution.length > 100)) {
    return { field: 'education', message: 'Degree and field of study must be less than 50 characters, institution less than 100 characters' };
  }
  if (education.some(edu => parseInt(edu.graduationYear) < 1900 || parseInt(edu.graduationYear) > new Date().getFullYear() + 10)) {
    return { field: 'education', message: 'Invalid graduation year' };
  }
  return null;
};

export const validateExperience = (experience: UserProfile['experience']): ValidationError | null => {
  if (experience.length === 0) {
    return { field: 'experience', message: 'Please add at least one work experience' };
  }
  if (experience.some(exp => !exp.title?.trim() || !exp.company?.trim() || !exp.startDate)) {
    return { field: 'experience', message: 'All experience entries must have title, company, and start date' };
  }
  if (experience.some(exp => exp.title.length < 2 || exp.company.length < 2)) {
    return { field: 'experience', message: 'Title and company must be at least 2 characters long' };
  }
  if (experience.some(exp => exp.title.length > 50 || exp.company.length > 100)) {
    return { field: 'experience', message: 'Title must be less than 50 characters, company less than 100 characters' };
  }
  if (experience.some(exp => {
    const startDate = new Date(exp.startDate);
    const endDate = exp.endDate ? new Date(exp.endDate) : new Date();
    return startDate > endDate;
  })) {
    return { field: 'experience', message: 'Start date cannot be after end date' };
  }
  if (experience.some(exp => exp.description && exp.description.length > 500)) {
    return { field: 'experience', message: 'Experience description must be less than 500 characters' };
  }
  return null;
};

export const validateStep = (
  step: number,
  data: {
    fullName?: string;
    email?: string;
    skills?: Skill[];
    careerPreferences?: CareerPreference;
    education?: UserProfile['education'];
    experience?: UserProfile['experience'];
  }
): ValidationError | null => {
  switch (step) {
    case 1:
      const fullNameError = validateFullName(data.fullName || '');
      if (fullNameError) return fullNameError;
      const emailError = validateEmail(data.email || '');
      if (emailError) return emailError;
      return null;
    case 2:
      return validateSkills(data.skills || []);
    case 3:
      return validateCareerPreferences(data.careerPreferences || {} as CareerPreference);
    case 4:
      return validateEducation(data.education || []);
    case 5:
      return validateExperience(data.experience || []);
    default:
      return null;
  }
}; 