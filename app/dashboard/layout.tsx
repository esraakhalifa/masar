"use client";

import { useState } from 'react';
import { Box, Drawer, IconButton, List, ListItem, ListItemButton, ListItemText, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Link from 'next/link';
import '../globals.css';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const SidebarContent = () => (
    <Box className="bg-gradient-to-b from-teal-500 to-blue-600 h-full text-white">
      <Box className="p-4">
        <Typography variant="h5" className="font-bold text-white flex items-center gap-2">
          🚀 Masar
        </Typography>
      </Box>
      <List>
        {['Dashboard', 'Courses', 'Statistics'].map((text) => (
          <ListItem key={text} disablePadding>
            <ListItemButton
              component={Link}
              href={text === 'Dashboard' ? '/dashboard' : `/dashboard/${text.toLowerCase()}`}
              className="text-white hover:bg-teal-700 transition-colors duration-200 py-3 px-4"
            >
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <html lang="en">
      <body>
        <Box className="flex">
          {/* Persistent Sidebar for Desktop */}
          <Drawer
            variant="permanent"
            sx={{
              width: 240,
              flexShrink: 0,
              '& .MuiDrawer-paper': { width: 240, boxSizing: 'border-box', border: 'none' },
              display: { xs: 'none', md: 'block' },
            }}
          >
            <SidebarContent />
          </Drawer>

          {/* Main Content */}
          <Box className="flex-grow p-4 md:p-8">
            <IconButton
              onClick={handleToggleSidebar}
              className="md:hidden mb-4 text-teal-600"
              aria-label="open sidebar"
            >
              <MenuIcon />
            </IconButton>
            {children}
          </Box>

          {/* Temporary Sidebar for Mobile */}
          <Drawer
            variant="temporary"
            open={sidebarOpen}
            onClose={handleToggleSidebar}
            sx={{
              width: 240,
              flexShrink: 0,
              '& .MuiDrawer-paper': { width: 240, boxSizing: 'border-box', border: 'none' },
              display: { xs: 'block', md: 'none' },
            }}
          >
            <SidebarContent />
          </Drawer>
        </Box>
      </body>
    </html>
  );
}