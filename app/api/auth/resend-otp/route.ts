import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { otpService } from "@/app/lib/services/otpService";
import { logInfo, logError, logWarning } from "@/app/lib/services/logger";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, firstName: true, isEmailVerified: true },
    });

    if (!user) {
      logWarning(`Resend OTP request for non-existent email: ${email}`);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if email is already verified
    if (user.isEmailVerified) {
      logWarning(`Resend OTP request for already verified email: ${email}`);
      return NextResponse.json({ error: "Email is already verified" }, { status: 400 });
    }

    // Resend OTP
    const otpResent = await otpService.resendOTP(email);
    
    if (!otpResent) {
      logError(new Error("Failed to resend OTP"), { email });
      return NextResponse.json({ error: "Failed to resend verification code" }, { status: 500 });
    }

    logInfo(`OTP resent successfully to ${email}`);
    return NextResponse.json({ 
      message: "Verification code resent successfully",
      email: email 
    });

  } catch (error) {
    logError(error as Error, { route: "resend-otp" });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 