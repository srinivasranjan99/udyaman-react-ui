import React, { useState, useEffect } from 'react';
import { 
  Drawer, Box, Typography, IconButton, Divider, 
  Tabs, Tab, Grid, Chip, Avatar, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import BatchPredictionIcon from '@mui/icons-material/BatchPrediction';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ExtensionIcon from '@mui/icons-material/Extension';
import HistoryIcon from '@mui/icons-material/History';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import api from '../../api/axios';
import StockAdjustmentForm from '../../modules/inventory/components/StockAdjustmentForm.jsx';
import { Dialog } from '@mui/material';

const MaterialDetailsDrawer = ({ open, onClose, product, onEdit }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [batches, setBatches] = useState([]);
  const [stockSummary, setStockSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);

  useEffect(() => {
    if (open && product) {
      if (product.isBatchTracked) fetchBatches();
      fetchStockSummary();
    }
  }, [open, product]);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/inventory/products/${product.id}/batches`);
      setBatches(res.data.data || []);
    } catch (err) {
      console.error("Failed to load batches", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStockSummary = async () => {
    try {
      const res = await api.get('/inventory/stock/summary');
      if (Array.isArray(res.data?.data)) {
        const myStock = res.data.data.find(s => s.materialId === product.id);
        setStockSummary(myStock);
      }
    } catch (err) {
      console.error("Failed to load stock summary", err);
    }
  };

  if (!product) return null;

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 600 }, p: 0 } }}>
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'primary.main', color: 'white' }}>
        <Box>
          <Typography variant="h6" fontWeight="bold">{product.name}</Typography>
          <Typography variant="caption">SKU: {product.sku}</Typography>
        </Box>
        <Box>
          <IconButton onClick={onEdit} sx={{ color: 'white', mr: 1 }}><EditIcon /></IconButton>
          <IconButton onClick={onClose} sx={{ color: 'white' }}><CloseIcon /></IconButton>
        </Box>
      </Box>

      <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="fullWidth" sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tab icon={<BatchPredictionIcon />} label="Batches" />
        <Tab icon={<WarehouseIcon />} label="Inventory" />
        <Tab icon={<LocalShippingIcon />} label="Suppliers" />
        <Tab icon={<ExtensionIcon />} label="Attributes" />
      </Tabs>

      <Box sx={{ p: 3, overflowY: 'auto', flexGrow: 1 }}>
        {/* Tab 0: Batches */}
        {activeTab === 0 && (
          <Box>
            {!product.isBatchTracked ? (
              <Alert severity="info">Batch tracking is disabled for this material.</Alert>
            ) : loading ? (
              <CircularProgress size={24} />
            ) : batches.length === 0 ? (
              <Typography color="textSecondary">No active batches in stock.</Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Batch No</TableCell>
                      <TableCell>Expiry</TableCell>
                      <TableCell align="right">Qty</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {batches.map(b => (
                      <TableRow key={b.id}>
                        <TableCell fontWeight="medium">{b.batchNumber}</TableCell>
                        <TableCell>
                          <Chip 
                            label={b.expiryDate || 'N/A'} 
                            size="small" 
                            color={b.isExpired ? 'error' : 'default'} 
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">{b.currentQuantity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* Tab 1: Inventory Breakdown */}
        {activeTab === 1 && (
          <Box>
            {!stockSummary ? (
              <Typography color="textSecondary">No ledger data available for this material.</Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Warehouse</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Stock</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stockSummary.warehouseStock.map(ws => (
                      <TableRow key={ws.warehouseId}>
                        <TableCell>{ws.warehouseName}</TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold">
                            {ws.quantity} {product.unit}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* Tab 2: Suppliers */}
        {activeTab === 2 && (
          <Box>
            {(!product.suppliers || product.suppliers.length === 0) ? (
              <Typography color="textSecondary">No suppliers mapped to this material.</Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Supplier Name</TableCell>
                      <TableCell align="right">Cost Price</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {product.suppliers.map(s => (
                      <TableRow key={s.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">{s.name}</Typography>
                          <Typography variant="caption">{s.contactPerson}</Typography>
                        </TableCell>
                        <TableCell align="right">₹{product.costPrice?.toFixed(2) || '0.00'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* Tab 3: Custom Attributes */}
        {activeTab === 3 && (
          <Box>
            {(!product.customFields || Object.keys(product.customFields).length === 0) ? (
              <Typography color="textSecondary">No custom attributes defined.</Typography>
            ) : (
              <Grid container spacing={2}>
                {Object.entries(product.customFields).map(([key, value]) => (
                  <Grid item xs={6} key={key}>
                    <Typography variant="caption" color="textSecondary" sx={{ textTransform: 'uppercase' }}>
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {value === true ? 'Yes' : value === false ? 'No' : value || '-'}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}
      </Box>

      <Divider />
      <Box sx={{ p: 2, bgcolor: '#f8fafc' }}>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={4}><Typography variant="caption">Selling Price</Typography><Typography variant="h6">₹{product.price}</Typography></Grid>
          <Grid item xs={4}><Typography variant="caption">Available Stock</Typography><Typography variant="h6">{product.stockQuantity} {product.unit}</Typography></Grid>
          <Grid item xs={4} sx={{ textAlign: 'right' }}>
            <Button 
              variant="outlined" 
              color="warning" 
              startIcon={<HistoryIcon />}
              onClick={() => setIsAdjustOpen(true)}
              size="small"
            >
              Adjust
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Adjustment Dialog */}
      <Dialog open={isAdjustOpen} onClose={() => setIsAdjustOpen(false)} maxWidth="sm" fullWidth>
        <Box sx={{ p: 4 }}>
          <StockAdjustmentForm 
            product={product} 
            onSave={() => { setIsAdjustOpen(false); onClose(); }} 
            onCancel={() => setIsAdjustOpen(false)} 
          />
        </Box>
      </Dialog>
    </Drawer>
  );
};

export default MaterialDetailsDrawer;
