import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

export async function GET(
  request: Request,
  { params }: { params: { topicId: string } }
) {
  try {
    const topic = await prisma.roadmapTopic.findFirst({
      where: {
        id: params.topicId,
        deletedAt: null,
      },
      include: {
        tasks: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    return NextResponse.json(topic);
  } catch (error) {
    console.error('Error fetching topic:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 