import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { generateCSRFToken, CSRF_COOKIE, CSRF_HEADER, validateAndRotateCSRFToken } from './app/lib/utils/csrf';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const csrfToken = request.cookies.get(CSRF_COOKIE)?.value;

  // Set CSRF token if not present
  if (!csrfToken) {
    const newToken = await generateCSRFToken();
    response.cookies.set(CSRF_COOKIE, newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });
  }

  // Validate CSRF token for POST, PUT, DELETE requests to API routes
  if (['POST', 'PUT', 'DELETE'].includes(request.method) && request.nextUrl.pathname.startsWith('/api/')) {
    const requestToken = request.headers.get(CSRF_HEADER);
    const storedToken = request.cookies.get(CSRF_COOKIE)?.value;

    const isValid = await validateAndRotateCSRFToken(requestToken, storedToken, response);

    if (!isValid) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'CSRF token missing or invalid',
          details: {
            requestToken: requestToken ? 'present' : 'missing',
            storedToken: storedToken ? 'present' : 'missing',
            match: requestToken === storedToken ? 'yes' : 'no'
          }
        }),
        { 
          status: 403, 
          headers: { 
            'Content-Type': 'application/json',
            'Set-Cookie': `${CSRF_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
          } 
        }
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 