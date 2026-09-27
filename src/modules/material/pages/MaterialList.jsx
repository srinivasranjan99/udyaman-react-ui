import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, TablePagination, 
  TextField, InputAdornment, Button, Chip, Avatar, Alert,
  CircularProgress, Stack
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Add as AddIcon, 
  Settings as SettingsIcon,
  ShoppingCart as ShoppingCartIcon 
} from '@mui/icons-material';
import { 
  Popover, Checkbox, FormControlLabel, FormGroup, 
  IconButton, List, ListItem, Tooltip, Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import { useConfig } from '../../../context/ConfigContext.jsx';

const MaterialList = ({ onAddClick, onEditClick, onViewClick }) => {
  const navigate = useNavigate();
  const configContext = useConfig();
  const isFeatureEnabled = configContext?.isFeatureEnabled || (() => false);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stockSummary, setStockSummary] = useState({});
  const [expandedRows, setExpandedRows] = useState({});
  
  // Dynamic Column State
  const [availableFields, setAvailableFields] = useState([]);
  const [visibleColumns, setVisibleColumns] = useState(['name', 'sku', 'categoryId', 'price', 'isActive', 'materialType']);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    fetchConfigs();
    fetchProducts();
    fetchStockSummary();
  }, [page, rowsPerPage, searchTerm]);

  const fetchConfigs = async () => {
    try {
      const res = await api.get('/config/fields/MATERIAL');
      setAvailableFields(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch column configs", err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let endpoint = '/inventory/products';
      let params = { page, size: rowsPerPage };

      if (searchTerm.trim()) {
        endpoint = '/inventory/products/search';
        params.q = searchTerm.trim();
      }

      const response = await api.get(endpoint, { params });
      
      if (response.data && response.data.data) {
        // Handle both Page object (from getAll) and search results
        const data = response.data.data;
        setProducts(data.content || []);
        setTotalElements(data.totalElements || 0);
      } else {
        setProducts([]);
        setTotalElements(0);
      }
    } catch (err) {
      console.error("Failed to fetch products", err);
      setError("Failed to load inventory. Please check your connection or restart the server.");
    } finally {
      setLoading(false);
    }
  };

  const [summaryError, setSummaryError] = useState(null);

  const fetchStockSummary = async () => {
    try {
      setSummaryError(null);
      const res = await api.get('/inventory/stock/summary');
      const summaryMap = {};
      if (Array.isArray(res.data?.data)) {
        res.data.data.forEach(s => {
          summaryMap[Number(s.materialId)] = s;
        });
      }
      setStockSummary(summaryMap);
    } catch (err) {
      console.error("Failed to fetch stock summary", err);
      setSummaryError("Could not load warehouse breakdown.");
    }
  };

  const toggleRow = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Paper sx={{ p: 0.5, flexGrow: 1, mr: 2, display: 'flex', alignItems: 'center' }}>
          <TextField
            fullWidth
            variant="standard"
            placeholder="Search materials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            slotProps={{
              input: {
                disableUnderline: true,
                sx: { px: 2, py: 1 },
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }
            }}
          />
        </Paper>
        <Tooltip title="Table Settings">
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ bgcolor: 'white', border: '1px solid #ddd' }}>
            <SettingsIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Column Selector Popover */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { p: 2, width: 250, maxHeight: 400 } }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Visible Columns</Typography>
        <Divider sx={{ mb: 1 }} />
        <FormGroup>
          {availableFields.map(field => (
            <FormControlLabel
              key={field.fieldName}
              control={
                <Checkbox 
                  size="small"
                  checked={visibleColumns.includes(field.fieldName)} 
                  onChange={(e) => {
                    const col = field.fieldName;
                    setVisibleColumns(prev => 
                      e.target.checked ? [...prev, col] : prev.filter(c => c !== col)
                    );
                  }}
                />
              }
              label={<Typography variant="body2">{field.displayLabel}</Typography>}
            />
          ))}
        </FormGroup>
      </Popover>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ bgcolor: '#f8fafc', width: 50 }} />
              {availableFields.filter(f => visibleColumns.includes(f.fieldName)).map(field => (
                <TableCell key={field.fieldName} sx={{ fontWeight: 'bold', bgcolor: '#f8fafc' }}>
                  {field.displayLabel}
                </TableCell>
              ))}
              <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={visibleColumns.length + 2} align="center" sx={{ py: 5 }}><CircularProgress size={24} /></TableCell></TableRow>
            ) : products.map((product) => {
              const summary = stockSummary[product.id];
              const isExpanded = expandedRows[product.id];
              const totalLedgerStock = summary ? summary.totalStock : product.stockQuantity;

              return (
                <React.Fragment key={product.id}>
                  <TableRow hover onClick={() => toggleRow(product.id)} sx={{ cursor: 'pointer', '& > *': { borderBottom: 'unset' } }}>
                    <TableCell>
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); toggleRow(product.id); }}>
                        {isExpanded ? <SettingsIcon sx={{ transform: 'rotate(90deg)' }} /> : <AddIcon />}
                      </IconButton>
                    </TableCell>
                    {availableFields.filter(f => visibleColumns.includes(f.fieldName)).map(field => {
                      const key = field.fieldName;
                      const value = field.isSystemField ? product[key] : (product.customFields ? product.customFields[key] : '');

                      return (
                        <TableCell key={key}>
                          {key === 'name' ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar sx={{ width: 28, height: 28, fontSize: '0.8rem', bgcolor: 'primary.main' }}>{value ? String(value)[0] : '?'}</Avatar>
                              <Typography variant="body2" fontWeight="bold">{value}</Typography>
                            </Box>
                          ) : key === 'isActive' ? (
                            <Chip label={value ? 'Active' : 'Inactive'} color={value ? 'success' : 'default'} size="small" />
                          ) : key === 'price' ? (
                            `₹${(Number(value) || 0).toFixed(2)}`
                          ) : key === 'stockQuantity' ? (
                            <Tooltip title="Click to see warehouse breakdown" arrow>
                              <Typography 
                                variant="body2" 
                                fontWeight="bold" 
                                color={(totalLedgerStock <= (product.reorderLevel || 10)) ? 'error.main' : 'success.main'}
                              >
                                {totalLedgerStock} {product.unit}
                              </Typography>
                            </Tooltip>
                          ) : (
                            <Typography variant="body2">{String(value || '-')}</Typography>
                          )}
                        </TableCell>
                      );
                    })}
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton size="small" color="primary" onClick={(e) => { e.stopPropagation(); onViewClick(product); }}>
                          <SettingsIcon fontSize="small" />
                        </IconButton>
                        <Tooltip title="Create Purchase Order">
                          <IconButton 
                            size="small" 
                            color="success" 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/procurement/orders/new?productId=${product.id}`);
                            }}
                          >
                            <ShoppingCartIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                  
                  {/* Expanded Warehouse View */}
                  <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={visibleColumns.length + 2}>
                      <Box sx={{ margin: 1, display: isExpanded ? 'block' : 'none', bgcolor: '#f8fafc', p: 2, borderRadius: 2, border: '1px dashed #cbd5e1' }}>
                        <Typography variant="subtitle2" gutterBottom component="div" fontWeight="bold" color="primary">
                          Warehouse Inventory Breakdown (Ledger Summary) - ID: {product.id}
                        </Typography>
                        {summaryError ? (
                          <Typography variant="body2" color="error">{summaryError}</Typography>
                        ) : summary ? (
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Warehouse</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Quantity</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {summary.warehouseStock.map((ws) => (
                                <TableRow key={ws.warehouseId}>
                                  <TableCell>{ws.warehouseName}</TableCell>
                                  <TableCell align="right">{ws.quantity} {product.unit}</TableCell>
                                  <TableCell>
                                    <Chip 
                                      label={ws.quantity > 0 ? 'In Stock' : 'Out of Stock'} 
                                      size="small" 
                                      variant="outlined"
                                      color={ws.quantity > 0 ? 'success' : 'error'}
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <Box sx={{ py: 1 }}>
                            <Typography variant="body2" color="textSecondary">
                              {product.stockQuantity > 0 
                                ? "Aggregate stock exists, but no detailed warehouse movements found in ledger." 
                                : "No stock recorded for this material in any warehouse."}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={totalElements}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </TableContainer>
    </Box>
  );
};

export default MaterialList;
