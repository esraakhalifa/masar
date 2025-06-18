import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

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

    // Get the course to verify it exists and get the userId
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        roadmap: true,
      },
    });

    if (!course) {
      console.error('Course not found:', courseId);
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    console.log('Found course:', {
      id: course.id,
      title: course.title,
      roadmapId: course.roadmapId,
      userId: course.roadmap.userId
    });

    // Create the certificate
    const certificate = await prisma.certificate.create({
      data: {
        title,
        provider,
        issueDate: new Date(issueDate),
        fileUrl,
        courseId,
        userId: course.roadmap.userId,
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