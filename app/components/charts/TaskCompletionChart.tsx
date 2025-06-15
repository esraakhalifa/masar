import { Box, Typography } from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface TaskCompletionData {
  date: string;
  count: number;
}

interface TaskCompletionChartProps {
  data: TaskCompletionData[];
}

export default function TaskCompletionChart({ data }: TaskCompletionChartProps) {
  const chartData = {
    labels: data.map(item => new Date(item.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Tasks Completed',
        data: data.map(item => item.count),
        borderColor: '#4ECDC4',
        backgroundColor: 'rgba(78, 205, 196, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Tasks Completed'
        },
        ticks: {
          stepSize: 1
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          title: (items: any) => {
            if (!items.length) return '';
            const date = new Date(items[0].label);
            return date.toLocaleDateString();
          },
          label: (item: any) => `Tasks completed: ${item.raw}`
        }
      }
    },
  };

  return (
    <Box className="h-full flex flex-col">
      <Typography variant="h6" className="mb-4">Task Completion Over Time</Typography>
      <Box className="flex-1 min-h-[250px]">
        <Line data={chartData} options={options} />
      </Box>
    </Box>
  );
} 