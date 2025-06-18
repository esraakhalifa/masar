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

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate?: string;
}

interface Topic {
  id: string;
  title: string;
  description: string;
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
        const response = await fetch(`/api/users/${session.user.id}/topics/${params.topicId}`);
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

    try {
      const response = await fetch(`/api/users/${session.user.id}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: !topic?.tasks.find(t => t.id === taskId)?.completed
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
            task.id === taskId ? { ...task, completed: updatedTask.completed } : task
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
    <Box className="p-4">
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

      <List>
        {topic.tasks.map((task) => (
          <ListItem
            key={task.id}
            className="mb-2 bg-white rounded-lg shadow-sm"
          >
            <ListItemText
              primary={task.title}
              secondary={
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    {task.description}
                  </Typography>
                  {task.dueDate && (
                    <Typography variant="caption" color="textSecondary">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </Typography>
                  )}
                </Box>
              }
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                onClick={() => handleTaskToggle(task.id)}
                color={task.completed ? "success" : "default"}
              >
                {task.completed ? <CheckCircleIcon /> : <CheckCircleOutlineIcon />}
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Box>
  );
} 