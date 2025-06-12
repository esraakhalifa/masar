import { roadmapService } from '../app/services/roadmapService';
import { prisma } from '../lib/prisma';

async function main() {
  try {
    console.log('Testing topic generation and database saving...');

    const userId = 'cmbsawz1n0000fpsjbsdiznnu';

    // Ensure a test user exists
    const testUser = await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: 'sara.youssef@example.com',
        firstName: 'Sara',
        lastName: 'Youssef',
      },
    });

    // Check if a roadmap already exists for the user
    const existingRoadmap = await prisma.careerRoadmap.findFirst({
      where: {
        userId: testUser.id,
        roadmapRole: 'Software Engineer',
        deletedAt: null, // Ensure we only find non-deleted roadmaps
      },
    });

    if (existingRoadmap) {
      console.log(`\nRoadmap already exists for user ${testUser.id} with ID ${existingRoadmap.id}. Halting roadmap creation.`);
      return;
    }

    // Create a test roadmap
    const testRoadmap = await prisma.careerRoadmap.create({
      data: {
        userId: testUser.id,
        roadmapRole: 'Software Engineer',
        roadmapDetails: {},
      },
    });

    console.log('\nCreated test roadmap:', testRoadmap.id);

    // Generate and save topics
    const topicResult = await roadmapService.generateAndSaveTopics(testRoadmap.id, 'Software Engineer');

    console.log('\nUpdated Roadmap with Topics in Details:');
    console.log(JSON.stringify(topicResult.roadmap, null, 2));

    console.log('\nCreated Individual Topics:');
    console.log(JSON.stringify(topicResult.topics, null, 2));

    // Generate and save courses
    const savedCourses = await roadmapService.generateAndSaveCourses(testRoadmap.id, 'Software Engineer');

    console.log('\nCreated Courses:');
    console.log(JSON.stringify(savedCourses, null, 2));

  } catch (error) {
    console.error('Error in test:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();


/**
 * 
 * import { PrismaClient } from './app/generated/prisma';
const prisma = new PrismaClient();

async function main() {
  console.log('Testing topic generation and database saving...');

  let testUser = await prisma.user.findFirst({
    where: {
      email: 'sara.youssef@example.com',
    },
  });

  if (!testUser) {
    testUser = await prisma.user.create({
      data: {
        email: 'sara.youssef@example.com',
        firstName: 'Sara',
        lastName: 'Youssef',
      },
    });
  }

  const testRoadmap = await prisma.careerRoadmap.create({
    data: {
      userId: testUser.id,
      roadmapRole: 'Frontend Developer',
      roadmapDetails: 'HTML, CSS, JavaScript, React',
      createdAt: new Date(),
    },
  });

  console.log('Roadmap created successfully:', testRoadmap);
}

main().catch((e) => {
  console.error('Error in test:', e);
});

 */