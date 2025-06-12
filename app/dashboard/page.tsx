"use client";

import { useEffect, useState } from 'react';
import {
  Box, CircularProgress, Alert, Button, Menu, MenuItem, Snackbar,
  Typography, Checkbox, List, ListItem, ListItemText
} from "@mui/material";
import { motion, AnimatePresence } from 'framer-motion';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface Task {
  id: string;
  title: string;
  description: string | null;
  order: number;
  isCompleted: boolean;
}

interface Topic {
  id: string;
  title: string;
  description: string | null;
  order: number;
  tasks?: Task[];
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

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roadmaps, setRoadmaps] = useState<Roadmap[] | null>(null);
  const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error' | 'info'>('info');

  const jobRoles = [
    'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
    'Data Scientist', 'DevOps Engineer', 'Machine Learning Engineer', 'Mobile Developer',
    'Cybersecurity Analyst', 'Cloud Architect',
  ];

  useEffect(() => {
    const fetchRoadmapData = async () => {
      try {
        const userId = 'cmbtb68ll0014fp90sry7mkie';
        const response = await fetch(`http://localhost:3000/api/users/${userId}/roadmaps`);
        if (!response.ok) throw new Error(`Failed to fetch roadmap data: ${response.statusText}`);
        const data: Roadmap[] = await response.json();
        setRoadmaps(data);
        setSelectedRoadmap(data.length > 0 ? data[0] : null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching roadmap:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmapData();
  }, []);

  const handleCreateRoadmapClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleJobRoleSelect = async (jobRole: string) => {
    setAnchorEl(null);
    setIsGenerating(true);
    setToastMessage(`Generating roadmap for ${jobRole}...`);
    setToastSeverity('info');

    try {
      const userId = 'cmbtb68ll0014fp90sry7mkie';
      const response = await fetch(`http://localhost:3000/api/career-roadmap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, roadmapRole: jobRole }),
      });

      if (!response.ok) throw new Error(`Failed to create roadmap: ${response.statusText}`);
      const newRoadmap: Roadmap = await response.json();
      setRoadmaps([newRoadmap]);
      setSelectedRoadmap(newRoadmap);
      setToastMessage(`Roadmap for ${jobRole} created successfully! 🎉`);
      setToastSeverity('success');
    } catch (err) {
      setToastMessage(err instanceof Error ? err.message : 'Failed to create roadmap');
      setToastSeverity('error');
      console.error('Error creating roadmap:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleTaskCompletion = async (taskId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`http://localhost:3000/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: !currentStatus }),
      });

      if (!response.ok) throw new Error('Failed to update task status');

      // Deep clone and update state
      setRoadmaps(prev => {
        if (!prev) return null;

        const updated = prev.map((roadmap) => {
          const newTopics = roadmap.topics.map((topic) => {
            const newTasks = topic.tasks?.map((task) =>
              task.id === taskId ? { ...task, isCompleted: !currentStatus } : task
            );
            return { ...topic, tasks: newTasks };
          });
          return { ...roadmap, topics: newTopics };
        });

        // Also update selectedRoadmap
        const updatedSelected = updated.find(r => r.id === selectedRoadmap?.id) || null;
        setSelectedRoadmap(updatedSelected);

        return updated;
      });

      setToastMessage(`Task marked as ${!currentStatus ? 'completed' : 'uncompleted'} ✅`);
      setToastSeverity('success');
    } catch (err) {
      console.error('Error updating task status:', err);
      setToastMessage('Failed to update task status');
      setToastSeverity('error');
    }
  };

  const handleCloseToast = () => {
    setToastMessage(null);
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
        <Alert severity="error" className="rounded-lg">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box className="max-w-7xl mx-auto">
      <Box className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <Box>
          <Typography variant="h4" className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <SchoolIcon className="text-coral-500" />
            {selectedRoadmap ? `${selectedRoadmap.roadmapRole} Journey` : 'Your Learning Adventure'}
          </Typography>
          <Typography className="text-gray-600 mt-2">Let’s master new skills with fun and ease! 🌟</Typography>
        </Box>

        {!roadmaps || roadmaps.length === 0 ? (
          <Box className="mt-4 md:mt-0">
            <Button
              onClick={handleCreateRoadmapClick}
              disabled={isGenerating}
              className="btn-primary"
            >
              {isGenerating ? 'Generating...' : 'Start New Journey'}
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              MenuListProps={{ 'aria-labelledby': 'create-roadmap-button' }}
            >
              {jobRoles.map((role) => (
                <MenuItem key={role} onClick={() => handleJobRoleSelect(role)} className="hover:bg-teal-100">
                  {role}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        ) : null}
      </Box>

      {roadmaps && selectedRoadmap ? (
        <Box className="space-y-6">
          <Typography variant="h5" className="text-2xl font-semibold text-teal-600">
            Your Topics
          </Typography>
          <AnimatePresence>
            {selectedRoadmap.topics.map((topic, index) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="card p-6 flex flex-col md:flex-row items-start gap-4 bg-gradient-to-r from-lavender-100 to-blue-100"
              >
                <Box className="flex-1">
                  <Typography className="card-header">{topic.title}</Typography>
                  {topic.description && (
                    <Typography className="text-gray-500 text-sm mt-2">{topic.description}</Typography>
                  )}
                </Box>
                <Box className="w-full md:w-1/3">
                  <Typography className="text-sm font-semibold text-gray-700 mb-2">Tasks</Typography>
                  <List dense>
                    {topic.tasks?.map((task) => (
                      <ListItem key={task.id} className="flex items-center">
                        <Checkbox
                          checked={task.isCompleted}
                          onChange={() => handleToggleTaskCompletion(task.id, task.isCompleted)}
                          icon={<CheckCircleIcon className="text-gray-300" />}
                          checkedIcon={<CheckCircleIcon className="text-teal-500" />}
                        />
                        <ListItemText
                          primary={task.title}
                          className={task.isCompleted ? 'line-through text-gray-400' : 'text-gray-700'}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </motion.div>
            ))}
          </AnimatePresence>
        </Box>
      ) : (
        <Box className="p-4 bg-yellow-100 rounded-lg">
          <Alert severity="info" className="rounded-lg">
            No roadmap yet. Start your learning journey above! 🚀
          </Alert>
        </Box>
      )}

      <Snackbar
        open={!!toastMessage}
        autoHideDuration={6000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseToast} severity={toastSeverity} className="rounded-lg">
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}