"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Box, CircularProgress, Alert, Paper, Typography,
  Card, CardContent, Chip, List, ListItem,
  ListItemText, ListItemIcon
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BookIcon from '@mui/icons-material/Book';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AnalyticsIcon from '@mui/icons-material/Analytics';

// Import chart components
import TaskCompletionChart from '@/app/components/charts/TaskCompletionChart';
import ProgressChart from '@/app/components/charts/ProgressChart';
import JobMarketChart from '@/app/components/charts/JobMarketChart';

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

interface ProgressData {
  recentCourses: {
    id: string;
    title: string;
    description: string | null;
    updatedAt: string;
    certificate: {
      provider: string;
      issueDate: string;
    } | null;
  }[];
  recentTasks: {
    id: string;
    title: string;
    description: string | null;
    updatedAt: string;
    topic: {
      title: string;
    };
  }[];
  taskCompletionOverTime: {
    date: string;
    count: number;
  }[];
  overallProgress: {
    completed: number;
    total: number;
    percentage: number;
  };
}

export default function StatisticsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [jobMarketData, setJobMarketData] = useState<JobMarketData | null>(null);
  const [jobMarketLoading, setJobMarketLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (status === 'loading') return;
      
      if (!session?.user?.id) {
        setError('Please sign in to view statistics');
        setLoading(false);
        setJobMarketLoading(false);
        return;
      }

      try {
        // Fetch progress data and job market data in parallel
        const [progressResponse, jobMarketResponse] = await Promise.all([
          fetch(`/api/users/${session.user.id}/progress`),
          fetch(`/api/users/${session.user.id}/job-market`)
        ]);

        // Handle progress data
        if (progressResponse.ok) {
          const progressData = await progressResponse.json();
          setProgressData(progressData);
        } else {
          console.error('Failed to fetch progress data');
        }

        // Handle job market data
        if (jobMarketResponse.ok) {
          const jobMarketData = await jobMarketResponse.json();
          setJobMarketData(jobMarketData);
        } else {
          console.error('Failed to fetch job market data');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
        setJobMarketLoading(false);
      }
    };

    fetchData();
  }, [session, status]);

  if (status === 'loading') {
    return (
      <Box className="flex items-center justify-center min-h-[60vh]">
        <CircularProgress className="text-teal-500" />
      </Box>
    );
  }

  if (!session) {
    return (
      <Box className="p-4">
        <Alert severity="warning" className="rounded-lg">
          Please sign in to access statistics.
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box className="flex items-center justify-center min-h-[60vh]">
        <CircularProgress className="text-teal-500" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="p-4">
        <Alert severity="error" className="rounded-lg">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box className="p-6 space-y-6">
      <Typography variant="h4" className="mb-6 font-bold text-gray-800">
        Learning Progress Dashboard
      </Typography>

      {/* Job Market Analysis Section */}
      <Paper className="p-6">
        <Typography variant="h6" className="mb-4 flex items-center gap-2">
          <AnalyticsIcon className="text-orange-500" />
          Job Market Analysis
        </Typography>
        <JobMarketChart data={jobMarketData} isLoading={jobMarketLoading} />
      </Paper>

      <Box className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overall Progress Chart */}
        <Paper className="p-6">
          {progressData ? (
            <ProgressChart 
              completed={progressData.overallProgress.completed}
              total={progressData.overallProgress.total}
              percentage={progressData.overallProgress.percentage}
            />
          ) : (
            <Alert severity="info">No progress data available</Alert>
          )}
        </Paper>

        {/* Task Completion Over Time Chart */}
        <Paper className="p-6">
          {progressData && progressData.taskCompletionOverTime.length > 0 ? (
            <TaskCompletionChart data={progressData.taskCompletionOverTime} />
          ) : (
            <Box>
              <Typography variant="h6" className="mb-4 flex items-center gap-2">
                <AssignmentTurnedInIcon className="text-green-500" />
                Task Completion Over Time
              </Typography>
              <Alert severity="info">No task completions in the last 30 days</Alert>
            </Box>
          )}
        </Paper>
      </Box>

      <Box className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <Paper className="p-6">
          <Typography variant="h6" className="mb-4 flex items-center gap-2">
            <CheckCircleIcon className="text-blue-500" />
            Recent Completed Tasks
          </Typography>
          {progressData && progressData.recentTasks.length > 0 ? (
            <List>
              {progressData.recentTasks.map((task) => (
                <ListItem key={task.id} className="px-0">
                  <ListItemIcon>
                    <CheckCircleIcon className="text-green-500" />
                  </ListItemIcon>
                  <ListItemText
                    primary={task.title}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          {task.topic.title}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Completed: {new Date(task.updatedAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Alert severity="info">No recently completed tasks</Alert>
          )}
        </Paper>

        {/* Recent Courses */}
        <Paper className="p-6">
          <Typography variant="h6" className="mb-4 flex items-center gap-2">
            <BookIcon className="text-purple-500" />
            Recently Completed Courses
          </Typography>
          {progressData && progressData.recentCourses.length > 0 ? (
            <Box className="space-y-3">
              {progressData.recentCourses.map((course) => (
                <Card key={course.id} className="border border-gray-200">
                  <CardContent className="p-4">
                    <Typography variant="subtitle1" className="mb-1 font-medium">
                      {course.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" className="mb-2">
                      {course.description}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            <Alert severity="info">No recently completed courses</Alert>
          )}
        </Paper>
      </Box>
    </Box>
  );
}