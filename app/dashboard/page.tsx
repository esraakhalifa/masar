"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, CircularProgress, Alert, Button, Menu, MenuItem, Snackbar,
  Typography, Checkbox, List, ListItem, ListItemText
} from "@mui/material";
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import StarIcon from '@mui/icons-material/Star';
import RoadmapDiagram from '@/app/components/RoadmapDiagram';
import RoadmapVisualization from '@/app/components/RoadmapVisualization';
import { styled } from '@mui/material/styles';
import Link from 'next/link';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssignmentIcon from '@mui/icons-material/Assignment';

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

const fadeInUp = {
  initial: { opacity: 0, y: 80 },
  animate: { opacity: 1, y: 0 },
  transition: { 
    duration: 1.2,
    ease: [0.4, 0, 0.2, 1]
  }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: {
    duration: 1,
    ease: [0.4, 0, 0.2, 1]
  }
};

const slideIn = {
  initial: { opacity: 0, x: -80 },
  animate: { opacity: 1, x: 0 },
  transition: {
    duration: 1.2,
    ease: [0.4, 0, 0.2, 1]
  }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.25
    }
  }
};

const StyledPaper = styled(Box)(({ theme }) => ({
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

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error' | 'info'>('info');
  const { scrollYProgress } = useScroll();

  const jobRoles = [
    'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
    'Data Scientist', 'DevOps Engineer', 'Machine Learning Engineer', 'Mobile Developer',
    'Cybersecurity Analyst', 'Cloud Architect',
  ];

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const userId = 'cmc0dobf90000fpa540yc6u0a'; // TODO: Get from auth context
        const response = await fetch(`/api/users/${userId}/roadmaps`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch roadmap');
        }
        
        const data = await response.json();
        if (data && data.length > 0) {
          setRoadmap(data[0]); // Get the first roadmap
          setSelectedRoadmap(data[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmap();
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
      const userId = 'cmbxgjycw0000fptltstn83z3';
      const response = await fetch(`http://localhost:3000/api/career-roadmap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, roadmapRole: jobRole }),
      });

      if (!response.ok) throw new Error(`Failed to create roadmap: ${response.statusText}`);
      const newRoadmap: Roadmap = await response.json();
      setRoadmap(newRoadmap);
      setSelectedRoadmap(newRoadmap);
      setToastMessage(`Roadmap for ${jobRole} created successfully!`);
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
      setRoadmap(prev => {
        if (!prev) return null;

        const updated = { ...prev, topics: prev.topics.map((topic) => {
          const newTasks = topic.tasks?.map((task) =>
            task.id === taskId ? { ...task, isCompleted: !currentStatus } : task
          );
          return { ...topic, tasks: newTasks };
        }) };

        setSelectedRoadmap(updated);

        return updated;
      });

      setToastMessage(`Task marked as ${!currentStatus ? 'completed' : 'uncompleted'}`);
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

  const handleTopicClick = (topicId: string) => {
    router.push(`/dashboard/tasks/${topicId}`);
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

  if (!roadmap) {
    return (
      <Box className="p-4">
        <Alert severity="info" className="rounded-lg">
          No roadmap found. Please create a roadmap to get started.
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
      <motion.div
        variants={fadeInUp}
        whileInView="animate"
        initial="initial"
        viewport={{ once: true, margin: "-100px" }}
      >
        <Box className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <Box>
            <Typography variant="h4" className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <SchoolIcon className="text-coral-500" />
              {selectedRoadmap ? `${selectedRoadmap.roadmapRole} Journey` : 'Your Learning Adventure'}
            </Typography>
            <Typography className="text-gray-600 mt-2 flex items-center gap-1">
              <StarIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
              Let's master new skills with fun and ease!
            </Typography>
          </Box>

          {!roadmap || roadmap.topics.length === 0 ? (
            <Box className="mt-4 md:mt-0">
              <Button
                onClick={handleCreateRoadmapClick}
                disabled={isGenerating}
                className="btn-primary"
                variant="contained"
                sx={{
                  background: 'linear-gradient(135deg, #4FD1C5 0%, #319795 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #319795 0%, #2C7A7B 100%)',
                  },
                }}
              >
                {isGenerating ? 'Generating...' : 'Start New Journey'}
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                MenuListProps={{ 'aria-labelledby': 'create-roadmap-button' }}
                PaperProps={{
                  sx: {
                    mt: 1,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                    borderRadius: 2,
                  },
                }}
              >
                {jobRoles.map((role) => (
                  <MenuItem 
                    key={role} 
                    onClick={() => handleJobRoleSelect(role)} 
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(79, 209, 197, 0.1)',
                      },
                    }}
                  >
                    {role}
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          ) : null}
        </Box>

        {roadmap && selectedRoadmap ? (
          <Box className="space-y-8">
            <RoadmapVisualization
              topics={selectedRoadmap.topics}
              onTopicClick={handleTopicClick}
            />
          </Box>
        ) : (
          <Box className="p-4 bg-yellow-100 rounded-lg">
            <Alert severity="info" className="rounded-lg flex items-center gap-1">
              <RocketLaunchIcon sx={{ fontSize: 20 }} />
              No roadmap yet. Start your learning journey above!
            </Alert>
          </Box>
        )}
      </motion.div>

      <Snackbar
        open={!!toastMessage}
        autoHideDuration={6000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseToast} 
          severity={toastSeverity} 
          className="rounded-lg"
          sx={{
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </motion.div>
  );
}