import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";
import nodemailer from "nodemailer";
import { logInfo, logError, logWarning } from "@/app/lib/services/logger";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    logInfo("Forgot password request received");
    const { email } = await req.json();
    if (!email) {
      logWarning("Forgot password: Email is required");
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const token = randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
      await prisma.verificationToken.create({
        data: {
          identifier: email,
          token,
          expires,
        },
      });

      // Send email
      const transporter = nodemailer.createTransport({
        service: "gmail", // or your email provider
        auth: {
          user: process.env.EMAIL_USER, // your email
          pass: process.env.EMAIL_PASS, // your email password or app password
        },
      });

      const resetLink = `http://localhost:3000/reset-password?token=${token}&email=${email}`;
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Password Reset",
        html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
      });
      logInfo(`Password reset email sent to ${email}`);
    }
    // Always return success for security
    return NextResponse.json({ message: "If an account with that email exists, a reset link has been sent." });
  } catch (error) {
    logError(error, { route: "forgot-password" });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 