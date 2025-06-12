"use client";

import { useEffect, useState } from 'react';
import { Box, CircularProgress, Alert, Typography } from "@mui/material";
import { motion, AnimatePresence } from 'framer-motion';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

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
  courses: Course[];
}

export default function CoursesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);

  useEffect(() => {
    const fetchRoadmapData = async () => {
      try {
        const userId = 'cmbtb68ll0014fp90sry7mkie';
        const response = await fetch(`/api/users/${userId}/roadmaps`);
        if (!response.ok) throw new Error(`Failed to fetch roadmap data: ${response.statusText}`);
        const data: Roadmap[] = await response.json();
        setRoadmap(data.length > 0 ? data[0] : null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching roadmap:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmapData();
  }, []);

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
    <Box className="max-w-7xl mx-auto p-4">
      <Typography variant="h4" className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        📚 Your Courses
      </Typography>
      {roadmap ? (
        <Box className="space-y-6">
          <AnimatePresence>
            {roadmap.courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="card p-6 flex flex-col md:flex-row items-center gap-4 bg-gradient-to-r from-yellow-100 to-orange-100"
              >
                <Box className="flex-1">
                  <Typography className="card-header">{course.title}</Typography>
                  {course.instructors && (
                    <Typography className="text-gray-600 text-sm mt-1">By {course.instructors}</Typography>
                  )}
                  {course.description && (
                    <Typography className="text-gray-500 text-sm mt-2">{course.description}</Typography>
                  )}
                </Box>
                <a
                  href={course.courseLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary flex items-center gap-2"
                >
                  Start Learning <OpenInNewIcon fontSize="small" />
                </a>
              </motion.div>
            ))}
          </AnimatePresence>
        </Box>
      ) : (
        <Box className="p-4 bg-yellow-100 rounded-lg">
          <Alert severity="info" className="rounded-lg">No roadmap found.</Alert>
        </Box>
      )}
    </Box>
  );
}