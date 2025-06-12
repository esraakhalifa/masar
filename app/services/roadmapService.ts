import axios from 'axios';
import * as dotenv from 'dotenv';
import process from 'process';
import { prisma } from '@/lib/prisma';
import { Prisma, RoadmapTopic } from '../generated/prisma';
// import { PrismaClient } from '@prisma/client';

dotenv.config();



interface JobSearchOptions {
  query: string;
  page?: number;
  numPages?: number;
  country?: string;
}

interface JobMarketData {
  timestamp: string;
  search_results: unknown; // Replace 'any' with specific job data interface if available
}


interface RoadmapTopicCreate {
  title: string;
  description: string;
  order: number;
}

class RoadmapService {
  private readonly apiKey = process.env.JSEARCH_API_KEY;
  private readonly baseURL = process.env.JSEARCH_BASE_URL;
  private readonly API_KEY = process.env.COHERE_API_KEY;
  private readonly jsearchRawData: unknown = null;
  private readonly jobTitle: string = 'Software Engineer';

  private createPrompt(jobMarketData: unknown, jobTitle: string): string {
    return `
You are to return structured JSON for a software engineering roadmap that matches the following structure exactly:

{
  "roadmap": {
    "courses": [
      {
        "title": "Course title",
        "description": "Course description",
        "instructors": "Course instructors",
        "courseLink": "Course URL"
      }
    ],
    "topics": [
      {
        "title": "Topic title",
        "description": "Topic description",
        "courseTopics": [
          {
            "courseId": "ID reference to a course in the roadmap.courses array"
          }
        ],
        "tasks": [
          {
            "title": "Task title",
            "description": "Task description",
            "isCompleted": false,
            "order": 1
          }
        ]
      }
    ]
  }
}

⚠️ IMPORTANT:
- Respond with **only valid JSON**, with no explanations or extra text
- The roadmap should have 6-10 topics
- Each topic should have 2-3 tasks
- Courses should be defined at the roadmap level and referenced by topics through courseTopics
- The same course can be referenced by multiple topics

✅ Guidelines:
1. Topics must be technical and ordered from foundational to advanced
2. Tasks should be practical and actionable
3. Courses should be comprehensive and cover the topic effectively
4. Use real, existing courses from major platforms
5. Do not include null, empty, or placeholder values

📌 Example course in roadmap.courses:
{
  "title": "Git Complete: The definitive, step-by-step guide",
  "description": "Comprehensive guide to Git version control system",
  "instructors": "Jason Taylor",
  "courseLink": "https://www.udemy.com/course/git-complete"
}

📌 Example topic in roadmap.topics:
{
  "title": "Version Control Systems",
  "description": "Introduction to tools like Git for managing code changes and collaboration",
  "courseTopics": [
    {
      "courseId": "course1" // References a course from the roadmap.courses array
    }
  ],
  "tasks": [
    {
      "title": "Initialize Git Repository",
      "description": "Create a new Git repository and make your first commit",
      "isCompleted": false,
      "order": 1
    }
  ]
}
`;
  }
  
public async getRoadmapTopicsandCourses(jobTitle: string) {
  const prompt = `
You are to return structured JSON for a software engineering roadmap that matches the following structure exactly:

{
  "roadmap": {
    "courses": [
      {
        "title": "Course title",
        "description": "Course description",
        "instructors": "Course instructors",
        "courseLink": "Course URL"
      }
    ],
    "topics": [
      {
        "title": "Topic title",
        "description": "Topic description",
        "courseTopics": [
          {
            "courseId": "ID reference to a course in the roadmap.courses array"
          }
        ],
        "tasks": [
          {
            "title": "Task title",
            "description": "Task description",
            "isCompleted": false,
            "order": 1
          }
        ]
      }
    ]
  }
}

⚠️ IMPORTANT:
- Respond with **only valid JSON**, with no explanations or extra text
- The roadmap should have 6-10 topics
- Each topic should have 2-3 tasks
- Courses should be defined at the roadmap level and referenced by topics through courseTopics
- The same course can be referenced by multiple topics

✅ Guidelines:
1. Topics must be technical and ordered from foundational to advanced
2. Tasks should be practical and actionable
3. Courses should be comprehensive and cover the topic effectively
4. Use real, existing courses from major platforms
5. Do not include null, empty, or placeholder values

📌 Example course in roadmap.courses:
{
  "title": "Git Complete: The definitive, step-by-step guide",
  "description": "Comprehensive guide to Git version control system",
  "instructors": "Jason Taylor",
  "courseLink": "https://www.udemy.com/course/git-complete"
}

📌 Example topic in roadmap.topics:
{
  "title": "Version Control Systems",
  "description": "Introduction to tools like Git for managing code changes and collaboration",
  "courseTopics": [
    {
      "courseId": "course1" // References a course from the roadmap.courses array
    }
  ],
  "tasks": [
    {
      "title": "Initialize Git Repository",
      "description": "Create a new Git repository and make your first commit",
      "isCompleted": false,
      "order": 1
    }
  ]
}
`;
  
  const response = await axios.post(
    'https://api.cohere.ai/v1/chat',
    {
      model: 'command-r',
      message: prompt,
    },
    {
      headers: {
        Authorization: `Bearer ${this.API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data.text || response.data.generations?.[0]?.text;
} 



  private async searchJobs({ query, page = 1, numPages = 1, country = 'eg' }: JobSearchOptions) {
    const options = {
      method: 'GET',
      url: `${this.baseURL}/search`,
      params: {
        query,
        page: page.toString(),
        num_pages: numPages.toString(),
        country
      },
      headers: {
        'x-rapidapi-key': this.apiKey,
        'x-rapidapi-host': 'jsearch.p.rapidapi.com'
      }
    };
    
    try {
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error fetching jobs:', error.message);
      }
      throw error;
    }
  }

  public async getJobMarketData(jobTitle: string): Promise<any[]> {
    try {
      const jobMarketData = await this.searchJobs({
        query: jobTitle,
        page: 1,
        numPages: 7
      });
      return jobMarketData.data || [];
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Failed to get job market data for: ${jobTitle}`, error.message);
      }
      throw error;
    }
  }


  public async generateAndSaveTopics(roadmapId: string, jobTitle: string) {
    try {
      const topicsResponse = await this.getRoadmapTopicsandCourses(jobTitle);
      console.log('Topics response:', topicsResponse);
  
      let parsed;
      try {
        parsed = JSON.parse(topicsResponse);
      } catch {
        const jsonMatch = topicsResponse.match(/{[\s\S]*}/);
        if (!jsonMatch) {
          throw new Error('No valid JSON object found in the response');
        }
        parsed = JSON.parse(jsonMatch[0]);
      }
  
      const topics = parsed?.roadmap?.topics;
      if (!Array.isArray(topics)) {
        throw new Error('Parsed topics are not in valid array format');
      }
  
      const result = await prisma.$transaction(async (tx) => {
        const updatedRoadmap = await tx.careerRoadmap.update({
          where: { id: roadmapId },
          data: {
            roadmapDetails: {
              topics: topics
            }
          }
        });
  
        const createdTopics = [];
  
        for (const [index, topic] of topics.entries()) {
          const exists = await tx.roadmapTopic.findFirst({
            where: {
              roadmapId,
              title: topic.title
            }
          });
  
          if (!exists) {
            const created = await tx.roadmapTopic.create({
              data: {
                roadmapId,
                title: topic.title,
                description: topic.description,
                order: index + 1,
                totalTasks: topic.tasks?.length || 0,
                completedTasks: 0
              }
            });
  
            createdTopics.push(created);
          }
        }
        await this.generateAndSaveTasks(tx, topics, createdTopics);

        return {
          roadmap: updatedRoadmap,
          topics: createdTopics
        };
      });
  
      return result;
    } catch (error) {
      console.error('Error generating and saving topics:', error);
      throw error;
    }
  }
  public async generateAndSaveTasks(
    tx: Prisma.TransactionClient,
    inputTopics: any[],
    createdTopics: RoadmapTopic[]
  ) {
    try {
      for (let i = 0; i < createdTopics.length; i++) {
        const dbTopic = createdTopics[i];
        const inputTopic = inputTopics.find((t: any) => t.title === dbTopic.title);
  
        if (!inputTopic || !Array.isArray(inputTopic.tasks)) continue;
  
        await Promise.all(
          inputTopic.tasks.map((task: any, index: number) =>
            tx.task.create({
              data: {
                title: task.title,
                description: task.description || '',
                order: index + 1,
                topicId: dbTopic.id,
              },
            })
          )
        );
      }
    } catch (error) {
      console.error('Error generating and saving tasks:', error);
      throw error;
    }
  }
    
  
  public async generateAndSaveCourses(roadmapId: string, jobTitle: string) {
    try {
      const roadmapResponse = await this.getRoadmapTopicsandCourses(jobTitle);
      console.log('Roadmap response:', roadmapResponse);
  
      let parsed;
      try {
        parsed = JSON.parse(roadmapResponse);
      } catch {
        const jsonMatch = roadmapResponse.match(/{[\s\S]*}/);
        if (!jsonMatch) throw new Error('No valid JSON object found in the response');
        parsed = JSON.parse(jsonMatch[0]);
      }
  
      const courses = parsed?.roadmap?.courses;
      if (!Array.isArray(courses)) {
        throw new Error('Parsed courses are not in valid array format');
      }
  
      const savedCourses = await prisma.$transaction(async (tx) => {
        const createdCourses = [];

        for (const course of courses) {
          const exists = await tx.course.findFirst({
            where: {
              courseLink: course.courseLink,
              roadmapId: roadmapId,
            },
          });

          if (!exists) {
            const created = await tx.course.create({
              data: {
                roadmapId,
                title: course.title,
                description: course.description,
                instructors: course.instructors,
                courseLink: course.courseLink,
              },
            });

            createdCourses.push(created);
          }
        }

        return createdCourses;
      });

      return savedCourses;
    } catch (error) {
      console.error('Error generating and saving courses:', error);
      throw error;
    }
  }

  
  
}

export const roadmapService = new RoadmapService();


/**
 * 
 * import axios from 'axios';
import * as dotenv from 'dotenv';
import process from 'process';

dotenv.config();


interface JobSearchOptions {
  query: string;
  page?: number;
  numPages?: number;
  country?: string;
}

interface JobMarketData {
  timestamp: string;
  search_results: unknown; // Replace 'any' with specific job data interface if available
}

interface DummyProgress {
  topics: {
    id: string;
    title: string;
    completedTasks: number;
    totalTasks: number;
    assessmentScore?: number;
    certificateUrl?: string;
  }[];
  certificates: {
    id: string;
    title: string;
    provider: string;
    issueDate: Date;
    url: string;
  }[];
  assessments: {
    id: string;
    title: string;
    score: number;
    maxScore: number;
    takenAt: Date;
  }[];
}

interface ProgressInsights {
  overallProgress: number;
  skillBreakdown: {
    completed: string[];
    inProgress: string[];
    notStarted: string[];
  };
  recentAchievements: {
    type: 'task' | 'assessment' | 'certificate';
    title: string;
    date: Date;
    details: string;
  }[];
  nextMilestones: {
    type: 'task' | 'assessment' | 'certificate';
    title: string;
    estimatedDate: Date;
  }[];
  timeSpent: {
    totalHours: number;
    byTopic: Record<string, number>;
  };
}

class RoadmapService {
  private readonly apiKey = process.env.JSEARCH_API_KEY;
  private readonly baseURL = process.env.JSEARCH_BASE_URL;
  private readonly API_KEY = process.env.COHERE_API_KEY;
  private readonly jsearchRawData: unknown = null;
  private readonly jobTitle: string = 'Software Engineer';

  private chunkArray<T>(arr: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      chunks.push(arr.slice(i, i + chunkSize));
    }
    return chunks;
  }
  private createPrompt(jobMarketData: unknown, jobTitle: string): string {
    return `
You are an expert career assistant analyzing job market data to create a structured learning roadmap.

Here is job market data (JSON format) for ${jobTitle} positions:
${JSON.stringify(jobMarketData, null, 2)}

Analyze this data and provide a structured response in the following JSON format:

{
  "roadmapRole": "${jobTitle}",
  "roadmapDetails": {
    "overview": "Brief overview of the career path",
    "requiredYearsExperience": "Entry level/Mid level/Senior",
    "averageSalary": "Salary range",
    "marketDemand": "High/Medium/Low",
    "recommendedTimeframe": "Estimated months to achieve competency"
  },
  "topics": [
    {
      "title": "Topic Name",
      "description": "Detailed description of the topic",
      "order": 1,
      "totalTasks": 5,
      "tasks": [
        {
          "title": "Task Name",
          "description": "Detailed description of what needs to be done",
          "order": 1,
          "isCompleted": false
        }
      ],
      "courses": [
        {
          "title": "Course Title",
          "description": "Course description",
          "instructors": "Instructor names",
          "topics": ["Topic 1", "Topic 2", "Topic 3"],
          "courseLink": "https://course-url.com"
        }
      ]
    }
  ],

}

Ensure the response:
1. Groups related skills into logical topics
2. Orders topics and tasks in a progressive learning sequence
3. Includes specific, actionable tasks for each topic
4. Maps courses to relevant topics
5. Provides comprehensive skill requirements with assessment criteria
6. Includes only high-quality, verifiable courses from platforms like Udemy, Coursera, etc.
7. Ensures all URLs and links are valid and accessible
8. Maintains consistent difficulty progression
9. Includes practical tasks and projects
10. Maps directly to job market requirements

The response should be valid JSON and match exactly the structure shown above.`;
  }
  


  private async searchJobs({ query, page = 1, numPages = 1, country = 'eg' }: JobSearchOptions) {
    const options = {
      method: 'GET',
      url: `${this.baseURL}/search`,
      params: {
        query,
        page: page.toString(),
        num_pages: numPages.toString(),
        country
      },
      headers: {
        'x-rapidapi-key': this.apiKey,
        'x-rapidapi-host': 'jsearch.p.rapidapi.com'
      }
    };
    
    try {
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error fetching jobs:', error.message);
      }
      throw error;
    }
  }

  public async getJobMarketData(jobTitle: string): Promise<any[]> {
    try {
      const jobMarketData = await this.searchJobs({
        query: jobTitle,
        page: 1,
        numPages: 7
      });
      return jobMarketData.data || [];
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Failed to get job market data for: ${jobTitle}`, error.message);
      }
      throw error;
    }
  }
  public async generateRoadmapWithChunking(jobMarketData: any[], jobTitle: string) {
    const chunkSize = 5;
    const chunks = this.chunkArray(jobMarketData, chunkSize);
  
    const partialResults = [];
  
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const prompt = this.createPrompt(chunk, jobTitle);
      
      try {
        const response = await axios.post(
          'https://api.cohere.ai/v1/chat',
          {
            model: 'command-r',
            message: prompt,
          },
          {
            headers: {
              Authorization: `Bearer ${this.API_KEY}`,
              'Content-Type': 'application/json',
            },
          }
        );
  
        const text = response.data.text || response.data.generations?.[0]?.text;
        console.log(`\n📊 Cohere AI Response for chunk ${i + 1}:\n`, text);
        partialResults.push(text);
      } catch (error: any) {
        console.error('Error:', error.response?.data || error.message);
      }
    }
  
    // Combine or summarize partialResults into final output
    // You can do further prompting here or simply return the array
    return partialResults;
  }
  public async generateFinalRoadmapFromChunks(partialResults: string[], jobTitle: string) {
  const combinedPrompt = `
You are an expert career assistant.

You have received several partial analyses of raw job market data for the role of ${jobTitle}.

Your task is to combine these partial insights into a single, well-structured, detailed learning roadmap including:
- Analysis of job market trends
- In-demand skills prioritized
- Recommended learning order
- Specific Udemy courses (title, description, sections, instructor info, links)
- Clear, actionable microtasks for each skill/course
- Relevant data-driven insights from the job market
- Interview preparation tips and application advice

Here are the partial analyses:

${partialResults.map((res, i) => `Partial result ${i + 1}:\n${res}\n`).join('\n')}

Please produce a single, cohesive final roadmap based on these.
`;

  try {
    const response = await axios.post(
      'https://api.cohere.ai/v1/chat',
      {
        model: 'command-r',
        message: combinedPrompt,
      },
      {
        headers: {
          Authorization: `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const finalText = response.data.text || response.data.generations?.[0]?.text;
    console.log('\n📊 Final Combined Cohere AI Roadmap:\n', finalText);
    return finalText;
  } catch (error: any) {
    console.error('Error:', error.response?.data || error.message);
  }
}

  private generateDummyProgress(): DummyProgress {
    const topics = [
      {
        id: 't1',
        title: 'JavaScript Fundamentals',
        completedTasks: 8,
        totalTasks: 10,
        assessmentScore: 85
      },
      {
        id: 't2',
        title: 'React Basics',
        completedTasks: 5,
        totalTasks: 8,
        assessmentScore: 75,
        certificateUrl: 'https://example.com/cert/react-basics'
      },
      {
        id: 't3',
        title: 'Backend Development',
        completedTasks: 2,
        totalTasks: 12
      },
      {
        id: 't4',
        title: 'Database Design',
        completedTasks: 0,
        totalTasks: 6
      }
    ];

    const certificates = [
      {
        id: 'c1',
        title: 'JavaScript Essential Training',
        provider: 'LinkedIn Learning',
        issueDate: new Date('2024-02-15'),
        url: 'https://example.com/cert/js-essential'
      },
      {
        id: 'c2',
        title: 'React Developer Certificate',
        provider: 'Meta',
        issueDate: new Date('2024-03-01'),
        url: 'https://example.com/cert/react-dev'
      }
    ];

    const assessments = [
      {
        id: 'a1',
        title: 'JavaScript Skills Assessment',
        score: 85,
        maxScore: 100,
        takenAt: new Date('2024-02-20')
      },
      {
        id: 'a2',
        title: 'React Components Quiz',
        score: 75,
        maxScore: 100,
        takenAt: new Date('2024-03-05')
      }
    ];

    return { topics, certificates, assessments };
  }

  public generateProgressInsights(): ProgressInsights {
    const progress = this.generateDummyProgress();
    
    // Calculate overall progress
    const completedTasksTotal = progress.topics.reduce((sum, topic) => sum + topic.completedTasks, 0);
    const totalTasksTotal = progress.topics.reduce((sum, topic) => sum + topic.totalTasks, 0);
    const overallProgress = Math.round((completedTasksTotal / totalTasksTotal) * 100);

    // Categorize skills by completion status
    const skillBreakdown = {
      completed: progress.topics
        .filter(t => t.completedTasks === t.totalTasks)
        .map(t => t.title),
      inProgress: progress.topics
        .filter(t => t.completedTasks > 0 && t.completedTasks < t.totalTasks)
        .map(t => t.title),
      notStarted: progress.topics
        .filter(t => t.completedTasks === 0)
        .map(t => t.title)
    };

    // Generate recent achievements
    const recentAchievements = [
      ...progress.certificates.map(cert => ({
        type: 'certificate' as const,
        title: cert.title,
        date: cert.issueDate,
        details: `Issued by ${cert.provider}`
      })),
      ...progress.assessments.map(assessment => ({
        type: 'assessment' as const,
        title: assessment.title,
        date: assessment.takenAt,
        details: `Score: ${assessment.score}/${assessment.maxScore}`
      }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

    // Generate upcoming milestones
    const nextMilestones = progress.topics
      .filter(t => t.completedTasks < t.totalTasks)
      .map(topic => ({
        type: 'task' as const,
        title: `Complete ${topic.title}`,
        estimatedDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within next 30 days
      }))
      .slice(0, 3);

    // Simulate time spent data
    const timeSpent = {
      totalHours: 45,
      byTopic: progress.topics.reduce((acc, topic) => ({
        ...acc,
        [topic.title]: Math.round(topic.completedTasks * 2.5) // Assume 2.5 hours per task
      }), {})
    };

    return {
      overallProgress,
      skillBreakdown,
      recentAchievements,
      nextMilestones,
      timeSpent
    };
  }

  public async testProgressInsights() {
    try {
      const insights = this.generateProgressInsights();
      console.log('\n📊 Progress Insights:');
      console.log('Overall Progress:', `${insights.overallProgress}%`);
      console.log('\nSkill Breakdown:');
      console.log('✅ Completed:', insights.skillBreakdown.completed.join(', '));
      console.log('🔄 In Progress:', insights.skillBreakdown.inProgress.join(', '));
      console.log('⏳ Not Started:', insights.skillBreakdown.notStarted.join(', '));
      console.log('\n🏆 Recent Achievements:');
      insights.recentAchievements.forEach(achievement => 
        console.log(`${achievement.type.toUpperCase()}: ${achievement.title} (${achievement.details})`));
      console.log('\n🎯 Next Milestones:');
      insights.nextMilestones.forEach(milestone =>
        console.log(`${milestone.title} - Due: ${milestone.estimatedDate.toLocaleDateString()}`));
      console.log('\n⏱️ Time Spent:');
      console.log('Total Hours:', insights.timeSpent.totalHours);
      console.log('By Topic:', insights.timeSpent.byTopic);
    } catch (error) {
      console.error('Error generating insights:', error);
    }
  }
}

export const roadmapService = new RoadmapService();

// Test the API call
(async () => {
  try {
    const jobTitle = 'Software Engineer';

    console.log('Fetching job market data...');
    const jobsArray = await roadmapService.getJobMarketData(jobTitle);

    console.log('Generating roadmap in chunks...');
    const partialRoadmaps = await roadmapService.generateRoadmapWithChunking(jobsArray, jobTitle);

    console.log('Combining partial roadmaps into final version...');
    const finalRoadmap = await roadmapService.generateFinalRoadmapFromChunks(partialRoadmaps, jobTitle);

    console.log('Testing progress tracking...');
    await roadmapService.testProgressInsights();
  } catch (error) {
    console.error('Test failed:', error);
  }
})();


 */