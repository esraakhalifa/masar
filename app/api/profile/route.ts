import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/app/lib/database/db';
import { profileSchema } from '@/app/lib/security/security';
import { logger } from '@/app/lib/services/logger';
import { createServerError } from '@/app/lib/errors/serverError';
import { sanitizeObjectForSQL } from '@/app/lib/security/sqlInjection';
import { CSRF_HEADER } from '@/app/lib/security/csrf';
import type { Skill, Education, Experience } from '@/app/lib/types/profile';

export async function POST(request: NextRequest) {
  try {
    // Log request details
    logger.info('Profile creation request received', {
      method: request.method,
      url: request.url,
      ip: request.headers.get('x-forwarded-for') ?? 'unknown',
    });

    // Validate CSRF token
    const csrfToken = request.headers.get(CSRF_HEADER);
    if (!csrfToken) {
      logger.warn('CSRF token missing', {
        ip: request.headers.get('x-forwarded-for') ?? 'unknown',
      });
      return NextResponse.json({ error: 'CSRF token missing' }, { status: 403 });
    }

    // Parse and validate request body
    const body = await request.json();
    logger.info('Request body received', {
      body: JSON.stringify(body),
      ip: request.headers.get('x-forwarded-for') ?? 'unknown',
    });

    // Log the exact structure of the request body
    console.log('Request body structure:', {
      fullName: body.fullName,
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
      logger.warn('Profile validation failed', {
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

    // Check if profile already exists
    const existingProfile = await prisma.user.findUnique({
      where: { email: sanitizedProfile.email },
    });

    if (existingProfile) {
      logger.warn('Profile already exists', {
        email: sanitizedProfile.email,
        ip: request.headers.get('x-forwarded-for') ?? 'unknown',
      });
      return NextResponse.json({ 
        message: 'Profile already exists',
        profile: existingProfile 
      }, { status: 409 });
    }

    // Create profile with nested relations
    const profile = await prisma.user.create({
      data: {
        fullName: sanitizedProfile.fullName,
        email: sanitizedProfile.email,
        skills: {
          create: sanitizedProfile.skills.map((skill) => ({
            name: skill.name,
            level: skill.level || 1,
            category: skill.category || 'General',
          })),
        },
        preferences: {
          create: {
            industry: sanitizedProfile.careerPreferences.industry,
            preferredSalary: sanitizedProfile.careerPreferences.preferredSalary || 0,
            workType: sanitizedProfile.careerPreferences.workType,
            location: sanitizedProfile.careerPreferences.location || '',
          },
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
        preferences: true,
        education: true,
        experience: true,
      },
    });

    logger.info('Profile created successfully', {
      profileId: profile.id,
      email: profile.email,
      ip: request.headers.get('x-forwarded-for') ?? 'unknown',
    });

    return NextResponse.json(profile, { status: 201 });

  } catch (error) {
    logger.error('Profile creation failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
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
      logger.error('Prisma error details', {
        code: prismaError.code,
        meta: prismaError.meta,
      });
    }

    // Return a more detailed error response
    return NextResponse.json({ 
      error: 'Failed to create profile',
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
        preferences: true,
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
      education: user.education.map(edu => ({
        ...edu,
        graduationYear: edu.graduationYear.toString()
      })),
      experience: user.experience.map(exp => ({
        ...exp,
        startDate: exp.startDate.toISOString(),
        endDate: exp.endDate ? exp.endDate.toISOString() : null
      }))
    };

    return NextResponse.json(formattedUser);
  } catch (error) {
    logger.error('Error fetching profile:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (error instanceof Error) {
      return await createServerError(error.message, 500);
    }

    return await createServerError('Failed to fetch profile', 500);
  }
} 