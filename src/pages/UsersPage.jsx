import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  MenuItem,
} from '@mui/material';
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext.jsx';
import { hasPermission } from '../utils/rbac';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [roleInput, setRoleInput] = useState('');
  const [roles, setRoles] = useState([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const MAX_USERS_PER_TENANT = 5;
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setUsers(res.data.data);
      setError('');
    } catch (err) {
      setError('Failed to load users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await api.get('/roles');
      setRoles(res.data.data);
    } catch (err) {
      console.error('Error fetching roles:', err);
    }
  };

  const handleOpenDialog = (user) => {
    setSelectedUser(user);
    setOpenDialog(true);
    setRoleInput('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setRoleInput('');
  };

  const handleAssignRole = async () => {
    if (!roleInput.trim()) return;

    try {
      await api.post(`/users/${selectedUser.id}/roles`, {
        roleNames: [roleInput],
      });
      setRoleInput('');
      fetchUsers();
      handleCloseDialog();
      alert('Role assigned successfully!');
    } catch (err) {
      alert('Failed to assign role: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleOpenAddDialog = () => {
    if (users.length >= MAX_USERS_PER_TENANT) {
      alert(`Tenant Limit Reached: Your current plan only allows a maximum of ${MAX_USERS_PER_TENANT} users.`);
      return;
    }
    setNewUser({ username: '', email: '', firstName: '', lastName: '', password: '' });
    setFormErrors({});
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };

  const handleAddUser = async () => {
    const errors = {};
    if (!newUser.username || newUser.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }
    if (!newUser.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
      errors.email = 'A valid email is required';
    }
    if (!newUser.password || newUser.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      await api.post('/auth/register', newUser);
      handleCloseAddDialog();
      fetchUsers();
      alert('User added successfully!');
    } catch (err) {
      alert('Failed to add user: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleRemoveRole = async (userId, roleName) => {
    if (window.confirm(`Remove role "${roleName}" from user?`)) {
      try {
        await api.delete(`/users/${userId}/roles`, {
          data: { roleNames: [roleName] },
        });
        fetchUsers();
        alert('Role removed successfully!');
      } catch (err) {
        alert('Failed to remove role');
      }
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
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Users Management
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
            Tenant Usage: {users.length} / {MAX_USERS_PER_TENANT} Users
          </Typography>
        </Box>
        {hasPermission(currentUser?.roles, 'USER_CREATE') && (
          <Button variant="contained" startIcon={<PersonAddIcon />} onClick={handleOpenAddDialog}>
            Add User
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ marginBottom: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Username</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Roles</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: 'center', padding: 3 }}>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    No users found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((userItem) => (
                <TableRow key={userItem.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                  <TableCell>{userItem.username}</TableCell>
                  <TableCell>{userItem.email}</TableCell>
                  <TableCell>
                    {userItem.firstName} {userItem.lastName}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={userItem.isActive ? 'Active' : 'Inactive'}
                      color={userItem.isActive ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {userItem.roles && userItem.roles.length > 0 ? (
                        userItem.roles.map((role) => (
                          <Chip
                            key={role}
                            label={role}
                            size="small"
                            onDelete={
                              hasPermission(currentUser?.roles, 'ROLE_ASSIGN')
                                ? () => handleRemoveRole(userItem.id, role)
                                : undefined
                            }
                          />
                        ))
                      ) : (
                        <Typography variant="caption" sx={{ color: '#999' }}>
                          No roles
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {hasPermission(currentUser?.roles, 'ROLE_ASSIGN') && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleOpenDialog(userItem)}
                      >
                        Assign Role
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog for assigning roles */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Role to User</DialogTitle>
        <DialogContent sx={{ marginTop: 2 }}>
          <Typography variant="body2" sx={{ marginBottom: 2 }}>
            Assigning role to: <strong>{selectedUser?.username}</strong>
          </Typography>

          <TextField
            select
            label="Select Role"
            value={roleInput}
            onChange={(e) => setRoleInput(e.target.value)}
            fullWidth
          >
            <MenuItem value="">
              <em>-- Choose a role --</em>
            </MenuItem>
            {roles.map((role) => (
              <MenuItem key={role.id} value={role.name}>
                {role.name}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleAssignRole} variant="contained" disabled={!roleInput}>
            Assign
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for adding a user */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent sx={{ marginTop: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Username"
            value={newUser.username}
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
            fullWidth
            required
            error={!!formErrors.username}
            helperText={formErrors.username}
            sx={{ mt: 1 }}
          />
          <TextField
            label="Email"
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            fullWidth
            required
            error={!!formErrors.email}
            helperText={formErrors.email}
          />
          <TextField
            label="Password"
            type="password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            fullWidth
            required
            error={!!formErrors.password}
            helperText={formErrors.password}
          />
          <TextField
            label="First Name"
            value={newUser.firstName}
            onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
            fullWidth
          />
          <TextField
            label="Last Name"
            value={newUser.lastName}
            onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Cancel</Button>
          <Button onClick={handleAddUser} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

