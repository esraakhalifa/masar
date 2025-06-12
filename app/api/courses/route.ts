import { NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

// GET /api/courses/[id] - Get course details
// GET /api/courses or /api/courses/[id]
export async function GET(
  req: Request,
  { params }: { params?: { id?: string } } = {}
) {
  try {
    if (params?.id) {
      // Get specific course by ID
      const course = await prisma.course.findUnique({
        where: {
          id: params.id,
          deleted_at: null,
        },
        include: {
          roadmap: {
            select: {
              roadmapRole: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
          certificates: true,
        },
      });

      if (!course) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 });
      }

      return NextResponse.json(course);
    } else {
      // Get all courses
      const courses = await prisma.course.findMany({
        where: {
          deleted_at: null,
        },
        include: {
          roadmap: {
            select: {
              roadmapRole: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
          certificates: true,
        },
      });

      return NextResponse.json(courses);
    }
  } catch (error) {
    console.error('Error fetching course(s):', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}


// POST /api/courses/[id] - Update course metadata
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    // const session = await getServerSession(authOptions);
    // if (!session?.user?.email) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await req.json();
    const { title, description, instructors, courseLink } = body;

    // Validate input
    if (!title || !courseLink) {
      return NextResponse.json({ error: 'Title and courseLink are required' }, { status: 400 });
    }

    // Verify course exists and is not deleted
    const courseExists = await prisma.course.findUnique({
      where: {
        id: params.id,
        deleted_at: null,
      },
      include: {
        roadmap: {
          select: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    if (!courseExists) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Optional: Check if user has access to the course
    // if (courseExists.roadmap.user.email !== session.user.email) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const course = await prisma.course.update({
      where: {
        id: params.id,
        deleted_at: null,
      },
      data: {
        title,
        description,
        instructors,
        courseLink,
        updatedAt: new Date(),
      },
      include: {
        roadmap: {
          select: {
            roadmapRole: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        certificates: true,
      },
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE /api/courses/[id] - Soft-delete a course
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    // const session = await getServerSession(authOptions);
    // if (!session?.user?.email) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Verify course exists and is not deleted
    const courseExists = await prisma.course.findUnique({
      where: {
        id: params.id,
        deleted_at: null,
      },
      include: {
        roadmap: {
          select: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    if (!courseExists) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Optional: Check if user has access to the course
    // if (courseExists.roadmap.user.email !== session.user.email) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const course = await prisma.course.update({
      where: {
        id: params.id,
        deleted_at: null,
      },
      data: {
        deleted_at: new Date(),
      },
      include: {
        roadmap: {
          select: {
            roadmapRole: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        certificates: true,
      },
    });

    return NextResponse.json({ message: 'Course soft-deleted', course });
  } catch (error) {
    console.error('Error soft-deleting course:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}