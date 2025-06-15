import { Box, Typography, List, ListItem, ListItemText, Divider } from '@mui/material';

interface Activity {
  id: string;
  title: string;
  description?: string | null;
  date: string;
  type: 'course' | 'task';
  topicTitle?: string;
}

interface RecentActivitiesProps {
  activities: Activity[];
  title: string;
  emptyMessage: string;
}

export default function RecentActivities({ activities, title, emptyMessage }: RecentActivitiesProps) {
  return (
    <Box className="h-full flex flex-col">
      <Typography variant="h6" className="mb-4">{title}</Typography>
      {activities.length > 0 ? (
        <List className="flex-1">
          {activities.map((activity, index) => (
            <Box key={activity.id}>
              <ListItem className="text-gray-700">
                <ListItemText
                  primary={activity.title}
                  secondary={
                    <>
                      {activity.type === 'task' && activity.topicTitle && (
                        <span className="block text-sm text-gray-500">
                          Topic: {activity.topicTitle}
                        </span>
                      )}
                      <span className="block text-sm text-gray-500">
                        Completed: {new Date(activity.date).toLocaleDateString()}
                      </span>
                    </>
                  }
                />
              </ListItem>
              {index < activities.length - 1 && <Divider />}
            </Box>
          ))}
        </List>
      ) : (
        <Typography variant="body1" className="text-gray-600 flex-1 flex items-center justify-center">
          {emptyMessage}
        </Typography>
      )}
    </Box>
  );
} 