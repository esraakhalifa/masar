'use client';

import { toast } from 'react-hot-toast';
import { ValidationError } from '@/app/lib/validation/validation';

export class ClientError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number = 400,
    public field?: string
  ) {
    super(message);
    this.name = 'ClientError';
  }
}

export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const;

export const handleValidationError = (error: ValidationError): void => {
  toast.error(error.message);
};

export const handleApiError = (error: unknown): void => {
  if (error instanceof ClientError) {
    toast.error(error.message);
    return;
  }

  if (error instanceof Error) {
    toast.error(error.message);
    return;
  }

  toast.error('An unexpected error occurred');
};

export const handleNetworkError = (error: unknown): void => {
  if (error instanceof Error && error.message.includes('Network Error')) {
    toast.error('Network connection error. Please check your internet connection.');
    return;
  }
  handleApiError(error);
};

export const createValidationError = (field: string, message: string): ClientError => {
  return new ClientError(
    message,
    ErrorCodes.VALIDATION_ERROR,
    400,
    field
  );
};

export const createServerError = (message: string): ClientError => {
  return new ClientError(
    message,
    ErrorCodes.SERVER_ERROR,
    500
  );
};

export const createNotFoundError = (message: string): ClientError => {
  return new ClientError(
    message,
    ErrorCodes.NOT_FOUND,
    404
  );
};

export const createAuthError = (message: string): ClientError => {
  return new ClientError(
    message,
    ErrorCodes.AUTH_ERROR,
    401
  );
};

export const handleFormError = (error: unknown): void => {
  if (error instanceof ClientError) {
    if (error.code === ErrorCodes.VALIDATION_ERROR) {
      toast.error(error.message);
      return;
    }
  }
  handleApiError(error);
};

export const handleProfileError = (error: unknown): void => {
  if (error instanceof ClientError) {
    switch (error.code) {
      case ErrorCodes.VALIDATION_ERROR:
        toast.error(`Invalid profile data: ${error.message}`);
        break;
      case ErrorCodes.NOT_FOUND:
        toast.error('Profile not found');
        break;
      case ErrorCodes.SERVER_ERROR:
        toast.error('Failed to save profile. Please try again later.');
        break;
      default:
        handleApiError(error);
    }
    return;
  }
  handleApiError(error);
};

export const handleExportError = (error: unknown): void => {
  if (error instanceof ClientError) {
    switch (error.code) {
      case ErrorCodes.VALIDATION_ERROR:
        toast.error('Cannot export: Invalid data');
        break;
      case ErrorCodes.SERVER_ERROR:
        toast.error('Failed to export. Please try again later.');
        break;
      default:
        handleApiError(error);
    }
    return;
  }
  handleApiError(error);
}; 