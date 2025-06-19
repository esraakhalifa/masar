import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// Get all skills for a user
export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = parseInt(params.userId);
    const skills = await prisma.skill.findMany({
      where: { userId },
    });
    return NextResponse.json(skills);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch skills" },
      { status: 500 }
    );
  }
}

// Add a new skill for a user
export async function POST(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = parseInt(params.userId);
    const body = await request.json();
    const { name, level } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if skill already exists for this user
    const existingSkill = await prisma.skill.findFirst({
      where: {
        userId,
        name,
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
      { error: "Failed to create skill" },
      { status: 500 }
    );
  }
}
