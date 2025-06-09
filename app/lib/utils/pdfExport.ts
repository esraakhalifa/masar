import jsPDF from 'jspdf';
import type { UserProfile } from '../types/profile';

interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
}

export async function generateProfilePDF(profile: UserProfile, element: HTMLElement): Promise<void> {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    let yOffset = margin;

    // Add header
    pdf.setFontSize(24);
    pdf.text('Career Profile', pageWidth / 2, yOffset, { align: 'center' });
    yOffset += 15;

    // Add basic information
    pdf.setFontSize(16);
    pdf.text('Basic Information', margin, yOffset);
    yOffset += 10;
    pdf.setFontSize(12);
    pdf.text(`Name: ${profile.fullName}`, margin, yOffset);
    yOffset += 7;
    pdf.text(`Email: ${profile.email}`, margin, yOffset);
    yOffset += 15;

    // Add skills
    pdf.setFontSize(16);
    pdf.text('Skills', margin, yOffset);
    yOffset += 10;
    pdf.setFontSize(12);
    profile.skills.forEach(skill => {
      pdf.text(`${skill.name} (${skill.category} - Level ${skill.level})`, margin, yOffset);
      yOffset += 7;
    });
    yOffset += 8;

    // Add career preferences
    pdf.setFontSize(16);
    pdf.text('Career Preferences', margin, yOffset);
    yOffset += 10;
    pdf.setFontSize(12);
    pdf.text(`Industry: ${profile.preferences.industry}`, margin, yOffset);
    yOffset += 7;
    pdf.text(`Location: ${profile.preferences.location}`, margin, yOffset);
    yOffset += 7;
    pdf.text(`Work Type: ${profile.preferences.workType}`, margin, yOffset);
    yOffset += 7;
    pdf.text(`Preferred Salary: $${profile.preferences.preferredSalary}`, margin, yOffset);
    yOffset += 15;

    // Add education
    pdf.setFontSize(16);
    pdf.text('Education', margin, yOffset);
    yOffset += 10;
    pdf.setFontSize(12);
    profile.education.forEach(edu => {
      pdf.text(`${edu.degree} in ${edu.fieldOfStudy}`, margin, yOffset);
      yOffset += 7;
      pdf.text(`${edu.institution} (${edu.graduationYear})`, margin, yOffset);
      yOffset += 10;
    });

    // Add experience
    pdf.setFontSize(16);
    pdf.text('Work Experience', margin, yOffset);
    yOffset += 10;
    pdf.setFontSize(12);
    profile.experience.forEach(exp => {
      pdf.text(`${exp.title} at ${exp.company}`, margin, yOffset);
      yOffset += 7;
      pdf.text(`${new Date(exp.startDate).toLocaleDateString()} - ${exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'Present'}`, margin, yOffset);
      yOffset += 7;
      if (exp.description) {
        const splitDescription = pdf.splitTextToSize(exp.description, pageWidth - (2 * margin));
        pdf.text(splitDescription, margin, yOffset);
        yOffset += 7 * splitDescription.length;
      }
      yOffset += 5;
    });

    // Save the PDF
    pdf.save('career-profile.pdf');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
} 