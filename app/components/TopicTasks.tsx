import { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  List, 
  ListItem, 
  Checkbox, 
  IconButton,
  Button,
  CircularProgress
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';

interface Task {
  id: string;
  title: string;
  description: string | null;
  isCompleted: boolean;
  order: number;
}

interface TopicTasksProps {
  topicTitle: string;
  tasks: Task[];
  onTaskToggle: (taskId: string, isCompleted: boolean) => Promise<void>;
  onBack: () => void;
}

export default function TopicTasks({ topicTitle, tasks, onTaskToggle, onBack }: TopicTasksProps) {
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const handleTaskToggle = async (taskId: string, currentStatus: boolean) => {
    setLoading(prev => ({ ...prev, [taskId]: true }));
    try {
      await onTaskToggle(taskId, !currentStatus);
    } finally {
      setLoading(prev => ({ ...prev, [taskId]: false }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          borderRadius: 2,
          background: 'linear-gradient(145deg, #ffffff 0%, #f5f7fa 100%)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton 
            onClick={onBack}
            sx={{ 
              mr: 2,
              color: '#4FD1C5',
              '&:hover': {
                backgroundColor: 'rgba(79, 209, 197, 0.1)'
              }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography 
            variant="h5" 
            sx={{ 
              color: '#2d3748',
              fontWeight: 600
            }}
          >
            {topicTitle}
          </Typography>
        </Box>

        <List sx={{ width: '100%' }}>
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ListItem
                sx={{
                  mb: 2,
                  p: 2,
                  borderRadius: 1,
                  backgroundColor: 'white',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  },
                }}
              >
                <Checkbox
                  checked={task.isCompleted}
                  onChange={() => handleTaskToggle(task.id, task.isCompleted)}
                  disabled={loading[task.id]}
                  sx={{
                    color: '#4FD1C5',
                    '&.Mui-checked': {
                      color: '#319795',
                    },
                  }}
                />
                <Box sx={{ ml: 2, flex: 1 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: '#2d3748',
                      textDecoration: task.isCompleted ? 'line-through' : 'none',
                      opacity: task.isCompleted ? 0.7 : 1,
                    }}
                  >
                    {task.title}
                  </Typography>
                  {task.description && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#718096',
                        mt: 0.5,
                      }}
                    >
                      {task.description}
                    </Typography>
                  )}
                </Box>
                {loading[task.id] && (
                  <CircularProgress
                    size={20}
                    sx={{ ml: 2, color: '#4FD1C5' }}
                  />
                )}
              </ListItem>
            </motion.div>
          ))}
        </List>
      </Paper>
    </motion.div>
  );
} 