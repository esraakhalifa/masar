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
      logWarning(`OTP request for non-existent email: ${email}`);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if email is already verified
    if (user.isEmailVerified) {
      logWarning(`OTP request for already verified email: ${email}`);
      return NextResponse.json({ error: "Email is already verified" }, { status: 400 });
    }

    // Generate and send OTP
    const otp = otpService.generateOTP();
    const emailSent = await otpService.sendOTPEmail(email, otp, user.firstName);
    
    if (!emailSent) {
      logError(new Error("Failed to send OTP email"), { email });
      return NextResponse.json({ error: "Failed to send verification email" }, { status: 500 });
    }

    // Save OTP to database
    const otpSaved = await otpService.saveOTP(email, otp);
    
    if (!otpSaved) {
      logError(new Error("Failed to save OTP"), { email });
      return NextResponse.json({ error: "Failed to save verification code" }, { status: 500 });
    }

    logInfo(`OTP sent successfully to ${email}`);
    return NextResponse.json({ 
      message: "Verification code sent successfully",
      email: email 
    });

  } catch (error) {
    logError(error as Error, { route: "send-otp" });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 