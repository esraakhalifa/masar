import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import axios from 'axios';

const COHERE_API_KEY = process.env.COHERE_API_KEY;

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  console.log('API Route: Job Market endpoint hit');
  console.log('Request URL:', request.url);
  console.log('User ID from params:', params.userId);

  try {
    // First, check if we can connect to the database
    try {
      await prisma.$connect();
      console.log('Successfully connected to database');
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      throw new Error('Failed to connect to database');
    }

    // Get user's roadmap
    const roadmap = await prisma.careerRoadmap.findFirst({
      where: {
        userId: params.userId,
        deletedAt: null,
      },
      select: {
        roadmapRole: true,
      },
    });

    if (!roadmap) {
      console.log('No roadmap found for user:', params.userId);
      return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 });
    }

    // Use Cohere AI to analyze job market data for the specific role
    const prompt = `
Analyze the current job market for ${roadmap.roadmapRole} positions in Egypt and provide insights in the following JSON format:

{
  "currentOpenings": number,
  "projectedOpenings": number,
  "growthRate": number,
  "averageSalary": {
    "amount": number,
    "currency": "EGP"
  },
  "demandTrend": string,
  "requiredSkills": string[],
  "marketInsights": [
    {
      "title": string,
      "description": string
    }
  ]
}

Focus on providing accurate, data-driven insights about:
1. Current market demand in Egypt
2. Salary expectations in EGP
3. Required skills
4. Growth projections
5. Industry trends specific to the Egyptian market
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

    console.log('Sending job market data');
    return NextResponse.json(jobMarketData);
  } catch (error) {
    console.error('Error in job market API:', error);
    
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