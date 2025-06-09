import { NextRequest, NextResponse } from 'next/server';
import { validateCSRFToken } from '@/app/lib/utils/csrf';
import { sanitizeObjectForSQL } from '@/app/lib/utils/sqlInjection';
import { validateContactForm } from '@/app/lib/utils/contactValidation';
import { emailService } from '@/app/lib/utils/emailService';
import { logError, logInfo, logWarning } from '@/app/lib/utils/logger';

// GET handler for CSRF token initialization
export async function GET() {
  logInfo('CSRF token initialization request received');
  return NextResponse.json({ message: 'CSRF token initialized' });
}

// POST handler for contact form submission
export async function POST(request: NextRequest) {
  try {
    // Validate CSRF token
    const csrfToken = request.headers.get('x-csrf-token');
    const storedToken = request.cookies.get('csrf_token')?.value ?? null;

    if (!csrfToken || !storedToken || !validateCSRFToken(csrfToken, storedToken)) {
      logWarning('Invalid CSRF token in contact form submission', {
        csrfToken,
        storedToken,
      });
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }

    const data = await request.json();
    
    // Validate form data
    const validationError = validateContactForm(data);
    if (validationError) {
      logWarning('Invalid contact form data', {
        error: validationError,
        data: { ...data, message: '[REDACTED]' }
      });
      return NextResponse.json(
        { error: validationError.message },
        { status: 400 }
      );
    }

    // Sanitize data for SQL injection
    const sanitizedData = sanitizeObjectForSQL(data);
    
    try {
      // Send emails
      await emailService.sendContactFormEmail(sanitizedData);
      
      // Log the successful submission
      logInfo('Contact form submission successful', {
        name: sanitizedData.name,
        email: sanitizedData.email,
        subject: sanitizedData.subject
      });

      return NextResponse.json({ 
        message: 'Message sent successfully',
        data: {
          name: sanitizedData.name,
          email: sanitizedData.email,
          subject: sanitizedData.subject
        }
      });
    } catch (emailError) {
      logError(emailError instanceof Error ? emailError : new Error('Failed to send email'), {
        data: { ...sanitizedData, message: '[REDACTED]' }
      });
      return NextResponse.json(
        { error: 'Failed to send email. Please try again later.' },
        { status: 500 }
      );
    }
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Unknown error'));
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 