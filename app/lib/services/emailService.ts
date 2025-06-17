import nodemailer from 'nodemailer';
import { logError, logInfo } from './logger';

// Email configuration
const emailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
};

// Create reusable transporter
let transporter: nodemailer.Transporter;

try {
  logInfo('Attempting to create Nodemailer transporter with config:', emailConfig);
  transporter = nodemailer.createTransport(emailConfig);
  logInfo('Nodemailer transporter created successfully.');
} catch (transporterError) {
  logError(transporterError instanceof Error ? transporterError : new Error('Failed to create Nodemailer transporter'), {
    context: 'Nodemailer Transporter Creation',
    emailConfig: {
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      user: emailConfig.auth.user ? '[REDACTED]' : 'N/A', // Redact password
    }
  });
  throw transporterError; // Re-throw to ensure it's caught upstream
}

// Email templates
const emailTemplates = {
  contactForm: (data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) => ({
    subject: `New Contact Form Submission: ${data.subject}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>From:</strong> ${data.name} (${data.email})</p>
      <p><strong>Subject:</strong> ${data.subject}</p>
      <h3>Message:</h3>
      <p>${data.message}</p>
    `,
  }),
};

// Email service functions
export const emailService = {
  async sendContactFormEmail(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) {
    try {
      const { subject, html } = emailTemplates.contactForm(data);
      
      logInfo('Attempting to send contact form email to admin', {
        to: process.env.ADMIN_EMAIL,
        from: process.env.EMAIL_USER,
        subject,
      });

      // Send email to admin
      await transporter.sendMail({
        from: `"Masar Contact Form" <${process.env.EMAIL_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject,
        html,
      });
      logInfo('Contact form email sent to admin successfully.');

      logInfo('Attempting to send confirmation email to user', {
        to: data.email,
        from: process.env.EMAIL_USER,
        subject: 'Thank you for contacting Masar',
      });

      // Send confirmation email to user
      await transporter.sendMail({
        from: `"Masar" <${process.env.EMAIL_USER}>`,
        to: data.email,
        subject: 'Thank you for contacting Masar',
        html: `
          <h2>Thank you for contacting Masar</h2>
          <p>Dear ${data.name},</p>
          <p>We have received your message and will get back to you as soon as possible.</p>
          <p>Here\'s a copy of your message:</p>
          <blockquote>
            <p><strong>Subject:</strong> ${data.subject}</p>
            <p>${data.message}</p>
          </blockquote>
          <p>Best regards,<br>The Masar Team</p>
        `,
      });
      logInfo('Confirmation email sent to user successfully.');

      return true;
    } catch (error) {
      logError(error instanceof Error ? error : new Error('Failed to send email'), {
        context: 'Email Sending Failure',
        data: {
          name: data.name,
          email: data.email,
          subject: data.subject,
          message: '[REDACTED]'
        }
      });
      throw new Error('Failed to send email');
    }
  },
}; 