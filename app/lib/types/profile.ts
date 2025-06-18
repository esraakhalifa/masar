export interface Skill {
  name: string;
  level?: number;
  category?: string;
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
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  skills: Skill[];
  education: Education[];
  experience: Experience[];
} 