import { roadmapService } from '../app/services/roadmapService';
import { prisma } from '../lib/prisma';

async function main() {
  try {
    console.log('Testing course generation for existing roadmap...');

    // Specify the existing roadmap ID (replace with actual ID)
    const roadmapId = 'cmbsev3g70001fp5q3drb88a5';
    const jobTitle = 'Software Engineer';

    // Verify the roadmap exists and is not deleted
    const roadmap = await prisma.careerRoadmap.findFirst({
      where: {
        id: roadmapId,
        deletedAt: null,
      },
    });

    if (!roadmap) {
      console.error(`No active roadmap found with ID ${roadmapId}`);
      process.exit(1);
    }

    // Generate and save courses
    const savedCourses = await roadmapService.generateAndSaveCourses(roadmapId, jobTitle);

    console.log('\nCreated Courses for Roadmap ID:', roadmapId);
    console.log(JSON.stringify(savedCourses, null, 2));

  } catch (error) {
    console.error('Error in course generation:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();