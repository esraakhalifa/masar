import axios from 'axios';
import fs from 'fs';
import path from 'path';

interface JobSearchOptions {
  query: string;
  page?: number;
  numPages?: number;
  country?: string;
}

interface JobData {
  timestamp: string;
  search_results: unknown; // Replace 'any' with specific job data interface if available
}

class RoadmapService {
  private readonly apiKey = 'd4c0b74033msh4b3611d3ee39664p1bf4a5jsn7ed341813dff';
  private readonly baseURL = 'https://jsearch.p.rapidapi.com';

  async searchJobs({ query, page = 1, numPages = 1, country = 'us' }: JobSearchOptions) {
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
      await this.saveJobsToFile(response.data, query);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error fetching jobs:', error.message);
      }
      throw error;
    }
  }

  private async saveJobsToFile(data: any, jobTitle: string): Promise<void> {
    try {
      const fileName = `${jobTitle.toLowerCase().replace(/\s+/g, '_')}_jobs.json`;
      const filePath = path.join(process.cwd(), 'data', fileName);
      
      // Ensure data directory exists
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      let existing: JobData[] = [];
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        try {
          existing = JSON.parse(content);
        } catch (e) {
          console.error('Failed to parse existing file, starting fresh.');
        }
      }

      const dataWithTimestamp: JobData = {
        timestamp: new Date().toISOString(),
        search_results: data
      };

      existing.push(dataWithTimestamp);
      fs.writeFileSync(filePath, JSON.stringify(existing, null, 2));
      console.log(`Job data saved to ${filePath}`);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error saving job data:', error.message);
      }
      throw error;
    }
  }

  async getJobMarketData(jobTitle: string): Promise<any> {
    try {
      // Search for jobs with 7 pages of results
      const jobData = await this.searchJobs({
        query: jobTitle,
        page: 1,
        numPages: 7
      });
      
      return jobData;
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Failed to get job market data for: ${jobTitle}`, error.message);
      }
      throw error;
    }
  }
}


export const roadmapService = new RoadmapService();