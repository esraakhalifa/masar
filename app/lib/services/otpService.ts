import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';
import { logInfo, logError } from './logger';

const prisma = new PrismaClient();

export class OTPService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Generate a 6-digit OTP
  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send OTP email
  async sendOTPEmail(email: string, otp: string, firstName: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: email,
        subject: 'Email Verification - Masar',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #2434B3 0%, #1a2a8a 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">Email Verification</h1>
            </div>
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                Hello ${firstName},
              </p>
              <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                Thank you for registering with Masar! To complete your registration, please use the following verification code:
              </p>
              <div style="background: #2434B3; color: white; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                <h2 style="margin: 0; font-size: 32px; letter-spacing: 5px;">${otp}</h2>
              </div>
              <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
                This code will expire in 10 minutes. If you didn't request this verification, please ignore this email.
              </p>
              <p style="font-size: 14px; color: #666;">
                Best regards,<br>
                The Masar Team
              </p>
            </div>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      logInfo(`OTP email sent to ${email}`);
      return true;
    } catch (error) {
      logError(error as Error, { service: 'OTPService', method: 'sendOTPEmail', email });
      return false;
    }
  }

  // Save OTP to database
  async saveOTP(email: string, otp: string): Promise<boolean> {
    try {
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
      
      await prisma.user.update({
        where: { email },
        data: {
          otpCode: otp,
          otpExpiresAt: expiresAt,
        },
      });
      
      logInfo(`OTP saved for ${email}`);
      return true;
    } catch (error) {
      logError(error as Error, { service: 'OTPService', method: 'saveOTP', email });
      return false;
    }
  }

  // Verify OTP
  async verifyOTP(email: string, otp: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { otpCode: true, otpExpiresAt: true },
      });

      if (!user || !user.otpCode || !user.otpExpiresAt) {
        return false;
      }

      // Check if OTP is expired
      if (new Date() > user.otpExpiresAt) {
        return false;
      }

      // Check if OTP matches
      if (user.otpCode !== otp) {
        return false;
      }

      // Mark email as verified and clear OTP
      await prisma.user.update({
        where: { email },
        data: {
          isEmailVerified: true,
          emailVerified: new Date(),
          otpCode: null,
          otpExpiresAt: null,
        },
      });

      logInfo(`Email verified for ${email}`);
      return true;
    } catch (error) {
      logError(error as Error, { service: 'OTPService', method: 'verifyOTP', email });
      return false;
    }
  }

  // Resend OTP
  async resendOTP(email: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { firstName: true },
      });

      if (!user) {
        return false;
      }

      const otp = this.generateOTP();
      const emailSent = await this.sendOTPEmail(email, otp, user.firstName);
      
      if (emailSent) {
        await this.saveOTP(email, otp);
        return true;
      }

      return false;
    } catch (error) {
      logError(error as Error, { service: 'OTPService', method: 'resendOTP', email });
      return false;
    }
  }
}

export const otpService = new OTPService(); 