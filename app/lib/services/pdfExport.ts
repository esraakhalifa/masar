import jsPDF from 'jspdf';
import { UserProfile } from '../types/profile';

export const exportProfileToPdf = async (profile: UserProfile): Promise<void> => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const margin = 20;
  let yOffset = 20;

  pdf.setFontSize(22);
  pdf.text('User Profile', margin, yOffset);
  yOffset += 15;

  pdf.setFontSize(16);
  pdf.text('Personal Information', margin, yOffset);
  yOffset += 10;
  pdf.setFontSize(12);
  pdf.text(`Full Name: ${profile.fullName}`, margin, yOffset);
  yOffset += 7;
  pdf.text(`Email: ${profile.email}`, margin, yOffset);
  yOffset += 15;

  if (profile.skills && profile.skills.length > 0) {
    pdf.setFontSize(16);
    pdf.text('Skills', margin, yOffset);
    yOffset += 10;
    pdf.setFontSize(12);
    profile.skills.forEach(skill => {
      pdf.text(`- ${skill.name}${skill.level ? ` (Level: ${skill.level})` : ''}`, margin, yOffset);
      yOffset += 7;
    });
    yOffset += 15;
  }

  if (profile.careerPreferences) {
    pdf.setFontSize(16);
    pdf.text('Career Preferences', margin, yOffset);
    yOffset += 10;
    pdf.setFontSize(12);
    pdf.text(`Industry: ${profile.careerPreferences.industry}`, margin, yOffset);
    yOffset += 7;
    pdf.text(`Location: ${profile.careerPreferences.location}`, margin, yOffset);
    yOffset += 7;
    pdf.text(`Work Type: ${profile.careerPreferences.workType}`, margin, yOffset);
    yOffset += 7;
    pdf.text(`Preferred Salary: $${profile.careerPreferences.preferredSalary}`, margin, yOffset);
    yOffset += 15;
  }

  if (profile.education && profile.education.length > 0) {
    pdf.setFontSize(16);
    pdf.text('Education', margin, yOffset);
    yOffset += 10;
    pdf.setFontSize(12);
    profile.education.forEach(edu => {
      pdf.text(`${edu.degree} in ${edu.fieldOfStudy} from ${edu.institution} (${edu.graduationYear})`, margin, yOffset);
      yOffset += 7;
      if (edu.description) {
        pdf.text(edu.description, margin + 5, yOffset, { maxWidth: 170 });
        yOffset += pdf.getTextDimensions(edu.description, { maxWidth: 170 }).h + 2;
      }
    });
    yOffset += 15;
  }

  if (profile.experience && profile.experience.length > 0) {
    pdf.setFontSize(16);
    pdf.text('Work Experience', margin, yOffset);
    yOffset += 10;
    pdf.setFontSize(12);
    profile.experience.forEach(exp => {
      pdf.text(`${exp.title} at ${exp.company} (${exp.startDate} - ${exp.endDate || 'Present'})`, margin, yOffset);
      yOffset += 7;
      if (exp.description) {
        pdf.text(exp.description, margin + 5, yOffset, { maxWidth: 170 });
        yOffset += pdf.getTextDimensions(exp.description, { maxWidth: 170 }).h + 2;
      }
    });
    yOffset += 15;
  }

  // Convert HTML content to PDF
  const content = document.createElement('div');
  content.innerHTML = `
    <h1>${profile.fullName}</h1>
    <p>Email: ${profile.email}</p>
    <h2>Skills</h2>
    <ul>
      ${profile.skills.map(skill => `<li>${skill.name} (Level: ${skill.level})</li>`).join('')}
    </ul>
  `;

  // This part is for converting an HTML element to canvas and then to PDF, 
  // but it's currently commented out or not fully implemented.
  // Given the manual text additions above, this section might be redundant or require a different approach.
  // If you intend to use html2canvas, ensure the HTML content is prepared correctly
  // and fits within the PDF structure.
  // This conversion might be better suited for complex layouts not easily done with jspdf text methods.

  // html2canvas(content).then(canvas => {
  //   const imgData = canvas.toDataURL('image/png');
  //   const imgWidth = 210; // A4 width in mm
  //   const pageHeight = 297; // A4 height in mm
  //   const imgHeight = (canvas.height * imgWidth) / canvas.width;
  //   let heightLeft = imgHeight;

  //   pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
  //   heightLeft -= pageHeight;

  //   while (heightLeft >= 0) {
  //     yOffset = heightLeft - imgHeight;
  //     pdf.addPage();
  //     pdf.addImage(imgData, 'PNG', 0, yOffset, imgWidth, imgHeight);
  //     heightLeft -= pageHeight;
  //   }

  //   pdf.save(`${profile.fullName}_profile.pdf`);
  // });

  pdf.save(`${profile.fullName}_profile.pdf`);
}; 