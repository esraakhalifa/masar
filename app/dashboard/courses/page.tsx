"use client";

import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  useTheme,
} from '@mui/material';
import { motion, useScroll, useTransform } from 'framer-motion';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { styled } from '@mui/material/styles';
import CertificateSubmission from '@/app/components/CertificateSubmission';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

const StyledCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  background: '#FFFFFF',
  borderRadius: '16px',
  overflow: 'hidden',
  transition: 'all 0.3s ease-in-out',
  border: `1px solid ${theme.palette.primary.main}`,
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
    '& .course-link': {
      color: '#FF6B3D',
      '& .arrow-icon': {
        transform: 'translateX(4px)',
      },
    },
    '& .card-content': {
      '&::after': {
        transform: 'scaleX(1)',
      },
    },
  },
  '& .card-content': {
    position: 'relative',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '100%',
      height: '3px',
      background: 'linear-gradient(90deg, #FF6B3D 0%, #FF9D6C 100%)',
      transform: 'scaleX(0)',
      transformOrigin: 'left',
      transition: 'transform 0.3s ease-in-out',
    },
  },
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  background: 'rgba(255, 107, 61, 0.15)',
  color: '#FF6B3D',
  fontWeight: 500,
  '&:hover': {
    background: 'rgba(255, 107, 61, 0.25)',
  },
}));

const CourseLink = styled(Link)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  color: theme.palette.primary.main,
  textDecoration: 'none',
  fontWeight: 500,
  transition: 'all 0.3s ease-in-out',
  '& .arrow-icon': {
    transition: 'transform 0.3s ease-in-out',
  },
}));

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { 
    duration: 0.8,
    ease: [0.6, -0.05, 0.01, 0.99]
  }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: {
    duration: 0.6,
    ease: [0.6, -0.05, 0.01, 0.99]
  }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15
    }
  }
};

interface Course {
  id: string;
  title: string;
  description: string | null;
  instructors: string | null;
  course_link: string;
  certificates?: Array<{
    id: string;
    title: string;
    provider: string;
    issueDate: string;
    fileUrl: string;
  }>;
}

export default function CoursesPage() {
  const theme = useTheme();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const { scrollYProgress } = useScroll();
  const [missingInfo, setMissingInfo] = useState(false);
  const [noRoadmap, setNoRoadmap] = useState(false);
  const [generating, setGenerating] = useState(false);

  const fetchCourses = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/roadmaps`);
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }
      const roadmaps = await response.json();
      if (roadmaps.length === 0) {
        setNoRoadmap(true);
        setCourses([]);
        return;
      }
      setNoRoadmap(false);
      const roadmap = roadmaps[0];
      setCourses(roadmap.courses);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'loading') return; // Wait for session to load
    if (!session?.user?.id) {
      setError('Please sign in to view your courses.');
      setLoading(false);
      return;
    }
    fetchCourses(session.user.id);
  }, [session, status]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (status === 'loading') return;
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        const userId = session.user.id;
        // Fetch all required data in parallel
        const [preferencesRes, experienceRes, skillsRes, paymentsRes] = await Promise.all([
          fetch(`/api/users/${userId}/career-preferences`),
          fetch(`/api/users/${userId}/experience`),
          fetch(`/api/users/${userId}/skills`),
          fetch(`/api/users/${userId}/payments`),
        ]);
        const [preferences, experience, skills, payments] = await Promise.all([
          preferencesRes.json(),
          experienceRes.json(),
          skillsRes.json(),
          paymentsRes.json(),
        ]);
        // Check if any are missing or empty
        if (
          !preferences || preferences.length === 0 ||
          !experience || experience.length === 0 ||
          !skills || skills.length === 0 ||
          !payments || payments.length === 0
        ) {
          setMissingInfo(true);
        }
      } catch (err) {
        setMissingInfo(true); // fallback to showing the message on error
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [session, status]);

  const handleCertificateSuccess = () => {
    fetchCourses(session.user.id); // Refresh courses after certificate submission
  };

  const completedCourses = courses.filter(course => (course.certificates?.length || 0) > 0);
  const inProgressCourses = courses.filter(course => (course.certificates?.length || 0) === 0);

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
          <Box className="mt-2 text-sm">
            Please make sure you have a roadmap created and try refreshing the page.
          </Box>
        </Alert>
      </Box>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="p-6 space-y-6"
    >
      <motion.div
        variants={fadeInUp}
        whileInView="animate"
        initial="initial"
        viewport={{ once: true, margin: "-100px" }}
      >
        <Typography variant="h4" className="mb-6 font-semibold">
          Your Learning Path
        </Typography>
      </motion.div>

      <motion.div
        variants={fadeInUp}
        whileInView="animate"
        initial="initial"
        viewport={{ once: true, margin: "-100px" }}
      >
        <Tabs
          value={selectedTab}
          onChange={(_, newValue) => setSelectedTab(newValue)}
          className="mb-6"
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: '#FF6B3D',
            },
            '& .MuiTab-root.Mui-selected': {
              color: '#FF6B3D',
            },
          }}
        >
          <Tab label="All Courses" />
          <Tab label="In Progress" />
          <Tab label="Completed" />
        </Tabs>
      </motion.div>

      {missingInfo && (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          minHeight="40vh"
          width="100%"
        >
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
              maxWidth: '600px',
              margin: '0 auto',
            }}
          >
            To unlock your personalized dashboard, please complete your profile information and subscribe to a plan.
          </Alert>
        </Box>
      )}

      <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(selectedTab === 0 ? courses : selectedTab === 1 ? inProgressCourses : completedCourses).map((course, index) => (
          <motion.div
            key={course.id}
            variants={scaleIn}
            whileInView="animate"
            initial="initial"
            viewport={{ once: true, margin: "-100px" }}
            custom={index}
          >
            <StyledCard>
              <CardContent className="card-content">
                <Typography 
                  variant="h6" 
                  component="h2" 
                  gutterBottom
                  className="font-semibold"
                >
                  {course.title}
                </Typography>
                {course.description && (
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    className="mb-4"
                  >
                    {course.description}
                  </Typography>
                )}
                {course.instructors && (
                  <Box className="mb-4">
                    <Typography variant="body2" color="text.secondary">
                      Instructors: {course.instructors}
                    </Typography>
                  </Box>
                )}
                <Box className="flex justify-between items-center mt-4">
                  <CourseLink 
                    href={course.course_link} 
                    className="course-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Start Course
                    <ArrowForwardIcon className="arrow-icon" />
                  </CourseLink>
                  {course.certificates && course.certificates.length > 0 && (
                    <StyledChip
                      icon={<CheckCircleIcon />}
                      label="Completed"
                      size="small"
                    />
                  )}
                </Box>
              </CardContent>
            </StyledCard>
          </motion.div>
        ))}
      </Box>
    </motion.div>
  );
}