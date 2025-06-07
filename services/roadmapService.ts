import axios from 'axios';
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
You are an expert career assistant.

Here is raw job market data retrieved from an API (JSON format):
${JSON.stringify(jobMarketData, null, 2)}

Your tasks:
1. Analyze this raw job market data.
2. Extract common job titles, most in-demand skills, preferred locations, average salaries, and employment types.
3. Identify current trends and industry needs.
4. Recommend a detailed learning roadmap for a ${jobTitle} with some programming experience who wants to transition into this career.
5. Suggest the order in which to learn the skills, and for each major skill, recommend **specific Udemy courses** with detailed info including:
   - Course title
   - Course description
   - Course sections/topics covered
   - Instructor(s) names
   - A brief bio/about the instructor(s)
   - Course link (URL) to Udemy
6. Provide clear, actionable goals and microtasks for each skill/course, such as coding exercises, mini-projects, or practice routines.
7. Include data-driven insights with relevant numbers or statistics from the job market data to justify the recommendations.
8. Conclude with interview preparation tips and how to stand out in applications.

Make your response detailed and well-structured, using bullet points, numbered lists, and section headers for clarity.
`;
}


  private async searchJobs({ query, page = 1, numPages = 1, country = 'us' }: JobSearchOptions) {
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

    console.log('Final Roadmap:\n', finalRoadmap);
  } catch (error) {
    console.error('Test failed:', error);
  }
})();

