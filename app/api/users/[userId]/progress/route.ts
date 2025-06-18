import { NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  console.log('API Route: Progress endpoint hit');
  console.log('Request URL:', request.url);
  console.log('User ID from params:', params.userId);

  try {
    // Connect to the database
    await prisma.$connect();
    console.log('Successfully connected to database');

    // Get user's roadmap
    const roadmap = await prisma.careerRoadmap.findFirst({
      where: {
        userId: params.userId,
        deletedAt: null,
      },
      include: {
        courses: {
          include: {
            certificates: true
          }
        },
        topics: {
          include: {
            tasks: true,
          },
        },
      },
    });

    if (!roadmap) {
      console.log('No roadmap found for user:', params.userId);
      return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 });
    }

    console.log('Roadmap found:', roadmap.id);

    // Get current date and calculate date ranges
    const now = new Date();
    
    // Set start of month to beginning of day
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    
    // Calculate start of week (Sunday) and set to beginning of day
    const startOfWeek = new Date(now);
    const day = now.getDay();
    startOfWeek.setDate(now.getDate() - day);
    startOfWeek.setHours(0, 0, 0, 0);
    
    console.log('Date ranges:', {
      now: now.toISOString(),
      startOfMonth: startOfMonth.toISOString(),
      startOfWeek: startOfWeek.toISOString()
    });

    // Get recent completed courses (this month)
    // A course is considered completed if it has a certificate issued this month
    const recentCourses = await prisma.courses.findMany({
      where: {
        roadmap_id: roadmap.id,
        certificates: {
          some: {
            userId: params.userId,
            issueDate: {
              gte: startOfMonth
            },
            deletedAt: null
          }
        }
      },
      include: {
        certificates: {
          where: {
            userId: params.userId,
            issueDate: {
              gte: startOfMonth
            },
            deletedAt: null
          },
          orderBy: {
            issueDate: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        certificates: {
          _count: 'desc'
        }
      },
      take: 3,
    });

    console.log('Recent completed courses found:', recentCourses.length);
    console.log('Recent courses:', recentCourses.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      updatedAt: course.certificates[0]?.issueDate || course.updatedAt,
      certificate: course.certificates[0] ? {
        provider: course.certificates[0].provider,
        issueDate: course.certificates[0].issueDate
      } : null
    })));

    // Get recent completed tasks (this week)
    const recentTasks = await prisma.task.findMany({
      where: {
        topic: {
          roadmapId: roadmap.id,
        },
        isCompleted: true,
        updatedAt: {
          gte: startOfWeek,
        },
      },
      include: {
        topic: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 3,
    });

    console.log('Recent tasks found:', recentTasks.length);
    console.log('Recent tasks:', recentTasks.map(task => ({
      id: task.id,
      title: task.title,
      updatedAt: task.updatedAt,
      topicTitle: task.topic.title
    })));

    // Get task completion over time (last 30 days)
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const taskCompletionOverTime = await prisma.task.findMany({
      where: {
        topic: {
          roadmapId: roadmap.id,
        },
        isCompleted: true,
        updatedAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'asc',
      },
    });

    console.log('Task completion over time found:', taskCompletionOverTime.length);

    // Calculate daily completion counts
    const dailyCompletions = taskCompletionOverTime.reduce((acc: Record<string, number>, task) => {
      const date = task.updatedAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    // Calculate overall progress
    const totalTasks = roadmap.topics.reduce((sum, topic) => sum + topic.tasks.length, 0);
    const completedTasks = roadmap.topics.reduce(
      (sum, topic) => sum + topic.tasks.filter(task => task.isCompleted).length,
      0
    );
    const overallProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const response = {
      recentCourses: recentCourses.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description,
        updatedAt: course.certificates[0]?.issueDate || course.updatedAt,
        certificate: course.certificates[0] ? {
          provider: course.certificates[0].provider,
          issueDate: course.certificates[0].issueDate
        } : null
      })),
      recentTasks,
      taskCompletionOverTime: Object.entries(dailyCompletions).map(([date, count]) => ({
        date,
        count,
      })),
      overallProgress: {
        completed: completedTasks,
        total: totalTasks,
        percentage: overallProgress,
      },
    };

    console.log('Sending progress response');
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in progress API:', error);
    
    // Log the full error details
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        details: error instanceof Error ? error.message : 'Unknown error',
        type: error instanceof Error ? error.name : 'Unknown',
        stack: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.stack : undefined : undefined
      },
      { status: 500 }
    );
  } finally {
    // Always disconnect from the database
    try {
      await prisma.$disconnect();
      console.log('Disconnected from database');
    } catch (disconnectError) {
      console.error('Error disconnecting from database:', disconnectError);
    }
  }
} 