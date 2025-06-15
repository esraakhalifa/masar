import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Box, Paper, Typography } from '@mui/material';
import { motion } from 'framer-motion';

interface Topic {
  id: string;
  title: string;
  order: number;
}

interface RoadmapDiagramProps {
  topics: Topic[];
  onTopicClick: (topicId: string) => void;
}

const COLORS = [
  '#4FD1C5', // Teal
  '#F6AD55', // Orange
  '#48BB78', // Green
  '#4299E1', // Blue
  '#F687B3', // Pink
  '#E53E3E', // Red
];

export default function RoadmapDiagram({ topics, onTopicClick }: RoadmapDiagramProps) {
  const diagramRef = useRef<HTMLDivElement>(null);
  const [diagramSvg, setDiagramSvg] = useState<string>('');
  const [renderKey, setRenderKey] = useState(0);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      flowchart: {
        htmlLabels: true,
        curve: 'basis',
        padding: 15,
        nodeSpacing: 50,
        rankSpacing: 50,
      },
    });
  }, []);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!diagramRef.current || topics.length === 0) return;

      const sortedTopics = [...topics].sort((a, b) => a.order - b.order);
      const numColumns = 3;
      const topicsPerColumn = Math.ceil(sortedTopics.length / numColumns);

      const diagramDefinition = `
        graph LR
          classDef default fill:#4FD1C5,stroke:#fff,color:#fff
          classDef topic1 fill:#4FD1C5,stroke:#fff,color:#fff,stroke-width:3px
          classDef topic2 fill:#F6AD55,stroke:#fff,color:#fff,stroke-width:3px
          classDef topic3 fill:#48BB78,stroke:#fff,color:#fff,stroke-width:3px
          classDef topic4 fill:#4299E1,stroke:#fff,color:#fff,stroke-width:3px
          classDef topic5 fill:#F687B3,stroke:#fff,color:#fff,stroke-width:3px
          classDef topic6 fill:#E53E3E,stroke:#fff,color:#fff,stroke-width:3px

          subgraph Column1
            direction TB
            ${sortedTopics.slice(0, topicsPerColumn).map((topic, index) => {
              const nodeId = `topic${index}`;
              const colorClass = `topic${(index % 6) + 1}`;
              return `${nodeId}["${topic.title}"]:::${colorClass}`;
            }).join('\n')}
          end

          subgraph Column2
            direction TB
            ${sortedTopics.slice(topicsPerColumn, topicsPerColumn * 2).map((topic, index) => {
              const nodeId = `topic${index + topicsPerColumn}`;
              const colorClass = `topic${((index + topicsPerColumn) % 6) + 1}`;
              return `${nodeId}["${topic.title}"]:::${colorClass}`;
            }).join('\n')}
          end

          subgraph Column3
            direction TB
            ${sortedTopics.slice(topicsPerColumn * 2).map((topic, index) => {
              const nodeId = `topic${index + topicsPerColumn * 2}`;
              const colorClass = `topic${((index + topicsPerColumn * 2) % 6) + 1}`;
              return `${nodeId}["${topic.title}"]:::${colorClass}`;
            }).join('\n')}
          end

          ${sortedTopics.map((topic, index) => {
            const nextTopic = sortedTopics[index + 1];
            if (nextTopic) {
              const currentColumn = Math.floor(index / topicsPerColumn);
              const nextColumn = Math.floor((index + 1) / topicsPerColumn);
              if (currentColumn !== nextColumn) {
                return `topic${index} ==> topic${index + 1}`;
              }
            }
            return '';
          }).filter(Boolean).join('\n')}
      `;

      try {
        const { svg } = await mermaid.render(`roadmap-diagram-${renderKey}`, diagramDefinition);
        
        // Add click handlers to the SVG nodes
        const parser = new DOMParser();
        const doc = parser.parseFromString(svg, 'image/svg+xml');
        
        const nodes = doc.querySelectorAll('.node');
        nodes.forEach((node, index) => {
          if (index < sortedTopics.length) {
            node.setAttribute('data-topic-id', sortedTopics[index].id);
            node.setAttribute('style', 'cursor: pointer;');
          }
        });
        
        setDiagramSvg(doc.documentElement.outerHTML);
      } catch (error) {
        console.error('Error rendering diagram:', error);
      }
    };

    renderDiagram();
  }, [topics, renderKey]);

  useEffect(() => {
    setRenderKey(prev => prev + 1);
  }, [topics]);

  const handleNodeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const node = target.closest('.node');
    if (node) {
      const topicId = node.getAttribute('data-topic-id');
      if (topicId) {
        onTopicClick(topicId);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          borderRadius: 2,
          background: 'linear-gradient(145deg, #9F7AEA 0%, #6B46C1 100%)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Typography 
          variant="h5" 
          sx={{ 
            mb: 3, 
            color: '#fff',
            fontWeight: 600,
            textAlign: 'center'
          }}
        >
          Your Learning Path
        </Typography>
        <Box
          ref={diagramRef}
          onClick={handleNodeClick}
          sx={{
            width: '100%',
            minHeight: '400px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            '& .node': {
              cursor: 'pointer',
              '&:hover': {
                filter: 'brightness(1.1)',
              },
              '& rect': {
                rx: '12px',
                ry: '12px',
                stroke: '#ffffff',
                strokeWidth: '3px',
                filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2))',
              },
              '& text': {
                fill: '#ffffff',
                fontWeight: 600,
                fontSize: '14px',
                pointerEvents: 'none',
              },
            },
            '& .edgePath path': {
              stroke: '#ffffff',
              strokeWidth: '3px',
              filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))',
            },
          }}
          dangerouslySetInnerHTML={{ __html: diagramSvg }}
        />
      </Paper>
    </motion.div>
  );
} 