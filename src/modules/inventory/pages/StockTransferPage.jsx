import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, TextField, MenuItem, 
  Button, Card, CardContent, Divider, Alert,
  Stepper, Step, StepLabel, IconButton
} from '@mui/material';
import {
  SwapHoriz as SwapHorizIcon,
  LocalShipping as LocalShippingIcon,
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import api from '../../../api/axios';

import { inventoryApi } from '../../../api/inventoryApi';

const StockTransferPage = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [fromLocations, setFromLocations] = useState([]);
  const [toLocations, setToLocations] = useState([]);
  
  const [transfer, setTransfer] = useState({
    fromWarehouseId: '',
    fromStorageLocationId: '',
    toWarehouseId: '',
    toStorageLocationId: '',
    productVariantId: '', // We use variant ID for stock transactions
    quantity: 0,
    notes: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      const [whRes, prodRes] = await Promise.all([
        inventoryApi.getWarehouses(),
        inventoryApi.getProducts()
      ]);
      // inventoryApi uses apiService which already strips axios .data, returning the ApiResponse body
      // Warehouses: ApiResponse.data is a flat list
      setWarehouses(whRes.data || []);
      // Products: ApiResponse.data is a Page, so content is at .data.content
      setProducts(prodRes.data?.content || []);
    } catch (err) { console.error(err); }
  };

  const handleFromWhChange = async (whId) => {
    setTransfer({ ...transfer, fromWarehouseId: whId, fromStorageLocationId: '' });
    try {
      const res = await inventoryApi.getStorageLocations(whId);
      setFromLocations(res.data || []);
    } catch (err) { console.error(err); }
  };

  const handleToWhChange = async (whId) => {
    setTransfer({ ...transfer, toWarehouseId: whId, toStorageLocationId: '' });
    try {
      const res = await inventoryApi.getStorageLocations(whId);
      setToLocations(res.data || []);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        ...transfer,
        // Since we are currently selecting "Product", and our backend expects "ProductVariant"
        // In a real system, we'd select a specific variant. For now, we take the default variant of the product.
        productVariantId: products.find(p => p.id === transfer.productId)?.variants?.[0]?.id || transfer.productId
      };
      await inventoryApi.transferStock(payload);
      alert("Stock transfer completed successfully!");
      setTransfer({
        fromWarehouseId: '', fromStorageLocationId: '',
        toWarehouseId: '', toStorageLocationId: '',
        productId: '', quantity: 0, notes: ''
      });
    } catch (err) { 
      alert("Transfer failed: " + (err.response?.data?.message || err.message)); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>Internal Stock Transfer</Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>Move inventory between warehouses or storage zones.</Typography>

      <Grid container spacing={4} alignItems="stretch">
        {/* Source */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Box sx={{ p: 1, bgcolor: 'primary.light', borderRadius: 2, color: 'white' }}>
                <SwapHorizIcon />
              </Box>
              <Typography variant="h6" fontWeight="bold">Source</Typography>
            </Box>
            
            <TextField
              select fullWidth label="From Warehouse" sx={{ mb: 3 }}
              value={transfer.fromWarehouseId}
              onChange={(e) => handleFromWhChange(e.target.value)}
            >
              {warehouses.map(wh => <MenuItem key={wh.id} value={wh.id}>{wh.name}</MenuItem>)}
            </TextField>

            <TextField
              select fullWidth label="From Bin / Location" sx={{ mb: 3 }}
              disabled={!transfer.fromWarehouseId}
              value={transfer.fromStorageLocationId}
              onChange={(e) => setTransfer({ ...transfer, fromStorageLocationId: e.target.value })}
            >
              <MenuItem value="">Main Floor / Unassigned</MenuItem>
              {fromLocations.map(loc => <MenuItem key={loc.id} value={loc.id}>{loc.code} - {loc.name}</MenuItem>)}
            </TextField>

            <TextField
              select fullWidth label="Select Product" sx={{ mb: 3 }}
              value={transfer.productId}
              onChange={(e) => setTransfer({ ...transfer, productId: e.target.value })}
            >
              {products.map(p => <MenuItem key={p.id} value={p.id}>{p.name} ({p.sku})</MenuItem>)}
            </TextField>
          </Paper>
        </Grid>

        <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ p: 2, bgcolor: '#f1f5f9', borderRadius: '50%' }}>
            <ArrowForwardIcon color="primary" sx={{ fontSize: 40 }} />
          </Box>
        </Grid>

        {/* Destination */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%', border: '2px dashed #e2e8f0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Box sx={{ p: 1, bgcolor: 'success.light', borderRadius: 2, color: 'white' }}>
                <LocalShippingIcon />
              </Box>
              <Typography variant="h6" fontWeight="bold">Destination</Typography>
            </Box>

            <TextField
              select fullWidth label="To Warehouse" sx={{ mb: 3 }}
              value={transfer.toWarehouseId}
              onChange={(e) => handleToWhChange(e.target.value)}
            >
              {warehouses.map(wh => <MenuItem key={wh.id} value={wh.id} disabled={wh.id === transfer.fromWarehouseId}>{wh.name}</MenuItem>)}
            </TextField>

            <TextField
              select fullWidth label="To Bin / Location" sx={{ mb: 3 }}
              disabled={!transfer.toWarehouseId}
              value={transfer.toStorageLocationId}
              onChange={(e) => setTransfer({ ...transfer, toStorageLocationId: e.target.value })}
            >
              <MenuItem value="">Main Floor / Unassigned</MenuItem>
              {toLocations.map(loc => <MenuItem key={loc.id} value={loc.id}>{loc.code} - {loc.name}</MenuItem>)}
            </TextField>

            <TextField
              fullWidth label="Transfer Quantity" type="number" sx={{ mb: 3 }}
              value={transfer.quantity}
              onChange={(e) => setTransfer({ ...transfer, quantity: Number(e.target.value) })}
            />

            <TextField
              fullWidth label="Transfer Notes" multiline rows={2}
              value={transfer.notes}
              onChange={(e) => setTransfer({ ...transfer, notes: e.target.value })}
            />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button variant="outlined" sx={{ mr: 2 }}>Cancel</Button>
            <Button 
              variant="contained" size="large" 
              startIcon={<CheckCircleIcon />}
              disabled={!transfer.toWarehouseId || transfer.quantity <= 0 || loading}
              onClick={handleSubmit}
            >
              {loading ? 'Processing...' : 'Execute Transfer'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StockTransferPage;
