import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// GET /api/users/[userId]/payments
export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const payments = await prisma.payment.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: {
        periodEnd: 'desc',
      },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 