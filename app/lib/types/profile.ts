export interface Skill {
  name: string;
  level?: number;
  category?: string;
}

export interface CareerPreference {
  industry: string;
  preferredSalary?: number;
  workType: 'remote' | 'hybrid' | 'onsite';
  location?: string;
}

export interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  graduationYear: string;
  description?: string;
}

export interface Experience {
  title: string;
  company: string;
  startDate: string;
  endDate?: string | null;
  description?: string;
}

export interface UserProfile {
  fullName: string;
  email: string;
  skills: Skill[];
  careerPreferences: CareerPreference;
  education: Education[];
  experience: Experience[];
} 