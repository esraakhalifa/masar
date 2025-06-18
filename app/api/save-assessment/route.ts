import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";
import { CSRF_HEADER, CSRF_COOKIE } from "@/app/lib/security/csrf";

export async function POST(request: Request) {
  try {
    // Get CSRF token from header and cookie
    const csrfToken = request.headers.get(CSRF_HEADER);
    const storedToken = request.cookies.get(CSRF_COOKIE)?.value;

    if (!csrfToken || !storedToken || csrfToken !== storedToken) {
      console.error("CSRF token validation failed", {
        path: "/api/save-assessment",
        providedToken: csrfToken,
        storedToken: storedToken,
      });
      return NextResponse.json(
        { error: "CSRF token missing or invalid" },
        { status: 403 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { skillName, score, maxScore } = body;

    if (
      !skillName ||
      typeof score !== "number" ||
      typeof maxScore !== "number"
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get or create the skill
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let skill = await prisma.skill.findFirst({
      where: {
        userId: user.id,
        name: skillName,
      },
    });

    if (!skill) {
      skill = await prisma.skill.create({
        data: {
          name: skillName,
          level: Math.round((score / maxScore) * 4), // Convert score to 1-4 scale
          category: "NA",
          userId: user.id,
          updatedAt: new Date(),
        },
      });
    } else {
      // Update existing skill level
      skill = await prisma.skill.update({
        where: { id: skill.id },
        data: {
          level: Math.round((score / maxScore) * 4), // Convert score to 1-4 scale
          updatedAt: new Date(),
        },
      });
    }

    console.log("Skill updated:", {
      userId: user.id,
      skillName,
      score,
      maxScore,
      skillId: skill.id,
    });

    return NextResponse.json({ success: true, skill });
  } catch (error) {
    console.error("Error saving skill:", error);
    return NextResponse.json(
      { error: "Failed to save skill" },
      { status: 500 }
    );
  }
}
