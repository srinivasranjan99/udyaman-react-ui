import React, { useState } from 'react';
import {
  Container, Typography, Box, Paper, TextField, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Chip, Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import VpnKeyIcon from '@mui/icons-material/VpnKey';

export default function GlobalUserOversightPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([
    { id: 1, username: 'admin_shop1', email: 'admin@shop1.com', tenantId: 'SHOP1', status: 'ACTIVE' },
    { id: 2, username: 'staff_shop1', email: 'staff@shop1.com', tenantId: 'SHOP1', status: 'LOCKED' },
    { id: 3, username: 'owner_shop2', email: 'owner@shop2.com', tenantId: 'SHOP2', status: 'ACTIVE' },
  ]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>Global User Oversight</Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search users by username, email, or tenant ID across the entire platform..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Tenant</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell sx={{ fontWeight: 'bold' }}>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip label={user.tenantId} size="small" />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={user.status} 
                    size="small" 
                    color={user.status === 'ACTIVE' ? 'success' : 'error'} 
                  />
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                    <IconButton 
                      size="small" 
                      color={user.status === 'ACTIVE' ? 'warning' : 'success'}
                      title={user.status === 'ACTIVE' ? 'Lock Account' : 'Unlock Account'}
                    >
                      {user.status === 'ACTIVE' ? <LockIcon /> : <LockOpenIcon />}
                    </IconButton>
                    <IconButton size="small" color="primary" title="Force Password Reset">
                      <VpnKeyIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
