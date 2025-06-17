import React from 'react';
import { Box, Typography } from '@mui/material';
import {
  School,
  Code,
  Lightbulb,
  TrendingUp,
  Psychology,
  Architecture,
} from '@mui/icons-material';

interface Topic {
  id: string;
  title: string;
  order: number;
}

interface RoadmapVisualizationProps {
  topics: Topic[];
  onTopicClick: (topicId: string) => void;
}

const getTopicIcon = (order: number) => {
  const icons = [School, Code, Lightbulb, TrendingUp, Psychology, Architecture];
  return icons[order % icons.length];
};

const gradients = [
  'linear-gradient(to right, #60a5fa, #3b82f6)',
  'linear-gradient(to right, #3b82f6, #2563eb)',
  'linear-gradient(to right, #38bdf8, #0ea5e9)',
  'linear-gradient(to right, #0ea5e9, #0284c7)',
];

export default function RoadmapVisualization({ topics, onTopicClick }: RoadmapVisualizationProps) {
  const sortedTopics = [...topics].sort((a, b) => a.order - b.order);

  const renderRow = (rowTopics: Topic[], rowIndex: number) => {
    const isVerticalRow = rowIndex % 2 === 1;
    const isReversed = rowIndex % 4 === 2;

    return (
      <Box
        key={`row-${rowIndex}`}
        sx={{
          display: 'flex',
          flexDirection: isVerticalRow ? 'column' : 'row',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          gap: 3,
          mb: 4,
          ...(isReversed && { flexDirection: 'row-reverse' }),
        }}
      >
        {rowTopics.map((topic, index) => {
          const IconComponent = getTopicIcon(topic.order);
          const gradient = gradients[topic.order % gradients.length];
          const isLast = index === rowTopics.length - 1;

          return (
            <Box
              key={topic.id}
              sx={{
                position: 'relative',
                width: '200px',
              }}
            >
              <Box
                onClick={() => onTopicClick(topic.id)}
                sx={{
                  padding: 2,
                  borderRadius: 2,
                  background: gradient,
                  color: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
                  },
                }}
              >
                <IconComponent sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="subtitle1" fontWeight="bold" textAlign="center">
                  {topic.title}
                </Typography>
              </Box>

              {!isLast && (
                <Box
                  sx={{
                    position: 'absolute',
                    ...(isVerticalRow
                      ? {
                          bottom: -24,
                          left: '50%',
                          height: '24px',
                          width: '2px',
                          transform: 'translateX(-50%)',
                        }
                      : {
                          top: '50%',
                          [isReversed ? 'left' : 'right']: -24,
                          width: '24px',
                          height: '2px',
                          transform: 'translateY(-50%)',
                        }),
                    backgroundColor: '#3b82f6',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      ...(isVerticalRow
                        ? {
                            bottom: -6,
                            left: -4,
                            borderLeft: '5px solid transparent',
                            borderRight: '5px solid transparent',
                            borderTop: '8px solid #3b82f6',
                          }
                        : {
                            [isReversed ? 'left' : 'right']: -6,
                            top: -4,
                            borderTop: '5px solid transparent',
                            borderBottom: '5px solid transparent',
                            [isReversed ? 'borderRight' : 'borderLeft']: '8px solid #3b82f6',
                          }),
                    },
                  }}
                />
              )}
            </Box>
          );
        })}
      </Box>
    );
  };

  const rows: Topic[][] = [];
  for (let i = 0; i < sortedTopics.length; i += 3) {
    const rowIndex = Math.floor(i / 3);
    const isVerticalRow = rowIndex % 2 === 1;
    const chunk = sortedTopics.slice(i, i + (isVerticalRow ? 2 : 3));
    rows.push(chunk);
  }

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth: '1000px',
        margin: '0 auto',
        py: 6,
        px: 4,
        background: '#f0f4f8',
        borderRadius: 4,
      }}
    >
      {rows.map((row, index) => renderRow(row, index))}
    </Box>
  );
}