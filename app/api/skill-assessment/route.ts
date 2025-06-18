import { NextResponse } from "next/server";
import { getCoreSkills, getSkillQuestions } from "@/app/services/gemini";
import Image from "next/image";
import routeIcon from "@/public/route.svg"; // Adjust the path if needed

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { role, action, skill } = body;

    if (!role) {
      return NextResponse.json({ error: "Role is required" }, { status: 400 });
    }

    try {
      if (action === "getSkills") {
        const skills = await getCoreSkills(role);
        return NextResponse.json(skills);
      } else if (action === "getQuestions") {
        if (!skill) {
          return NextResponse.json(
            { error: "Skill is required for questions" },
            { status: 400 }
          );
        }
        const questions = await getSkillQuestions(role, skill);
        return NextResponse.json(questions);
      } else {
        return NextResponse.json(
          { error: "Invalid action specified" },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error("Gemini API error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to get data from Gemini";
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  } catch (error) {
    console.error("Request parsing error:", error);
    return NextResponse.json(
      { error: "Invalid request format" },
      { status: 400 }
    );
  }
}