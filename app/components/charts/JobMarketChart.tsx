import { Box, Typography, CircularProgress, Alert, LinearProgress } from '@mui/material';
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
import { motion } from 'framer-motion';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TimelineIcon from '@mui/icons-material/Timeline';

interface JobMarketData {
  currentOpenings: number;
  projectedOpenings: number;
  growthRate: number;
  averageSalary: {
    amount: number;
    currency: string;
  };
  demandTrend: string;
  requiredSkills: string[];
  marketInsights: {
    title: string;
    description: string;
  }[];
}

interface JobMarketChartProps {
  data?: JobMarketData | null;
  isLoading?: boolean;
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function JobMarketChart({ data: propData, isLoading: propLoading = false }: JobMarketChartProps) {
  const [data, setData] = useState<JobMarketData | null>(propData || null);
  const [loading, setLoading] = useState(!propData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (propData) {
      setData(propData);
      setLoading(false);
      return;
    }

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
  }, [propData]);

  if (propLoading || loading) {
    return (
      <Box className="w-full bg-white rounded-lg shadow-sm p-6">
        <Box className="flex items-center space-x-4 mb-4">
          <TimelineIcon className="text-[#4ECDC4] text-2xl" />
          <Typography variant="h6" className="text-gray-700">
            Analyzing Market Trends
          </Typography>
        </Box>
        <LinearProgress 
          className="mb-4" 
          sx={{ 
            height: 4,
            borderRadius: 2,
            backgroundColor: 'rgba(78, 205, 196, 0.1)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#4ECDC4',
            },
          }} 
        />
        <Typography variant="body2" className="text-gray-500">
          Processing market data and generating insights...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="w-full p-4">
        <Alert severity="error" className="rounded-lg">
          {error}
        </Alert>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box className="w-full p-4">
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
    <Box className="space-y-6">
      <Box className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Box className="bg-white p-4 rounded-lg shadow-sm">
          <Typography variant="subtitle2" className="text-gray-600">
            Current Openings
          </Typography>
          <Typography variant="h6" className="text-[#4ECDC4]">
            {data.currentOpenings.toLocaleString()}
      </Typography>
      </Box>
        <Box className="bg-white p-4 rounded-lg shadow-sm">
          <Typography variant="subtitle2" className="text-gray-600">
            Projected Openings
          </Typography>
          <Typography variant="h6" className="text-[#4ECDC4]">
            {data.projectedOpenings.toLocaleString()}
          </Typography>
        </Box>
        <Box className="bg-white p-4 rounded-lg shadow-sm">
          <Typography variant="subtitle2" className="text-gray-600">
            Average Salary
          </Typography>
          <Typography variant="h6" className="text-[#4ECDC4]">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: data.averageSalary?.currency || 'USD',
            }).format(data.averageSalary?.amount || 0)}
          </Typography>
        </Box>
      </Box>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="flex flex-col md:flex-row gap-6"
      >
        <motion.div variants={fadeInUp} className="flex-1">
          <Box className="flex items-center space-x-2 mb-4">
            <TrendingUpIcon className="text-[#4ECDC4]" />
            <Typography variant="h6">Job Market Trends</Typography>
        </Box>

          <Box className="h-[250px] mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis 
                  dataKey="name" 
                  stroke="#2D3748"
                  tick={{ fill: '#2D3748' }}
                />
                <YAxis 
                  stroke="#2D3748"
                  tick={{ fill: '#2D3748' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid #4ECDC4',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="openings" 
                  fill="#4ECDC4"
                  radius={[4, 4, 0, 0]}
                  activeBar={{ fill: '#FF6B3D' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </motion.div>

        <motion.div variants={fadeInUp} className="flex-1 space-y-4">
          <Box className="grid grid-cols-2 gap-4">
            <Box className="bg-gray-50 p-4 rounded-lg">
              <Typography variant="subtitle2" className="text-[#4ECDC4] mb-1">
                Growth Rate
              </Typography>
              <Typography variant="h6" className="text-gray-700">
                {data.growthRate}
              </Typography>
            </Box>

            <Box className="bg-gray-50 p-4 rounded-lg">
              <Typography variant="subtitle2" className="text-[#4ECDC4] mb-1">
            Demand Trend
          </Typography>
              <Typography variant="h6" className="text-gray-700">
            {data.demandTrend}
          </Typography>
        </Box>

            <Box className="bg-gray-50 p-4 rounded-lg">
              <Typography variant="subtitle2" className="text-[#4ECDC4] mb-1">
                Required Skills
          </Typography>
              <Box className="flex flex-wrap gap-1">
                {data.requiredSkills.slice(0, 3).map((skill, index) => (
                  <motion.div
                    key={skill}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Box
                      className="px-2 py-0.5 rounded-full text-xs"
                      sx={{
                        backgroundColor: 'rgba(78, 205, 196, 0.1)',
                        color: '#4ECDC4'
                      }}
              >
                {skill}
              </Box>
                  </motion.div>
            ))}
              </Box>
          </Box>
        </Box>

          <Box className="bg-gray-50 p-4 rounded-lg">
            <Typography variant="subtitle2" className="text-[#4ECDC4] mb-2">
            Market Insights
          </Typography>
            <Box className="grid grid-cols-2 gap-4">
            <Box>
                <Typography variant="caption" className="text-gray-500 block mb-1">
                Trends
              </Typography>
              <ul className="list-disc list-inside text-sm text-gray-700">
                  {data.marketInsights.slice(0, 2).map((insight, index) => (
                    <li key={index}>{insight.title}</li>
                ))}
              </ul>
            </Box>
            <Box>
                <Typography variant="caption" className="text-gray-500 block mb-1">
                Opportunities
              </Typography>
              <ul className="list-disc list-inside text-sm text-gray-700">
                  {data.marketInsights.slice(0, 2).map((insight, index) => (
                    <li key={index}>{insight.description}</li>
                ))}
              </ul>
            </Box>
          </Box>
        </Box>
        </motion.div>
      </motion.div>
    </Box>
  );
} 