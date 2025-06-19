"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Box, CircularProgress, Alert, Button, Snackbar,
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
import { fetchWithCsrf } from '@/app/lib/fetchWithCsrf';

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
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error' | 'info'>('info');
  const [isGenerating, setIsGenerating] = useState(false);
  const { scrollYProgress } = useScroll();
  const theme = useTheme();

  useEffect(() => {
    const fetchOrGenerateRoadmap = async () => {
      if (status === 'loading') return;
      
      if (!session?.user?.id) {
        setError('Please sign in to view your roadmap');
        setLoading(false);
        return;
      }

      try {
        // First, try to fetch existing roadmaps
        const response = await fetch(`/api/users/${session.user.id}/roadmaps`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch roadmap');
        }
        
        const data = await response.json();
        
        if (data && data.length > 0) {
          // Roadmap exists, use it
          setRoadmap(data[0]);
          setSelectedRoadmap(data[0]);
          setLoading(false);
        } else {
          // No roadmap found, generate a new one
          setIsGenerating(true);
          setToastMessage('Generating your personalized roadmap...');
          setToastSeverity('info');
          
          const generateResponse = await fetchWithCsrf('/api/career-roadmap', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: session.user.id }),
          });

          if (!generateResponse.ok) {
            throw new Error(`Failed to generate roadmap: ${generateResponse.statusText}`);
          }

          const newRoadmap: Roadmap = await generateResponse.json();
          setRoadmap(newRoadmap);
          setSelectedRoadmap(newRoadmap);
          setToastMessage('Roadmap generated successfully!');
          setToastSeverity('success');
          setIsGenerating(false);
          setLoading(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setIsGenerating(false);
        setLoading(false);
        setToastMessage(err instanceof Error ? err.message : 'Failed to load roadmap');
        setToastSeverity('error');
      }
    };

    fetchOrGenerateRoadmap();
  }, [session, status]);

  const handleToggleTaskCompletion = async (taskId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`http://localhost:3000/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: !currentStatus }),
      });

      if (!response.ok) throw new Error('Failed to update task status');

      // Deep clone and update state
      setRoadmap((prev: Roadmap | null) => {
        if (!prev) return null;

        const updated = { ...prev, topics: prev.topics.map((topic: Topic) => {
          const newTasks = topic.tasks?.map((task: Task) =>
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

  if (loading || isGenerating) {
    return (
      <Box className="flex items-center justify-center min-h-[60vh] flex-col space-y-4">
        <CircularProgress className="text-teal-500" />
        <Typography variant="h6" className="text-gray-600">
          {isGenerating ? 'Generating your personalized roadmap...' : 'Loading your dashboard...'}
        </Typography>
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
          Please complete your profile to generate your personalized learning path!
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
            No roadmap yet. Complete your profile to start your learning journey!
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