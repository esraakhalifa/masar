import { roadmapService } from './roadmapService';
import { PrismaClient } from '../generated/prisma';

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

    // Create test user
    const testUser = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        firstName: 'Test',
        lastName: 'User'
      }
    });

    console.log('✅ Created test user:', testUser.id);

    // Generate roadmap
    const result = await roadmapService.generateAndSaveRoadmap(testUser.id, 'Software Engineer');
    console.log('✅ Generated roadmap:', result.roadmap.id);
    console.log('Number of courses:', result.courses.length);
    console.log('Number of topics:', result.topics.length);

    // Log sample courses
    console.log('\nSample Courses:');
    result.courses.slice(0, 2).forEach(course => {
      console.log(`- ${course.title}`);
      console.log(`  Description: ${course.description}`);
      console.log(`  Link: ${course.courseLink}`);
    });

    // Log sample topics
    console.log('\nSample Topics:');
    result.topics.slice(0, 2).forEach(topic => {
      console.log(`- ${topic.title}`);
      console.log(`  Description: ${topic.description}`);
      console.log(`  Tasks: ${topic.tasks.length}`);
    });

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

    console.log('\nVerification:');
    console.log('Roadmap exists:', !!savedRoadmap);
    console.log('Courses count matches:', savedRoadmap?.courses.length === result.courses.length);
    console.log('Topics count matches:', savedRoadmap?.topics.length === result.topics.length);

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

    // Finally delete the user
    await prisma.user.delete({
      where: {
        id: testUser.id
      }
    });

    console.log('✅ Test completed successfully');
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