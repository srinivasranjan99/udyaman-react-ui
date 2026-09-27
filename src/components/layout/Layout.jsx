import React, { useState } from 'react';
import {
  Box, Drawer, AppBar, Toolbar, Typography, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, IconButton, Menu, MenuItem,
  Divider, useMediaQuery, useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BarChartIcon from '@mui/icons-material/BarChart';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CategoryIcon from '@mui/icons-material/Category';
import BusinessIcon from '@mui/icons-material/Business';
import HistoryIcon from '@mui/icons-material/History';
import BarcodeIcon from '@mui/icons-material/QrCode2';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import SettingsIcon from '@mui/icons-material/Settings';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Collapse from '@mui/material/Collapse';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES, PERMISSIONS, hasRole, hasPermission } from '../../utils/rbac';

const DRAWER_WIDTH = 260;

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // If not authenticated, render without layout (e.g., Login/Register pages)
  if (!isAuthenticated) {
    return <Box>{children}</Box>;
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  // Role/Permission checkers
  const checkRole = (roles) => {
    if (!roles) return true;
    return hasRole(user?.roles, roles);
  };
  const checkPermission = (perm) => {
    if (!perm) return true;
    return hasPermission(user?.roles, perm);
  };

  const menuGroups = [
    {
      title: 'Material Management',
      icon: <InventoryIcon />,
      items: [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
        { text: 'Materials', icon: <InventoryIcon />, path: '/inventory', reqPerm: PERMISSIONS.PRODUCT_READ },
        { text: 'Categories', icon: <CategoryIcon />, path: '/categories', reqPerm: PERMISSIONS.PRODUCT_READ },
        { text: 'Inventory', icon: <BarChartIcon />, path: '/inventory/ledger', reqPerm: PERMISSIONS.PRODUCT_READ },
        { text: 'Procurement', icon: <ShoppingCartIcon />, path: '/purchase', reqPerm: PERMISSIONS.PO_READ },
        { text: 'Adjustments', icon: <HistoryIcon />, path: '/inventory/adjustments', reqPerm: PERMISSIONS.PRODUCT_READ },
        { text: 'Reports', icon: <BarChartIcon />, path: '/reports', reqPerm: PERMISSIONS.VIEW_REPORTS },
      ]
    },
    {
      title: 'Sales & Billing',
      icon: <ReceiptIcon />,
      items: [
        { text: 'POS Terminal', icon: <PointOfSaleIcon />, path: '/billing', reqPerm: PERMISSIONS.SALE_READ },
      ]
    },
    {
      title: 'Administration',
      icon: <SettingsIcon />,
      items: [
        { text: 'Suppliers', icon: <BusinessIcon />, path: '/suppliers', reqPerm: PERMISSIONS.PRODUCT_READ },
        { text: 'Audit Logs', icon: <HistoryIcon />, path: '/audit', reqPerm: PERMISSIONS.AUDIT_LOGS },
        { text: 'Users', icon: <PeopleIcon />, path: '/users', reqRoles: [ROLES.ADMIN, ROLES.MANAGER], reqPerm: PERMISSIONS.USER_READ },
        { text: 'Roles', icon: <SecurityIcon />, path: '/roles', reqRoles: [ROLES.ADMIN, ROLES.MANAGER], reqPerm: PERMISSIONS.ROLE_READ },
        { text: 'Form Architect', icon: <AdminPanelSettingsIcon />, path: '/admin/fields', reqRoles: ROLES.ADMIN, reqPerm: PERMISSIONS.ADMIN_PANEL },
      ]
    },
    {
      title: 'Platform Admin',
      icon: <SecurityIcon />,
      reqRoles: [ROLES.SUPER_ADMIN],
      items: [
        { text: 'Tenant Mgmt', icon: <BusinessIcon />, path: '/system-admin/tenants' },
        { text: 'Global Users', icon: <PeopleIcon />, path: '/system-admin/users' },
        { text: 'System Reports', icon: <BarChartIcon />, path: '/system-admin/reports' },
        { text: 'Global Audit', icon: <HistoryIcon />, path: '/system-admin/audit' },
      ]
    }
  ];

  const NavItem = ({ item }) => {
    if (item.reqRoles && !checkRole(item.reqRoles)) return null;
    if (item.reqPerm && !checkPermission(item.reqPerm)) return null;

    const isSelected = location.pathname === item.path;

    return (
      <ListItem disablePadding>
        <ListItemButton
          component={Link}
          to={item.path}
          onClick={() => isMobile && setMobileOpen(false)}
          sx={{
            borderRadius: 2,
            mb: 0.5,
            pl: 4,
            backgroundColor: isSelected ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
            color: isSelected ? '#1976d2' : 'text.secondary',
            '&:hover': {
              backgroundColor: 'rgba(25, 118, 210, 0.12)',
            }
          }}
        >
          <ListItemIcon sx={{ color: isSelected ? '#1976d2' : 'inherit', minWidth: 35 }}>
            {React.cloneElement(item.icon, { sx: { fontSize: 20 } })}
          </ListItemIcon>
          <ListItemText
            primary={item.text}
            primaryTypographyProps={{ 
              variant: 'body2',
              fontWeight: isSelected ? 'bold' : 'medium' 
            }}
          />
        </ListItemButton>
      </ListItem>
    );
  };

  const NavGroup = ({ group }) => {
    const [open, setOpen] = useState(true); // Default open for ERP efficiency
    
    if (group.reqRoles && !checkRole(group.reqRoles)) return null;
    
    // Check if any child item is visible to the user
    const hasVisibleItems = group.items.some(item => {
      const roleOk = !item.reqRoles || checkRole(item.reqRoles);
      const permOk = !item.reqPerm || checkPermission(item.reqPerm);
      return roleOk && permOk;
    });

    if (!hasVisibleItems) return null;

    return (
      <Box sx={{ mb: 2 }}>
        <ListItemButton 
          onClick={() => setOpen(!open)}
          sx={{ 
            borderRadius: 2, 
            mb: 0.5,
            color: 'text.primary',
            '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>
            {group.icon}
          </ListItemIcon>
          <ListItemText 
            primary={group.title} 
            primaryTypographyProps={{ variant: 'subtitle2', fontWeight: 'bold' }}
          />
          {open ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
        </ListItemButton>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {group.items.map((item) => (
              <NavItem key={item.text} item={item} />
            ))}
          </List>
        </Collapse>
      </Box>
    );
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ backgroundColor: '#1976d2', color: '#fff', justifyContent: 'center' }}>
        <Typography variant="h6" fontWeight="bold">
          🏭 Udyaman ERP
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ flexGrow: 1, px: 2, pt: 2 }}>
        {menuGroups.map((group, index) => (
          <NavGroup key={index} group={group} />
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="textSecondary" display="block">
          Logged in as:
        </Typography>
        <Typography variant="body2" fontWeight="bold" color="primary">
          {user?.tenantId || 'DEFAULT'} Workspace
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f7fa' }}>
      
      {/* Top Header */}
      <AppBar 
        position="fixed" 
        elevation={0}
        className="no-print"
        sx={{ 
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` }, 
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: '#fff',
          color: '#333',
          borderBottom: '1px solid #e0e0e0'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ flexGrow: 1 }} />
          
          {/* User Profile Menu */}
          <Box
            onClick={handleMenuOpen}
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              p: 0.5,
              pr: 1.5,
              borderRadius: 8,
              border: '1px solid #e0e0e0',
              '&:hover': { bgcolor: '#f5f5f5' }
            }}
          >
            <AccountCircleIcon sx={{ color: '#1976d2', fontSize: 36, mr: 1 }} />
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, flexDirection: 'column', alignItems: 'flex-start' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', lineHeight: 1 }}>
                {user?.firstName || user?.username}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {user?.roles?.[0]?.replace('ROLE_', '') || 'User'}
              </Typography>
            </Box>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{ elevation: 3, sx: { mt: 1, minWidth: 200 } }}
          >
            <Box sx={{ px: 2, py: 1.5, outline: 'none' }}>
              <Typography variant="subtitle2" fontWeight="bold">{user?.email}</Typography>
              <Typography variant="caption" color="textSecondary">Username: {user?.username}</Typography>
            </Box>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main', py: 1.5 }}>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar Navigation */}
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }} className="no-print">
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }} // Better open performance on mobile
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {drawerContent}
        </Drawer>
        
        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, borderRight: '1px solid #e0e0e0' },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content Area */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: { xs: 2, md: 4 }, 
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: '64px', // Toolbar height offset
          overflowX: 'hidden'
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
