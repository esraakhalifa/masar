import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// GET /api/users/[userId]/career-preferences
export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const preference = await prisma.careerPreference.findUnique({
      where: { userId },
    });

    if (!preference) {
      return NextResponse.json({ error: 'Career preference not found' }, { status: 404 });
    }

    return NextResponse.json(preference);
  } catch (error) {
    console.error('Error fetching career preference:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 