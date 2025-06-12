import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: params.id,
        deletedAt: null,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const roadmaps = await prisma.careerRoadmap.findMany({
      where: {
        userId: params.id,
        deletedAt: null,
      },
      include: {
        courses: {
          where: { deleted_at: null },
          select: {
            id: true,
            title: true,
            description: true,
            instructors: true,
            courseLink: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        topics: {
          where: { deletedAt: null },
          select: {
            id: true,
            title: true,
            description: true,
            order: true,
            tasks: {
              where: { deletedAt: null },
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
      },
    });

    return NextResponse.json(roadmaps);
  } catch (error) {
    console.error(`Error fetching roadmaps for user_id: ${params.id}`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}