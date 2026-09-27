import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasRole, hasAllRoles, hasPermission } from '../utils/rbac';
import { Box, Typography, Button } from '@mui/material';

/**
 * Protected route component that:
 * 1. Redirects to login if not authenticated
 * 2. Redirects to unauthorized if user lacks required roles/permissions
 * 3. Shows loading state while auth is being checked
 */
export default function ProtectedRoute({
  children,
  requiredRoles = null,      // Single role or array of roles (any match = allowed)
  requiredAllRoles = null,   // Single role or array of roles (all must match)
  requiredPermissions = null // Single permission or array (any match = allowed)
}) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#fafafa',
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" sx={{ marginBottom: 2 }}>
            Loading...
          </Typography>
          <div style={{
            display: 'inline-block',
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #1976d2',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </Box>
      </Box>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role requirements
  if (requiredRoles && !hasRole(user?.roles, requiredRoles)) {
    return <UnauthorizedPage reason="insufficient_role" />;
  }

  // Check that user has ALL required roles
  if (requiredAllRoles && !hasAllRoles(user?.roles, requiredAllRoles)) {
    return <UnauthorizedPage reason="insufficient_role" />;
  }

  // Check permission requirements
  if (requiredPermissions && !hasPermission(user?.roles, requiredPermissions)) {
    return <UnauthorizedPage reason="insufficient_permission" />;
  }

  // All checks passed
  return children;
}

/**
 * Unauthorized page component
 */
function UnauthorizedPage({ reason = 'unauthorized' }) {
  const messages = {
    insufficient_role: 'Your role does not have access to this page.',
    insufficient_permission: 'You do not have the required permissions to access this page.',
    unauthorized: 'You are not authorized to access this page.',
  };

  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: 'calc(100vh - 64px)',
      backgroundColor: '#fafafa',
    }}>
      <Box sx={{
        textAlign: 'center',
        padding: 3,
        backgroundColor: 'white',
        borderRadius: 2,
        boxShadow: 1,
      }}>
        <Typography variant="h4" sx={{ marginBottom: 2, fontWeight: 'bold', color: '#d32f2f' }}>
          ❌ Access Denied
        </Typography>
        <Typography variant="body1" sx={{ marginBottom: 3, color: '#666' }}>
          {messages[reason] || messages.unauthorized}
        </Typography>
        <Button variant="contained" href="/" sx={{ marginRight: 2 }}>
          Go to Home
        </Button>
        <Button variant="outlined" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </Box>
    </Box>
  );
}

