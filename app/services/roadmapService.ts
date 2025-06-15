import axios from 'axios';
import * as dotenv from 'dotenv';
import process from 'process';
import { prisma } from '@/lib/prisma';
import { Prisma, RoadmapTopic } from '../generated/prisma';


dotenv.config();



interface JobSearchOptions {
  query: string;
  page?: number;
  numPages?: number;
  country?: string;
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



class RoadmapService {
  private readonly apiKey = process.env.JSEARCH_API_KEY;
  private readonly baseURL = process.env.JSEARCH_BASE_URL;
  private readonly API_KEY = process.env.COHERE_API_KEY;
  private readonly jsearchRawData: unknown = null;
  private readonly jobTitle: string = 'Software Engineer';

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

  private chunkArray<T>(arr: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      chunks.push(arr.slice(i, i + chunkSize));
    }
    return chunks;
  }

  private createPrompt(jobMarketData: unknown, jobTitle: string, userContext?: UserContext): string {
    const skillLevels = userContext?.skills.reduce((acc, skill) => {
      acc[skill.name.toLowerCase()] = skill.level;
      return acc;
    }, {} as Record<string, number | null>) || {};

    const educationInfo = userContext?.education.map(edu => 
      `${edu.degree} in ${edu.fieldOfStudy} from ${edu.institution} (${edu.graduationYear})`
    ).join(', ') || 'Not specified';

    const careerPreferences = userContext?.careerPreference ? `
Career Preferences:
- Industry: ${userContext.careerPreference.industry}
- Preferred Salary: $${userContext.careerPreference.preferredSalary}
- Work Type: ${userContext.careerPreference.workType}
- Location: ${userContext.careerPreference.location}
` : '';

    const skillsInfo = userContext?.skills ? `
Current Skills and Levels:
${userContext.skills.map(skill => `- ${skill.name}: ${skill.level || 'Not assessed'}`).join('\n')}
` : '';

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
- Courses should be comprehensive and cover the topic effectively
- Use real, existing courses from major platforms
- Do not include null, empty, or placeholder values

✅ Guidelines:
1. Topics must be technical and ordered from foundational to advanced
2. Tasks should be practical and actionable
3. Courses should be comprehensive and cover the topic effectively
4. Use real, existing courses from major platforms
5. Do not include null, empty, or placeholder values

🔍 User Context:
${careerPreferences}
${skillsInfo}
Education: ${educationInfo}

📊 Skill Level Requirements:
${Object.entries(skillLevels).map(([skill, level]) => {
  if (level === null || level >= 6) {
    return `- For ${skill}: Focus on intermediate and advanced topics only`;
  } else {
    return `- For ${skill}: Include topics from beginner to advanced`;
  }
}).join('\n')}

Here is the job market data to analyze:
${JSON.stringify(jobMarketData, null, 2)}`;
  }

  public async generateAndSaveRoadmap(
    userId: string,
    jobTitle: string,
    userContext?: UserContext
  ) {
    try {
      // Get job market data
      const jobMarketData = await this.getJobMarketData(jobTitle);
      
      // Split data into chunks
      const chunkSize = 5;
      const chunks = this.chunkArray(jobMarketData, chunkSize);
      
      // Create initial roadmap
      const roadmap = await prisma.careerRoadmap.create({
        data: {
          userId,
          roadmapRole: jobTitle,
          roadmapDetails: {
            courses: [],
            topics: []
          }
        }
      });

      console.log('✅ Created initial roadmap:', roadmap.id);
      
      // Process each chunk and save results
      const allCourses = new Map(); // Use Map to deduplicate courses
      const allTopics = new Map(); // Use Map to deduplicate topics
      
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const prompt = this.createPrompt(chunk, jobTitle, userContext);
        
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
          
          let parsed;
          try {
            parsed = JSON.parse(text);
          } catch (err) {
            const jsonMatch = text && text.match(/{[\s\S]*}/);
            if (jsonMatch) {
              try {
                parsed = JSON.parse(jsonMatch[0]);
              } catch (err2) {
                console.error('[ERROR] Could not parse extracted JSON block:', jsonMatch[0]);
                continue; // Skip this chunk if parsing fails
              }
            } else {
              console.error('[ERROR] Response was not valid JSON or was empty:', text);
              continue; // Skip this chunk if no JSON found
            }
          }

          // Process and save courses from this chunk
          if (parsed?.roadmap?.courses) {
            for (const course of parsed.roadmap.courses) {
              if (!allCourses.has(course.courseLink)) {
                try {
                  const savedCourse = await prisma.course.create({
                    data: {
                      roadmapId: roadmap.id,
                      title: `${course.title} (${allCourses.size + 1})`,
                      description: course.description,
                      instructors: course.instructors,
                      courseLink: course.courseLink,
                    },
                  });
                  allCourses.set(course.courseLink, savedCourse);
                } catch (error) {
                  console.error('Error creating course:', error);
                  // Skip this course and continue with the next one
                  continue;
                }
              }
            }
          }

          // Process and save topics and tasks from this chunk
          if (parsed?.roadmap?.topics) {
            for (const topic of parsed.roadmap.topics) {
              if (!allTopics.has(topic.title)) {
                const savedTopic = await prisma.roadmapTopic.create({
                  data: {
                    roadmapId: roadmap.id,
                    title: topic.title,
                    description: topic.description,
                    order: allTopics.size + 1,
                    totalTasks: topic.tasks?.length || 0,
                    completedTasks: 0,
                    tasks: {
                      create: topic.tasks.map((task: any, taskIndex: number) => ({
                        title: task.title,
                        description: task.description || '',
                        order: taskIndex + 1,
                      })),
                    },
                  },
                });
                allTopics.set(topic.title, savedTopic);
              }
            }
          }

        } catch (error: any) {
          console.error(`Error processing chunk ${i + 1}:`, error.response?.data || error.message);
          // Continue with next chunk instead of failing completely
          continue;
        }
      }

      // Update roadmap details with final combined data
      const finalRoadmap = await prisma.careerRoadmap.update({
        where: { id: roadmap.id },
        data: {
          roadmapDetails: {
            courses: Array.from(allCourses.values()),
            topics: Array.from(allTopics.values()),
          }
        },
        include: {
          courses: true,
          topics: {
            include: {
              tasks: true
            }
          }
        }
      });

      return {
        roadmap: finalRoadmap,
        courses: Array.from(allCourses.values()),
        topics: Array.from(allTopics.values()),
      };

    } catch (error) {
      console.error('Error generating and saving roadmap:', error);
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



 */