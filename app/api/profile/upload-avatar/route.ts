import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { CSRF_HEADER } from '@/app/lib/security/csrf';
import { logger } from '@/app/lib/services/logger';
import prisma from '@/app/lib/database/db';

export async function POST(request: NextRequest) {
  try {
    logger.info('Avatar upload request received');

    const csrfToken = request.headers.get(CSRF_HEADER);
    if (!csrfToken) {
      logger.warn('CSRF token missing during avatar upload');
      return NextResponse.json({ error: 'CSRF token missing' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('avatar') as File; // 'avatar' is the field name for the file
    const userEmail = formData.get('email') as string;

    if (!file) {
      logger.warn('No file provided for avatar upload');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!userEmail) {
      logger.warn('User email not provided for avatar upload');
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      );
    }

    // In a real application, you would upload the file to a cloud storage service
    // (e.g., AWS S3, Cloudinary) here and get a public URL.
    // For this example, we'll simulate the upload and generate a mock URL.

    // For demonstration, let's save it temporarily to a local tmp directory
    // and then construct a mock URL.
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const tempFileName = `avatar-${Date.now()}-${file.name}`;
    const tempFilePath = join(tmpdir(), tempFileName);

    await writeFile(tempFilePath, buffer);
    logger.info(`Temporary avatar file saved at: ${tempFilePath}`);

    // Simulate a public URL (replace with actual cloud storage URL)
    const mockAvatarUrl = `/uploads/avatars/${tempFileName}`; // This path won't actually serve the image

    // Update the user's avatarUrl in the database
    const updatedUser = await prisma.user.update({
      where: { email: userEmail },
      data: { avatarUrl: mockAvatarUrl },
    });

    // Clean up the temporary file (in a real scenario, this would be after successful cloud upload)
    await unlink(tempFilePath);
    logger.info(`Temporary avatar file deleted: ${tempFilePath}`);

    return NextResponse.json({
      message: 'Avatar uploaded and profile updated successfully',
      avatarUrl: mockAvatarUrl,
      userId: updatedUser.id,
    });

  } catch (error) {
    logger.error('Error during avatar upload:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: 'Failed to upload avatar' },
      { status: 500 }
    );
  }
} 