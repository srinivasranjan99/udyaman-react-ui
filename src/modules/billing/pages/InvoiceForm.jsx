import React, { useState, useEffect } from 'react';
import { 
  Box, Grid, Paper, Typography, TextField, Button, 
  Table, TableBody, TableCell, TableHead, TableRow, IconButton,
  Autocomplete, Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import api from '../../../api/axios';
import { useConfig } from '../../../context/ConfigContext';

const InvoiceForm = ({ onInvoiceCreated }) => {
  const { isFeatureEnabled } = useConfig();
  const [customer, setCustomer] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [items, setItems] = useState([]);
  const [productSearch, setProductSearch] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      const res = await api.get('/inventory/warehouses');
      const data = res.data?.data || [];
      setWarehouses(data);
      if (data.length > 0) setSelectedWarehouseId(data[0].id);
    } catch (err) { console.error(err); }
  };

  const [totals, setTotals] = useState({
    subtotal: 0,
    tax: 0,
    discount: 0,
    grandTotal: 0
  });

  // Calculate totals whenever items or discount change
  useEffect(() => {
    const sub = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const tax = items.reduce((acc, item) => acc + (item.price * item.quantity * (item.gstRate / 100)), 0);
    const grand = sub + tax - totals.discount;
    
    setTotals(prev => ({
      ...prev,
      subtotal: sub,
      tax: tax,
      grandTotal: grand
    }));
  }, [items, totals.discount]);

  const searchProducts = async (query) => {
    if (query.length < 2) return;
    try {
      const res = await api.get('/products', { params: { search: query } });
      setProductSearch(res.data.data.content);
    } catch (err) {
      console.error(err);
    }
  };

  const addItem = (product) => {
    const existing = items.find(i => i.productId === product.id);
    if (existing) {
      setItems(items.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setItems([...items, {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        gstRate: product.gstRate || 0
      }]);
    }
  };

  const removeItem = (productId) => {
    setItems(items.filter(i => i.productId !== productId));
  };

  const handleSubmit = async () => {
    if (items.length === 0) return;
    setLoading(true);
    try {
      const payload = {
        customerId: customer?.id,
        customerName: customer?.name || 'Cash Customer',
        warehouseId: selectedWarehouseId,
        items: items.map(i => ({
          productId: i.productId,
          quantity: i.quantity
        })),
        paymentMode: 'CASH', // Simplified
        discount: totals.discount
      };
      
      const res = await api.post('/invoices', payload);
      onInvoiceCreated(res.data.data);
      setItems([]);
      setCustomer(null);
    } catch (err) {
      console.error("Invoice creation failed", err);
      alert("Failed to create invoice: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>Point of Sale (POS)</Typography>
      
      <Grid container spacing={3}>
        {/* Left: Item Selection */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Autocomplete
              options={productSearch}
              getOptionLabel={(option) => `${option.name} (${option.sku}) - ₹${option.price}`}
              onInputChange={(e, val) => searchProducts(val)}
              onChange={(e, val) => val && addItem(val)}
              renderInput={(params) => (
                <TextField {...params} label="Search Products by Name/SKU/Barcode" variant="outlined" fullWidth />
              )}
            />
          </Paper>

          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell>Item</TableCell>
                  <TableCell align="center">Qty</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="center"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.productId}>
                    <TableCell>
                      <Typography variant="body2">{item.name}</Typography>
                      <Typography variant="caption" color="textSecondary">GST: {item.gstRate}%</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <TextField 
                        type="number" 
                        size="small" 
                        value={item.quantity} 
                        onChange={(e) => setItems(items.map(i => i.productId === item.productId ? { ...i, quantity: parseInt(e.target.value) || 1 } : i))}
                        sx={{ width: 70 }}
                      />
                    </TableCell>
                    <TableCell align="right">₹{item.price.toFixed(2)}</TableCell>
                    <TableCell align="right">₹{(item.price * item.quantity).toFixed(2)}</TableCell>
                    <TableCell align="center">
                      <IconButton color="error" onClick={() => removeItem(item.productId)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* Right: Summary & Customer */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Inventory Context</Typography>
            <Autocomplete
              options={warehouses}
              getOptionLabel={(option) => `${option.name} (${option.code})`}
              value={warehouses.find(w => w.id === selectedWarehouseId) || null}
              onChange={(e, v) => setSelectedWarehouseId(v?.id || '')}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Dispatch Warehouse" 
                  required 
                  size="small"
                  error={!selectedWarehouseId}
                  helperText={!selectedWarehouseId ? 'Dispatch source required' : ''}
                />
              )}
              sx={{ mb: 2 }}
            />
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Customer Details</Typography>
            <TextField 
              fullWidth 
              size="small" 
              label="Customer Name / Phone" 
              sx={{ mb: 2 }}
              onChange={(e) => setCustomer({ name: e.target.value })}
            />
            {isFeatureEnabled('billing.gst_enabled') && (
              <TextField fullWidth size="small" label="Customer GSTIN (Optional)" />
            )}
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Order Summary</Typography>
            <Box sx={{ my: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Subtotal</Typography>
                <Typography variant="body2">₹{totals.subtotal.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Tax (GST)</Typography>
                <Typography variant="body2">₹{totals.tax.toFixed(2)}</Typography>
              </Box>
              <TextField 
                label="Discount (₹)" 
                fullWidth 
                size="small" 
                sx={{ my: 1 }} 
                onChange={(e) => setTotals(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
              />
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6" fontWeight="bold">Total Amount</Typography>
                <Typography variant="h6" fontWeight="bold" color="primary">₹{totals.grandTotal.toFixed(2)}</Typography>
              </Box>
            </Box>
            <Button 
              fullWidth 
              variant="contained" 
              size="large" 
              startIcon={<ShoppingCartIcon />}
              onClick={handleSubmit}
              disabled={items.length === 0 || loading}
            >
              Generate Invoice
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default InvoiceForm;
