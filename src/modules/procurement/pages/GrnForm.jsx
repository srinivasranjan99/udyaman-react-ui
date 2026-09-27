import React, { useState, useEffect } from 'react';
import { 
  Box, Grid, TextField, Button, Typography, Paper, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Autocomplete, Alert, CircularProgress, Chip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import api from '../../../api/axios';

const GrnForm = ({ onSave, onCancel }) => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedPo, setSelectedPo] = useState(null);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [poDetails, setPoDetails] = useState(null);
  const [items, setItems] = useState([]);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(false);

  useEffect(() => {
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      const [poRes, whRes] = await Promise.all([
        api.get('/procurement/po', { params: { statuses: 'APPROVED,PARTIALLY_DELIVERED' } }),
        api.get('/inventory/warehouses')
      ]);
      setPurchaseOrders(poRes.data.data || []);
      setWarehouses(whRes.data?.data || []);
    } catch (err) {
      console.error("Metadata load failed", err);
    }
  };

  const fetchPoDetails = async (po) => {
    if (!po) return;
    setFetchingDetails(true);
    try {
      const res = await api.get(`/procurement/po/${po.id}`);
      const poData = res.data.data;
      setPoDetails(poData);
      
      // Auto-set warehouse if it exists in PO
      if (poData.warehouseId) setSelectedWarehouseId(poData.warehouseId);

      setItems(poData.items.map(item => ({
        poItemId: item.id,
        productName: item.productName || item.productVariantName,
        productVariantId: item.productVariantId,
        orderedQuantity: item.orderQuantity,
        receivedSoFar: item.receivedQuantity || 0,
        acceptedQuantity: item.orderQuantity - (item.receivedQuantity || 0),
        rejectedQuantity: 0,
        batchNumber: '',
        expiryDate: '',
        isExpiryTracked: true
      })));
    } catch (err) {
      setError("Failed to load PO details");
    } finally {
      setFetchingDetails(false);
    }
  };

  const updateItem = (poItemId, field, value) => {
    setItems(items.map(item => 
      item.poItemId === poItemId ? { ...item, [field]: value } : item
    ));
  };

  const handleSubmit = async () => {
    if (!selectedPo) return setError("Please select a Purchase Order");
    if (!selectedWarehouseId) return setError("Please select a receiving warehouse");
    if (!invoiceNumber) return setError("Supplier Invoice Number is required");
    
    setLoading(true);
    try {
      const payload = {
        purchaseOrderId: selectedPo.id,
        warehouseId: selectedWarehouseId,
        supplierInvoiceNumber: invoiceNumber,
        notes,
        items: items.map(i => ({
          poItemId: i.poItemId,
          productVariantId: i.productVariantId,
          acceptedQuantity: parseInt(i.acceptedQuantity) || 0,
          rejectedQuantity: parseInt(i.rejectedQuantity) || 0,
          batchNumber: i.batchNumber,
          expiryDate: i.expiryDate || null
        }))
      };
      const res = await api.post('/procurement/grn', payload);
      onSave(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to process Goods Receipt");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="h5" fontWeight="800" sx={{ mb: 3, color: '#1e293b' }}>
        Process Goods Receipt (GRN)
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
      
      <Paper sx={{ p: 4, borderRadius: 4, border: '1px solid #e2e8f0', mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Autocomplete
              options={purchaseOrders}
              getOptionLabel={(option) => `${option.poNumber} (${option.supplierName})`}
              value={selectedPo}
              onChange={(e, v) => { setSelectedPo(v); fetchPoDetails(v); }}
              renderInput={(params) => <TextField {...params} label="Source Purchase Order" fullWidth placeholder="Search PO..." />}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Autocomplete
              options={warehouses}
              getOptionLabel={(option) => `${option.name} (${option.code})`}
              value={warehouses.find(w => w.id === selectedWarehouseId) || null}
              onChange={(e, v) => setSelectedWarehouseId(v?.id || '')}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Receiving Warehouse" 
                  required 
                  error={!selectedWarehouseId}
                  helperText={!selectedWarehouseId ? 'Destination required' : ''}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Supplier Invoice Number"
              placeholder="e.g. INV/2024/001"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
            />
          </Grid>
        </Grid>
      </Paper>

      {fetchingDetails && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10 }}>
          <CircularProgress size={40} thickness={4} />
          <Typography sx={{ mt: 2, color: 'text.secondary' }}>Fetching PO details...</Typography>
        </Box>
      )}

      {poDetails && !fetchingDetails && (
        <Box>
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Table>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: '800' }}>Material / Product</TableCell>
                  <TableCell align="center" sx={{ fontWeight: '800' }}>PO Qty</TableCell>
                  <TableCell align="center" sx={{ fontWeight: '800' }}>Accepted</TableCell>
                  <TableCell align="center" sx={{ fontWeight: '800' }}>Rejected</TableCell>
                  <TableCell sx={{ fontWeight: '800' }}>Batch & Expiry</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.poItemId} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">{item.productName}</Typography>
                      <Typography variant="caption" color="primary.main" fontWeight="600">
                        Pending: {item.orderedQuantity - item.receivedSoFar} units
                      </Typography>
                    </TableCell>
                    <TableCell align="center">{item.orderedQuantity}</TableCell>
                    <TableCell align="center">
                      <TextField
                        type="number"
                        size="small"
                        sx={{ width: 90 }}
                        value={item.acceptedQuantity}
                        onChange={(e) => updateItem(item.poItemId, 'acceptedQuantity', parseInt(e.target.value) || 0)}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <TextField
                        type="number"
                        size="small"
                        sx={{ width: 90 }}
                        value={item.rejectedQuantity}
                        onChange={(e) => updateItem(item.poItemId, 'rejectedQuantity', parseInt(e.target.value) || 0)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                          placeholder="Batch No"
                          size="small"
                          sx={{ width: 140 }}
                          value={item.batchNumber}
                          onChange={(e) => updateItem(item.poItemId, 'batchNumber', e.target.value)}
                        />
                        <TextField
                          type="date"
                          size="small"
                          label="Expiry"
                          InputLabelProps={{ shrink: true }}
                          sx={{ width: 150 }}
                          value={item.expiryDate}
                          onChange={(e) => updateItem(item.poItemId, 'expiryDate', e.target.value)}
                        />
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 4, display: 'flex', gap: 3 }}>
            <Box sx={{ flex: 1 }}>
              <TextField
                label="GRN Notes / Remarks"
                multiline
                rows={3}
                fullWidth
                placeholder="Enter any observations during receipt..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Box>
            <Paper sx={{ p: 3, bgcolor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 3, minWidth: 250 }}>
               <Typography variant="subtitle2" color="primary.dark" fontWeight="bold">SUMMARY</Typography>
               <Divider sx={{ my: 1 }} />
               <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                 <Typography variant="body2">Total Line Items:</Typography>
                 <Typography variant="body2" fontWeight="bold">{items.length}</Typography>
               </Box>
               <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                 <Typography variant="body2">Total Accepted:</Typography>
                 <Typography variant="body2" fontWeight="bold">{items.reduce((acc, i) => acc + (parseInt(i.acceptedQuantity) || 0), 0)}</Typography>
               </Box>
            </Paper>
          </Box>

          <Box sx={{ mt: 5, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" color="inherit" onClick={onCancel} sx={{ borderRadius: 2, px: 3 }}>
              Cancel
            </Button>
            <Button 
              variant="contained" 
              color="success"
              size="large" 
              startIcon={<CheckCircleIcon />}
              onClick={handleSubmit}
              disabled={loading}
              sx={{ px: 6, borderRadius: 2, fontWeight: 'bold', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)' }}
            >
              {loading ? 'Processing...' : 'Verify & Post GRN'}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default GrnForm;
