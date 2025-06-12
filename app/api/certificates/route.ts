import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, provider, issueDate, fileUrl, courseId, userId } = body;

    const certificate = await prisma.certificate.create({
      data: {
        course: {
          connect: {
            id: courseId
          }
        },
        user: {
          connect: {
            id: userId
          }
        },
        title,
        provider,
        issueDate,
        fileUrl
      }
    });

    return NextResponse.json(certificate);
  } catch (error) {
    console.error('Error creating certificate:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
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