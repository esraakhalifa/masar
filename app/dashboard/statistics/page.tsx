"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Box, CircularProgress, Alert, Paper, Typography,
  LinearProgress
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

interface Statistics {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  tasksByTopic: {
    topicName: string;
    total: number;
    completed: number;
  }[];
  tasksByStatus: {
    status: string;
    count: number;
  }[];
}

export default function StatisticsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<Statistics | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      if (status === 'loading') return;
      
      if (!session?.user?.id) {
        setError('Please sign in to view statistics');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/users/${session.user.id}/statistics`);
        if (!response.ok) {
          throw new Error('Failed to fetch statistics');
        }
        const data = await response.json();
        setStatistics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
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

  if (!statistics) {
    return (
      <Box className="p-4">
        <Alert severity="info" className="rounded-lg">
          No statistics available.
        </Alert>
      </Box>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <Box className="p-4">
      <Typography variant="h4" className="mb-6">
        Learning Progress Statistics
      </Typography>

      <Box className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Overall Progress */}
        <Paper className="p-4">
          <Typography variant="h6" className="mb-4">
            Overall Progress
          </Typography>
          <Box className="mb-2">
            <Typography variant="body2" color="textSecondary">
              Completion Rate
            </Typography>
            <LinearProgress
              variant="determinate"
              value={statistics.completionRate}
              className="h-2 rounded"
            />
            <Typography variant="body2" className="mt-1">
              {statistics.completionRate}% ({statistics.completedTasks} / {statistics.totalTasks} tasks)
            </Typography>
          </Box>
        </Paper>

        {/* Tasks by Status */}
        <Paper className="p-4">
          <Typography variant="h6" className="mb-4">
            Tasks by Status
          </Typography>
          <Box className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statistics.tasksByStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {statistics.tasksByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Paper>

        {/* Tasks by Topic */}
        <Paper className="p-4 md:col-span-2">
          <Typography variant="h6" className="mb-4">
            Tasks by Topic
          </Typography>
          <Box className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={statistics.tasksByTopic}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="topicName" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completed" name="Completed" fill="#00C49F" />
                <Bar dataKey="total" name="Total" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}