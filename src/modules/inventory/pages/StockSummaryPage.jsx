import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, Tooltip, CircularProgress, Alert, LinearProgress,
  Collapse
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Inventory2 as Inventory2Icon,
  WarningAmber as WarningIcon,
  CheckCircle as CheckIcon,
  History as HistoryIcon,
  SwapHoriz as TransferIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon
} from '@mui/icons-material';
import api from '../../../api/axios';

/**
 * StockSummaryPage: Provides a comprehensive view of inventory levels across all locations.
 * Includes expandable rows detailing stock levels per warehouse and for individual product variants.
 */
const StockSummaryPage = () => {
  const [stock, setStock] = useState([]);
  const [stockSummary, setStockSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [error, setError] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    fetchStockSummary();
  }, []);

  const fetchStockSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch products with large page size to avoid truncation (size: 100)
      const prodRes = await api.get('/inventory/products', { params: { size: 100 } });
      const products = prodRes.data?.data?.content || [];
      setStock(products);

      // 2. Fetch warehouse ledger summaries
      try {
        const sumRes = await api.get('/inventory/stock/summary');
        const summaryMap = {};
        if (Array.isArray(sumRes.data?.data)) {
          sumRes.data.data.forEach(s => {
            summaryMap[Number(s.materialId)] = s;
          });
        }
        setStockSummary(summaryMap);
      } catch (sumErr) {
        console.error("Failed to load warehouse stock summary:", sumErr);
      }
    } catch (err) {
      console.error("Failed to load stock summary:", err);
      setError("Failed to synchronize inventory data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredStock = stock.filter(item => 
    item.name.toLowerCase().includes(query.toLowerCase()) || 
    item.sku?.toLowerCase().includes(query.toLowerCase())
  );

  const getStatusColor = (qty, minQty) => {
    if (qty <= 0) return 'error';
    if (qty <= minQty) return 'warning';
    return 'success';
  };

  return (
    <Box sx={{ p: 0 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>Stock Summary</Typography>
        <Typography variant="body2" color="text.secondary">
          Monitor real-time inventory levels, stock health, and location-based distribution.
        </Typography>
      </Box>

      {/* Analytics Highlights */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: '#f0f9ff', border: '1px solid #bae6fd' }}>
            <Typography variant="caption" color="primary.main" fontWeight="bold">TOTAL SKU ITEMS</Typography>
            <Typography variant="h4" fontWeight="bold">{stock.length}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: '#fffbeb', border: '1px solid #fef3c7' }}>
            <Typography variant="caption" color="warning.main" fontWeight="bold">LOW STOCK ALERTS</Typography>
            <Typography variant="h4" fontWeight="bold">{stock.filter(s => (s.stockQuantity || 0) <= (s.reorderLevel || 10)).length}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <Typography variant="caption" color="success.main" fontWeight="bold">HEALTHY STOCK</Typography>
            <Typography variant="h4" fontWeight="bold">{stock.filter(s => (s.stockQuantity || 0) > (s.reorderLevel || 10)).length}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {/* Inventory Table */}
      <Paper sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'white' }}>
          <TextField
            placeholder="Search stock by name or SKU..."
            size="small"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ width: 400 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
              sx: { borderRadius: 2 }
            }}
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Filter Locations">
              <IconButton onClick={fetchStockSummary}><FilterListIcon /></IconButton>
            </Tooltip>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchStockSummary}><HistoryIcon /></IconButton>
            </Tooltip>
          </Box>
        </Box>

        {loading && <LinearProgress />}
        
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell style={{ width: '50px' }} />
                <TableCell sx={{ fontWeight: 'bold' }}>Product Details</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>SKU / Code</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Stock Level</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStock.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                    {loading ? <CircularProgress size={24} /> : "No matching inventory found."}
                  </TableCell>
                </TableRow>
              ) : filteredStock.map((item) => {
                const isExpanded = !!expandedRows[item.id];
                const summary = stockSummary[item.id];
                
                return (
                  <React.Fragment key={item.id}>
                    <TableRow hover onClick={() => toggleRow(item.id)} sx={{ cursor: 'pointer', '& > *': { borderBottom: 'unset' } }}>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <IconButton size="small" onClick={() => toggleRow(item.id)}>
                          {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ p: 1, bgcolor: 'primary.light', borderRadius: 2, color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                            <Inventory2Icon fontSize="small" />
                          </Box>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">{item.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{item.categoryName || 'General'}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={item.sku || item.code || 'N/A'} size="small" variant="outlined" sx={{ borderRadius: 1 }} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">{item.stockQuantity || 0} {item.unit}</Typography>
                        <Typography variant="caption" color="text.secondary">Min: {item.reorderLevel || 10}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          icon={(item.stockQuantity || 0) <= (item.reorderLevel || 10) ? <WarningIcon /> : <CheckIcon />}
                          label={(item.stockQuantity || 0) <= 0 ? 'Out of Stock' : (item.stockQuantity || 0) <= (item.reorderLevel || 10) ? 'Low Stock' : 'In Stock'}
                          color={getStatusColor(item.stockQuantity || 0, item.reorderLevel || 10)}
                          size="small"
                          sx={{ borderRadius: 1.5, fontWeight: 'bold' }}
                        />
                      </TableCell>
                      <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                        <Tooltip title="Quick Transfer">
                          <IconButton size="small" color="primary"><TransferIcon fontSize="small" /></IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>

                    {/* Expandable breakdown row */}
                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                          <Box sx={{ margin: 2, bgcolor: '#f8fafc', p: 3, borderRadius: 3, border: '1px dashed #cbd5e1' }}>
                            <Grid container spacing={4}>
                              {/* Warehouse stock breakdown */}
                              <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" fontWeight="bold" color="primary" sx={{ mb: 2 }}>
                                  Warehouse Distribution (Ledger Summary)
                                </Typography>
                                {summary && summary.warehouseStock && summary.warehouseStock.length > 0 ? (
                                  <Table size="small">
                                    <TableHead>
                                      <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold', py: 1 }}>Warehouse</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', py: 1 }} align="right">Quantity</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {summary.warehouseStock.map((ws) => (
                                        <TableRow key={ws.warehouseId}>
                                          <TableCell sx={{ py: 0.75 }}>{ws.warehouseName}</TableCell>
                                          <TableCell sx={{ py: 0.75 }} align="right">
                                            <strong>{ws.quantity}</strong> {item.unit}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                ) : (
                                  <Typography variant="body2" color="text.secondary">
                                    {item.stockQuantity > 0 
                                      ? "Aggregate stock exists, but no detailed warehouse movements found in ledger." 
                                      : "No stock recorded for this material in any warehouse."}
                                  </Typography>
                                )}
                              </Grid>

                              {/* Variant details */}
                              <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" fontWeight="bold" color="primary" sx={{ mb: 2 }}>
                                  Variants Stock Levels
                                </Typography>
                                {item.variants && item.variants.length > 0 ? (
                                  <Table size="small">
                                    <TableHead>
                                      <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold', py: 1 }}>Variant Name</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', py: 1 }}>SKU</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', py: 1 }} align="right">Quantity</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {item.variants.map((v) => (
                                        <TableRow key={v.id}>
                                          <TableCell sx={{ py: 0.75 }}>{v.variantName}</TableCell>
                                          <TableCell sx={{ py: 0.75 }}><Chip label={v.sku} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.75rem' }} /></TableCell>
                                          <TableCell sx={{ py: 0.75 }} align="right">
                                            <strong>{v.stockQuantity}</strong> {v.unit || item.unit}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                ) : (
                                  <Typography variant="body2" color="text.secondary">
                                    No variants defined for this product.
                                  </Typography>
                                )}
                              </Grid>
                            </Grid>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default StockSummaryPage;
