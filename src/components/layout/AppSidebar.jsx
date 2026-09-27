import React, { useState, useEffect } from 'react';
import { 
  Drawer, List, ListItem, ListItemButton, ListItemIcon, 
  ListItemText, Collapse, Box, Typography, Divider, IconButton, Tooltip 
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ExpandLess,
  ExpandMore,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { navigationConfig } from '../../config/navigation';
import { hasPermission, hasRole } from '../../utils/rbac';
import { useAuth } from '../../context/AuthContext.jsx';

const Sidebar = ({ open, setOpen }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState({});

  // Persist expanded state
  useEffect(() => {
    const saved = localStorage.getItem('sidebar_expanded');
    if (saved) setExpanded(JSON.parse(saved));
  }, []);

  const handleToggle = (id) => {
    const newState = { ...expanded, [id]: !expanded[id] };
    setExpanded(newState);
    localStorage.setItem('sidebar_expanded', JSON.stringify(newState));
  };

  const drawerWidth = open ? 260 : 70;

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          transition: 'width 0.2s ease-in-out',
          bgcolor: '#0f172a', // Sleek Navy/Slate
          color: '#94a3b8',
          borderRight: 'none',
          overflowX: 'hidden'
        },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: open ? 'space-between' : 'center', height: 64 }}>
        {open && (
          <Typography variant="h6" fontWeight="bold" color="white" sx={{ letterSpacing: 1 }}>
            UDYAMAN<span style={{ color: '#3b82f6' }}>.</span>
          </Typography>
        )}
        <IconButton onClick={() => setOpen(!open)} sx={{ color: '#94a3b8' }}>
          {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />

      <List sx={{ px: 1, py: 2 }}>
        {navigationConfig.map((item) => {
          // Role-based check
          if (item.roles && !hasRole(user?.roles, item.roles)) return null;

          const Icon = item.icon;
          const isSelected = item.path && location.pathname.startsWith(item.path);
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expanded[item.id];

          return (
            <React.Fragment key={item.id}>
              <ListItem disablePadding sx={{ display: 'block', mb: 0.5 }}>
                <ListItemButton
                  onClick={() => hasChildren ? handleToggle(item.id) : navigate(item.path)}
                  selected={isSelected}
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                    borderRadius: 2,
                    mx: 0.5,
                    '&.Mui-selected': {
                      bgcolor: 'rgba(59, 130, 246, 0.1)',
                      color: '#3b82f6',
                      '& .MuiListItemIcon-root': { color: '#3b82f6' }
                    },
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.05)',
                      color: 'white',
                      '& .MuiListItemIcon-root': { color: 'white' }
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 0, mr: open ? 2 : 'auto', justifyContent: 'center', color: isSelected ? '#3b82f6' : 'inherit' }}>
                    <Icon fontSize="small" />
                  </ListItemIcon>
                  {open && (
                    <Typography 
                      sx={{ 
                        fontSize: '0.875rem', 
                        fontWeight: isSelected ? 600 : 400,
                        flexGrow: 1,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {item.label}
                    </Typography>
                  )}
                  {open && hasChildren && (isExpanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />)}
                </ListItemButton>
              </ListItem>

              {hasChildren && (
                <Collapse in={isExpanded && open} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding sx={{ mb: 1 }}>
                    {item.children.map((child) => {
                      const isChildSelected = location.pathname === child.path;
                      return (
                        <ListItemButton
                          key={child.path}
                          onClick={() => navigate(child.path)}
                          selected={isChildSelected}
                          sx={{
                            pl: 7,
                            py: 0.5,
                            borderRadius: 2,
                            mx: 1.5,
                            '&.Mui-selected': { bgcolor: 'transparent', color: '#3b82f6' },
                            '&:hover': { color: 'white', bgcolor: 'transparent' }
                          }}
                        >
                          <Typography 
                            sx={{ 
                              fontSize: '0.8rem', 
                              fontWeight: isChildSelected ? 600 : 400,
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {child.label}
                          </Typography>
                        </ListItemButton>
                      );
                    })}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          );
        })}
      </List>
    </Drawer>
  );
};

export default Sidebar;
