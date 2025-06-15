'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Alert } from '@mui/material';
import TopicTasks from '@/app/components/TopicTasks';

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
  tasks: Task[];
}

export default function TopicTasksPage({ params }: { params: { topicId: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);

  useEffect(() => {
    const fetchTopic = async () => {
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
  }, [params.topicId]);

  const handleTaskToggle = async (taskId: string, isCompleted: boolean) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isCompleted }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      // Update local state
      setTopic(prev => {
        if (!prev) return null;
        return {
          ...prev,
          tasks: prev.tasks.map(task =>
            task.id === taskId ? { ...task, isCompleted } : task
          ),
        };
      });
    } catch (err) {
      console.error('Error updating task:', err);
      // You might want to show an error message to the user here
    }
  };

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

  if (!topic) {
    return (
      <Box className="p-4">
        <Alert severity="info" className="rounded-lg">
          Topic not found
        </Alert>
      </Box>
    );
  }

  return (
    <Box className="max-w-4xl mx-auto p-4">
      <TopicTasks
        topicTitle={topic.title}
        tasks={topic.tasks}
        onTaskToggle={handleTaskToggle}
        onBack={() => router.push('/dashboard')}
      />
    </Box>
  );
} 