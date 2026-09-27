import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, TextField, Button, Grid, 
  MenuItem, Alert, CircularProgress, Divider, Paper
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import api from '../../../api/axios';

const StockAdjustmentForm = ({ product, onSave, onCancel }) => {
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState('NEW');
  const [newBatchData, setNewBatchData] = useState({
    batchNumber: '',
    manufacturingDate: '',
    expiryDate: '',
    supplierName: '',
    costPrice: product.costPrice || 0
  });
  const [type, setType] = useState('ADDITION');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('Manual Count Correction');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingBatches, setFetchingBatches] = useState(false);

  useEffect(() => {
    if (product?.isBatchTracked) {
      fetchBatches();
    }
  }, [product]);

  const fetchBatches = async () => {
    setFetchingBatches(true);
    try {
      const variantId = product.variants?.[0]?.id || product.id;
      const res = await api.get(`/inventory/stock/${variantId}/batches`);
      setBatches(res.data.data || []);
      if (res.data.data?.length > 0) {
        setSelectedBatchId(res.data.data[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch batches", err);
    } finally {
      setFetchingBatches(false);
    }
  };

  const handleSubmit = async () => {
    if (!quantity || quantity <= 0) return setError("Please enter a valid quantity");
    if (product.isBatchTracked && !selectedBatchId) return setError("Please select a batch for adjustment");
    if (selectedBatchId === 'NEW' && !newBatchData.batchNumber) return setError("Batch Number is required for new lots");
    if (!reason) return setError("Please provide a reason for adjustment");

    setLoading(true);
    try {
      const variantId = product.variants?.[0]?.id || product.id;
      
      if (selectedBatchId === 'NEW' && type === 'ADDITION') {
        // Create new batch
        await api.post(`/inventory/stock/${variantId}/batches`, {
          ...newBatchData,
          quantity: parseInt(quantity),
          notes: reason
        });
      } else {
        // Normal adjustment
        await api.post(`/inventory/stock/${variantId}/adjust`, {
          quantity: parseInt(quantity),
          type,
          stockBatchId: selectedBatchId === 'NEW' ? null : selectedBatchId,
          reason
        });
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || "Adjustment failed");
    } finally {
      setLoading(false);
    }
  };

  const getImpact = () => {
    const current = (product.isBatchTracked && selectedBatchId !== 'NEW')
      ? (batches.find(b => b.id === selectedBatchId)?.quantity || 0)
      : product.stockQuantity;
    
    const change = parseInt(quantity) || 0;
    const newBal = type === 'ADDITION' ? current + change : current - change;
    return { current, newBal };
  };

  const { current, newBal } = getImpact();

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <WarningAmberIcon color="warning" />
        <Typography variant="h6" fontWeight="bold">Manual Stock Adjustment</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            select
            fullWidth
            label="Adjustment Type"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <MenuItem value="ADDITION">Inventory Correction (Add)</MenuItem>
            <MenuItem value="DEDUCTION">Stock Removal (Deduct)</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder={`Enter quantity in ${product.unit}`}
          />
        </Grid>

        {product?.isBatchTracked && (
          <Grid item xs={12}>
            {fetchingBatches ? <CircularProgress size={20} /> : (
              <Box>
                <TextField
                  select
                  fullWidth
                  label="Target Batch"
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  sx={{ mb: 3 }}
                >
                  {type === 'ADDITION' && <MenuItem value="NEW">+ Create New Batch / Lot</MenuItem>}
                  {batches.map(b => (
                    <MenuItem key={b.id} value={b.id}>
                      {b.batchNumber} (Available: {b.quantity}) {b.isExpired ? '[EXPIRED]' : ''}
                    </MenuItem>
                  ))}
                </TextField>

                {selectedBatchId === 'NEW' && type === 'ADDITION' && (
                  <Paper sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: '#f8fafc' }}>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                      NEW BATCH DETAILS
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField 
                          fullWidth 
                          label="Batch Number" 
                          size="small" 
                          required
                          value={newBatchData.batchNumber}
                          onChange={(e) => setNewBatchData(prev => ({ ...prev, batchNumber: e.target.value }))}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField 
                          fullWidth 
                          label="Expiry Date" 
                          type="date" 
                          size="small" 
                          InputLabelProps={{ shrink: true }}
                          value={newBatchData.expiryDate}
                          onChange={(e) => setNewBatchData(prev => ({ ...prev, expiryDate: e.target.value }))}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField 
                          fullWidth 
                          label="Manufacturing Date" 
                          type="date" 
                          size="small" 
                          InputLabelProps={{ shrink: true }}
                          value={newBatchData.manufacturingDate}
                          onChange={(e) => setNewBatchData(prev => ({ ...prev, manufacturingDate: e.target.value }))}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField 
                          fullWidth 
                          label="Unit Cost Price" 
                          type="number" 
                          size="small" 
                          value={newBatchData.costPrice}
                          onChange={(e) => setNewBatchData(prev => ({ ...prev, costPrice: e.target.value }))}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                )}
              </Box>
            )}
          </Grid>
        )}

        {/* Impact Preview Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, bgcolor: '#f1f5f9', border: '1px dashed #cbd5e1' }}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>PROJECTED IMPACT</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" fontWeight="bold">{current}</Typography>
                <Typography variant="caption">Current Balance</Typography>
              </Box>
              <Typography variant="h4" color="textSecondary">→</Typography>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" fontWeight="bold" color={newBal < 0 ? 'error' : 'primary'}>
                  {newBal}
                </Typography>
                <Typography variant="caption">New Balance</Typography>
              </Box>
            </Box>
            {newBal < 0 && (
              <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
                Warning: This will result in negative stock.
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <TextField
            select
            fullWidth
            label="Reason Category"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          >
            <MenuItem value="Manual Count Correction">Manual Count Correction</MenuItem>
            <MenuItem value="Damaged Goods">Damaged Goods</MenuItem>
            <MenuItem value="Expired Stock Removal">Expired Stock Removal</MenuItem>
            <MenuItem value="Returned to Supplier">Returned to Supplier</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button variant="text" onClick={onCancel}>Cancel</Button>
        <Button 
          variant="contained" 
          color={type === 'DEDUCTION' ? 'error' : 'primary'}
          onClick={handleSubmit}
          disabled={loading}
          sx={{ px: 4, borderRadius: 2 }}
        >
          {loading ? 'Processing...' : `Confirm ${type === 'DEDUCTION' ? 'Removal' : 'Addition'}`}
        </Button>
      </Box>
    </Box>
  );
};

export default StockAdjustmentForm;
