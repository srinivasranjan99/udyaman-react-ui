import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, Chip, Switch,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import api from '../../api/axios';

export default function TenantManagementPage() {
  const [tenants, setTenants] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [newTenant, setNewTenant] = useState({
    tenantId: '',
    name: '',
    adminEmail: '',
    adminUsername: '',
    adminPassword: '',
    planType: 'BASIC',
    maxUsers: 5
  });

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const res = await api.get('/system/tenants');
      setTenants(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch tenants', err);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.put(`/system/tenants/${id}/status`, null, { params: { status: newStatus } });
      fetchTenants();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleOnboard = async () => {
    try {
      await api.post('/system/tenants/onboard', newTenant);
      setOpenAdd(false);
      fetchTenants();
    } catch (err) {
      alert('Onboarding failed: ' + err.message);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Tenant Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenAdd(true)}>
          Onboard New Tenant
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Tenant ID</TableCell>
              <TableCell>Shop Name</TableCell>
              <TableCell>Plan</TableCell>
              <TableCell>Users</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tenants.map((tenant) => (
              <TableRow key={tenant.tenantId}>
                <TableCell sx={{ fontWeight: 'bold' }}>{tenant.tenantId}</TableCell>
                <TableCell>{tenant.name}</TableCell>
                <TableCell>
                  <Chip label={tenant.planType} size="small" color="primary" variant="outlined" />
                </TableCell>
                <TableCell>{tenant.maxUsers}</TableCell>
                <TableCell>
                  <Switch 
                    checked={tenant.status === 'ACTIVE'} 
                    onChange={() => handleToggleStatus(tenant.tenantId, tenant.status)}
                    color="success"
                  />
                  <Chip 
                    label={tenant.status} 
                    size="small" 
                    color={tenant.status === 'ACTIVE' ? 'success' : 'error'} 
                    sx={{ ml: 1 }}
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton color="info" size="small" title="View Details">
                    <VisibilityIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Onboarding Dialog */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Onboard New Tenant</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField 
              label="Unique Tenant ID (e.g. SHOP01)" 
              fullWidth 
              value={newTenant.tenantId} 
              onChange={(e) => setNewTenant({...newTenant, tenantId: e.target.value})}
            />
            <TextField 
              label="Shop Name" 
              fullWidth 
              value={newTenant.name} 
              onChange={(e) => setNewTenant({...newTenant, name: e.target.value})}
            />
            <TextField 
              label="Admin Email" 
              fullWidth 
              value={newTenant.adminEmail} 
              onChange={(e) => setNewTenant({...newTenant, adminEmail: e.target.value})}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField 
                label="Admin Username" 
                fullWidth 
                value={newTenant.adminUsername} 
                onChange={(e) => setNewTenant({...newTenant, adminUsername: e.target.value})}
              />
              <TextField 
                label="Admin Password" 
                type="password" 
                fullWidth 
                value={newTenant.adminPassword} 
                onChange={(e) => setNewTenant({...newTenant, adminPassword: e.target.value})}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleOnboard}>Onboard Tenant</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
