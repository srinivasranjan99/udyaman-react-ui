import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, Chip, IconButton,
  Tooltip, LinearProgress, TextField, InputAdornment
} from '@mui/material';
import {
  LocalShipping as ShippingIcon,
  CheckCircle as CheckIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import api from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext.jsx';
import { PERMISSIONS, hasPermission } from '../../../utils/rbac';

/**
 * GrnListPage: Specialized page for receiving goods against Purchase Orders.
 * Focused on the logistical act of warehouse intake.
 */
const GrnListPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/purchase/orders');
      // Filter for orders that can be received (Approved or Partially Received)
      const receivable = (res.data.data || []).filter(po => 
        po.status === 'APPROVED' || po.status === 'IN_TRANSIT'
      );
      setOrders(receivable);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">Goods Receipt Note (GRN)</Typography>
        <Typography variant="body2" color="text.secondary">
          Confirm intake of materials from suppliers and update warehouse stock levels.
        </Typography>
      </Box>

      <Paper sx={{ borderRadius: 4, overflow: 'hidden' }}>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <TextField
            placeholder="Search by PO Number or Supplier..."
            size="small"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ width: 350 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
              ),
              sx: { borderRadius: 2 }
            }}
          />
          <IconButton><FilterIcon /></IconButton>
        </Box>

        {loading && <LinearProgress />}

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>PO Reference</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Supplier</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Expected Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Items</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    {loading ? 'Synchronizing...' : 'No pending shipments found to receive.'}
                  </TableCell>
                </TableRow>
              ) : orders.map((po) => (
                <TableRow key={po.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <ReceiptIcon color="action" />
                      <Typography variant="body2" fontWeight="bold">PO-{po.id.toString().padStart(5, '0')}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{po.supplierName || 'Test Supplier'}</TableCell>
                  <TableCell>{new Date(po.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{po.items?.length || 0} Products</TableCell>
                  <TableCell>
                    <Chip 
                      label={po.status} 
                      color="info" 
                      variant="outlined" 
                      size="small" 
                      sx={{ fontWeight: 'bold', borderRadius: 1 }} 
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button 
                      variant="contained" 
                      color="success" 
                      size="small"
                      startIcon={<ShippingIcon />}
                      onClick={() => {/* Navigate to receiving form */}}
                      disabled={!hasPermission(user?.roles, PERMISSIONS.GRN_CREATE)}
                      sx={{ borderRadius: 2 }}
                    >
                      Receive Items
                    </Button>
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

export default GrnListPage;
