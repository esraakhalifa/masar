import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/app/lib/database/db';
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
      // Defensive: Only use deleteMany if there are existing relations
      const skillsDelete = existingUser.skills && existingUser.skills.length > 0 ? { deleteMany: {} } : undefined;
      const educationDelete = existingUser.education && existingUser.education.length > 0 ? { deleteMany: {} } : undefined;
      const experienceDelete = existingUser.experience && existingUser.experience.length > 0 ? { deleteMany: {} } : undefined;

      profile = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          firstName: sanitizedProfile.firstName,
          lastName: sanitizedProfile.lastName,
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