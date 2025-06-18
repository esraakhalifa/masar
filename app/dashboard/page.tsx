"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
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
import { styled, useTheme } from '@mui/material/styles';
import Link from 'next/link';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssignmentIcon from '@mui/icons-material/Assignment';
import Image from "next/image";
import routeIcon from "@/public/route.svg";

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
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error' | 'info'>('info');
  const [missingProfileInfo, setMissingProfileInfo] = useState(false);
  const { scrollYProgress } = useScroll();
  const theme = useTheme();

  const jobRoles = [
    'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
    'Data Scientist', 'DevOps Engineer', 'Machine Learning Engineer', 'Mobile Developer',
    'Cybersecurity Analyst', 'Cloud Architect',
  ];

  useEffect(() => {
    const fetchRoadmap = async () => {
      if (status === 'loading') return;
      
      if (!session?.user?.id) {
        setError('Please sign in to view your roadmap');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/users/${session.user.id}/roadmaps`);
        
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

    const fetchProfileInfo = async () => {
      if (status === 'loading') return;
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }
      try {
        const userId = session.user.id;
        const [preferencesRes, experienceRes, educationRes, paymentsRes] = await Promise.all([
          fetch(`/api/users/${userId}/career-preferences`),
          fetch(`/api/users/${userId}/experience`),
          fetch(`/api/users/${userId}/education`),
          fetch(`/api/users/${userId}/payments`),
        ]);
        const [preferences, experience, education, payments] = await Promise.all([
          preferencesRes.json(),
          experienceRes.json(),
          educationRes.json(),
          paymentsRes.json(),
        ]);
        if (
          !preferences || preferences.length === 0 ||
          !experience || experience.length === 0 ||
          !education || education.length === 0 ||
          !payments || payments.length === 0
        ) {
          setMissingProfileInfo(true);
        }
      } catch (err) {
        setMissingProfileInfo(true);
      }
    };

    fetchRoadmap();
    fetchProfileInfo();
  }, [session, status]);

  const handleCreateRoadmapClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleJobRoleSelect = async (jobRole: string) => {
    if (!session?.user?.id) {
      setToastMessage('Please sign in to create a roadmap');
      setToastSeverity('error');
      return;
    }

    setAnchorEl(null);
    setIsGenerating(true);
    setToastMessage(`Generating roadmap for ${jobRole}...`);
    setToastSeverity('info');

    try {
      const response = await fetch(`/api/career-roadmap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id, roadmapRole: jobRole }),
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
          Please sign in to access your dashboard.
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

  if (missingProfileInfo) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="60vh" width="100%">
        <Alert
          severity="warning"
          sx={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            padding: '2rem 3rem',
            borderRadius: '1rem',
            background: 'linear-gradient(90deg, #fffbe6 0%, #ffe0b2 100%)',
            color: '#b26a00',
            boxShadow: '0 4px 24px rgba(255, 193, 7, 0.15)',
            textAlign: 'center',
            maxWidth: '700px',
            margin: '0 auto',
            mb: 3,
          }}
        >
          Please complete your profile and subscribe to a plan to unlock your personalized dashboard.
        </Alert>
        <Button
          onClick={() => router.push('/')}
          variant="contained"
          sx={{
            background: 'linear-gradient(90deg, #2434B3 0%, #FF4B36 100%)',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.2rem',
            padding: '1rem 2.5rem',
            borderRadius: '2rem',
            marginTop: '2rem',
            boxShadow: '0 2px 8px rgba(36, 52, 179, 0.15)',
            transition: 'background 0.3s',
            '&:hover': {
              background: 'linear-gradient(90deg, #2434B3 0%, #FF6B3D 100%)',
            },
          }}
        >
          Return to Homepage
        </Button>
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
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="60vh" width="100%">
        <Alert
          severity="info"
          sx={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            padding: '2rem 3rem',
            borderRadius: '1rem',
            background: 'linear-gradient(90deg, #e3f2fd 0%, #bbdefb 100%)',
            color: '#1565c0',
            boxShadow: '0 4px 24px rgba(33, 150, 243, 0.15)',
            textAlign: 'center',
            maxWidth: '700px',
            margin: '0 auto',
            mb: 3,
          }}
        >
          No roadmap found for your account.<br />
          Click below to generate your personalized learning path!
        </Alert>
        <Button
          onClick={handleCreateRoadmapClick}
          disabled={isGenerating}
          variant="contained"
          sx={{
            background: 'linear-gradient(90deg, #2434B3 0%, #FF4B36 100%)',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.2rem',
            padding: '1rem 2.5rem',
            borderRadius: '2rem',
            marginTop: '2rem',
            boxShadow: '0 2px 8px rgba(36, 52, 179, 0.15)',
            transition: 'background 0.3s',
            opacity: isGenerating ? 0.7 : 1,
            '&:hover': {
              background: 'linear-gradient(90deg, #2434B3 0%, #FF6B3D 100%)',
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
        <Box display="flex" alignItems="center" justifyContent="space-between" width="100%" sx={{ mb: 4 }}>
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
          <Image
            src={routeIcon}
            alt="Masar Icon"
            width={40}
            height={40}
            style={{ marginLeft: "auto" }}
          />
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
      </motion.div>

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