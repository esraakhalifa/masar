import { NextResponse } from 'next/server';
import { generateCSRFToken } from '@/app/lib/security/csrf';
import { CSRF_COOKIE } from '@/app/lib/security/csrf';

export async function GET() {
  try {
    // Generate new CSRF token
    const token = await generateCSRFToken();

    // Create response with token
    const response = NextResponse.json({ token });

    // Set CSRF token cookie
    response.cookies.set({
      name: CSRF_COOKIE,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 86400 // 24 hours
    });

    return response;
  } catch (error) {
    console.error('CSRF token generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
} 