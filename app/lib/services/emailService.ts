import nodemailer from 'nodemailer';

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
const transporter = nodemailer.createTransport(emailConfig);

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
      
      // Send email to admin
      await transporter.sendMail({
        from: `"Masar Contact Form" <${process.env.EMAIL_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject,
        html,
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
          <p>Here's a copy of your message:</p>
          <blockquote>
            <p><strong>Subject:</strong> ${data.subject}</p>
            <p>${data.message}</p>
          </blockquote>
          <p>Best regards,<br>The Masar Team</p>
        `,
      });

      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  },
}; 