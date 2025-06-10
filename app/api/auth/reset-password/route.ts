import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

export async function POST(req: Request) {
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
  return NextResponse.json({ message: "Password reset successful" });
} 