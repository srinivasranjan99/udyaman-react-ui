import React from 'react';
import { useAuth } from '../context/AuthContext';
import { hasRole, hasPermission, hasAllRoles, hasAllPermissions } from '../utils/rbac';

/**
 * RoleGate component for conditional rendering based on roles
 * Shows children only if user has required role(s)
 *
 * Examples:
 * <RoleGate requiredRole="SUPER_ADMIN">
 *   <AdminButton />
 * </RoleGate>
 *
 * <RoleGate requiredRoles={['SUPER_ADMIN', 'TENANT_ADMIN']}>
 *   <ManageButton />  // Shows if user has either role
 * </RoleGate>
 *
 * <RoleGate requiredAllRoles={['SUPER_ADMIN', 'TENANT_ADMIN']}>
 *   <SpecialButton />  // Shows only if user has both roles
 * </RoleGate>
 */
export function RoleGate({
  children,
  requiredRoles = null,
  requiredAllRoles = null,
  fallback = null
}) {
  const { user } = useAuth();

  if (!user || !user.roles) return fallback;

  // Check if user has any of the required roles
  if (requiredRoles !== null) {
    if (!hasRole(user.roles, requiredRoles)) {
      return fallback;
    }
  }

  // Check if user has all of the required roles
  if (requiredAllRoles !== null) {
    if (!hasAllRoles(user.roles, requiredAllRoles)) {
      return fallback;
    }
  }

  return children;
}

/**
 * PermissionGate component for conditional rendering based on permissions
 * Shows children only if user has required permission(s)
 *
 * Examples:
 * <PermissionGate requiredPermission="USER_CREATE">
 *   <CreateUserButton />
 * </PermissionGate>
 *
 * <PermissionGate requiredPermissions={['USER_CREATE', 'USER_UPDATE']}>
 *   <UserButton />  // Shows if user has either permission
 * </PermissionGate>
 *
 * <PermissionGate requiredAllPermissions={['USER_CREATE', 'USER_UPDATE']}>
 *   <AdminButton />  // Shows only if user has both permissions
 * </PermissionGate>
 */
export function PermissionGate({
  children,
  requiredPermissions = null,
  requiredAllPermissions = null,
  fallback = null
}) {
  const { user } = useAuth();

  if (!user || !user.roles) return fallback;

  // Check if user has any of the required permissions
  if (requiredPermissions !== null) {
    if (!hasPermission(user.roles, requiredPermissions)) {
      return fallback;
    }
  }

  // Check if user has all of the required permissions
  if (requiredAllPermissions !== null) {
    if (!hasAllPermissions(user.roles, requiredAllPermissions)) {
      return fallback;
    }
  }

  return children;
}

/**
 * Combined Gate component
 * Shows children only if user meets both role AND permission requirements
 */
export function AccessGate({
  children,
  requiredRoles = null,
  requiredPermissions = null,
  fallback = null
}) {
  const { user } = useAuth();

  if (!user || !user.roles) return fallback;

  // Check roles if specified
  if (requiredRoles !== null && !hasRole(user.roles, requiredRoles)) {
    return fallback;
  }

  // Check permissions if specified
  if (requiredPermissions !== null && !hasPermission(user.roles, requiredPermissions)) {
    return fallback;
  }

  return children;
}

export default RoleGate;

