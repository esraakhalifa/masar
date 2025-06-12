import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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


// POST /api/skills - Create new skill
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, jobRole, name, level } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    if (!jobRole) {
      return NextResponse.json({ error: 'jobRole is required' }, { status: 400 });
    }

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    // First verify the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const skill = await prisma.skill.create({
      data: {
        user: {
          connect: { id: userId }
        },
        jobRole,
        name,
        level
      }
    });

    return NextResponse.json(skill);
  } catch (error) {
    console.error('Error creating skill:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/skills/[id] - Update skill
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { jobRole, name, level } = body;

    const skill = await prisma.skill.update({
      where: { id: params.id },
      data: {
        jobRole,
        name,
        level
      }
    });

    return NextResponse.json(skill);
  } catch (error) {
    console.error('Error updating skill:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/skills/[id] - Soft delete skill
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const skill = await prisma.skill.update({
      where: { id: params.id },
      data: { deletedAt: new Date() }
    });

    return NextResponse.json({ 
      message: 'Skill soft-deleted successfully',
      deletedSkill: skill
    });
  } catch (error) {
    console.error('Error deleting skill:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}