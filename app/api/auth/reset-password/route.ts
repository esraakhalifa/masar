import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";
import { logInfo, logError, logWarning } from "@/app/lib/services/logger";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    logInfo("Reset password request received");
    const { token, email, password } = await req.json();
    if (!token || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { identifier_token: { identifier: email, token } },
    });
    if (!verificationToken || verificationToken.expires < new Date()) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }
    const hashedPassword = await hash(password, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });
    await prisma.verificationToken.delete({
      where: { identifier_token: { identifier: email, token } },
    });
    logInfo(`Password reset for ${email}`);
    return NextResponse.json({ message: "Password reset successful" });
  } catch (error) {
    logError(error as Error, { route: "reset-password" });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 