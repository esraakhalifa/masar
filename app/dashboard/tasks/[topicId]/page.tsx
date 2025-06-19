'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Box, CircularProgress, Alert, Button, List, ListItem,
  ListItemText, ListItemSecondaryAction, IconButton,
  Typography, Paper, Divider
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { fetchWithCsrf } from '@/app/lib/fetchWithCsrf';
import RequirementGate from '@/app/components/RequirementGate';
import { motion } from 'framer-motion';

interface Task {
  id: string;
  title: string;
  description: string | null;
  isCompleted: boolean;
  order: number;
}

interface Topic {
  id: string;
  title: string;
  description: string | null;
  tasks: Task[];
}

export default function TasksPage({ params }: { params: { topicId: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);

  useEffect(() => {
    const fetchTopic = async () => {
      if (status === 'loading') return;
      
      if (!session?.user?.id) {
        setError('Please sign in to view tasks');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/topics/${params.topicId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch topic');
        }
        const data = await response.json();
        setTopic(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTopic();
  }, [params.topicId, session, status]);

  const handleTaskToggle = async (taskId: string) => {
    if (!session?.user?.id) {
      setError('Please sign in to update tasks');
      return;
    }

    if (!topic) return;

    const currentTask = topic.tasks.find(t => t.id === taskId);
    if (!currentTask) return;

    try {
      const response = await fetchWithCsrf(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isCompleted: !currentTask.isCompleted
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const updatedTask = await response.json();
      
      setTopic(prev => {
        if (!prev) return null;
        return {
          ...prev,
          tasks: prev.tasks.map(task =>
            task.id === taskId ? { ...task, isCompleted: updatedTask.isCompleted } : task
          )
        };
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  };

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
          Please sign in to access tasks.
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

  if (!topic) {
    return (
      <Box className="p-4">
        <Alert severity="info" className="rounded-lg">
          Topic not found.
        </Alert>
      </Box>
    );
  }

  return (
    <RequirementGate>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4"
    >
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.back()}
        className="mb-4"
      >
        Back to Dashboard
      </Button>

      <Paper className="p-4 mb-4">
        <Typography variant="h5" className="mb-2">
          {topic.title}
        </Typography>
        <Typography variant="body1" color="textSecondary">
          {topic.description}
        </Typography>
      </Paper>

      <Typography variant="h6" className="mb-3">
        Tasks ({topic.tasks.filter(task => task.isCompleted).length}/{topic.tasks.length} completed)
      </Typography>

      <List>
        {topic.tasks
          .sort((a, b) => a.order - b.order)
          .map((task) => (
          <ListItem
            key={task.id}
            className="mb-2 bg-white rounded-lg shadow-sm"
          >
            <ListItemText
              primary={
                <Typography 
                  variant="h6" 
                  style={{ 
                    textDecoration: task.isCompleted ? 'line-through' : 'none',
                    color: task.isCompleted ? '#9CA3AF' : 'inherit'
                  }}
                >
                  {task.title}
                </Typography>
              }
              secondary={
                <Typography 
                  variant="body2" 
                  color="textSecondary"
                  style={{ 
                    textDecoration: task.isCompleted ? 'line-through' : 'none'
                  }}
                >
                  {task.description}
                </Typography>
              }
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                onClick={() => handleTaskToggle(task.id)}
                color={task.isCompleted ? "success" : "default"}
                size="large"
              >
                {task.isCompleted ? <CheckCircleIcon /> : <CheckCircleOutlineIcon />}
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </motion.div>
    </RequirementGate>
  );
} 