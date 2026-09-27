/**
 * Role and permission utility functions for RBAC
 * Centralized role/permission checking logic
 */

/**
 * Role hierarchy enum
 * SUPER_ADMIN > TENANT_ADMIN > STAFF
 */
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  TENANT_ADMIN: 'TENANT_ADMIN',
  STAFF: 'STAFF',
};

/**
 * Permission codes
 */
export const PERMISSIONS = {
  // User management
  USER_READ: 'USER_READ',
  USER_CREATE: 'USER_CREATE',
  USER_UPDATE: 'USER_UPDATE',
  USER_DELETE: 'USER_DELETE',

  // Role management
  ROLE_READ: 'ROLE_READ',
  ROLE_CREATE: 'ROLE_CREATE',
  ROLE_UPDATE: 'ROLE_UPDATE',
  ROLE_DELETE: 'ROLE_DELETE',
  ROLE_ASSIGN: 'ROLE_ASSIGN',

  // Admin access
  ADMIN_PANEL: 'ADMIN_PANEL',
  SYSTEM_CONFIG: 'SYSTEM_CONFIG',
  AUDIT_LOGS: 'AUDIT_LOGS',

  // Staff operations
  VIEW_REPORTS: 'VIEW_REPORTS',
  EXPORT_DATA: 'EXPORT_DATA',

  // Purchase management
  PO_READ: 'PO_READ',
  PO_CREATE: 'PO_CREATE',
  PO_UPDATE: 'PO_UPDATE',
  PO_DELETE: 'PO_DELETE',
  PO_APPROVE: 'PO_APPROVE',
  GRN_CREATE: 'GRN_CREATE',

  // Product management
  PRODUCT_READ: 'PRODUCT_READ',
  PRODUCT_CREATE: 'PRODUCT_CREATE',
  PRODUCT_UPDATE: 'PRODUCT_UPDATE',
  PRODUCT_DELETE: 'PRODUCT_DELETE',

  // Sale/Billing management
  SALE_READ: 'SALE_READ',
  SALE_CREATE: 'SALE_CREATE',
};

/**
 * Role hierarchy mapping
 * Determines what permissions each role has
 */
const rolePermissions = {
  [ROLES.TENANT_ADMIN]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.ROLE_READ,
    PERMISSIONS.ROLE_CREATE,
    PERMISSIONS.ROLE_UPDATE,
    PERMISSIONS.ROLE_DELETE,
    PERMISSIONS.ROLE_ASSIGN,
    PERMISSIONS.ADMIN_PANEL,
    PERMISSIONS.AUDIT_LOGS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.PO_READ,
    PERMISSIONS.PO_CREATE,
    PERMISSIONS.PO_UPDATE,
    PERMISSIONS.PO_DELETE,
    PERMISSIONS.PO_APPROVE,
    PERMISSIONS.GRN_CREATE,
    PERMISSIONS.PRODUCT_READ,
    PERMISSIONS.PRODUCT_CREATE,
    PERMISSIONS.PRODUCT_UPDATE,
    PERMISSIONS.PRODUCT_DELETE,
    PERMISSIONS.SALE_READ,
    PERMISSIONS.SALE_CREATE,
  ],
  [ROLES.STAFF]: [
    PERMISSIONS.PRODUCT_READ,
    PERMISSIONS.PO_READ,
    PERMISSIONS.PO_CREATE,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.SALE_READ,
    PERMISSIONS.SALE_CREATE,
  ],
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
};

/**
 * Normalize role string coming from backend (e.g. 'ROLE_ADMIN' -> 'ADMIN')
 * Accepts null/undefined and returns trimmed uppercase string
 */
const normalizeRoleString = (r) => {
  if (!r && r !== 0) return r;
  if (typeof r === 'object' && r.name) return normalizeRoleString(r.name);
  if (typeof r === 'object' && r.authority) return normalizeRoleString(r.authority);
  return String(r).replace(/^ROLE_/, '').trim().toUpperCase();
};

const normalizeRoles = (userRoles) => {
  if (!userRoles) return [];
  const arr = Array.isArray(userRoles) ? userRoles : [userRoles];
  return arr.map(normalizeRoleString).filter(Boolean);
};

/**
 * Check if user has role
 * @param {string|string[]} userRoles - User's roles
 * @param {string|string[]} requiredRoles - Required role(s)
 * @returns {boolean} - True if user has at least one required role
 */
export const hasRole = (userRoles, requiredRoles) => {
  if (!userRoles) return false;

  const rolesNorm = normalizeRoles(userRoles);
  const required = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  const requiredNorm = required.map(normalizeRoleString);

  return requiredNorm.some(role => rolesNorm.includes(role));
};

/**
 * Check if user has all required roles
 * @param {string|string[]} userRoles - User's roles
 * @param {string|string[]} requiredRoles - Required role(s)
 * @returns {boolean} - True if user has all required roles
 */
export const hasAllRoles = (userRoles, requiredRoles) => {
  if (!userRoles) return false;

  const rolesNorm = normalizeRoles(userRoles);
  const required = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  const requiredNorm = required.map(normalizeRoleString);

  return requiredNorm.every(role => rolesNorm.includes(role));
};

/**
 * Check if user has permission
 * @param {string|string[]} userRoles - User's roles
 * @param {string|string[]} requiredPermissions - Required permission(s)
 * @returns {boolean} - True if user has at least one required permission
 */
export const hasPermission = (userRoles, requiredPermissions) => {
  if (!userRoles) return false;

  const rolesNorm = normalizeRoles(userRoles);
  const permissions = Array.isArray(requiredPermissions)
    ? requiredPermissions
    : [requiredPermissions];

  // Get all permissions for user's roles
  const userPermissions = new Set();
  rolesNorm.forEach(role => {
    const rolePerms = rolePermissions[role] || [];
    rolePerms.forEach(perm => userPermissions.add(perm));
  });

  // Check if user has at least one required permission
  return permissions.some(perm => userPermissions.has(perm));
};

/**
 * Check if user has all required permissions
 * @param {string|string[]} userRoles - User's roles
 * @param {string|string[]} requiredPermissions - Required permission(s)
 * @returns {boolean} - True if user has all required permissions
 */
export const hasAllPermissions = (userRoles, requiredPermissions) => {
  if (!userRoles) return false;

  const rolesNorm = normalizeRoles(userRoles);
  const permissions = Array.isArray(requiredPermissions)
    ? requiredPermissions
    : [requiredPermissions];

  // Get all permissions for user's roles
  const userPermissions = new Set();
  rolesNorm.forEach(role => {
    const rolePerms = rolePermissions[role] || [];
    rolePerms.forEach(perm => userPermissions.add(perm));
  });

  // Check if user has all required permissions
  return permissions.every(perm => userPermissions.has(perm));
};

/**
 * Get all permissions for user's roles
 * @param {string|string[]} userRoles - User's roles
 * @returns {string[]} - Array of permissions
 */
export const getUserPermissions = (userRoles) => {
  if (!userRoles) return [];

  const rolesNorm = normalizeRoles(userRoles);
  const permissions = new Set();

  rolesNorm.forEach(role => {
    const rolePerms = rolePermissions[role] || [];
    rolePerms.forEach(perm => permissions.add(perm));
  });

  return Array.from(permissions);
};

/**
 * Get role level (higher number = more access)
 * @param {string} role - Role name
 * @returns {number} - Role level
 */
export const getRoleLevel = (role) => {
  const levels = {
    [ROLES.SUPER_ADMIN]: 10,
    [ROLES.TENANT_ADMIN]: 5,
    [ROLES.STAFF]: 1,
  };
  const norm = normalizeRoleString(role);
  return levels[norm] || 0;
};

/**
 * Get highest role level from array of roles
 * @param {string[]} roles - Array of roles
 * @returns {number} - Highest role level
 */
export const getHighestRoleLevel = (roles) => {
  if (!roles || !Array.isArray(roles)) return 0;
  const norm = normalizeRoles(roles);
  return Math.max(...norm.map(getRoleLevel), 0);
};

/**
 * Check if user's role is higher or equal to required role
 * @param {string|string[]} userRoles - User's roles
 * @param {string} requiredRole - Required role
 * @returns {boolean} - True if user's role level >= required role level
 */
export const hasHigherOrEqualRole = (userRoles, requiredRole) => {
  if (!userRoles) return false;
  const rolesNorm = normalizeRoles(userRoles);
  const userLevel = getHighestRoleLevel(rolesNorm);
  const requiredLevel = getRoleLevel(requiredRole);

  return userLevel >= requiredLevel;
};

/**
 * Filter items based on role
 * @param {Array} items - Items to filter
 * @param {string|string[]} userRoles - User's roles
 * @param {string|string[]} allowedRoles - Allowed role(s) for items
 * @returns {Array} - Filtered items
 */
export const filterByRole = (items, userRoles, allowedRoles) => {
  return items.filter(item => hasRole(userRoles, allowedRoles));
};

export default {
  ROLES,
  PERMISSIONS,
  hasRole,
  hasAllRoles,
  hasPermission,
  hasAllPermissions,
  getUserPermissions,
  getRoleLevel,
  getHighestRoleLevel,
  hasHigherOrEqualRole,
  filterByRole,
};

