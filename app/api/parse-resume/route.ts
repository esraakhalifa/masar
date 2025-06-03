import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { spawn } from 'child_process';

// List of common programming skills and technologies
const SKILLS_LIST = [
  // Programming Languages
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin',
  // Frontend
  'React', 'Angular', 'Vue', 'Next.js', 'HTML', 'CSS', 'SASS', 'Bootstrap', 'Tailwind', 'Material-UI',
  // Backend
  'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'ASP.NET', 'Laravel', 'FastAPI',
  // Databases
  'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Firebase', 'DynamoDB',
  // Cloud & DevOps
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'GitLab CI', 'GitHub Actions',
  // Tools & Others
  'Git', 'CI/CD', 'Agile', 'Scrum', 'Jira', 'Confluence', 'REST', 'GraphQL', 'WebSocket', 'Microservices',
  // Testing
  'Jest', 'Mocha', 'Cypress', 'Selenium', 'JUnit', 'Pytest',
  // Build Tools
  'Webpack', 'Babel', 'Vite', 'npm', 'yarn', 'Gradle', 'Maven'
];

function extractSkills(text: string): string[] {
  const normalizedText = text.toLowerCase();
  const foundSkills = SKILLS_LIST.filter(skill => 
    normalizedText.includes(skill.toLowerCase())
  );
  return [...new Set(foundSkills)]; // Remove duplicates
}

// Function to extract text from PDF using pdftotext
async function extractTextFromPDF(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdftotext = spawn('pdftotext', [filePath, '-']);
    let output = '';
    let error = '';

    pdftotext.stdout.on('data', (data) => {
      output += data.toString();
    });

    pdftotext.stderr.on('data', (data) => {
      error += data.toString();
    });

    pdftotext.on('close', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`pdftotext failed with code ${code}: ${error}`));
      }
    });
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    try {
      // Create temporary file
      const tempFilePath = join(tmpdir(), file.name);
      await writeFile(tempFilePath, buffer);

      // Extract text using pdftotext
      const text = await extractTextFromPDF(tempFilePath);

      // Clean up temp file
      await unlink(tempFilePath);

      // Extract skills from the text
      const skills = extractSkills(text);

      return NextResponse.json({
        success: true,
        data: {
          skills,
          text,
          numPages: text.split('\f').length 
        }
      });
    } catch (error) {
      console.error('Error during parsing:', error);
      return NextResponse.json(
        { error: `Failed to parse resume: ${error instanceof Error ? error.message : 'Unknown error'}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { error: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 