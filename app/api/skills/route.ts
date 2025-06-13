import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const skills = await prisma.skill.findMany({
      include: {
        user: true,
      },
    });
    return NextResponse.json(skills);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch skills",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, level, userId } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const existingSkill = await prisma.skill.findFirst({
      where: {
        name,
        userId,
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
        name,
        level,
        userId,
      },
    });
    return NextResponse.json(skill, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create skill",
      },
      { status: 500 }
    );
  }
}
