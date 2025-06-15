import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface JobMarketData {
  currentOpenings: number;
  projectedOpenings: number;
  growthRate: string;
  averageSalary: {
    amount: number;
    currency: string;
    source: string;
  };
  demandTrend: string;
  requiredSkills: string[];
  marketInsights: {
    trends: string[];
    challenges: string[];
    opportunities: string[];
  };
}

export default function JobMarketChart() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<JobMarketData | null>(null);

  useEffect(() => {
    const fetchJobMarketData = async () => {
      try {
        const response = await fetch('/api/job-market');
        if (!response.ok) {
          throw new Error('Failed to fetch job market data');
        }
        const jobMarketData = await response.json();
        setData(jobMarketData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchJobMarketData();
  }, []);

  if (loading) {
    return (
      <Box className="flex items-center justify-center h-[300px]">
        <CircularProgress className="text-teal-500" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="p-4">
        <Alert severity="error" className="rounded-lg">
          {error}
        </Alert>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box className="p-4">
        <Alert severity="info" className="rounded-lg">
          No job market data available
        </Alert>
      </Box>
    );
  }

  const chartData = [
    {
      name: 'Current',
      openings: data.currentOpenings,
    },
    {
      name: 'Projected',
      openings: data.projectedOpenings,
    },
  ];

  return (
    <Box className="h-full">
      <Typography variant="h6" className="mb-4 text-gray-800">
        Job Market Insights
      </Typography>
      
      <Box className="h-[200px] mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="openings" fill="#9F7AEA" />
          </BarChart>
        </ResponsiveContainer>
      </Box>

      <Box className="space-y-4">
        <Box>
          <Typography variant="subtitle2" className="text-gray-600">
            Growth Rate
          </Typography>
          <Typography className="text-lg font-semibold text-teal-600">
            {data.growthRate}
          </Typography>
        </Box>

        <Box>
          <Typography variant="subtitle2" className="text-gray-600">
            Average Salary
          </Typography>
          <Typography className="text-lg font-semibold text-teal-600">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: data.averageSalary.currency,
            }).format(data.averageSalary.amount)}
          </Typography>
          <Typography variant="caption" className="text-gray-500">
            Source: {data.averageSalary.source}
          </Typography>
        </Box>

        <Box>
          <Typography variant="subtitle2" className="text-gray-600">
            Demand Trend
          </Typography>
          <Typography className="text-lg font-semibold text-teal-600">
            {data.demandTrend}
          </Typography>
        </Box>

        <Box>
          <Typography variant="subtitle2" className="text-gray-600 mb-2">
            Top Required Skills
          </Typography>
          <Box className="flex flex-wrap gap-2">
            {data.requiredSkills.map((skill, index) => (
              <Box
                key={index}
                className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm"
              >
                {skill}
              </Box>
            ))}
          </Box>
        </Box>

        <Box>
          <Typography variant="subtitle2" className="text-gray-600 mb-2">
            Market Insights
          </Typography>
          <Box className="space-y-2">
            <Box>
              <Typography variant="caption" className="text-gray-500">
                Trends
              </Typography>
              <ul className="list-disc list-inside text-sm text-gray-700">
                {data.marketInsights.trends.map((trend, index) => (
                  <li key={index}>{trend}</li>
                ))}
              </ul>
            </Box>
            <Box>
              <Typography variant="caption" className="text-gray-500">
                Opportunities
              </Typography>
              <ul className="list-disc list-inside text-sm text-gray-700">
                {data.marketInsights.opportunities.map((opportunity, index) => (
                  <li key={index}>{opportunity}</li>
                ))}
              </ul>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
} 