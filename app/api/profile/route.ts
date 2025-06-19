import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { profileSchema } from '@/app/lib/security/security';
import { logError, logInfo, logWarning } from '@/app/lib/services/logger';
import { createServerError } from '@/app/lib/errors/serverError';
import { sanitizeObjectForSQL } from '@/app/lib/security/sqlInjection';
import { CSRF_HEADER } from '@/app/lib/security/csrf';
import type { Skill, Education, Experience } from '@/app/lib/types/profile';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Log request details
    await logInfo('Profile creation request received', {
      method: request.method,
      url: request.url,
      ip: request.headers.get('x-forwarded-for') ?? 'unknown',
    });

    // Validate CSRF token
    const csrfToken = request.headers.get(CSRF_HEADER);
    if (!csrfToken) {
      await logWarning('CSRF token missing', {
        ip: request.headers.get('x-forwarded-for') ?? 'unknown',
      });
      return NextResponse.json({ error: 'CSRF token missing' }, { status: 403 });
    }

    // Parse and validate request body
    const body = await request.json();
    await logInfo('Request body received', {
      body: JSON.stringify(body),
      ip: request.headers.get('x-forwarded-for') ?? 'unknown',
    });

    // Log the exact structure of the request body
    console.log('Request body structure:', {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      skills: body.skills?.map((s: Skill) => ({ name: s.name, level: s.level, category: s.category })),
      careerPreferences: body.careerPreferences,
      education: body.education?.map((e: Education) => ({
        institution: e.institution,
        degree: e.degree,
        fieldOfStudy: e.fieldOfStudy,
        graduationYear: e.graduationYear,
        description: e.description
      })),
      experience: body.experience?.map((e: Experience) => ({
        title: e.title,
        company: e.company,
        startDate: e.startDate,
        endDate: e.endDate,
        description: e.description
      }))
    });

    // Validate profile data
    const validationResult = profileSchema.safeParse(body);
    if (!validationResult.success) {
      await logWarning('Profile validation failed', {
        errors: validationResult.error.errors,
        ip: request.headers.get('x-forwarded-for') ?? 'unknown',
      });
      console.error('Validation errors:', validationResult.error.errors);
      return NextResponse.json({ 
        error: 'Invalid profile data',
        details: validationResult.error.errors 
      }, { status: 400 });
    }

    // Sanitize profile data
    const sanitizedProfile = sanitizeObjectForSQL(validationResult.data);
    console.log('DEBUG sanitizedProfile:', JSON.stringify(sanitizedProfile, null, 2));

    const existingUser = await prisma.user.findUnique({
      where: { email: sanitizedProfile.email },
      include: {
        skills: true,
        education: true,
        experience: true,
      },
    });

    // Debug log to inspect the existingUser object and its relations
    console.log('DEBUG existingUser:', JSON.stringify(existingUser, null, 2));

    let profile;

    if (existingUser && existingUser.id) {
      // Update basic info
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          firstName: sanitizedProfile.firstName,
          lastName: sanitizedProfile.lastName,
        },
      });

      // Remove old relations
      await prisma.skill.deleteMany({ where: { userId: existingUser.id } });
      await prisma.education.deleteMany({ where: { userId: existingUser.id } });
      await prisma.experience.deleteMany({ where: { userId: existingUser.id } });

      // Add new relations
      await prisma.skill.createMany({
        data: sanitizedProfile.skills.map((skill) => ({
          userId: existingUser.id,
          name: skill.name,
          level: skill.level || 1,
          category: skill.category || 'General',
        })),
      });

      await prisma.education.createMany({
        data: sanitizedProfile.education.map((edu) => ({
          userId: existingUser.id,
          degree: edu.degree,
          fieldOfStudy: edu.fieldOfStudy,
          institution: edu.institution,
          graduationYear: parseInt(edu.graduationYear.toString()),
        })),
      });

      await prisma.experience.createMany({
        data: sanitizedProfile.experience.map((exp) => ({
          userId: existingUser.id,
          title: exp.title,
          company: exp.company,
          startDate: new Date(exp.startDate),
          endDate: exp.endDate ? new Date(exp.endDate) : null,
          description: exp.description || '',
        })),
      });

      // Fetch the updated profile with relations
      profile = await prisma.user.findUnique({
        where: { id: existingUser.id },
        include: {
          skills: true,
          education: true,
          experience: true,
        },
      });

      await logInfo('Profile updated successfully', {
        profileId: profile.id,
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        ip: request.headers.get('x-forwarded-for') ?? 'unknown',
      });

    } else if (!existingUser) {
      console.log('DEBUG about to create user with data:', JSON.stringify({
        firstName: sanitizedProfile.firstName,
        lastName: sanitizedProfile.lastName,
        email: sanitizedProfile.email,
        skills: sanitizedProfile.skills,
        education: sanitizedProfile.education,
        experience: sanitizedProfile.experience,
      }, null, 2));
      profile = await prisma.user.create({
        data: {
          firstName: sanitizedProfile.firstName,
          lastName: sanitizedProfile.lastName,
          email: sanitizedProfile.email,
          skills: {
            create: sanitizedProfile.skills.map((skill) => ({
              name: skill.name,
              level: skill.level || 1,
              category: skill.category || 'General',
            })),
          },
          education: {
            create: sanitizedProfile.education.map((edu) => ({
              degree: edu.degree,
              fieldOfStudy: edu.fieldOfStudy,
              institution: edu.institution,
              graduationYear: parseInt(edu.graduationYear.toString())
            })),
          },
          experience: {
            create: sanitizedProfile.experience.map((exp) => ({
              title: exp.title,
              company: exp.company,
              startDate: new Date(exp.startDate),
              endDate: exp.endDate ? new Date(exp.endDate) : null,
              description: exp.description || '',
            })),
          },
        },
        include: {
          skills: true,
          education: true,
          experience: true,
        },
      });
      console.log('DEBUG created user profile:', JSON.stringify(profile, null, 2));

      await logInfo('Profile created successfully', {
        profileId: profile.id,
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        ip: request.headers.get('x-forwarded-for') ?? 'unknown',
      });
    }

    return NextResponse.json(profile, { status: existingUser ? 200 : 201 });

  } catch (error) {
    console.error('DEBUG Prisma error:', error);
    await logError(error instanceof Error ? error : new Error('Unknown error'), {
      context: 'Profile creation/update failed',
      stack: error instanceof Error ? error.stack : undefined,
      ip: request.headers.get('x-forwarded-for') ?? 'unknown',
    });

    // Handle Prisma errors
    if (error instanceof Error && 'code' in error) {
      const prismaError = error as { code: string; meta?: { target: string | string[] } };
      
      if (prismaError.code === 'P2002') {
        return NextResponse.json({ 
          error: 'A profile with this email already exists',
          code: 'DUPLICATE_EMAIL'
        }, { status: 409 });
      }

      if (prismaError.code === 'P2025') {
        return NextResponse.json({ 
          error: 'Profile not found',
          code: 'NOT_FOUND'
        }, { status: 404 });
      }

      // Log the specific Prisma error
      await logError(new Error('Prisma error details'), {
        code: prismaError.code,
        meta: prismaError.meta,
        context: 'Prisma Error in Profile Creation/Update',
      });
    }

    // Return a more detailed error response
    return NextResponse.json({ 
      error: 'Failed to create/update profile',
      details: error instanceof Error ? error.message : 'Unknown error',
      code: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return await createServerError('Email is required', 400);
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        skills: true,
        education: true,
        experience: true
      }
    });

    if (!user) {
      return await createServerError('User not found', 404);
    }

    // Format dates in the response
    const formattedUser = {
      ...user,
      fullName: `${user.firstName} ${user.lastName}`,
      education: user.education ? user.education.map((edu: any) => ({
        ...edu,
        graduationYear: edu.graduationYear.toString()
      })) : [],
      experience: user.experience ? user.experience.map((exp: any) => ({
        ...exp,
        startDate: exp.startDate.toISOString(),
        endDate: exp.endDate ? exp.endDate.toISOString() : null
      })) : [],
    };

    return NextResponse.json(formattedUser);
  } catch (error) {
    await logError(error instanceof Error ? error : new Error('Unknown error'), {
      context: 'Error fetching profile:',
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (error instanceof Error) {
      return await createServerError(error.message, 500);
    }

    return await createServerError('Failed to fetch profile', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Log request details
    await logInfo('Profile update request received', {
      method: request.method,
      url: request.url,
      ip: request.headers.get('x-forwarded-for') ?? 'unknown',
    });

    // Validate CSRF token
    const csrfToken = request.headers.get('x-csrf-token');
    if (!csrfToken) {
      await logWarning('CSRF token missing', {
        ip: request.headers.get('x-forwarded-for') ?? 'unknown',
      });
      return NextResponse.json({ error: 'CSRF token missing' }, { status: 403 });
    }

    // Parse and validate request body
    const body = await request.json();
    const { email, skills, education, experience, firstName, lastName } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    await logInfo('Profile update request body received', {
      email,
      hasSkills: !!skills,
      hasEducation: !!education,
      hasExperience: !!experience,
      ip: request.headers.get('x-forwarded-for') ?? 'unknown',
    });

    // Find the existing user
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: {
        skills: true,
        education: true,
        experience: true,
      },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;

    // Update basic info if provided
    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: updateData,
      });
    }

    // Update skills if provided
    if (skills) {
      // Remove existing skills
      await prisma.skill.deleteMany({ where: { userId: existingUser.id } });
      
      // Add new skills
      await prisma.skill.createMany({
        data: skills.map((skill: any) => ({
          userId: existingUser.id,
          name: skill.name,
          level: skill.level || 1,
          category: skill.category || 'General',
          updatedAt: new Date(),
        })),
      });
    }

    // Update education if provided
    if (education) {
      // Remove existing education
      await prisma.education.deleteMany({ where: { userId: existingUser.id } });
      
      // Add new education
      await prisma.education.createMany({
        data: education.map((edu: any) => ({
          userId: existingUser.id,
          degree: edu.degree,
          fieldOfStudy: edu.fieldOfStudy,
          institution: edu.institution,
          graduationYear: typeof edu.graduationYear === 'string' 
            ? parseInt(edu.graduationYear) 
            : edu.graduationYear,
        })),
      });
    }

    // Update experience if provided
    if (experience) {
      // Remove existing experience
      await prisma.experience.deleteMany({ where: { userId: existingUser.id } });
      
      // Add new experience
      const crypto = require('crypto');
      await prisma.experience.createMany({
        data: experience.map((exp: any) => ({
          id: crypto.randomUUID(),
          userId: existingUser.id,
          title: exp.title,
          company: exp.company,
          startDate: new Date(exp.startDate),
          endDate: exp.endDate ? new Date(exp.endDate) : null,
          description: exp.description || '',
        })),
      });
    }

    // Fetch the updated profile with relations
    const updatedProfile = await prisma.user.findUnique({
      where: { id: existingUser.id },
      include: {
        skills: true,
        education: true,
        experience: true,
      },
    });

    if (!updatedProfile) {
      return NextResponse.json({ error: 'Failed to fetch updated profile' }, { status: 500 });
    }

    await logInfo('Profile updated successfully', {
      profileId: updatedProfile.id,
      email: updatedProfile.email,
      firstName: updatedProfile.firstName,
      lastName: updatedProfile.lastName,
      ip: request.headers.get('x-forwarded-for') ?? 'unknown',
    });

    return NextResponse.json(updatedProfile);

  } catch (error) {
    console.error('DEBUG Prisma error in PUT:', error);
    await logError(error instanceof Error ? error : new Error('Unknown error'), {
      context: 'Profile update failed',
      stack: error instanceof Error ? error.stack : undefined,
      ip: request.headers.get('x-forwarded-for') ?? 'unknown',
    });

    return NextResponse.json({ 
      error: 'Failed to update profile',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
} 