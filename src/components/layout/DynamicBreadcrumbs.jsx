import React from 'react';
import { Breadcrumbs, Link, Typography, Box } from '@mui/material';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import { NavigateNext as NavigateNextIcon, Home as HomeIcon } from '@mui/icons-material';
import { navigationConfig } from '../../config/navigation';

/**
 * DynamicBreadcrumbs: Automatically generates a clickable breadcrumb trail
 * based on the current URL path, with human-readable titles from navigation config.
 */
const DynamicBreadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Helper to find title from navigation config
  const getTitle = (path, segment) => {
    // Check main items and sub-items
    for (const group of navigationConfig) {
      if (group.path === path) return group.title;
      if (group.items) {
        const item = group.items.find(i => i.path === path);
        if (item) return item.title;
      }
    }
    // Fallback: capitalize and remove dashes
    return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" sx={{ color: 'text.disabled' }} />} 
        aria-label="breadcrumb"
      >
        <Link 
          underline="hover" 
          color="inherit" 
          component={RouterLink} 
          to="/dashboard"
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            fontSize: '0.85rem',
            color: 'text.secondary',
            '&:hover': { color: 'primary.main' }
          }}
        >
          <HomeIcon sx={{ mr: 0.5, fontSize: '1.1rem' }} />
          Dashboard
        </Link>

        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          
          // Skip redundant segments
          if (value === 'dashboard') return null;

          // Detect dynamic IDs (UUIDs or numeric IDs)
          const isId = /^[0-9a-fA-F-]{24,36}$/.test(value) || !isNaN(value);
          const displayTitle = isId ? 'Details' : getTitle(to, value);

          return last ? (
            <Typography 
              key={to} 
              color="text.primary" 
              sx={{ fontSize: '0.85rem', fontWeight: 600 }}
            >
              {displayTitle}
            </Typography>
          ) : (
            <Link
              key={to}
              underline="hover"
              color="inherit"
              component={RouterLink}
              to={to}
              sx={{ 
                fontSize: '0.85rem', 
                color: 'text.secondary',
                '&:hover': { color: 'primary.main' }
              }}
            >
              {displayTitle}
            </Link>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
};

export default DynamicBreadcrumbs;
