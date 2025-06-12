import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/users or /api/users/[id]
export async function GET(
  req: Request,
  { params }: { params?: { id?: string } } = {}
) {
  try {
    if (params?.id) {
      // Get user by ID
      const user = await prisma.user.findFirst({
        where: {
          id: params.id,
          deletedAt: null,
        },
      });

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      return NextResponse.json(user);
    } else {
      // Get all users
      const users = await prisma.user.findMany({
        where: {
          deletedAt: null,
        },
      });

      return NextResponse.json(users);
    }
  } catch (error) {
    console.error('Error fetching user(s):', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/users - Create new user
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, image } = body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        image,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/users/[id] - Update user
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, image } = body;

    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        firstName,
        lastName,
        email,
        image,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/users/[id] - Soft delete user
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.user.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}