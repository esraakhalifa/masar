import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { otpService } from "@/app/lib/services/otpService";
import { logInfo, logError, logWarning } from "@/app/lib/services/logger";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();
    
    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, isEmailVerified: true },
    });

    if (!user) {
      logWarning(`OTP verification for non-existent email: ${email}`);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if email is already verified
    if (user.isEmailVerified) {
      logWarning(`OTP verification for already verified email: ${email}`);
      return NextResponse.json({ error: "Email is already verified" }, { status: 400 });
    }

    // Verify OTP
    const isValid = await otpService.verifyOTP(email, otp);
    
    if (!isValid) {
      logWarning(`Invalid OTP attempt for email: ${email}`);
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 });
    }

    logInfo(`Email verified successfully for ${email}`);
    return NextResponse.json({ 
      message: "Email verified successfully",
      email: email 
    });

  } catch (error) {
    logError(error as Error, { route: "verify-otp" });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 