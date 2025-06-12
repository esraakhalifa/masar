import { NextResponse } from 'next/server';
import { Prisma, PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

// GET /api/tasks or /api/tasks/[id]
export async function GET(
  req: Request,
  { params }: { params?: { id?: string } } = {}
) {
  try {
    if (params?.id) {
      // Get task by ID
      const task = await prisma.task.findFirst({
        where: {
          id: params.id,
          deletedAt: null,
        },
      });

      if (!task) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      }

      return NextResponse.json(task);
    } else {
      // Get all tasks
      const tasks = await prisma.task.findMany({
        where: {
          deletedAt: null,
        },
      });

      return NextResponse.json(tasks);
    }
  } catch (error) {
    console.error('Error fetching task(s):', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


// POST /api/tasks - Create new task
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, isCompleted, topicId } = body;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        isCompleted,
        topicId,
        order: 0,
        topic: {
          connect: {
            id: topicId
          }
        }
      }
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/tasks/[id] - Update task
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { title, description, isCompleted } = body;

    const task = await prisma.task.update({
      where: { id: params.id },
      data: {
        title,
        description,
        isCompleted
      }
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH /api/tasks/[id] - Partially update a task
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await req.json();

    const updatedTask = await prisma.task.update({
      where: {
        id: params.id,
      },
      data,
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);

    // Handle "not found" errors gracefully
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


// DELETE /api/tasks/[id] - Soft delete task
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.task.update({
      where: { id: params.id },
      data: { deletedAt: new Date() }
    });

    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 