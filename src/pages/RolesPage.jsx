import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext.jsx';
import { hasPermission } from '../utils/rbac';

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissionCodes: [],
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await api.get('/roles');
      setRoles(res.data.data);
      setError('');
    } catch (err) {
      setError('Failed to load roles');
      console.error('Error fetching roles:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      // Note: You may need to create a /permissions endpoint in the backend
      // For now, we'll show a placeholder
      setPermissions([
        { id: 1, name: 'User Read', code: 'USER_READ' },
        { id: 2, name: 'User Create', code: 'USER_CREATE' },
        { id: 3, name: 'User Update', code: 'USER_UPDATE' },
        { id: 4, name: 'User Delete', code: 'USER_DELETE' },
        { id: 5, name: 'Role Read', code: 'ROLE_READ' },
        { id: 6, name: 'Role Create', code: 'ROLE_CREATE' },
        { id: 7, name: 'Role Assign', code: 'ROLE_ASSIGN' },
      ]);
    } catch (err) {
      console.error('Error fetching permissions:', err);
    }
  };

  const handleOpenDialog = () => {
    setFormData({ name: '', description: '', permissionCodes: [] });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePermissionChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      permissionCodes: e.target.value,
    }));
  };

  const handleCreateRole = async () => {
    if (!formData.name.trim()) {
      alert('Role name is required');
      return;
    }

    try {
      await api.post('/roles', formData);
      fetchRoles();
      handleCloseDialog();
      alert('Role created successfully!');
    } catch (err) {
      alert('Failed to create role: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ marginTop: 4, marginBottom: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Roles Management
        </Typography>
        {hasPermission(user?.roles, 'ROLE_CREATE') && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenDialog}>
            Create Role
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ marginBottom: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {roles.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ padding: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#666' }}>
                No roles found
              </Typography>
            </Paper>
          </Grid>
        ) : (
          roles.map((role) => (
            <Grid item xs={12} sm={6} md={4} key={role.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
                    {role.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', marginBottom: 2 }}>
                    {role.description || 'No description'}
                  </Typography>

                  <Typography variant="caption" sx={{ display: 'block', marginBottom: 1, fontWeight: 'bold' }}>
                    Permissions ({role.permissions?.length || 0})
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {role.permissions && role.permissions.length > 0 ? (
                      role.permissions.map((perm) => (
                        <Chip
                          key={perm}
                          label={perm}
                          size="small"
                          variant="outlined"
                          sx={{ backgroundColor: '#f5f5f5' }}
                        />
                      ))
                    ) : (
                      <Typography variant="caption" sx={{ color: '#999' }}>
                        No permissions
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Dialog for creating role */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Role</DialogTitle>
        <DialogContent sx={{ marginTop: 2 }}>
          <TextField
            autoFocus
            label="Role Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            placeholder="e.g., ROLE_ADMIN, ROLE_MANAGER"
          />

          <TextField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            fullWidth
            multiline
            rows={3}
            margin="normal"
            placeholder="Describe what this role is for"
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Permissions</InputLabel>
            <Select
              multiple
              name="permissionCodes"
              value={formData.permissionCodes}
              onChange={handlePermissionChange}
              label="Permissions"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {permissions.map((perm) => (
                <MenuItem key={perm.code} value={perm.code}>
                  {perm.name} ({perm.code})
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>Select permissions for this role</FormHelperText>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleCreateRole} variant="contained" disabled={!formData.name}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

