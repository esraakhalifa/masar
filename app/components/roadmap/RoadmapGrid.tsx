"use client"

import React from 'react';
import { Box, Container } from '@mui/material';
import { RoadmapTopicCard } from './RoadmapTopicCard';

interface Topic {
  id: string;
  title: string;
  description: string | null;
  order: number;
}

interface RoadmapGridProps {
  topics: Topic[];
  onTopicClick?: (topic: Topic) => void;
}

const colorVariants = ["green", "coral", "yellow"] as const;

export function RoadmapGrid({ topics, onTopicClick }: RoadmapGridProps) {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          },
          gap: 3,
        }}
      >
        {topics.map((topic, index) => (
          <RoadmapTopicCard
            key={topic.id}
            title={topic.title}
            description={topic.description || ''}
            order={topic.order}
            onClick={() => onTopicClick?.(topic)}
            variant={colorVariants[index % colorVariants.length]}
          />
        ))}
      </Box>
    </Container>
  );
} 