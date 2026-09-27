import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, TextField, Button, 
  Autocomplete, Alert, CircularProgress, Card, CardContent
} from '@mui/material';
import { 
  AddCircle as AddIcon, 
  Inventory as InventoryIcon,
  CheckCircle as SuccessIcon 
} from '@mui/icons-material';
import api from '../../../api/axios';
import inventoryApi from '../../../api/inventoryApi';

/**
 * OpeningStockForm: Allows manual initialization of stock for materials in specific warehouses.
 * This ensures every piece of inventory is tracked from the moment it enters the system.
 */
const OpeningStockForm = ({ onSave }) => {
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    productVariantId: '',
    warehouseId: '',
    quantity: '',
    unitCost: '',
    batchNumber: '',
    expiryDate: '',
    notes: 'Initial Opening Stock'
  });

  const [recentEntries, setRecentEntries] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(false);

  useEffect(() => {
    loadMetadata();
    fetchRecentEntries();
  }, []);

  const loadMetadata = async () => {
    try {
      const [whRes, prodRes] = await Promise.all([
        api.get('/inventory/warehouses'),
        api.get('/inventory/products', { params: { size: 100 } })
      ]);

      // ApiResponse wrapper: { success, data: <payload>, message }
      // Warehouses: payload is a flat List<Warehouse>
      const warehouseList = whRes.data?.data || [];
      console.log('[OpeningStock] Warehouses loaded:', warehouseList.length);
      setWarehouses(Array.isArray(warehouseList) ? warehouseList : []);

      // Products: payload is a Page<ProductResponse> with { content, totalPages, ... }
      const productPage = prodRes.data?.data;
      const productList = productPage?.content || [];
      console.log('[OpeningStock] Products loaded:', productList.length);

      // Flatten products to variants for selection
      const allVariants = productList.flatMap(p => 
        (p.variants || []).map(v => ({
          ...v,
          productName: p.name,
          displayName: `${p.name} - ${v.variantName} (${p.sku})`
        }))
      );
      console.log('[OpeningStock] Variants available:', allVariants.length);
      setProducts(allVariants);
    } catch (err) {
      console.error('[OpeningStock] Load error:', err);
      setError("Failed to load warehouses or products. Please check connectivity.");
    } finally {
      setFetching(false);
    }
  };

  const fetchRecentEntries = async () => {
    setLoadingRecent(true);
    try {
      // Get the inventory ledger to fetch recent entries
      const res = await api.get('/inventory/ledger', { params: { page: 0, size: 50 } });
      const ledgerData = res.data?.data?.content || [];
      // Filter locally for OPENING_STOCK transactions
      const openingStockTxns = ledgerData.filter(txn => txn.transactionType === 'OPENING_STOCK');
      setRecentEntries(openingStockTxns);
    } catch (err) {
      console.error('[OpeningStock] Failed to fetch ledger:', err);
    } finally {
      setLoadingRecent(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.productVariantId || !formData.warehouseId || !formData.quantity) {
      setError("Please fill all mandatory fields.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        quantity: parseInt(formData.quantity),
        unitCost: parseFloat(formData.unitCost) || 0
      };
      await api.post('/inventory/stock/opening', payload);
      setSuccess("Opening stock recorded successfully!");
      setFormData({
        productVariantId: '',
        warehouseId: '',
        quantity: '',
        unitCost: '',
        batchNumber: '',
        expiryDate: '',
        notes: 'Initial Opening Stock'
      });
      fetchRecentEntries();
      if (onSave) onSave();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to record opening stock.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3 }}>
      <Typography variant="h4" fontWeight="900" sx={{ mb: 1, color: '#1e293b' }}>
        Opening Stock Entry
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Initialize your inventory by assigning stock to specific warehouses.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} icon={<SuccessIcon />}>{success}</Alert>}

      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 4, borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Autocomplete
              options={products}
              fullWidth
              getOptionLabel={(option) => option.displayName || ''}
              value={products.find(p => p.id === formData.productVariantId) || null}
              onChange={(e, v) => setFormData({ ...formData, productVariantId: v?.id || '' })}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              renderInput={(params) => (
                <TextField {...params} label="Select Material / Variant" required margin="none" placeholder="Search material/variant..." />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Autocomplete
              options={warehouses}
              fullWidth
              getOptionLabel={(option) => `${option.name} (${option.code})`}
              value={warehouses.find(w => w.id === formData.warehouseId) || null}
              onChange={(e, v) => setFormData({ ...formData, warehouseId: v?.id || '' })}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              renderInput={(params) => (
                <TextField {...params} label="Warehouse" required margin="none" placeholder="Search warehouse..." />
              )}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              label="Quantity"
              type="number"
              required
              fullWidth
              margin="none"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              label="Unit Cost (Valuation)"
              type="number"
              fullWidth
              margin="none"
              value={formData.unitCost}
              onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Batch Number (Optional)"
              fullWidth
              margin="none"
              value={formData.batchNumber}
              onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Expiry Date"
              type="date"
              fullWidth
              margin="none"
              InputLabelProps={{ shrink: true }}
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Notes / Reference"
              fullWidth
              margin="none"
              multiline
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button 
              type="submit" 
              variant="contained" 
              size="large" 
              startIcon={<AddIcon />}
              disabled={loading}
              sx={{ px: 4, borderRadius: 2, fontWeight: 'bold' }}
            >
              {loading ? 'Recording...' : 'Post Opening Stock'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Recent Opening Stock Postings Table */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          Recent Opening Stock Postings
        </Typography>
        <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
          {loadingRecent ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress size={30} /></Box>
          ) : recentEntries.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ p: 4, textAlign: 'center' }}>
              No recent opening stock entries found.
            </Typography>
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Date/Time</th>
                    <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Material / Variant</th>
                    <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Warehouse</th>
                    <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 'bold', color: '#475569', textAlign: 'right' }}>Qty</th>
                    <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 'bold', color: '#475569', textAlign: 'right' }}>Unit Cost</th>
                    <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Batch No</th>
                    <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEntries.map((entry) => (
                    <tr key={entry.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#334155' }}>
                        {entry.createdAt ? new Date(entry.createdAt).toLocaleString() : 'N/A'}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>
                        {entry.productName ? `${entry.productName} - ${entry.variantName} (${entry.sku || 'N/A'})` : entry.variantName}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#334155' }}>
                        {entry.warehouseName || 'Unassigned'}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 'bold', color: '#10b981', textAlign: 'right' }}>
                        +{entry.quantity}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#334155', textAlign: 'right' }}>
                        ₹{entry.unitCost ? entry.unitCost.toFixed(2) : '0.00'}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>
                        {entry.batchNumber || 'N/A'}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#64748b' }}>
                        {entry.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          )}
        </Paper>
      </Box>

      <Box sx={{ mb: 6 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Audit Trail Context</Typography>
        <Card sx={{ bgcolor: '#f8fafc', border: '1px dashed #cbd5e1', boxShadow: 'none' }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              * Posting opening stock creates an immutable <strong>OPENING_STOCK</strong> entry in the ledger.
              <br />
              * This will immediately update the <strong>Inventory Balance</strong> for the selected warehouse.
              <br />
              * Stock valuation will be updated based on the provided unit cost.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default OpeningStockForm;
