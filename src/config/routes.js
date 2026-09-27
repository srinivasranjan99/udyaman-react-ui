import { ROLES, PERMISSIONS } from '../utils/rbac';

// Page imports will be done dynamically
// This file defines route configuration with role-based access

export const routeConfig = [
  {
    path: '/',
    name: 'Dashboard',
    icon: 'Dashboard',
    requiredRoles: null, // All authenticated users
    requiredPermissions: null,
    public: false,
  },
  {
    path: '/users',
    name: 'Users',
    icon: 'People',
    requiredRoles: [ROLES.ADMIN, ROLES.MANAGER],
    requiredPermissions: PERMISSIONS.USER_READ,
    public: false,
  },
  {
    path: '/roles',
    name: 'Roles',
    icon: 'Security',
    requiredRoles: [ROLES.ADMIN, ROLES.MANAGER],
    requiredPermissions: PERMISSIONS.ROLE_READ,
    public: false,
  },
  {
    path: '/admin',
    name: 'Admin Panel',
    icon: 'AdminPanelSettings',
    requiredRoles: ROLES.ADMIN,
    requiredPermissions: PERMISSIONS.ADMIN_PANEL,
    public: false,
  },
  {
    path: '/audit-logs',
    name: 'Audit Logs',
    icon: 'History',
    requiredRoles: ROLES.ADMIN,
    requiredPermissions: PERMISSIONS.AUDIT_LOGS,
    public: false,
  },
  {
    path: '/reports',
    name: 'Reports',
    icon: 'BarChart',
    requiredRoles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER],
    requiredPermissions: PERMISSIONS.VIEW_REPORTS,
    public: false,
  },
  {
    path: '/billing',
    name: 'POS Billing',
    icon: 'PointOfSale',
    requiredRoles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER],
    requiredPermissions: null, // Open to all staff for now
    public: false,
  },
];

/**
 * Public routes that don't require authentication
 */
export const publicRoutes = [
  {
    path: '/login',
    name: 'Login',
    public: true,
  },
  {
    path: '/register',
    name: 'Register',
    public: true,
  },
];

/**
 * Get routes accessible by user
 */
export const getAccessibleRoutes = (userRoles) => {
  if (!userRoles) return [];

  return routeConfig.filter(route => {
    // If no role requirement, all authenticated users can access
    if (!route.requiredRoles && !route.requiredPermissions) {
      return true;
    }

    // Check role requirement
    if (route.requiredRoles) {
      const roles = Array.isArray(route.requiredRoles)
        ? route.requiredRoles
        : [route.requiredRoles];

      const hasRequiredRole = roles.some(role => userRoles.includes(role));
      if (!hasRequiredRole) return false;
    }

    return true;
  });
};

/**
 * Get navigation items for sidebar/menu
 */
export const getNavItems = (userRoles) => {
  return getAccessibleRoutes(userRoles);
};

export default {
  routeConfig,
  publicRoutes,
  getAccessibleRoutes,
  getNavItems,
};

