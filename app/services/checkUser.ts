import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function checkUser() {
  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: 'test-user-id' },
      include: {
        CareerPreference: true,
        skills: true,
        Education: true,
        careerRoadmap: {
          include: {
            courses: true,
            topics: {
              include: {
                tasks: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      console.log('Test user not found');
      return;
    }

    console.log('Test user found:', {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      careerPreference: user.CareerPreference,
      skills: user.skills,
      education: user.Education,
      roadmap: user.careerRoadmap
    });

  } catch (error) {
    console.error('Error checking user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser().then(() => {
  console.log('Check completed');
  process.exit(0);
}).catch((error) => {
  console.error('Check failed:', error);
  process.exit(1);
}); 