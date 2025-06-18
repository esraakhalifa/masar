import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function getUserId(): Promise<string | null> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.error('No user ID found in session');
      return null;
    }
    return session.user.id;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
} 