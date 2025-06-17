import { Box, Typography, List, ListItem, ListItemText, ListItemIcon, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import SchoolIcon from '@mui/icons-material/School';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { styled } from '@mui/material/styles';

interface Course {
  id: string;
  title: string;
  description: string | null;
  progress: number;
  updatedAt: string;
}

interface RecentCoursesProps {
  courses?: Course[];
}

const StyledListItem = styled(ListItem)(({ theme }) => ({
  backgroundColor: '#FFFFFF',
  borderRadius: '12px',
  marginBottom: theme.spacing(1),
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateX(4px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#F8FAFC',
    '& .course-title': {
      color: '#FF6B3D',
    },
    '& .MuiListItemIcon-root': {
      color: '#FF6B3D',
    }
  }
}));

const CourseTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: 500,
  transition: 'all 0.3s ease-in-out',
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  backgroundColor: 'rgba(78, 205, 196, 0.1)',
  color: '#4ECDC4',
  fontWeight: 500,
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
  }
}));

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function RecentCourses({ courses = [] }: RecentCoursesProps) {
  if (!courses.length) {
    return (
      <Box className="text-center py-8">
        <Typography variant="body1" className="text-gray-500">
          No courses in progress. Start your learning journey!
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" className="mb-4 flex items-center gap-2">
        <SchoolIcon className="text-[#4ECDC4]" />
        Recent Courses
      </Typography>
      <List className="space-y-2">
        {courses.map((course, index) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StyledListItem>
              <ListItemIcon>
                <SchoolIcon className="text-[#4ECDC4]" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <CourseTitle variant="subtitle1" className="course-title">
                    {course.title}
                  </CourseTitle>
                }
                secondary={
                  <Box className="flex items-center gap-2 mt-1">
                    <StyledChip
                      size="small"
                      label={`${course.progress}% Complete`}
                    />
                    <Box className="flex items-center text-gray-500 text-sm">
                      <AccessTimeIcon className="text-sm mr-1" />
                      {new Date(course.updatedAt).toLocaleDateString()}
                    </Box>
                  </Box>
                }
              />
            </StyledListItem>
          </motion.div>
        ))}
      </List>
    </Box>
  );
} 