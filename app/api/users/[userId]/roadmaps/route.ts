import { NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  console.log('API Route: Roadmaps endpoint hit');
  console.log('Request URL:', request.url);
  console.log('User ID from params:', params.userId);

  try {
    // Connect to the database
    await prisma.$connect();
    console.log('Successfully connected to database');

    // Get user by ID
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
    });

    if (!user) {
      console.log('User not found:', params.userId);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('User found:', user.email);

    // Get user's roadmaps
    const roadmaps = await prisma.careerRoadmap.findMany({
      where: { userId: params.userId },
      include: {
        courses: true,
        topics: {
          include: {
            tasks: true
          }
        }
      }
    });

    console.log('Found roadmaps:', roadmaps.length);
    return NextResponse.json(roadmaps);
  } catch (error) {
    console.error('Error in roadmaps API:', error);
    
    // Log the full error details
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        details: error instanceof Error ? error.message : 'Unknown error',
        type: error instanceof Error ? error.name : 'Unknown',
        stack: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.stack : undefined : undefined
      },
      { status: 500 }
    );
  } finally {
    // Always disconnect from the database
    try {
      await prisma.$disconnect();
      console.log('Disconnected from database');
    } catch (disconnectError) {
      console.error('Error disconnecting from database:', disconnectError);
    }
  }
} 