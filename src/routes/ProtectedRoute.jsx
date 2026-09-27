import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { hasPermission, hasRole } from '../utils/rbac';

const ProtectedRoute = ({ children, requiredRoles, requiredPermissions }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRoles) {
    if (!hasRole(user.roles, requiredRoles)) {
      return <Navigate to="/" replace />;
    }
  }

  if (requiredPermissions) {
    if (!hasPermission(user.roles, requiredPermissions)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
