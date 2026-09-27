import React, { useState } from 'react';
import { 
  AppBar, Toolbar, IconButton, Typography, Box, Chip, Tooltip, Avatar,
  Menu, MenuItem, ListItemIcon, Divider
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Help as HelpIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext.jsx';
import { Badge } from '@mui/material';
import api from '../../api/axios';

/**
 * AppHeader: The primary navigation bar for the ERP.
 * Contains global search trigger, notifications, and user profile.
 */
const AppHeader = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [lowStockCount, setLowStockCount] = useState(0);

  React.useEffect(() => {
    const fetchLowStock = async () => {
      try {
        const res = await api.get('/inventory/products/alerts/low-stock');
        if (Array.isArray(res.data?.data)) {
          setLowStockCount(res.data.data.length);
        }
      } catch (err) {
        console.error("Failed to fetch low stock alerts for header", err);
      }
    };
    fetchLowStock();
  }, []);

  return (
    <AppBar 
      position="sticky" 
      elevation={0} 
      sx={{ 
        bgcolor: 'rgba(255, 255, 255, 0.8)', 
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid', 
        borderColor: 'divider',
        color: 'text.primary',
        zIndex: (theme) => theme.zIndex.drawer + 1
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton 
            edge="start" 
            color="inherit" 
            aria-label="menu" 
            onClick={onMenuClick}
            sx={{ display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              bgcolor: '#f1f5f9', 
              px: 2, 
              py: 0.5, 
              borderRadius: 2,
              cursor: 'pointer',
              border: '1px solid transparent',
              transition: '0.2s',
              '&:hover': { 
                bgcolor: 'white',
                borderColor: 'primary.main',
                boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
              },
              width: { xs: '40px', sm: '300px' },
              justifyContent: { xs: 'center', sm: 'flex-start' }
            }}
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true, key: 'k' }))}
          >
            <SearchIcon sx={{ color: 'text.secondary', mr: { xs: 0, sm: 1 }, fontSize: '1.2rem' }} />
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ display: { xs: 'none', sm: 'block' }, flexGrow: 1 }}
            >
              Search...
            </Typography>
            <Chip 
              label="Ctrl+K" 
              size="small" 
              sx={{ 
                height: 20, 
                fontSize: '0.65rem', 
                bgcolor: 'white', 
                border: '1px solid', 
                borderColor: 'divider',
                display: { xs: 'none', sm: 'flex' }
              }} 
            />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 2 } }}>
          <Tooltip title="Help Center">
            <IconButton size="small" color="inherit">
              <HelpIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title={lowStockCount > 0 ? `${lowStockCount} Low Stock Alerts` : "No Notifications"}>
            <IconButton size="small" color="inherit">
              <Badge badgeContent={lowStockCount} color="error" overlap="circular">
                <NotificationsIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
            <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'right' }}>
              <Typography variant="body2" fontWeight="bold">{user?.username || 'User'}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: -0.5 }}>
                {user?.roles?.[0] || 'Member'}
              </Typography>
            </Box>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0.5 }}>
              <Avatar 
                sx={{ 
                  width: 35, 
                  height: 35, 
                  bgcolor: 'primary.main', 
                  fontSize: '0.9rem',
                  fontWeight: 'bold'
                }}
              >
                {(user?.username || 'U')[0].toUpperCase()}
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              PaperProps={{ sx: { mt: 1.5, minWidth: 180, borderRadius: 2, boxShadow: 3 } }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2" fontWeight="bold">{user?.username}</Typography>
                <Typography variant="caption" color="text.secondary">{user?.email || 'No email set'}</Typography>
              </Box>
              <Divider />
              <MenuItem onClick={() => setAnchorEl(null)} sx={{ fontSize: '0.85rem' }}>
                <ListItemIcon><HelpIcon fontSize="small" /></ListItemIcon>
                Profile Settings
              </MenuItem>
              <MenuItem 
                onClick={() => {
                  setAnchorEl(null);
                  logout();
                }} 
                sx={{ fontSize: '0.85rem', color: 'error.main' }}
              >
                <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader;
