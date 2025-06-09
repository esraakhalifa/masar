export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export const validateName = (name: string): ValidationError | null => {
  if (!name?.trim()) {
    return { field: 'name', message: 'Name is required' };
  }
  if (name.length < 3) {
    return { field: 'name', message: 'Name must be at least 3 characters long' };
  }
  if (!/^[A-Za-z\s]+$/.test(name)) {
    return { field: 'name', message: 'Name can only contain letters and spaces' };
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

export const validateSubject = (subject: string): ValidationError | null => {
  if (!subject?.trim()) {
    return { field: 'subject', message: 'Subject is required' };
  }
  if (subject.length < 3) {
    return { field: 'subject', message: 'Subject must be at least 3 characters long' };
  }
  if (subject.length > 100) {
    return { field: 'subject', message: 'Subject must be less than 100 characters' };
  }
  return null;
};

export const validateMessage = (message: string): ValidationError | null => {
  if (!message?.trim()) {
    return { field: 'message', message: 'Message is required' };
  }
  if (message.length < 10) {
    return { field: 'message', message: 'Message must be at least 10 characters long' };
  }
  if (message.length > 1000) {
    return { field: 'message', message: 'Message must be less than 1000 characters' };
  }
  return null;
};

export const validateContactForm = (data: ContactFormData): ValidationError | null => {
  const nameError = validateName(data.name);
  if (nameError) return nameError;

  const emailError = validateEmail(data.email);
  if (emailError) return emailError;

  const subjectError = validateSubject(data.subject);
  if (subjectError) return subjectError;

  const messageError = validateMessage(data.message);
  if (messageError) return messageError;

  return null;
}; 