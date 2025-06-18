import { PrismaClient, User, CareerPreference, Skill, Education } from '@/prisma/client';
import { roadmapService } from './roadmapService';

const prisma = new PrismaClient();

interface Course {
  id: string;
  title: string;
  description: string | null;
  instructors: string | null;
  courseLink: string;
}

interface Topic {
  id: string;
  title: string;
  description: string | null;
  totalTasks: number;
  tasks: Array<{
    id: string;
    title: string;
    description: string | null;
    order: number;
  }>;
}

interface RoadmapResult {
  roadmap: {
    id: string;
  };
  courses: Course[];
  topics: Topic[];
}

interface UserWithRelations extends User {
  CareerPreference: CareerPreference | null;
  skills: Skill[];
  Education: Education[];
}

interface UserContext {
  careerPreference: {
    industry: string;
    preferredSalary: number;
    workType: string;
    location: string;
    jobRole: string;
  };
  skills: Array<{
    name: string;
    level: number | null;
    jobRole: string;
  }>;
  education: Array<{
    degree: string;
    fieldOfStudy: string;
    institution: string;
    graduationYear: number;
  }>;
}

async function createTestUser() {
  try {
    // Create a test user with all required fields
    const testUser = await prisma.user.create({
      data: {
        id: 'test-user-id', // Set a fixed ID for testing
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        updatedAt: new Date(),
        CareerPreference: {
          create: {
            industry: 'Technology',
            preferredSalary: 80000,
            workType: 'Full-time',
            location: 'Remote'
          }
        },
        skills: {
          create: [
            {
              name: 'Sales',
              jobRole: 'Business Development Manager',
              level: 3,
              updatedAt: new Date()
            },
            {
              name: 'Negotiation',
              jobRole: 'Business Development Manager',
              level: 4,
              updatedAt: new Date()
            }
          ]
        },
        Education: {
          create: {
            degree: 'Bachelor',
            fieldOfStudy: 'Business Administration',
            institution: 'Test University',
            graduationYear: 2020
          }
        }
      },
      include: {
        CareerPreference: true,
        skills: true,
        Education: true
      }
    });

    console.log('Test user created:', testUser);
    return testUser;
  } catch (error) {
    console.error('Error creating test user:', error);
    throw error;
  }
}

async function testRoadmapGeneration() {
  try {
    // Get the test user
    const testUser = await prisma.user.findUnique({
      where: { id: 'test-user-id' },
      include: {
        CareerPreference: true,
        skills: true,
        Education: true
      }
    });

    if (!testUser) {
      throw new Error('Test user not found');
    }

    console.log('Found test user:', testUser);

    // Generate roadmap
    const roadmap = await roadmapService.generateAndSaveRoadmap(
      testUser.id,
      'Business Development Manager',
      {
        careerPreference: {
          industry: testUser.CareerPreference?.industry || 'Technology',
          preferredSalary: testUser.CareerPreference?.preferredSalary || 80000,
          workType: testUser.CareerPreference?.workType || 'Full-time',
          location: testUser.CareerPreference?.location || 'Remote',
          jobRole: 'Business Development Manager'
        },
        skills: testUser.skills.map(skill => ({
          name: skill.name,
          level: skill.level,
          jobRole: skill.jobRole || 'Business Development Manager'
        })),
        education: testUser.Education
      }
    );

    console.log('Generated roadmap:', roadmap);
  } catch (error) {
    console.error('Error in test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testRoadmapGeneration().then(() => {
  console.log('Test completed');
  process.exit(0);
}).catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
}); 