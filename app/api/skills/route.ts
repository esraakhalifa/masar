import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

// GET /api/skills - Get all skills (no GET by ID)
export async function GET() {
  try {
    const skills = await prisma.skill.findMany({
      where: { deletedAt: null },
      include: {
        user: true,
      },
    });

    return NextResponse.json(skills);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch skills' },
      { status: 500 }
    );
  }
}

// POST /api/skills - Create new skill
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, jobRole, name, level } = body;

    if (!userId || !jobRole || !name) {
      return NextResponse.json({ error: 'userId, jobRole, and name are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const existingSkill = await prisma.skill.findFirst({
      where: {
        name,
        userId,
        deletedAt: null,
      },
    });

    if (existingSkill) {
      return NextResponse.json(
        { error: "Skill already exists for this user" },
        { status: 400 }
      );
    }

    const skill = await prisma.skill.create({
      data: {
        userId,
        jobRole,
        name,
        level,
      }
    });

    return NextResponse.json(skill, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create skill' },
      { status: 500 }
    );
  }
}

// PUT /api/skills/[id] - Update skill
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { jobRole, name, level } = body;

    const skill = await prisma.skill.update({
      where: { id: params.id },
      data: { jobRole, name, level }
    });

    return NextResponse.json(skill);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/skills/[id] - Soft delete skill
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const skill = await prisma.skill.update({
      where: { id: params.id },
      data: { deletedAt: new Date() }
    });

    return NextResponse.json({
      message: 'Skill soft-deleted successfully',
      deletedSkill: skill
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
