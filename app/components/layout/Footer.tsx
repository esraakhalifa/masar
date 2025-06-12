"use client"

import { Box, Container, Typography, Link as MuiLink, useTheme } from '@mui/material';

export function Footer() {
  const theme = useTheme();
  
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        color: 'white',
        borderTop: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            © {new Date().getFullYear()} Masar Learning. All rights reserved.
          </Typography>
          
          <Box
            sx={{
              display: 'flex',
              gap: 3,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <MuiLink 
              href="/about" 
              color="inherit" 
              underline="hover"
              sx={{ 
                opacity: 0.9,
                transition: 'opacity 0.2s',
                '&:hover': {
                  opacity: 1
                }
              }}
            >
              About
            </MuiLink>
            <MuiLink 
              href="/contact" 
              color="inherit" 
              underline="hover"
              sx={{ 
                opacity: 0.9,
                transition: 'opacity 0.2s',
                '&:hover': {
                  opacity: 1
                }
              }}
            >
              Contact
            </MuiLink>
            <MuiLink 
              href="/privacy" 
              color="inherit" 
              underline="hover"
              sx={{ 
                opacity: 0.9,
                transition: 'opacity 0.2s',
                '&:hover': {
                  opacity: 1
                }
              }}
            >
              Privacy Policy
            </MuiLink>
            <MuiLink 
              href="/terms" 
              color="inherit" 
              underline="hover"
              sx={{ 
                opacity: 0.9,
                transition: 'opacity 0.2s',
                '&:hover': {
                  opacity: 1
                }
              }}
            >
              Terms of Service
            </MuiLink>
          </Box>
        </Box>
      </Container>
    </Box>
  );
} 