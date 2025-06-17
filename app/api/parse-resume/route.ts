// app/api/parse-resume/route.ts
import { NextRequest, NextResponse } from 'next/server';

const RESUME_PARSER_API_KEY = process.env.APILAYER_API_KEY;
const RESUME_PARSER_API_URL = 'https://api.apilayer.com/resume_parser/upload';

// Updated interface to match the actual API response
interface ApiLayerResponse {
  name?: string;
  email?: string;
  phone?: string;
  skills?: string[];
  education?: Array<{
    name?: string;
    dates?: string[];
    date_start?: string;
    date_end?: string;
  }>;
  experience?: Array<{
    title?: string;
    organization?: string;
    dates?: string[];
  }>;
  // Keep the old structure as fallback
  success?: boolean;
  data?: {
    personal_infos?: {
      name?: string;
      email?: string;
      phone?: string;
      location?: string;
    };
    skills?: string[];
    work_experience?: Array<{
      job_title?: string;
      company?: string;
      location?: string;
      dates?: string;
      description?: string;
    }>;
    education?: Array<{
      degree?: string;
      institution?: string;
      location?: string;
      dates?: string;
    }>;
    certifications?: string[];
    languages?: string[];
  };
  error?: string;
}

interface ParsedResumeData {
  skills: string[];
  personalInfo: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
  };
  workExperience: Array<{
    jobTitle?: string;
    company?: string;
    location?: string;
    dates?: string;
    description?: string;
  }>;
  education: Array<{
    degree?: string;
    institution?: string;
    location?: string;
    dates?: string;
  }>;
  certifications: string[];
  languages: string[];
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

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    // Get the file extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const mimeType = file.type;
    
    console.log('File details:', {
      name: file.name,
      type: mimeType,
      extension: fileExtension,
      size: file.size
    });
    
    // Check both MIME type and file extension
    const isValidType = allowedTypes.includes(mimeType) || 
      (fileExtension && ['pdf', 'doc', 'docx', 'txt'].includes(fileExtension));
    
    if (!isValidType) {
      return NextResponse.json(
        { error: 'Only PDF, DOC, DOCX, and TXT files are supported' },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate PDF magic number
    if (fileExtension === 'pdf') {
      const isPDF = buffer.length > 4 && 
        buffer[0] === 0x25 && // %
        buffer[1] === 0x50 && // P
        buffer[2] === 0x44 && // D
        buffer[3] === 0x46;   // F
      
      if (!isPDF) {
        return NextResponse.json(
          { error: 'The file appears to be corrupted or not a valid PDF' },
          { status: 400 }
        );
      }
    }

    console.log('Sending request to Resume Parser API...');

    // Try multiple approaches for better compatibility
    const uploadMethods = [
      // // Method 1: Standard FormData with correct MIME type
      // async () => {
      //   const apiFormData = new FormData();
      //   // Force the correct MIME type based on extension
      //   let correctMimeType = mimeType;
      //   if (fileExtension === 'pdf') correctMimeType = 'application/pdf';
      //   else if (fileExtension === 'doc') correctMimeType = 'application/msword';
      //   else if (fileExtension === 'docx') correctMimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        
      //   const blob = new Blob([buffer], { type: correctMimeType });
      //   apiFormData.append('file', blob, file.name);

      //   const controller = new AbortController();
      //   const timeout = setTimeout(() => controller.abort(), 60000); // 60 seconds
      //   try {
      //     const response = await fetch(RESUME_PARSER_API_URL, {
      //       method: 'POST',
      //       headers: {
      //         'apikey': RESUME_PARSER_API_KEY,
      //       },
      //       body: apiFormData,
      //       signal: controller.signal
      //     });
      //     clearTimeout(timeout);
      //     return response;
      //   } catch (error) {
      //     clearTimeout(timeout);
      //     throw error;
      //   }
      // },

      // // Method 2: Base64 encoding
      // async () => {
      //   const base64File = buffer.toString('base64');
      //   const apiFormData = new FormData();
      //   apiFormData.append('file', base64File);
      //   apiFormData.append('filename', file.name);

      //   return fetch(RESUME_PARSER_API_URL, {
      //     method: 'POST',
      //     headers: {
      //       'apikey': RESUME_PARSER_API_KEY,
      //     },
      //     body: apiFormData,
      //   });
      // },

      // // Method 3: URLSearchParams with base64
      // async () => {
      //   const base64File = buffer.toString('base64');
        
      //   return fetch(RESUME_PARSER_API_URL, {
      //     method: 'POST',
      //     headers: {
      //       'apikey': RESUME_PARSER_API_KEY,
      //       'Content-Type': 'application/x-www-form-urlencoded',
      //     },
      //     body: new URLSearchParams({
      //       file: base64File,
      //       filename: file.name
      //     })
      //   });
      // },

      // Method 4: Raw binary with specific content-type
      async () => {
        let contentType = 'application/pdf';
        if (fileExtension === 'doc') contentType = 'application/msword';
        else if (fileExtension === 'docx') contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        else if (fileExtension === 'txt') contentType = 'text/plain';

        return fetch(RESUME_PARSER_API_URL, {
          method: 'POST',
          headers: {
            'apikey': RESUME_PARSER_API_KEY,
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${file.name}"`,
          },
          body: buffer,
        });
      }
    ];

    let lastError: string = 'All upload methods failed';
    
    // Try each method sequentially
    for (let i = 0; i < uploadMethods.length; i++) {
      try {
        console.log(`Trying upload method ${i + 1}...`);
        const response = await uploadMethods[i]();
        
        console.log(`Method ${i + 1} - API Response status:`, response.status);
        
        const responseText = await response.text();
        console.log(`Method ${i + 1} - Raw API Response:`, responseText);

        if (response.ok) {
          let apiResponse: ApiLayerResponse;
          try {
            apiResponse = JSON.parse(responseText);
          } catch {
            console.error('Failed to parse API response as JSON:', responseText);
            lastError = 'Invalid response from resume parsing service';
            continue;
          }

          console.log('Parsed API Response:', JSON.stringify(apiResponse, null, 2));

          // FIXED: Handle both response formats
          let extractedData: ParsedResumeData;
          
          // Check if it's the new format (direct properties)
          if (apiResponse.name || apiResponse.email || apiResponse.skills) {
            extractedData = {
              skills: apiResponse.skills || [],
              personalInfo: {
                name: apiResponse.name,
                email: apiResponse.email,
                phone: apiResponse.phone,
                location: undefined, // Not provided in this format
              },
              workExperience: apiResponse.experience?.map(exp => ({
                jobTitle: exp.title,
                company: exp.organization,
                location: undefined,
                dates: exp.dates?.join(' - '),
                description: undefined,
              })) || [],
              education: apiResponse.education?.map(edu => ({
                degree: undefined,
                institution: edu.name,
                location: undefined,
                dates: edu.dates?.join(' - ') || `${edu.date_start} - ${edu.date_end}`,
              })) || [],
              certifications: [],
              languages: [],
            };
          } 
          // Fallback to old format
          else if (apiResponse.success && apiResponse.data) {
            extractedData = {
              skills: apiResponse.data.skills || [],
              personalInfo: {
                name: apiResponse.data.personal_infos?.name,
                email: apiResponse.data.personal_infos?.email,
                phone: apiResponse.data.personal_infos?.phone,
                location: apiResponse.data.personal_infos?.location,
              },
              workExperience: apiResponse.data.work_experience?.map(exp => ({
                jobTitle: exp.job_title,
                company: exp.company,
                location: exp.location,
                dates: exp.dates,
                description: exp.description,
              })) || [],
              education: apiResponse.data.education?.map(edu => ({
                degree: edu.degree,
                institution: edu.institution,
                location: edu.location,
                dates: edu.dates,
              })) || [],
              certifications: apiResponse.data.certifications || [],
              languages: apiResponse.data.languages || [],
            };
          } else {
            lastError = apiResponse.error || 'Failed to parse resume - no data returned';
            continue;
          }

          // Clean and deduplicate skills
          const cleanedSkills = cleanSkills(extractedData.skills);

          return NextResponse.json({
            success: true,
            data: {
              skills: cleanedSkills,
              personalInfo: extractedData.personalInfo,
              workExperience: extractedData.workExperience,
              education: extractedData.education,
              certifications: extractedData.certifications,
              languages: extractedData.languages,
              summary: {
                totalSkills: cleanedSkills.length,
                hasPersonalInfo: !!(extractedData.personalInfo.name || extractedData.personalInfo.email),
                hasWorkExperience: extractedData.workExperience.length > 0,
                hasEducation: extractedData.education.length > 0,
                hasCertifications: extractedData.certifications.length > 0,
              }
            }
          });
        } else {
          // Parse error response
          let errorMessage = 'Failed to parse resume';
          try {
            const errorJson = JSON.parse(responseText);
            errorMessage = errorJson.message || errorJson.error || errorMessage;
          } catch {
            errorMessage = responseText || errorMessage;
          }
          
          console.log(`Method ${i + 1} failed:`, errorMessage);
          lastError = errorMessage;
          
          // If it's a file format error, continue to next method
          if (errorMessage.includes('Unknown file format') || 
              errorMessage.includes('file format') ||
              errorMessage.includes('not supported')) {
            continue;
          } else {
            // For other errors, stop trying
            break;
          }
        }
      } catch (error) {
        console.error(`Method ${i + 1} error:`, error);
        lastError = error instanceof Error ? error.message : 'Network error';
        continue;
      }
    }

    // If we get here, all methods failed
    console.error('All upload methods failed. Last error:', lastError);
    
    // Return a more helpful error message
    if (lastError.includes('Unknown file format')) {
      return NextResponse.json(
        { error: 'The PDF file format is not recognized by the parsing service. Please try saving your CV as a different PDF or use a DOC/DOCX format.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: lastError || 'Failed to parse resume. Please try again or use a different file format.' },
      { status: 500 }
    );

  } catch (error) {
    console.error('Error in API route:', error);
    
    let errorMessage = 'Server error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// Clean and deduplicate skills
function cleanSkills(skills: string[]): string[] {
  if (!skills || !Array.isArray(skills)) {
    return [];
  }

  const cleanedSkills = skills
    .map(skill => {
      if (typeof skill !== 'string') return '';
      
      return skill
        .trim()
        .replace(/[^\w\s+#.-]/g, '') // Remove special characters except common ones in tech
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
    })
    .filter(skill => {
      // Filter out empty strings and very short skills
      return skill.length > 1 && skill.length < 50;
    });

  // Remove duplicates (case-insensitive)
  const uniqueSkills = [...new Set(cleanedSkills.map(skill => skill.toLowerCase()))]
    .map(lowerSkill => {
      // Find the original casing
      return cleanedSkills.find(skill => skill.toLowerCase() === lowerSkill) || lowerSkill;
    });

  return uniqueSkills.sort();
}