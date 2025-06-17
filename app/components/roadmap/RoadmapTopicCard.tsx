"use client"

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Collapse,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  School,
  Person,
  Code,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

interface RoadmapTopicCardProps {
  title: string;
  description: string;
  order: number;
  onClick?: () => void;
  variant: "green" | "coral" | "yellow";
}

interface StyledCardProps {
  cardVariant: "green" | "coral" | "yellow";
}

const StyledCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'cardVariant',
})<StyledCardProps>(({ theme, cardVariant }) => {
  const getColor = () => {
    switch (cardVariant) {
      case "green":
        return theme.palette.primary.main;
      case "coral":
        return theme.palette.secondary.main;
      case "yellow":
        return theme.palette.warning.main;
      default:
        return theme.palette.primary.main;
    }
  };

  const getTextColor = () => {
    return cardVariant === "yellow" ? '#000' : '#fff';
  };

  return {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
    cursor: 'pointer',
    backgroundColor: getColor(),
    color: getTextColor(),
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: theme.shadows[8],
    },
  };
});

export function RoadmapTopicCard({
  title,
  description,
  order,
  onClick,
  variant,
}: RoadmapTopicCardProps) {
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const getIllustration = () => {
    const icons = [Person, School, Code];
    const IconComponent = icons[order % icons.length];
    return <IconComponent sx={{ fontSize: 80, opacity: 0.9 }} />;
  };

  const textColor = variant === "yellow" ? '#000' : '#fff';
  const buttonBorderColor = variant === "yellow" ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)';
  const buttonHoverBgColor = variant === "yellow" ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';

  return (
    <StyledCard cardVariant={variant} onClick={onClick}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            Topic {order}
          </Typography>
          <Box sx={{ mx: 1, opacity: 0.8 }}>•</Box>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            Software Engineering
          </Typography>
        </Box>

        <Box sx={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          {getIllustration()}
        </Box>

        <Typography variant="h5" gutterBottom>
          {title}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            opacity: 0.9,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: expanded ? 'unset' : 3,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {description}
        </Typography>

        <Box sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={handleExpandClick}
            sx={{
              borderRadius: '15px',
              borderColor: buttonBorderColor,
              '&:hover': { borderColor: textColor, bgcolor: buttonHoverBgColor }
            }}
            endIcon={<ExpandMoreIcon sx={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />}
          >
            {expanded ? 'Show Less' : 'Read More'}
          </Button>
        </Box>
      </CardContent>
    </StyledCard>
  );
}
