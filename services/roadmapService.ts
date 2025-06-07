import axios from 'axios';
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
import process from 'process';

dotenv.config();

// const apiKey = process.env.JSEARCH_API_KEY;
// const baseURL = process.env.JSEARCH_BASE_URL;

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

  public async getJobMarketData(jobTitle: string): Promise<unknown> {
    try {
      const jobMarketData = await this.searchJobs({
        query: jobTitle,
        page: 1,
        numPages: 7
      });
      return jobMarketData;
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Failed to get job market data for: ${jobTitle}`, error.message);
      }
      throw error;
    }
  }

}

export const roadmapService = new RoadmapService();

// Test the API call
(async () => {
  try {
    console.log('Testing job market data API call...');
    const result = await roadmapService.getJobMarketData('Software Engineer');
    console.log('API Response:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Test failed:', error);
  }
})();