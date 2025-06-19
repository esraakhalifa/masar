import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/app/lib/prisma';
import { roadmapService } from '@/app/services/roadmapService';

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
          topics: {
            include: {
              tasks: true
            }
          },
          courses: true
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
        topics: {
          include: {
            tasks: true
          }
        },
        courses: true
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
    const { userId } = body;

    // Validate input
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        careerPreference: true,
        skills: true,
        education: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has career preference with industry
    if (!user.careerPreference?.industry) {
      return NextResponse.json({ 
        error: 'User must have career preference with industry set to generate roadmap' 
      }, { status: 400 });
    }

    // Use industry as roadmap role
    const roadmapRole = user.careerPreference.industry;

    // Generate and save the roadmap using roadmapService
    const roadmap = await roadmapService.generateAndSaveRoadmap(
      userId,
      roadmapRole,
      {
        skills: user.skills.map(skill => ({
          name: skill.name,
          level: skill.level,
          jobRole: skill.jobRole || roadmapRole
        }))
      }
    );

    return NextResponse.json(roadmap);
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