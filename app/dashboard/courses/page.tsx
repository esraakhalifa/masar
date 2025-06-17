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
  courseLink: string;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const { scrollYProgress } = useScroll();

  const fetchCourses = async () => {
    try {
      const userId = 'cmc0dobf90000fpa540yc6u0a'; // TODO: Get from auth context
      const response = await fetch(`/api/users/${userId}/roadmaps`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }

      const roadmaps = await response.json();
      if (roadmaps.length === 0) {
        throw new Error('No roadmap found');
      }

      const roadmap = roadmaps[0];
      setCourses(roadmap.courses);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCertificateSuccess = () => {
    fetchCourses(); // Refresh courses after certificate submission
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
                  sx={{ 
                    fontWeight: 600,
                    color: theme.palette.primary.main,
                    transition: 'color 0.3s ease-in-out',
                    '&:hover': {
                      color: '#FF6B3D',
                    },
                  }}
                >
                  {course.title}
                </Typography>
                {course.description && (
                  <Typography 
                    color="text.secondary" 
                    paragraph
                    sx={{ 
                      minHeight: '48px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {course.description}
                  </Typography>
                )}
                {course.instructors && (
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    paragraph
                    sx={{ 
                      fontStyle: 'italic',
                      color: 'text.secondary',
                    }}
                  >
                    Instructors: {course.instructors}
                  </Typography>
                )}
                <Box className="mt-4">
                  <CourseLink
                    href={course.courseLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="course-link"
                  >
                    View Course
                    <ArrowForwardIcon className="arrow-icon" sx={{ fontSize: 16 }} />
                  </CourseLink>
                </Box>
                {(course.certificates?.length || 0) > 0 ? (
                  <Box className="mt-4">
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        color: '#FF6B3D',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        fontWeight: 600,
                      }}
                    >
                      <CheckCircleIcon sx={{ fontSize: 16 }} />
                      Completed
                    </Typography>
                    {course.certificates?.map((cert) => (
                      <Box key={cert.id} className="mt-2">
                        <StyledChip
                          label={`${cert.provider} Certificate`}
                          size="small"
                          className="mr-2"
                        />
                        <CourseLink
                          href={cert.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Certificate
                        </CourseLink>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <CertificateSubmission
                    courseId={course.id}
                    courseTitle={course.title}
                    onSuccess={handleCertificateSuccess}
                  />
                )}
              </CardContent>
            </StyledCard>
          </motion.div>
        ))}
      </Box>
    </motion.div>
  );
}