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
} from '@mui/material';
import { motion } from 'framer-motion';
import CertificateSubmission from '@/app/components/CertificateSubmission';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeTab, setActiveTab] = useState(0);

  const fetchCourses = async () => {
    try {
      const userId = 'cmby26o8v0000fp5nbmuzfc4f'; // TODO: Get from auth context
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
    <Box className="max-w-7xl mx-auto p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Box className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          📚 Your Courses
        </Box>

        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ mb: 3 }}
        >
          <Tab label={`In Progress (${inProgressCourses.length})`} />
          <Tab label={`Completed (${completedCourses.length})`} />
        </Tabs>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          {(activeTab === 0 ? inProgressCourses : completedCourses).map((course) => (
            <Card key={course.id} className="h-full">
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  {course.title}
                </Typography>
                {course.description && (
                  <Typography color="text.secondary" paragraph>
                    {course.description}
                  </Typography>
                )}
                {course.instructors && (
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Instructors: {course.instructors}
                  </Typography>
                )}
                <Box className="mt-4">
                  <a
                    href={course.courseLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 hover:text-teal-700"
                  >
                    View Course →
                  </a>
                </Box>
                {(course.certificates?.length || 0) > 0 ? (
                  <Box className="mt-4">
                    <Typography variant="subtitle2" color="success.main">
                      ✓ Completed
                    </Typography>
                    {course.certificates?.map((cert) => (
                      <Box key={cert.id} className="mt-2">
                        <Chip
                          label={`${cert.provider} Certificate`}
                          color="success"
                          size="small"
                          className="mr-2"
                        />
                        <a
                          href={cert.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-teal-600 hover:text-teal-700"
                        >
                          View Certificate
                        </a>
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
            </Card>
          ))}
        </Box>
      </motion.div>
    </Box>
  );
}