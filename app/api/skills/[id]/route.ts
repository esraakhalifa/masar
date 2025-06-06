import { NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const skill = await prisma.skill.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    return NextResponse.json(skill);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch skill",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { name, level } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const skill = await prisma.skill.findUnique({
      where: { id },
    });

    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    // Check if new name conflicts with existing skill for the same user
    if (name !== skill.name) {
      const existingSkill = await prisma.skill.findFirst({
        where: {
          name,
          userId: skill.userId,
          NOT: {
            id,
          },
        },
      });

      if (existingSkill) {
        return NextResponse.json(
          { error: "Skill name already exists for this user" },
          { status: 400 }
        );
      }
    }

    const updatedSkill = await prisma.skill.update({
      where: { id },
      data: {
        name,
        level,
      },
    });

    return NextResponse.json(updatedSkill);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update skill",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    const skill = await prisma.skill.findUnique({
      where: { id },
    });

    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    await prisma.skill.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete skill",
      },
      { status: 500 }
    );
  }
}
