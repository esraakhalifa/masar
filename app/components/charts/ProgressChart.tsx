import { Box, Typography } from '@mui/material';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ProgressChartProps {
  completed: number;
  total: number;
  percentage: number;
}

export default function ProgressChart({ completed, total, percentage }: ProgressChartProps) {
  const data = {
    labels: ['Completed', 'Remaining'],
    datasets: [
      {
        data: [completed, total - completed],
        backgroundColor: ['#4ECDC4', '#FF6B3D'],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#2D3748',
          font: {
            weight: 'normal' as const,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ${value} tasks`;
          }
        }
      }
    },
  };

  return (
    <Box className="h-full flex flex-col">
      <Typography variant="h6" className="mb-4">Overall Progress</Typography>
      <Box className="flex-1 min-h-[250px]">
        <Pie data={data} options={options} />
      </Box>
      <Typography className="text-center mt-4 text-lg font-semibold">
        {percentage.toFixed(1)}% Complete
      </Typography>
    </Box>
  );
} 