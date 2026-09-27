import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, Chip, IconButton,
  Tooltip, LinearProgress, TextField, InputAdornment
} from '@mui/material';
import {
  Assignment as OrderIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  MoreVert as MoreIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import api from '../../../api/axios';

/**
 * SalesOrderPage: Comprehensive management of customer sales orders.
 * Distinct from Billing by its focus on commitment, scheduling, and fulfillment.
 */
const SalesOrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Fetching sales orders (assuming /sales/orders endpoint exists)
      const res = await api.get('/sales/orders').catch(() => ({ data: { data: [] } }));
      setOrders(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Sales Orders</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage customer commitments, track order fulfillment, and prepare for invoicing.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} sx={{ borderRadius: 2, px: 3 }}>
          Create New Order
        </Button>
      </Box>

      <Paper sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <TextField
            placeholder="Search by Order ID or Customer..."
            size="small"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ width: 400 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
              ),
              sx: { borderRadius: 2 }
            }}
          />
          <IconButton><MoreIcon /></IconButton>
        </Box>

        {loading && <LinearProgress />}

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Order Ref</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Order Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                    {loading ? 'Fetching orders...' : 'No sales orders found.'}
                  </TableCell>
                </TableRow>
              ) : orders.map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <OrderIcon color="primary" fontSize="small" />
                      <Typography variant="body2" fontWeight="bold">SO-{order.id.toString().padStart(6, '0')}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{order.customerName || 'Retail Customer'}</TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell fontWeight="bold">₹{order.totalAmount?.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={order.status} 
                      color={order.status === 'CONFIRMED' ? 'success' : 'warning'} 
                      size="small" 
                      variant="outlined"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Details">
                      <IconButton size="small"><ViewIcon fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Convert to Invoice">
                      <IconButton size="small" color="success"><CheckIcon fontSize="small" /></IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default SalesOrderPage;
