import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Grid, LinearProgress
} from '@mui/material';
import {
  Add as AddIcon,
  PlayCircle as PlayCircleIcon,
  CheckCircle as CheckCircleIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import api from '../../../api/axios';

const ProductionOrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [boms, setBoms] = useState([]);
  const [formData, setFormData] = useState({
    productId: '',
    bomId: '',
    warehouseId: '',
    plannedQuantity: 1,
    remarks: ''
  });
  const [warehouses, setWarehouses] = useState([]);

  useEffect(() => {
    fetchOrders();
    fetchProducts();
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      const res = await api.get('/inventory/warehouses');
      setWarehouses(res.data?.data || []);
    } catch (err) { console.error(err); }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get('/production/orders'); // Assuming a GET all exists
      setOrders(res.data.data.content || []);
    } catch (err) { console.error(err); }
  };

  const fetchProducts = async () => {
    const res = await api.get('/inventory/products');
    setProducts(res.data.data.content || []);
  };

  const handleProductChange = async (productId) => {
    setFormData({ ...formData, productId, bomId: '' });
    const res = await api.get(`/production/boms/product/${productId}`);
    setBoms(res.data.data || []);
  };

  const handleSave = async () => {
    try {
      await api.post('/production/orders', formData);
      setOpen(false);
      fetchOrders();
    } catch (err) { alert(err.response?.data?.message); }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PLANNED': return 'info';
      case 'IN_PROGRESS': return 'warning';
      case 'COMPLETED': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">Production Orders</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>New Plan</Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Order #</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Product</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Qty (Planned/Real)</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Progress</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => {
              const progress = order.producedQuantity > 0 ? (order.producedQuantity / order.plannedQuantity) * 100 : 0;
              return (
                <TableRow key={order.id}>
                  <TableCell><Typography variant="body2" fontWeight="bold">{order.orderNumber}</Typography></TableCell>
                  <TableCell>{order.productName}</TableCell>
                  <TableCell>{order.plannedQuantity} / {order.producedQuantity}</TableCell>
                  <TableCell sx={{ width: 150 }}>
                    <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 3 }} />
                  </TableCell>
                  <TableCell><Chip label={order.status} color={getStatusColor(order.status)} size="small" /></TableCell>
                  <TableCell>
                    {order.status === 'PLANNED' && (
                      <IconButton color="primary" onClick={async () => {
                        await api.put(`/production/orders/${order.id}/start`);
                        fetchOrders();
                      }}><PlayCircleIcon /></IconButton>
                    )}
                    {order.status === 'IN_PROGRESS' && (
                      <IconButton color="success" onClick={() => {/* Navigate to Execution */}}><CheckCircleIcon /></IconButton>
                    )}
                    <IconButton size="small"><SettingsIcon /></IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Create Production Plan</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12}>
              <TextField
                select fullWidth label="Material to Produce"
                value={formData.productId}
                onChange={(e) => handleProductChange(e.target.value)}
              >
                {products.filter(p => p.productionAllowed).map(p => (
                  <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                select fullWidth label="BOM Version"
                value={formData.bomId}
                disabled={!formData.productId}
                onChange={(e) => setFormData({ ...formData, bomId: e.target.value })}
              >
                {boms.map(b => (
                  <MenuItem key={b.id} value={b.id}>{b.version} ({b.status})</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                select fullWidth label="Target Storage Warehouse"
                value={formData.warehouseId}
                onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
                required
              >
                {warehouses.map(wh => (
                  <MenuItem key={wh.id} value={wh.id}>{wh.name} ({wh.code})</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth label="Target Quantity" type="number"
                value={formData.plannedQuantity}
                onChange={(e) => setFormData({ ...formData, plannedQuantity: Number(e.target.value) })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Initialize Order</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductionOrderPage;
