"use client";

import { useEffect, useState } from 'react';
import { Box, CircularProgress, Alert, Typography, List, ListItem, ListItemText, Divider } from "@mui/material";
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { motion } from 'framer-motion';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface Topic {
  id: string;
  title: string;
  description: string | null;
  order: number;
  tasks?: Task[];
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  order: number;
  isCompleted: boolean;
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  instructors: string | null;
  courseLink: string;
  createdAt: string;
  updatedAt: string;
}

interface Roadmap {
  id: string;
  roadmapRole: string;
  topics: Topic[];
  courses: Course[];
}

export default function StatisticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);

  useEffect(() => {
    const fetchRoadmapData = async () => {
      try {
        const userId = 'cmbsawz1n0000fpsjbsdiznnu';
        const response = await fetch(`/api/users/${userId}/roadmaps`);
        if (!response.ok) throw new Error(`Failed to fetch roadmap data: ${response.statusText}`);
        const data: Roadmap[] = await response.json();
        setRoadmap(data.length > 0 ? data[0] : null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching roadmap:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmapData();
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
        <Alert severity="error" className="rounded-lg">{error}</Alert>
      </Box>
    );
  }

  if (!roadmap) {
    return (
      <Box className="p-4 bg-yellow-100 rounded-lg">
        <Alert severity="info" className="rounded-lg">No roadmap found.</Alert>
      </Box>
    );
  }

  // Statistics Calculations
  const completedTasks = roadmap.topics
    .flatMap((topic) => topic.tasks || [])
    .filter((task) => task?.isCompleted) || [];
  const totalTasks = roadmap.topics
    .flatMap((topic) => topic.tasks || []).length || 0;
  const progress = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const recentCourses = roadmap.courses.filter(
    (course) => new Date(course.updatedAt) >= lastMonth
  );

  const tasksPerTopic = roadmap.topics.map((topic) => ({
    title: topic.title,
    completed: (topic.tasks || []).filter((task) => task.isCompleted).length,
    uncompleted: (topic.tasks || []).filter((task) => !task.isCompleted).length,
  }));

  const jobMarketInsights = {
    averageSalary: roadmap.roadmapRole === 'Data Scientist'
      ? { amount: 80000, currency: 'USD', source: 'Coursera, 2025' }
      : roadmap.roadmapRole === 'Software Engineer'
      ? { amount: 110140, currency: 'USD', source: 'Indeed, 2025' }
      : { amount: 75000, currency: 'USD', source: 'Generic Estimate' },
    demandTrend: 'High demand due to increasing reliance on technology!',
    requiredSkills: ['SQL', 'Python', 'Data Visualization'],
    jobOpenings: roadmap.roadmapRole === 'Software Engineer' ? 50000 : 30000,
    growthRate: '15% annual growth projected!',
  };

  const tasksChartData = {
    labels: tasksPerTopic.map((t) => t.title),
    datasets: [
      {
        label: 'Completed Tasks',
        data: tasksPerTopic.map((t) => t.completed),
        backgroundColor: '#4ECDC4',
      },
      {
        label: 'Uncompleted Tasks',
        data: tasksPerTopic.map((t) => t.uncompleted),
        backgroundColor: '#FF6B6B',
      },
    ],
  };

  const progressChartData = {
    labels: ['Completed', 'Remaining'],
    datasets: [
      {
        data: [progress, 100 - progress],
        backgroundColor: ['#4ECDC4', '#FFE4C4'],
      },
    ],
  };

  const completionOverTimeData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Tasks Completed',
        data: [2, 4, 6, 8],
        borderColor: '#4ECDC4',
        backgroundColor: 'rgba(78, 205, 196, 0.2)',
        fill: true,
      },
    ],
  };

  const jobOpeningsChartData = {
    labels: ['Current', 'Next Year'],
    datasets: [
      {
        label: 'Job Openings',
        data: [jobMarketInsights.jobOpenings, jobMarketInsights.jobOpenings * 1.15],
        backgroundColor: '#C3BFFA',
      },
    ],
  };

  return (
    <Box className="max-w-7xl mx-auto p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          📈 Your Learning Insights
        </Typography>
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Box className="card p-6 bg-gradient-to-r from-teal-100 to-blue-100">
            <Typography variant="h6" className="card-header-bold mb-4">Recent Completions</Typography>
            {recentCourses.length > 0 ? (
              <List>
                {recentCourses.map((course) => (
                  <ListItem key={course.id} className="text-gray-700">
                    <ListItemText primary={course.title} secondary={`Completed: ${new Date(course.updatedAt).toLocaleDateString()}`} />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body1" className="text-gray-600">No courses completed recently. Keep learning! 🌟</Typography>
            )}
          </Box>
          <Box className="card p-6 bg-gradient-to-r from-lavender-100 to-purple-100">
            <Typography variant="h6" className="card-header mb-4">Tasks per Topic</Typography>
            <Box sx={{ height: 250 }}>
              <Bar
                data={tasksChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Tasks' } },
                    x: { title: { display: true, text: 'Topics' } },
                  },
                  plugins: {
                    legend: { position: 'top' },
                    title: { display: true, text: 'Completed vs Uncompleted Tasks' },
                  },
                }}
              />
            </Box>
          </Box>
          <Box className="card p-6 bg-gradient-to-r from-yellow-100 to-orange-100">
            <Typography variant="h6" className="card-header mb-4">Overall Progress</Typography>
            <Box sx={{ height: 250 }}>
              <Pie
                data={progressChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'top' },
                    title: { display: true, text: 'Your Roadmap Progress' },
                  },
                }}
              />
            </Box>
          </Box>
          <Box className="card p-6 bg-gradient-to-r from-coral-100 to-pink-100">
            <Typography variant="h6" className="card-header mb-4">Completed Tasks</Typography>
            {completedTasks.length > 0 ? (
              <List>
                {completedTasks.map((task) => (
                  <ListItem key={task.id} className="text-gray-700">
                    <ListItemText
                      primary={task.title}
                      secondary={`Topic: ${roadmap.topics.find(t => t.tasks?.includes(task))?.title}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body1" className="text-gray-600">No tasks completed yet. Let’s get started! 🚀</Typography>
            )}
          </Box>
          <Box className="card p-6 bg-gradient-to-r from-blue-100 to-teal-100">
            <Typography variant="h6" className="card-header mb-4">Task Completion Over Time</Typography>
            <Box sx={{ height: 250 }}>
              <Line
                data={completionOverTimeData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Tasks Completed' } },
                    x: { title: { display: true, text: 'Time' } },
                  },
                  plugins: {
                    legend: { position: 'top' },
                    title: { display: true, text: 'Task Completion Trend' },
                  },
                }}
              />
            </Box>
          </Box>
          <Box className="card p-6 bg-gradient-to-r from-purple-100 to-lavender-100">
            <Typography variant="h6" className="card-header mb-4">Job Market Insights</Typography>
            <Typography className="text-gray-700 mb-1">
              <strong>Average Salary:</strong> {jobMarketInsights.averageSalary.amount.toLocaleString()} {jobMarketInsights.averageSalary.currency} ({jobMarketInsights.averageSalary.source})
            </Typography>
            <Typography className="text-gray-700 mb-1">
              <strong>Demand:</strong> {jobMarketInsights.demandTrend}
            </Typography>
            <Typography className="text-gray-700 mb-1">
              <strong>Skills:</strong> {jobMarketInsights.requiredSkills.join(', ')}
            </Typography>
            <Typography className="text-gray-700 mb-4">
              <strong>Job Openings:</strong> {jobMarketInsights.jobOpenings.toLocaleString()}
            </Typography>
            <Box sx={{ height: 250 }}>
              <Bar
                data={jobOpeningsChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Openings' } },
                    x: { title: { display: true, text: 'Time' } },
                  },
                  plugins: {
                    legend: { position: 'top' },
                    title: { display: true, text: 'Job Openings Trend' },
                  },
                }}
              />
            </Box>
            <Typography className="text-gray-700 mt-4">
              <strong>Growth:</strong> {jobMarketInsights.growthRate}
            </Typography>
          </Box>
        </Box>
      </motion.div>
    </Box>
  );
}