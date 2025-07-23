'use client'
import React, { useState } from 'react';
import { Box, Drawer, IconButton, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { Menu as MenuIcon, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import ListIcon from '@mui/icons-material/ListAlt';
import ChatIcon from '@mui/icons-material/Chat';
import { useRouter } from 'next/navigation';

const drawerWidth = 240;

const LeftMenu = () => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const router = useRouter(); // Initialize useRouter from 'next/navigation'

  // Handle the open/close of the drawer
  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  // Handle navigation
  const handleNavigation = (path) => {
    setOpen(false);
    router.push(path); // Use router.push to navigate to the desired path
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Left Menu Drawer */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: '#1b1b1b', // Dark background
            color: '#e0e0e0', // Light text color
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', padding: theme.spacing(1) }}>
          <IconButton onClick={handleDrawerToggle} sx={{ color: '#e0e0e0' }}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </Box>
        <Divider />
        {/* Menu Options */}
        <List>
          {/* Playground Option */}
          <ListItem
            onClick={() => handleNavigation('/')}
            sx={{
              '&:hover': {
                backgroundColor: '#333', // Darker background on hover
                cursor: 'pointer', // Hand icon on hover
              },
            }}
          >
            <ListItemIcon sx={{ color: '#e0e0e0' }}>
              <ChatIcon />
            </ListItemIcon>
            <ListItemText primary="New Conversation" />
          </ListItem>
          {/* Conversations Option */}
          <ListItem
            onClick={() => handleNavigation('/conversations')}
            sx={{
              '&:hover': {
                backgroundColor: '#333', // Darker background on hover
                cursor: 'pointer', // Hand icon on hover
              },
            }}
          >
            <ListItemIcon sx={{ color: '#e0e0e0' }}>
              <ListIcon />
            </ListItemIcon>
            <ListItemText primary="Conversations List" />
          </ListItem>
        </List>
      </Drawer>

      {/* Menu Toggle Button */}
      <Box sx={{ backgroundColor: '#1b1b1b' }}>
        <IconButton
          onClick={handleDrawerToggle}
          sx={{
            marginTop: '20px',
            marginLeft: '10px',
            color: '#e0e0e0', // Light text color
          }}
        >
          <MenuIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default LeftMenu;
