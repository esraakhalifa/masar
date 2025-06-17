import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// Get a specific skill for a user
export async function GET(
  request: Request,
  { params }: { params: { userId: string; skillId: string } }
) {
  try {
    const userId = parseInt(params.userId);
    const skillId = parseInt(params.skillId);

    const skill = await prisma.skill.findFirst({
      where: {
        id: skillId,
        userId,
      },
    });

    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    return NextResponse.json(skill);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch skill" },
      { status: 500 }
    );
  }
}

// Update a skill for a user
export async function PUT(
  request: Request,
  { params }: { params: { userId: string; skillId: string } }
) {
  try {
    const userId = parseInt(params.userId);
    const skillId = parseInt(params.skillId);
    const body = await request.json();
    const { name, level } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Check if the skill exists and belongs to the user
    const existingSkill = await prisma.skill.findFirst({
      where: {
        id: skillId,
        userId,
      },
    });

    if (!existingSkill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    // Check if the new name conflicts with another skill
    if (name !== existingSkill.name) {
      const nameConflict = await prisma.skill.findFirst({
        where: {
          userId,
          name,
          NOT: {
            id: skillId,
          },
        },
      });

      if (nameConflict) {
        return NextResponse.json(
          { error: "Skill name already exists for this user" },
          { status: 400 }
        );
      }
    }

    const skill = await prisma.skill.update({
      where: {
        id: skillId,
      },
      data: {
        name,
        level,
      },
    });

    return NextResponse.json(skill);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update skill" },
      { status: 500 }
    );
  }
}

// Delete a skill for a user
export async function DELETE(
  request: Request,
  { params }: { params: { userId: string; skillId: string } }
) {
  try {
    const userId = parseInt(params.userId);
    const skillId = parseInt(params.skillId);

    // Check if the skill exists and belongs to the user
    const skill = await prisma.skill.findFirst({
      where: {
        id: skillId,
        userId,
      },
    });

    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    await prisma.skill.delete({
      where: {
        id: skillId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete skill" },
      { status: 500 }
    );
  }
}
