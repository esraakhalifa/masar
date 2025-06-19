import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/app/lib/prisma';
import { validateCSRFToken, CSRF_HEADER, CSRF_COOKIE } from '@/app/lib/security/csrf';


// const prisma = new PrismaClient();

// GET /api/certificates - Get all certificates
// GET /api/certificates or /api/certificates/[id]
export async function GET(
  req: Request,
  { params }: { params?: { id?: string } } = {}
) {
  try {
    if (params?.id) {
      // Get certificate by ID
      const certificate = await prisma.certificate.findFirst({
        where: {
          id: params.id,
          deletedAt: null
        }
      });

      if (!certificate) {
        return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
      }

      return NextResponse.json(certificate);
    } else {
      // Get all certificates
      const certificates = await prisma.certificate.findMany({
        where: {
          deletedAt: null
        }
      });

      return NextResponse.json(certificates);
    }
  } catch (error) {
    console.error('Error fetching certificate(s):', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


// POST /api/certificates - Create new certificate
export async function POST(request: Request) {
  console.log('API Route: Certificate creation endpoint hit');
  
  try {
    // CSRF Protection
    const csrfToken = request.headers.get(CSRF_HEADER) || null;
    const cookieHeader = request.headers.get('cookie');
    const csrfCookie = cookieHeader
      ?.split(';')
      .find(c => c.trim().startsWith(`${CSRF_COOKIE}=`))
      ?.split('=')[1] || null;

    console.log('CSRF validation:', { csrfToken, csrfCookie });

    if (!validateCSRFToken(csrfToken, csrfCookie)) {
      console.error('CSRF token validation failed');
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }

    const body = await request.json();
    console.log('Received certificate data:', body);
    
    const { title, provider, issueDate, fileUrl, courseId } = body;

    // Validate required fields
    if (!title || !provider || !issueDate || !fileUrl || !courseId) {
      console.error('Missing required fields:', { title, provider, issueDate, fileUrl, courseId });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the course to verify it exists
    const course = await prisma.courses.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      console.error('Course not found:', courseId);
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Get the roadmap to find the userId
    const roadmap = await prisma.careerRoadmap.findUnique({
      where: { id: course.roadmap_id },
    });

    if (!roadmap) {
      console.error('Roadmap not found for course:', course.roadmap_id);
      return NextResponse.json(
        { error: 'Roadmap not found' },
        { status: 404 }
      );
    }

    console.log('Found course and roadmap:', {
      courseId: course.id,
      courseTitle: course.title,
      roadmapId: course.roadmap_id,
      userId: roadmap.userId
    });

    // Create the certificate
    const certificate = await prisma.certificate.create({
      data: {
        title,
        provider,
        issueDate: new Date(issueDate),
        fileUrl,
        courseId,
        userId: roadmap.userId,
      },
    });

    console.log('Certificate created successfully:', {
      id: certificate.id,
      title: certificate.title,
      provider: certificate.provider,
      courseId: certificate.courseId,
      userId: certificate.userId
    });

    return NextResponse.json(certificate);
  } catch (error) {
    console.error('Error creating certificate:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT /api/certificates/[id] - Update certificate
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    // CSRF Protection
    const csrfToken = req.headers.get(CSRF_HEADER) || null;
    const cookieHeader = req.headers.get('cookie');
    const csrfCookie = cookieHeader
      ?.split(';')
      .find(c => c.trim().startsWith(`${CSRF_COOKIE}=`))
      ?.split('=')[1] || null;

    if (!validateCSRFToken(csrfToken, csrfCookie)) {
      console.error('CSRF token validation failed for PUT request');
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, provider, issueDate, fileUrl } = body;

    const certificate = await prisma.certificate.update({
      where: { id: params.id },
      data: {
        title,
        provider,
        issueDate,
        fileUrl
      }
    });

    return NextResponse.json(certificate);
  } catch (error) {
    console.error('Error updating certificate:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/certificates/[id] - Soft delete certificate
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    // CSRF Protection
    const csrfToken = req.headers.get(CSRF_HEADER) || null;
    const cookieHeader = req.headers.get('cookie');
    const csrfCookie = cookieHeader
      ?.split(';')
      .find(c => c.trim().startsWith(`${CSRF_COOKIE}=`))
      ?.split('=')[1] || null;

    if (!validateCSRFToken(csrfToken, csrfCookie)) {
      console.error('CSRF token validation failed for DELETE request');
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }

    await prisma.certificate.update({
      where: { id: params.id },
      data: { deletedAt: new Date() }
    });

    return NextResponse.json({ message: 'Certificate deleted successfully' });
  } catch (error) {
    console.error('Error deleting certificate:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 