import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  console.log('API Route: User endpoint hit');
  console.log('Request URL:', request.url);
  console.log('User ID from params:', params.userId);

  try {
    // First, check if we can connect to the database
    try {
      await prisma.$connect();
      console.log('Successfully connected to database');
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      throw new Error('Failed to connect to database');
    }
    
    // Then try to fetch the user
    const user = await prisma.user.findFirst({
      where: {
        id: params.userId,
        deletedAt: null,
      },
      include: {
        careerRoadmap: true,
      },
    });

    if (!user) {
      console.log('User not found:', params.userId);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('User found:', user.email);
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error in user API:', error);
    
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