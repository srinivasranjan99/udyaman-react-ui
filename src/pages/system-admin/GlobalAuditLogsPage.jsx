import React, { useState } from 'react';
import {
  Container, Typography, Box, Paper, Grid, TextField, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Pagination, Chip
} from '@mui/material';

export default function GlobalAuditLogsPage() {
  const [filters, setFilters] = useState({
    date: '',
    tenant: 'ALL',
    module: 'ALL'
  });

  const [logs] = useState([
    { id: 1, timestamp: '2026-05-02 10:30:45', tenant: 'SHOP1', user: 'admin', module: 'INVENTORY', action: 'CREATE_PRODUCT', details: 'Added iPhone 15' },
    { id: 2, timestamp: '2026-05-02 11:15:20', tenant: 'SHOP2', user: 'staff_1', module: 'BILLING', action: 'CREATE_INVOICE', details: 'Invoice #1024 generated' },
    { id: 3, timestamp: '2026-05-02 12:05:10', tenant: 'SYSTEM', user: 'superadmin', module: 'TENANT', action: 'ONBOARD_TENANT', details: 'Created SHOP3' },
  ]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>Global Audit Explorer</Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="date"
              label="Filter by Date"
              InputLabelProps={{ shrink: true }}
              value={filters.date}
              onChange={(e) => setFilters({...filters, date: e.target.value})}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Tenant"
              value={filters.tenant}
              onChange={(e) => setFilters({...filters, tenant: e.target.value})}
            >
              <MenuItem value="ALL">All Tenants</MenuItem>
              <MenuItem value="SHOP1">SHOP1</MenuItem>
              <MenuItem value="SHOP2">SHOP2</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Module"
              value={filters.module}
              onChange={(e) => setFilters({...filters, module: e.target.value})}
            >
              <MenuItem value="ALL">All Modules</MenuItem>
              <MenuItem value="INVENTORY">Inventory</MenuItem>
              <MenuItem value="BILLING">Billing</MenuItem>
              <MenuItem value="TENANT">Tenant Management</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper} elevation={3}>
        <Table size="small">
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>Tenant</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Module</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id} hover>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{log.timestamp}</TableCell>
                <TableCell><Chip label={log.tenant} size="small" variant="outlined" /></TableCell>
                <TableCell sx={{ fontWeight: 'medium' }}>{log.user}</TableCell>
                <TableCell>{log.module}</TableCell>
                <TableCell>
                  <Chip label={log.action} size="small" color="primary" />
                </TableCell>
                <TableCell>{log.details}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
          <Pagination count={10} color="primary" />
        </Box>
      </TableContainer>
    </Container>
  );
}
