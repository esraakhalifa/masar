import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Get the user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { skills, personalInfo, workExperience, education, jobRole, additionalInfo } = data;

    // Start a transaction to ensure all data is saved correctly
    const result = await prisma.$transaction(async (tx) => {
      // Update user's personal information
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          firstName: personalInfo.name?.split(' ')[0] || undefined,
          lastName: personalInfo.name?.split(' ').slice(1).join(' ') || undefined,
          additionalInfo: additionalInfo || undefined,
        },
      });

      // Save skills
      if (skills && skills.length > 0) {
        // Delete existing skills
        await tx.skill.deleteMany({
          where: { userId: session.user.id },
        });

        // Create new skills
        await Promise.all(
          skills.map((skill: string) =>
            tx.skill.create({
              data: {
                name: skill,
                category: 'Technical', // You might want to categorize skills
                userId: session.user.id,
                updatedAt: new Date(),
              },
            })
          )
        );
      }

      // Save education
      if (education && education.length > 0) {
        // Delete existing education
        await tx.education.deleteMany({
          where: { userId: session.user.id },
        });

        // Create new education records
        await Promise.all(
          education.map((edu: any) => {
            // Parse graduation year, default to current year if invalid
            let graduationYear = new Date().getFullYear();
            if (edu.dates) {
              const yearMatch = edu.dates.match(/\d{4}/);
              if (yearMatch) {
                graduationYear = parseInt(yearMatch[0]);
              }
            }

            return tx.education.create({
              data: {
                degree: edu.degree || 'Not specified',
                fieldOfStudy: 'Not specified', // Default value
                institution: edu.institution || 'Not specified',
                graduationYear: graduationYear,
                userId: session.user.id,
              },
            });
          })
        );
      }

      // Save work experience
      if (workExperience && workExperience.length > 0) {
        // Delete existing experience
        await tx.experience.deleteMany({
          where: { userId: session.user.id },
        });

        // Create new experience records
        await Promise.all(
          workExperience.map((exp: any) => {
            const dates = exp.dates?.split('-') || [];
            const startDate = new Date(dates[0] || new Date());
            const endDate = dates[1] ? new Date(dates[1]) : null;

            return tx.experience.create({
              data: {
                id: crypto.randomUUID(),
                title: exp.jobTitle || 'Not specified',
                company: exp.company || 'Not specified',
                startDate,
                endDate,
                description: exp.description || '',
                userId: session.user.id,
              },
            });
          })
        );
      }

      // Save career preference
      await tx.careerPreference.upsert({
        where: { userId: session.user.id },
        update: {
          industry: jobRole || 'Not specified',
        },
        create: {
          industry: jobRole || 'Not specified',
          preferredSalary: 0, // Default value
          workType: 'Full-time', // Default value
          location: personalInfo.location || 'Not specified',
          userId: session.user.id,
        },
      });

      return { success: true };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error saving resume data:', error);
    return NextResponse.json(
      { error: 'Failed to save resume data' },
      { status: 500 }
    );
  }
} 