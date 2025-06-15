import { NextResponse } from 'next/server';
import axios from 'axios';

const COHERE_API_KEY = process.env.COHERE_API_KEY;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const jobTitle = searchParams.get('jobTitle') || 'Software Engineer';

    const prompt = `
Analyze the current job market for ${jobTitle} positions and provide insights in the following JSON format:

{
  "currentOpenings": number,
  "projectedOpenings": number,
  "growthRate": string,
  "averageSalary": {
    "amount": number,
    "currency": string,
    "source": string
  },
  "demandTrend": string,
  "requiredSkills": string[],
  "marketInsights": {
    "trends": string[],
    "challenges": string[],
    "opportunities": string[]
  }
}

Focus on providing accurate, data-driven insights about:
1. Current market demand
2. Salary expectations
3. Required skills
4. Growth projections
5. Industry trends
`;

    const response = await axios.post(
      'https://api.cohere.ai/v1/chat',
      {
        model: 'command-r',
        message: prompt,
      },
      {
        headers: {
          Authorization: `Bearer ${COHERE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const text = response.data.text || response.data.generations?.[0]?.text;
    let jobMarketData;

    try {
      // Try to parse the JSON response
      const jsonMatch = text.match(/{[\s\S]*}/);
      if (jsonMatch) {
        jobMarketData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch (error) {
      console.error('Error parsing job market data:', error);
      return NextResponse.json(
        { error: 'Failed to parse job market data' },
        { status: 500 }
      );
    }

    return NextResponse.json(jobMarketData);
  } catch (error) {
    console.error('Error fetching job market data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job market data' },
      { status: 500 }
    );
  }
} 