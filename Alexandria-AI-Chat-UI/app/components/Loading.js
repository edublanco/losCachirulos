import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const Loading = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh', // Full height of the page
        width: '100vw', // Full width of the page
        backgroundColor: '#1b1b1b', // Dark background
        color: '#e0e0e0' // Light text color
      }}
    >
      <CircularProgress
        sx={{
          color: theme.palette.primary.main, // Use the primary color from the theme
          marginBottom: theme.spacing(2)
        }}
        size={60} // Adjust size as needed
      />
      <Typography variant="h6" sx={{ color: '#e0e0e0' }}>
        Loading...
      </Typography>
    </Box>
  );
};

export default Loading;