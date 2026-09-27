import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Reactive Navigation: Move to home as soon as context confirms authentication
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password, tenantId || 'DEFAULT');
      // Navigation is now handled by the useEffect watching isAuthenticated
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ marginTop: 8 }}>
      <Paper elevation={3} sx={{ padding: 4, borderRadius: 2 }}>
        <Box sx={{ textAlign: 'center', marginBottom: 3 }}>
          <LockIcon sx={{ fontSize: 48, color: '#1976d2', marginBottom: 1 }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Udyaman ERP
          </Typography>
          <Typography variant="body2" sx={{ color: '#666', marginTop: 1 }}>
            Sign in to your account
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ marginBottom: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            margin="normal"
            required
            disabled={loading}
            placeholder="Enter your username"
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            disabled={loading}
            placeholder="Enter your password"
          />

          <TextField
            fullWidth
            label="Tenant ID"
            type="text"
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
            margin="normal"
            disabled={loading}
            placeholder="Leave empty for DEFAULT"
            helperText="Required for multi-tenant ERP access"
          />

          <Button
            fullWidth
            variant="contained"
            disabled={loading || !username || !password}
            sx={{ marginTop: 3, padding: '12px' }}
            onClick={handleSubmit}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign In'}
          </Button>
        </form>

        <Box sx={{ marginTop: 2, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#666' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#1976d2', textDecoration: 'none' }}>
              Register here
            </Link>
          </Typography>
        </Box>

        <Box sx={{ marginTop: 3, padding: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="caption" sx={{ color: '#666' }}>
            <strong>Demo Credentials:</strong>
            <br />
            Tenant: DEFAULT | admin | admin123
            <br />
            Tenant: _GLOBAL_ADMIN_ | superadmin | superadmin123
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

