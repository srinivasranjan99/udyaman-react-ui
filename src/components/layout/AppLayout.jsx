import React, { useState } from 'react';
import { Box, CssBaseline, Container } from '@mui/material';
import Sidebar from './AppSidebar';
import AppHeader from './AppHeader';
import DynamicBreadcrumbs from './DynamicBreadcrumbs';
import GlobalSearch from '../common/GlobalSearch';

/**
 * AppLayout: The primary layout shell for the Udyaman ERP.
 * Orchestrates Sidebar, Header, Breadcrumbs, and Global Search.
 */
const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* Sidebar Component */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main Layout Area */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          minHeight: '100vh', 
          bgcolor: '#f1f5f9',
          transition: 'all 0.3s ease',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Global Header */}
        <AppHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Page Content */}
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
          <DynamicBreadcrumbs />
          
          <Box sx={{ mt: 2 }}>
            {children}
          </Box>
        </Container>

        {/* Global Search Dialog (Controlled via Ctrl+K) */}
        <GlobalSearch />
      </Box>
    </Box>
  );
};

export default AppLayout;
