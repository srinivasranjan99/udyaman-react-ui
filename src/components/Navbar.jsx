import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Menu,
  MenuItem,
  Container,
  Chip,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';
import BarChartIcon from '@mui/icons-material/BarChart';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { useAuth } from '../context/AuthContext';
import { RoleGate, PermissionGate } from './RoleGate';
import { ROLES, PERMISSIONS } from '../utils/rbac';
import { useState } from 'react';

/**
 * Navigation bar with role-based menu items
 */
export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              textDecoration: 'none',
              color: 'white',
              fontWeight: 'bold',
              marginRight: 'auto',
            }}
          >
            🏭 Udyaman ERP
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {isAuthenticated ? (
              <>
                {/* Dashboard - All authenticated users */}
                <NavLink to="/" icon={<DashboardIcon />} label="Dashboard" />

                {/* Users - SUPER_ADMIN and TENANT_ADMIN */}
                <RoleGate requiredRoles={[ROLES.ADMIN, ROLES.MANAGER]}>
                  <NavLink to="/users" icon={<PeopleIcon />} label="Users" />
                </RoleGate>

                {/* Roles - SUPER_ADMIN and TENANT_ADMIN */}
                <RoleGate requiredRoles={[ROLES.ADMIN, ROLES.MANAGER]}>
                  <NavLink to="/roles" icon={<SecurityIcon />} label="Roles" />
                </RoleGate>

                {/* Admin Panel - SUPER_ADMIN only */}
                <RoleGate requiredRoles={ROLES.ADMIN}>
                  <NavLink to="/admin" icon={<AdminPanelSettingsIcon />} label="Admin" />
                </RoleGate>

                {/* Reports - All users with permission */}
                <PermissionGate requiredPermissions={PERMISSIONS.VIEW_REPORTS}>
                  <NavLink to="/reports" icon={<BarChartIcon />} label="Reports" />
                </PermissionGate>

                {/* User Menu Dropdown */}
                <Box
                  onClick={handleMenuOpen}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                    marginLeft: 2,
                  }}
                >
                  <AccountCircleIcon sx={{ marginRight: 1 }} />
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {user?.username}
                    </Typography>
                    <RoleBadge roles={user?.roles} />
                  </Box>
                </Box>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem disabled>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {user?.email}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#666' }}>
                        {user?.roles?.map(r => String(r).replace(/^ROLE_/, '')).join(', ')}
                      </Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button color="inherit" component={Link} to="/login">
                  Login
                </Button>
                <Button color="inherit" component={Link} to="/register">
                  Register
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

/**
 * Navigation link component
 */
function NavLink({ to, icon, label }) {
  return (
    <Button
      color="inherit"
      component={Link}
      to={to}
      sx={{
        display: 'flex',
        gap: 1,
        alignItems: 'center',
        '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
      }}
    >
      {icon}
      {label}
    </Button>
  );
}

/**
 * Role badge component showing user's role(s)
 */
function RoleBadge({ roles }) {
  if (!roles || roles.length === 0) return null;

  const getRoleColor = (role) => {
    switch (role) {
      case ROLES.ADMIN:
        return 'error';
      case ROLES.MANAGER:
        return 'warning';
      case ROLES.USER:
        return 'info';
      default:
        return 'default';
    }
  };

  const primaryRoleRaw = roles[0];
  const primaryRole = String(primaryRoleRaw || '').replace(/^ROLE_/, '');
  const colorKey = getRoleColor(primaryRole);

  return (
    <Chip
      label={primaryRole}
      color={colorKey}
      size="small"
      variant="outlined"
      sx={{
        fontSize: '0.65rem',
        height: '18px',
        color: 'white',
        backgroundColor: colorKey === 'error'
          ? '#d32f2f'
          : colorKey === 'warning'
            ? '#f57c00'
            : '#1976d2',
      }}
    />
  );
}

