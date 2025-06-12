import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {roadmapService} from '@/app/services/roadmapService';

// GET /api/career-roadmap - Get all career roadmaps or a specific one
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      const roadmap = await prisma.careerRoadmap.findUnique({
        where: { 
          id: id,
          deletedAt: null
        },
        include: {
          user: {
            select: {
              id: true,
              email: true
            }
          },
          topics: {
            include: {
              tasks: true
            }
          }
        }
      });

      if (!roadmap) {
        return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 });
      }

      return NextResponse.json(roadmap);
    }

    // If no ID provided, return all roadmaps
    const roadmaps = await prisma.careerRoadmap.findMany({
      where: {
        deletedAt: null
      },
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        },
        topics: {
          include: {
            tasks: true
          }
        }
      }
    });

    return NextResponse.json(roadmaps);
  } catch (error) {
    console.error('Error fetching career roadmap(s):', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/career-roadmap - Create new career roadmap
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, roadmapRole } = body;

    // Validate input
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    if (!roadmapRole) {
      return NextResponse.json({ error: 'roadmapRole is required' }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user already has a roadmap (since it's a 1:1 relation)
    const existingRoadmap = await prisma.careerRoadmap.findUnique({
      where: { userId },
    });

    if (existingRoadmap) {
      return NextResponse.json({ error: 'User already has a career roadmap' }, { status: 400 });
    }

    // Create the career roadmap with minimal initial details
    const roadmap = await prisma.careerRoadmap.create({
      data: {
        user: {
          connect: { id: userId },
        },
        roadmapRole,
        roadmapDetails: {}, // Initialize with empty object, will be updated by roadmapService
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    // Generate and save topics (which includes tasks) and courses using roadmapService
    try {
      const [topicsResult, coursesResult] = await Promise.all([
        roadmapService.generateAndSaveTopics(roadmap.id, roadmapRole), // This also generates and saves tasks
        roadmapService.generateAndSaveCourses(roadmap.id, roadmapRole),
      ]);

      // Fetch the updated roadmap with topics, tasks, and courses
      const updatedRoadmap = await prisma.careerRoadmap.findUnique({
        where: { id: roadmap.id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
          topics: {
            include: {
              tasks: {
                select: {
                  id: true,
                  title: true,
                  description: true,
                  order: true,
                  isCompleted: true,
                },
              },
            },
          },
          courses: {
            select: {
              id: true,
              title: true,
              description: true,
              instructors: true,
              courseLink: true,
            },
          },
        },
      });

      return NextResponse.json(updatedRoadmap);
    } catch (serviceError) {
      // If roadmapService fails, delete the created roadmap to maintain consistency
      await prisma.careerRoadmap.delete({
        where: { id: roadmap.id },
      });
      console.error('Error generating roadmap content:', serviceError);
      return NextResponse.json({ error: 'Failed to generate roadmap content' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error creating career roadmap:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/career-roadmap/[id] - Update career roadmap
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { roadmapRole, roadmapDetails } = body;

    const roadmap = await prisma.careerRoadmap.update({
      where: { id: params.id },
      data: {
        roadmapRole,
        roadmapDetails
      },
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        },
        topics: true
      }
    });

    return NextResponse.json(roadmap);
  } catch (error) {
    console.error('Error updating career roadmap:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/career-roadmap/[id] - Soft delete career roadmap
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const roadmap = await prisma.careerRoadmap.update({
      where: { id: params.id },
      data: { deletedAt: new Date() }
    });

    return NextResponse.json({ 
      message: 'Career roadmap deleted successfully',
      deletedRoadmap: roadmap
    });
  } catch (error) {
    console.error('Error deleting career roadmap:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}