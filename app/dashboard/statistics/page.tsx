"use client";

import { useEffect, useState } from 'react';
import { Box, CircularProgress, Alert } from "@mui/material";
import { motion } from 'framer-motion';
import ProgressChart from '@/app/components/charts/ProgressChart';
import TaskCompletionChart from '@/app/components/charts/TaskCompletionChart';
import JobMarketChart from '@/app/components/charts/JobMarketChart';
import RecentActivities from '@/app/components/RecentActivities';

interface ProgressData {
  recentCourses: Array<{
    id: string;
    title: string;
    description: string | null;
    updatedAt: string;
  }>;
  recentTasks: Array<{
    id: string;
    title: string;
    description: string | null;
    updatedAt: string;
    topic: {
      title: string;
    };
  }>;
  taskCompletionOverTime: Array<{
    date: string;
    count: number;
  }>;
  overallProgress: {
    completed: number;
    total: number;
    percentage: number;
  };
}

export default function StatisticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        const userId = 'cmbxgjycw0000fptltstn83z3'; // TODO: Get from auth context
        console.log('Fetching progress data for user:', userId);
        
        const response = await fetch(`/api/users/${userId}/progress`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          cache: 'no-store',
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
          console.error('Error response:', errorData);
          throw new Error(errorData.error || `Failed to fetch progress data: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Received progress data:', data);
        
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid response format: Expected object');
        }
        
        setProgressData(data);
      } catch (err) {
        console.error('Error fetching progress:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching progress data');
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, []);

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
    <Box className="max-w-7xl mx-auto p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Box className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          📈 Your Learning Insights
        </Box>
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Box className="card p-6 bg-gradient-to-r from-teal-100 to-blue-100">
            <RecentActivities
              activities={progressData.recentCourses.map(course => ({
                id: course.id,
                title: course.title,
                description: course.description,
                date: course.updatedAt,
                type: 'course'
              }))}
              title="Recent Courses"
              emptyMessage="No courses completed recently. Keep learning! 🌟"
            />
          </Box>
          <Box className="card p-6 bg-gradient-to-r from-lavender-100 to-purple-100">
            <RecentActivities
              activities={progressData.recentTasks.map(task => ({
                id: task.id,
                title: task.title,
                description: task.description,
                date: task.updatedAt,
                type: 'task',
                topicTitle: task.topic.title
              }))}
              title="Recent Tasks"
              emptyMessage="No tasks completed recently. Let's get started! 🚀"
            />
          </Box>
          <Box className="card p-6 bg-gradient-to-r from-yellow-100 to-orange-100">
            <ProgressChart
              completed={progressData.overallProgress.completed}
              total={progressData.overallProgress.total}
              percentage={progressData.overallProgress.percentage}
            />
          </Box>
          <Box className="card p-6 bg-gradient-to-r from-blue-100 to-teal-100">
            <TaskCompletionChart data={progressData.taskCompletionOverTime} />
          </Box>
          <Box className="card p-6 bg-gradient-to-r from-purple-100 to-lavender-100">
            <JobMarketChart />
          </Box>
        </Box>
      </motion.div>
    </Box>
  );
}