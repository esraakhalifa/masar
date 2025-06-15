"use client";

import { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Card, CardContent, LinearProgress } from '@mui/material';
import { motion } from 'framer-motion';

interface Topic {
  id: string;
  title: string;
  description: string | null;
  order: number;
  completedTasks: number;
  totalTasks: number;
}

export default function TopicsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const userId = 'cmby1pcum0000fp5biqny28w3'; // TODO: Get from auth context
        const response = await fetch(`/api/users/${userId}/roadmaps`);
        if (!response.ok) {
          throw new Error('Failed to fetch topics');
        }
        const roadmaps = await response.json();
        if (roadmaps.length === 0) {
          throw new Error('No roadmap found');
        }
        const roadmap = roadmaps[0];
        setTopics(roadmap.topics);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
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
        <Typography variant="h4" className="mb-6 text-gray-800">
          Learning Topics
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          {topics.map((topic) => {
            const progress = (topic.completedTasks / topic.totalTasks) * 100;

            return (
              <Card key={topic.id} className="h-full">
                <CardContent>
                  <Box className="flex items-center justify-between mb-4">
                    <Typography variant="h6" component="h2">
                      {topic.title}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                      Topic {topic.order}
                    </Typography>
                  </Box>

                  {topic.description && (
                    <Typography color="text.secondary" paragraph>
                      {topic.description}
                    </Typography>
                  )}

                  <Box className="mt-4">
                    <Box className="flex justify-between mb-1">
                      <Typography variant="body2" color="text.secondary">
                        Progress
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {topic.completedTasks}/{topic.totalTasks} tasks
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      className="h-2 rounded-full"
                      sx={{
                        backgroundColor: '#E2E8F0',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#4FD1C5',
                        },
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      </motion.div>
    </Box>
  );
} 