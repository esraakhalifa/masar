"use client";

import { useState } from 'react';
import { 
  Box, 
  Drawer, 
  IconButton, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon,
  ListItemText, 
  Typography,
  useTheme,
  AppBar,
  Toolbar
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SchoolIcon from '@mui/icons-material/School';
import BarChartIcon from '@mui/icons-material/BarChart';
import Link from 'next/link';
import { styled } from '@mui/material/styles';
import '../globals.css';

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  py: 2,
  px: 3,
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    backgroundColor: 'rgba(255, 127, 80, 0.1)',
    '& .MuiListItemIcon-root': {
      color: '#E65C2E', // Darker coral orange
    },
    '& .MuiListItemText-primary': {
      color: '#E65C2E', // Darker coral orange
    },
  },
}));

const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
  color: theme.palette.text.secondary,
  minWidth: 40,
  transition: 'color 0.3s ease-in-out',
}));

const StyledListItemText = styled(ListItemText)(({ theme }) => ({
  '& .MuiListItemText-primary': {
    fontWeight: 500,
    color: theme.palette.text.primary,
    transition: 'color 0.3s ease-in-out',
  },
}));

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const theme = useTheme();

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, href: '/dashboard' },
    { text: 'Courses', icon: <SchoolIcon />, href: '/dashboard/courses' },
    { text: 'Statistics', icon: <BarChartIcon />, href: '/dashboard/statistics' },
  ];

  const SidebarContent = () => (
    <Box sx={{ 
      width: 280,
      height: '100%',
      background: 'white',
      borderRight: `1px solid ${theme.palette.divider}`,
    }}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ 
          fontWeight: 600,
          color: theme.palette.primary.main,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          Masar
        </Typography>
      </Box>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <StyledListItemButton
              component={Link}
              href={item.href}
            >
              <StyledListItemIcon>
                {item.icon}
              </StyledListItemIcon>
              <StyledListItemText primary={item.text} />
            </StyledListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <html lang="en">
      <body>
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          {/* App Bar */}
          <AppBar 
            position="fixed" 
            sx={{ 
              zIndex: (theme) => theme.zIndex.drawer + 1,
              backgroundColor: 'white',
              boxShadow: 'none',
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Toolbar>
              <IconButton
                onClick={handleToggleSidebar}
                sx={{ 
                  color: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 127, 80, 0.1)',
                    color: '#E65C2E',
                  },
                }}
              >
                <MenuIcon />
              </IconButton>
            </Toolbar>
          </AppBar>

          {/* Sidebar */}
          <Drawer
            variant="temporary"
            open={sidebarOpen}
            onClose={handleToggleSidebar}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                border: 'none',
              },
            }}
          >
            <SidebarContent />
          </Drawer>

          {/* Main Content */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              width: '100%',
              backgroundColor: theme.palette.background.default,
            }}
          >
            <Toolbar />
            {children}
          </Box>
        </Box>
      </body>
    </html>
  );
}