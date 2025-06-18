import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { Prisma } from '@prisma/client';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if the user has any education entries
    const educationCount = await prisma.education.count({
      where: {
        user: {
          email: session.user.email
        }
      }
    });

    const hasProfile = educationCount > 0;

    return NextResponse.json({ hasProfile });
  } catch (error) {
    console.error('Error checking profile status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 