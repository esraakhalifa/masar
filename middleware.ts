import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { validateCSRFToken, CSRF_HEADER, CSRF_COOKIE } from './app/lib/security/csrf';
import { RATE_LIMIT } from './app/lib/security/security';

// Rate limiting store
const rateLimit = new Map<string, { count: number; resetTime: number }>();

// Security headers
const securityHeaders = {
  'Content-Security-Policy': `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self';
    connect-src 'self';
    frame-ancestors 'none';
    form-action 'self';
    base-uri 'self';
    object-src 'none';
  `.replace(/\s+/g, ' ').trim(),
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

export async function middleware(request: NextRequest) {
  try {
    // Log incoming request
    console.info('Incoming request', {
      method: request.method,
      url: request.url,
      ip: request.headers.get('x-forwarded-for') ?? 'unknown',
      userAgent: request.headers.get('user-agent'),
    });

    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
    const now = Date.now();
    const rateLimitInfo = rateLimit.get(ip);

    if (rateLimitInfo) {
      if (now > rateLimitInfo.resetTime) {
        rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT.windowMs });
      } else if (rateLimitInfo.count >= RATE_LIMIT.max) {
        console.warn('Rate limit exceeded', { ip });
        return new NextResponse('Too Many Requests', { status: 429 });
      } else {
        rateLimitInfo.count++;
      }
    } else {
      rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT.windowMs });
    }

    // CSRF protection for API routes
    if (request.nextUrl.pathname.startsWith('/api/')) {
      // Skip CSRF check for CSRF token generation endpoint and GET requests
      if (request.nextUrl.pathname === '/api/csrf' || request.method === 'GET') {
        return NextResponse.next();
      }

      const csrfToken = request.headers.get(CSRF_HEADER);
      const storedToken = request.cookies.get(CSRF_COOKIE)?.value;

      if (!csrfToken || !storedToken || !validateCSRFToken(csrfToken, storedToken)) {
        console.error('CSRF token validation failed', {
          path: request.nextUrl.pathname,
          ip: request.headers.get('x-forwarded-for') ?? 'unknown',
          providedToken: csrfToken,
          storedToken: storedToken,
        });
        return NextResponse.json(
          { error: 'CSRF token missing or invalid' },
          { status: 403 }
        );
      }
    }

    // Add security headers to all responses
    const response = NextResponse.next();
    const updatedSecurityHeaders = {
      ...securityHeaders,
      'Content-Security-Policy': `
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval';
        style-src 'self' 'unsafe-inline';
        img-src 'self' data: https:;
        font-src 'self';
        connect-src 'self';
        frame-ancestors 'none';
        form-action 'self';
        base-uri 'self';
        object-src 'none';
        media-src 'self' data:;
      `.replace(/\s+/g, ' ').trim(),
    };

    Object.entries(updatedSecurityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Log response
    console.info('Outgoing response', {
      status: response.status,
      url: request.url,
    });

    return response;
  } catch (error) {
    console.error('Middleware error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}; 