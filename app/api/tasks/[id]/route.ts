import { NextResponse } from 'next/server';
import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


// PATCH /api/tasks/[id] - Partially update a task


export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
  ) {
    try {
      const data = await req.json();
  
      // Step 1: Check if the task exists
      const existingTask = await prisma.task.findUnique({
        where: { id: params.id },
      });
  
      if (!existingTask) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      }
  
      // Step 2: Update the task
      const updatedTask = await prisma.task.update({
        where: {
          id: params.id,
        },
        data,
      });
  
      return NextResponse.json(updatedTask);
    } catch (error: any) {
      console.error('Error updating task:', error);
  
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  }