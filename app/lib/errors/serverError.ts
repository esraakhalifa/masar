import { NextResponse } from 'next/server';
import { logError, logWarning } from '@/app/lib/services/logger';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ValidationError } from '@/app/lib/validation/validation';

export class ServerError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_SERVER_ERROR',
    public details?: unknown
  ) {
    super(message);
    this.name = 'ServerError';
  }
}

export async function createServerError(
  message: string,
  statusCode: number = 500,
  details?: unknown
): Promise<NextResponse> {
  await logError(new Error('Server error'), {
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

export async function handlePrismaError(error: PrismaClientKnownRequestError): Promise<NextResponse> {
  if (error.code === 'P2002') {
    return createServerError('A record with this value already exists', 409);
  }

  if (error.code === 'P2025') {
    return createServerError('Record not found', 404);
  }

  await logError(new Error('Database error'), {
    error: error.message,
    code: error.code,
    meta: error.meta,
  });

  return createServerError('Database operation failed', 500);
}

export async function handleValidationError(error: ValidationError): Promise<NextResponse> {
  await logWarning('Validation error', {
    error: error.message,
    details: error.details,
  });

  return createServerError('Validation failed', 400, error.details);
}

export async function handleAuthError(error: Error): Promise<NextResponse> {
  await logWarning('Authentication error', {
    error: error.message,
  });

  return createServerError('Authentication failed', 401);
}

export async function handleCSRFError(): Promise<NextResponse> {
  await logWarning('CSRF validation failed');
  return createServerError('Invalid CSRF token', 403);
}

export async function handleRateLimitError(): Promise<NextResponse> {
  await logWarning('Rate limit exceeded');
  return createServerError('Too many requests', 429);
}