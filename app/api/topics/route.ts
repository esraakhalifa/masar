import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/topics or /api/topics/[id]
export async function GET(
    req: Request,
    { params }: { params?: { id?: string } } = {}
  ) {
    try {
      if (params?.id) {
        // Fetch topic by ID
        const topic = await prisma.roadmapTopic.findFirst({
          where: {
            id: params.id,
            deletedAt: null,
          },
          include: {
            tasks: true,
            roadmap: {
              select: {
                roadmapRole: true,
                roadmapDetails: true,
              },
            },
          },
        });
  
        if (!topic) {
          return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
        }
  
        return NextResponse.json(topic);
      } else {
        // Fetch all topics
        const topics = await prisma.roadmapTopic.findMany({
          where: {
            deletedAt: null,
          },
          include: {
            tasks: true,
            roadmap: {
              select: {
                roadmapRole: true,
                roadmapDetails: true,
              },
            },
          },
        });
  
        return NextResponse.json(topics);
      }
    } catch (error) {
      console.error('Error fetching topic(s):', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
  

// POST /api/topics - Create new topic
export async function POST(req: Request) {
  try {
    // const session = await getServerSession(authOptions);
    // if (!session?.user?.email) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await req.json();
    const { title, description, order, totalTasks, roadmapId, tasks, courses } = body;

    const topic = await prisma.roadmapTopic.create({
      data: {
        title,
        description,
        order,
        totalTasks,
        roadmapId,
        tasks: {
          create: tasks
        },

      },
      include: {
        tasks: true,
        roadmap: {
          select: {
            roadmapRole: true,
            roadmapDetails: true
          }
        }
      }
    });

    return NextResponse.json(topic);
  } catch (error) {
    console.error('Error creating topic:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/topics/[id] - Update topic
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    // const session = await getServerSession(authOptions);
    // if (!session?.user?.email) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await req.json();
    const { title, description, order, totalTasks, tasks, courses } = body;

    const topic = await prisma.roadmapTopic.update({
      where: { id: params.id },
      data: {
        title,
        description,
        order,
        totalTasks,
        tasks: {
          upsert: tasks.map((task: any) => ({
            where: { id: task.id || 'new' },
            create: task,
            update: task
          }))
        }
      },
      include: {
        tasks: true,
        roadmap: {
          select: {
            roadmapRole: true,
            roadmapDetails: true
          }
        }
      }
    });

    return NextResponse.json(topic);
  } catch (error) {
    console.error('Error updating topic:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/topics/[id] - Soft delete topic
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    // const session = await getServerSession(authOptions);
    // if (!session?.user?.email) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    await prisma.roadmapTopic.update({
      where: { id: params.id },
      data: { deletedAt: new Date() }
    });

    return NextResponse.json({ message: 'Topic deleted successfully' });
  } catch (error) {
    console.error('Error deleting topic:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 