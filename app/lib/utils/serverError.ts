import { NextResponse } from 'next/server';
import { logger } from './logger';

export class ServerError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_SERVER_ERROR',
    public details?: any
  ) {
    super(message);
    this.name = 'ServerError';
  }
}

export async function createServerError(
  message: string,
  statusCode: number = 500,
  details?: any
): Promise<NextResponse> {
  logger.error('Server error', {
    message,
    statusCode,
    details,
  });

  return NextResponse.json(
    {
      error: message,
      code: statusCode,
      details,
    },
    { status: statusCode }
  );
}

export async function handlePrismaError(error: any): Promise<NextResponse> {
  if (error.code === 'P2002') {
    return createServerError('A record with this value already exists', 409);
  }

  if (error.code === 'P2025') {
    return createServerError('Record not found', 404);
  }

  logger.error('Database error', {
    error: error.message,
    code: error.code,
    meta: error.meta,
  });

  return createServerError('Database operation failed', 500);
}

export async function handleValidationError(error: any): Promise<NextResponse> {
  logger.warn('Validation error', {
    error: error.message,
    details: error.details,
  });

  return createServerError('Validation failed', 400, error.details);
}

export async function handleAuthError(error: any): Promise<NextResponse> {
  logger.warn('Authentication error', {
    error: error.message,
  });

  return createServerError('Authentication failed', 401);
}

export async function handleCSRFError(): Promise<NextResponse> {
  logger.warn('CSRF validation failed');
  return createServerError('Invalid CSRF token', 403);
}

export async function handleRateLimitError(): Promise<NextResponse> {
  logger.warn('Rate limit exceeded');
  return createServerError('Too many requests', 429);
} 