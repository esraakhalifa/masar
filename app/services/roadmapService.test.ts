const { roadmapService } = require('./roadmapService');
const { PrismaClient } = require('../generated/prisma');

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

async function testRoadmapGeneration() {
  try {
    console.log('🚀 Starting roadmap generation test...');

    // Create test user with career preferences, skills, and education
    const testUser = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        firstName: 'Test',
        lastName: 'User',
        CareerPreference: {
          create: {
            industry: 'Technology',
            preferredSalary: 90000,
            workType: 'Hybrid',
            location: 'United States',
            jobRole: 'Business Development Manager'
          }
        },
        skills: {
          create: [
            {
              jobRole: 'Business Development Manager',
              name: 'Sales Strategy',
              level: 7
            },
            {
              jobRole: 'Business Development Manager',
              name: 'Market Analysis',
              level: 8
            },
            {
              jobRole: 'Business Development Manager',
              name: 'Negotiation',
              level: 6
            },
            {
              jobRole: 'Business Development Manager',
              name: 'CRM Software',
              level: 4
            },
            {
              jobRole: 'Business Development Manager',
              name: 'Business Intelligence',
              level: null
            }
          ]
        },
        Education: {
          create: [
            {
              degree: 'Master of Business Administration',
              fieldOfStudy: 'Business Administration',
              institution: 'Test University',
              graduationYear: 2021
            }
          ]
        }
      },
      include: {
        CareerPreference: true,
        skills: true,
        Education: true
      }
    });

    console.log('✅ Created test user with preferences:', testUser.id);
    console.log('Career Preferences:', testUser.CareerPreference);
    console.log('Skills:', testUser.skills);
    console.log('Education:', testUser.Education);

    // Generate roadmap with user context
    const result = await roadmapService.generateAndSaveRoadmap(
      testUser.id,
      testUser.CareerPreference?.jobRole || 'Business Development Manager',
      {
        careerPreference: testUser.CareerPreference || {
          industry: 'Technology',
          preferredSalary: 90000,
          workType: 'Hybrid',
          location: 'United States',
          jobRole: 'Business Development Manager'
        },
        skills: testUser.skills,
        education: testUser.Education
      }
    );

    console.log('✅ Generated roadmap:', result.roadmap.id);
    
    if (!result || !result.courses || !result.topics) {
      throw new Error('Failed to generate roadmap: Invalid result structure');
    }

    console.log('Number of courses:', result.courses.length);
    console.log('Number of topics:', result.topics.length);

    // Log sample courses
    console.log('\nSample Courses:');
    if (result.courses.length > 0) {
      result.courses.slice(0, 2).forEach(course => {
        console.log(`- ${course.title}`);
        console.log(`  Description: ${course.description}`);
        console.log(`  Link: ${course.courseLink}`);
      });
    } else {
      console.log('No courses generated');
    }

    // Log sample topics
    console.log('\nSample Topics:');
    if (result.topics.length > 0) {
      result.topics.slice(0, 2).forEach(topic => {
        console.log(`- ${topic.title}`);
        console.log(`  Description: ${topic.description}`);
        console.log(`  Tasks: ${topic.tasks?.length || 0}`);
      });
    } else {
      console.log('No topics generated');
    }

    // Verify data was saved correctly
    const savedRoadmap = await prisma.careerRoadmap.findUnique({
      where: { id: result.roadmap.id },
      include: {
        courses: true,
        topics: {
          include: {
            tasks: true
          }
        }
      }
    });

    if (!savedRoadmap) {
      throw new Error('Failed to verify roadmap: Roadmap not found in database');
    }

    console.log('\nVerification:');
    console.log('Roadmap exists:', !!savedRoadmap);
    console.log('Courses count matches:', savedRoadmap.courses.length === result.courses.length);
    console.log('Topics count matches:', savedRoadmap.topics.length === result.topics.length);

    // Comment out cleanup to keep test data
    /*
    // Clean up test data
    console.log('\nCleaning up test data...');
    
    // First delete all related records
    if (savedRoadmap) {
      // Delete all tasks
      await prisma.task.deleteMany({
        where: {
          topicId: {
            in: savedRoadmap.topics.map(topic => topic.id)
          }
        }
      });

      // Delete all topics
      await prisma.roadmapTopic.deleteMany({
        where: {
          roadmapId: savedRoadmap.id
        }
      });

      // Delete all courses
      await prisma.course.deleteMany({
        where: {
          roadmapId: savedRoadmap.id
        }
      });

      // Delete the roadmap
      await prisma.careerRoadmap.delete({
        where: {
          id: savedRoadmap.id
        }
      });
    }

    // Delete user's related data
    await prisma.skill.deleteMany({
      where: { userId: testUser.id }
    });

    await prisma.careerPreference.delete({
      where: { userId: testUser.id }
    });

    await prisma.education.deleteMany({
      where: { userId: testUser.id }
    });

    // Finally delete the user
    await prisma.user.delete({
      where: {
        id: testUser.id
      }
    });
    */

    console.log('✅ Test completed successfully');
    console.log('Test data preserved for inspection:');
    console.log('User ID:', testUser.id);
    console.log('Roadmap ID:', savedRoadmap.id);
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testRoadmapGeneration()
  .catch(console.error)
  .finally(() => process.exit()); 