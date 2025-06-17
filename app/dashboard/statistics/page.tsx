"use client";

import { useEffect, useState } from 'react';
import { Box, CircularProgress, Alert, Typography, useTheme, Paper, Grid } from "@mui/material";
import { motion, useScroll, useTransform } from 'framer-motion';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StarIcon from '@mui/icons-material/Star';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import ProgressChart from '@/app/components/charts/ProgressChart';
import TaskCompletionChart from '@/app/components/charts/TaskCompletionChart';
import JobMarketChart from '@/app/components/charts/JobMarketChart';
import RecentActivities from '@/app/components/RecentActivities';
import RecentCourses from '@/app/components/RecentCourses';
import { styled } from '@mui/material/styles';

interface ProgressData {
  overallProgress: {
    completed: number;
    total: number;
    percentage: number;
  };
  taskCompletionOverTime: {
    date: string;
    completed: number;
  }[];
  recentTasks: {
    id: string;
    title: string;
    description: string;
    updatedAt: string;
    topic: {
      title: string;
    };
  }[];
  recentCourses: {
    id: string;
    title: string;
    description: string | null;
    updatedAt: string;
  }[];
  jobMarketData: {
    currentOpenings: number;
    projectedOpenings: number;
    demandTrend: string;
    requiredSkills: string[];
    marketInsights: {
      title: string;
      description: string;
    }[];
    growthRate: number;
    averageSalary: {
      amount: number;
      currency: string;
    };
  };
}

interface TaskCompletionData {
  date: string;
  count: number;
}

interface JobMarketData {
  currentOpenings: number;
  projectedOpenings: number;
  demandTrend: string;
  requiredSkills: string[];
  marketInsights: {
    title: string;
    description: string;
  }[];
  growthRate: number;
  averageSalary: {
    amount: number;
    currency: string;
  };
}

const ChartContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: '#FFFFFF',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.5s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
  }
}));

const ChartTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(2),
  fontWeight: 500,
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    color: '#4FD1C5',
  }
}));

const CardTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    color: '#FF6B3D',
    transform: 'translateX(4px)',
  }
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: '#FFFFFF',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
    '& .card-title': {
      color: '#FF6B3D',
      transform: 'translateX(4px)',
    }
  }
}));

const SectionTitleCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  background: 'linear-gradient(135deg, #4ECDC4 0%, #45B7AF 100%)',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(78, 205, 196, 0.2), 0 4px 8px rgba(0, 0, 0, 0.1)',
  marginBottom: theme.spacing(3),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
    zIndex: 1
  },
  '& .MuiSvgIcon-root': {
    color: '#FFFFFF',
    fontSize: '1.5rem',
    position: 'relative',
    zIndex: 2
  },
  '& .MuiTypography-root': {
    color: '#FFFFFF',
    fontWeight: 600,
    fontSize: '1.25rem',
    position: 'relative',
    zIndex: 2,
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  }
}));

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { 
    duration: 0.6,
    ease: [0.2, 0.8, 0.2, 1]
  }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: {
    duration: 0.5,
    ease: [0.2, 0.8, 0.2, 1]
  }
};

const slideIn = {
  initial: { opacity: 0, x: -40 },
  animate: { opacity: 1, x: 0 },
  transition: {
    duration: 0.6,
    ease: [0.2, 0.8, 0.2, 1]
  }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15
    }
  }
};

export default function StatisticsPage() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [jobMarketData, setJobMarketData] = useState<JobMarketData | null>(null);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = 'cmc0dobf90000fpa540yc6u0a'; // TODO: Get from auth context
        console.log('Fetching progress data for user:', userId);
        
        // Fetch progress data
        const progressResponse = await fetch(`/api/users/${userId}/progress`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          cache: 'no-store',
        });
        
        if (!progressResponse.ok) {
          const errorData = await progressResponse.json().catch(() => ({ error: 'Failed to parse error response' }));
          console.error('Error response:', errorData);
          throw new Error(errorData.error || `Failed to fetch progress data: ${progressResponse.statusText}`);
        }
        
        const progressData = await progressResponse.json();
        console.log('Received progress data:', progressData);
        
        if (!progressData || typeof progressData !== 'object') {
          throw new Error('Invalid response format: Expected object');
        }

        // Fetch job market data
        const jobMarketResponse = await fetch(`/api/users/${userId}/job-market`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          cache: 'no-store',
        });

        if (!jobMarketResponse.ok) {
          const errorData = await jobMarketResponse.json().catch(() => ({ error: 'Failed to parse error response' }));
          console.error('Error response:', errorData);
          throw new Error(errorData.error || `Failed to fetch job market data: ${jobMarketResponse.statusText}`);
        }

        const jobMarketData = await jobMarketResponse.json();
        console.log('Received job market data:', jobMarketData);

        // Transform the data to match the expected structure
        const transformedData: ProgressData = {
          ...progressData,
          jobMarketData: {
            currentOpenings: jobMarketData.currentOpenings,
            projectedOpenings: jobMarketData.projectedOpenings,
            demandTrend: jobMarketData.demandTrend,
            requiredSkills: jobMarketData.requiredSkills,
            marketInsights: jobMarketData.marketInsights,
            growthRate: jobMarketData.growthRate,
            averageSalary: {
              amount: jobMarketData.averageSalary.amount,
              currency: jobMarketData.averageSalary.currency
            }
          }
        };
        
        console.log('Transformed data:', transformedData);
        setProgressData(transformedData);
        setJobMarketData(jobMarketData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box className="flex items-center justify-center min-h-[60vh]">
        <CircularProgress sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="p-4">
        <Alert severity="error" className="rounded-lg">
          {error}
          <Box className="mt-2 text-sm">
            Please make sure you have a roadmap created and try refreshing the page.
          </Box>
        </Alert>
      </Box>
    );
  }

  if (!progressData) {
    return (
      <Box className="p-4 bg-yellow-100 rounded-lg">
        <Alert severity="info" className="rounded-lg">
          No progress data found. Please create a roadmap to see your progress.
        </Alert>
      </Box>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="p-6 space-y-8"
    >
      {/* Progress Charts Section */}
      <motion.div
        variants={fadeInUp}
        whileInView="animate"
        initial="initial"
        viewport={{ once: true, margin: "-100px" }}
      >
        <SectionTitleCard>
          <TrendingUpIcon />
          <Typography>Learning Progress</Typography>
        </SectionTitleCard>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          <motion.div
            variants={scaleIn}
            whileInView="animate"
            initial="initial"
            viewport={{ once: true, margin: "-100px" }}
          >
            <ChartContainer>
              <ChartTitle variant="h6">Overall Progress</ChartTitle>
              <ProgressChart
                completed={progressData?.overallProgress.completed || 0}
                total={progressData?.overallProgress.total || 0}
                percentage={progressData?.overallProgress.percentage || 0}
              />
            </ChartContainer>
          </motion.div>
          <motion.div
            variants={scaleIn}
            whileInView="animate"
            initial="initial"
            viewport={{ once: true, margin: "-100px" }}
          >
            <ChartContainer>
              <ChartTitle variant="h6">Task Completion</ChartTitle>
              <TaskCompletionChart data={progressData?.taskCompletionOverTime.map(item => ({
                date: item.date,
                count: item.completed
              })) || []} />
            </ChartContainer>
          </motion.div>
        </Box>
      </motion.div>

      {/* Recent Activities Section */}
      <motion.div
        variants={slideIn}
        whileInView="animate"
        initial="initial"
        viewport={{ once: true, margin: "-100px" }}
      >
        <SectionTitleCard>
          <StarIcon />
          <Typography>Recent Activities</Typography>
        </SectionTitleCard>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          <motion.div
            variants={scaleIn}
            whileInView="animate"
            initial="initial"
            viewport={{ once: true, margin: "-100px" }}
          >
            <ChartContainer>
              <ChartTitle variant="h6">Learning Activities</ChartTitle>
              <RecentActivities
                activities={progressData?.recentTasks.map(task => ({
                  id: task.id,
                  title: task.title,
                  description: task.description,
                  date: task.updatedAt,
                  type: 'task',
                  topicTitle: task.topic.title
                })) || []}
                title="Recent Tasks"
                emptyMessage="No tasks completed recently. Let's get started!"
              />
            </ChartContainer>
          </motion.div>
          <motion.div
            variants={scaleIn}
            whileInView="animate"
            initial="initial"
            viewport={{ once: true, margin: "-100px" }}
          >
            <ChartContainer>
              <ChartTitle variant="h6">Recent Courses</ChartTitle>
              <RecentCourses
                courses={progressData?.recentCourses.map(course => ({
                  ...course,
                  progress: 0
                })) || []}
              />
            </ChartContainer>
          </motion.div>
        </Box>
      </motion.div>

      {/* Job Market Insights Section */}
      <motion.div
        variants={fadeInUp}
        whileInView="animate"
        initial="initial"
        viewport={{ once: true, margin: "-100px" }}
      >
        <SectionTitleCard>
          <RocketLaunchIcon />
          <Typography>Job Market Insights</Typography>
        </SectionTitleCard>
        <motion.div
          variants={scaleIn}
          whileInView="animate"
          initial="initial"
          viewport={{ once: true, margin: "-100px" }}
        >
          <ChartContainer>
            <ChartTitle variant="h6">Market Trends</ChartTitle>
            {jobMarketData && (
              <JobMarketChart 
                data={jobMarketData}
                isLoading={loading}
              />
            )}
          </ChartContainer>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}