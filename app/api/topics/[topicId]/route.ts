import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { topicId: string } }
) {
  console.log('API Route: Topics endpoint hit for topicId:', params.topicId);
  
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

    console.log('Topic query result:', topic ? 'Found' : 'Not found');

    if (!topic) {
      console.log('Topic not found for ID:', params.topicId);
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    console.log('Returning topic:', {
      id: topic.id,
      title: topic.title,
      tasksCount: topic.tasks.length
    });

    return NextResponse.json(topic);
  } catch (error) {
    console.error('Error fetching topic:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 