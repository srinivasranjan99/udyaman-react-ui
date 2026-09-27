import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Container, Grid, Paper, Typography, Box, TextField, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Divider, Dialog, DialogTitle, DialogContent,
  InputAdornment, Chip, ToggleButton, ToggleButtonGroup, Alert, Stack
} from '@mui/material';
import {
  Delete as DeleteIcon,
  AddCircle as AddCircleIcon,
  RemoveCircle as RemoveCircleIcon,
  PointOfSale as PointOfSaleIcon,
  QrCodeScanner as QrCodeScannerIcon,
  Search as SearchIcon,
  Payments as PaymentsIcon,
  AccountBalance as AccountBalanceIcon,
  QrCode as QrCodeIcon
} from '@mui/icons-material';
import { Scanner } from '@yudiel/react-qr-scanner';
import api from '../api/axios';
import InvoicePreview from '../components/InvoicePreview.jsx';

// Memoized Cart Item Row
const CartItemRow = React.memo(({ item, onUpdateQty, onRemove }) => {
  const itemTotal = (Number(item.price) || 0) * (Number(item.qty) || 0);
  const gstTotal = (itemTotal * (Number(item.gstRate) || 0)) / 100;

  return (
    <TableRow hover>
      <TableCell sx={{ py: 1 }}>
        <Typography variant="body2" fontWeight="bold">{item.name}</Typography>
        <Typography variant="caption" color="textSecondary" display="block">SKU: {item.sku}</Typography>
        {item.batchNumber && (
          <Chip label={`Batch: ${item.batchNumber}`} size="small" sx={{ height: 16, fontSize: '0.65rem', mt: 0.5 }} color="primary" variant="outlined" />
        )}
      </TableCell>
      <TableCell align="center">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconButton size="small" onClick={() => onUpdateQty(item.id, -1)} color="primary">
            <RemoveCircleIcon fontSize="small" />
          </IconButton>
          <Typography sx={{ mx: 1.5, fontWeight: 'bold' }}>{item.qty}</Typography>
          <IconButton size="small" onClick={() => onUpdateQty(item.id, 1)} color="primary">
            <AddCircleIcon fontSize="small" />
          </IconButton>
        </Box>
      </TableCell>
      <TableCell align="right">₹{Number(item.price || 0).toFixed(2)}</TableCell>
      <TableCell align="right">₹{gstTotal.toFixed(2)}</TableCell>
      <TableCell align="right" sx={{ fontWeight: 'bold' }}>₹{(itemTotal + gstTotal).toFixed(2)}</TableCell>
      <TableCell align="center">
        <IconButton size="small" color="error" onClick={() => onRemove(item.id)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
});

export default function BillingPage() {
  const [allProducts, setAllProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [error, setError] = useState('');
  const [completedInvoice, setCompletedInvoice] = useState(null);
  
  const [batchDialogOpen, setBatchDialogOpen] = useState(false);
  const [batches, setBatches] = useState([]);
  const [pendingProduct, setPendingProduct] = useState(null);

  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F1') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'F2') {
        e.preventDefault();
        handleCheckout();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, paymentMode, customerName]);

  useEffect(() => {
    searchInputRef.current?.focus();
    fetchInventoryPool();
  }, []);

  const fetchInventoryPool = async () => {
    try {
      setLoading(true);
      const res = await api.get('/inventory/products', { params: { size: 2000 } });
      if (res.data && res.data.data) {
        setAllProducts(res.data.data.content || res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to load inventory pool", err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = useCallback(async (product, batch = null) => {
    if (product.isBatchTracked && !batch) {
      setLoading(true);
      try {
        const res = await api.get(`/inventory/products/${product.id}/batches`);
        setBatches(res.data.data || []);
        setPendingProduct(product);
        setBatchDialogOpen(true);
        return;
      } catch (err) {
        setError("Failed to load batches");
        return;
      } finally {
        setLoading(false);
      }
    }

    setCart(prev => {
      const existing = prev.find(i => (batch ? i.batchId === batch.id : i.id === product.id));
      if (existing) {
        return prev.map(i => (batch ? i.batchId === batch.id : i.id === product.id) 
          ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { 
        ...product, 
        qty: 1, 
        batchId: batch?.id, 
        batchNumber: batch?.batchNumber 
      }];
    });
    
    setSearchInput('');
    setTimeout(() => searchInputRef.current?.focus(), 50);
  }, []);

  const handleBarcodeOrInput = (value) => {
    setSearchInput(value);
    const exactMatch = allProducts.find(p => p.barcode === value || p.sku === value);
    if (exactMatch) {
      addToCart(exactMatch);
      setSearchInput('');
    }
  };

  const filteredResults = useMemo(() => {
    if (!searchInput.trim() || searchInput.trim().length < 2) return [];
    const term = searchInput.toLowerCase().trim();
    return allProducts.filter(p => 
      p.name.toLowerCase().includes(term) || 
      p.sku?.toLowerCase().includes(term) ||
      p.barcode?.includes(term)
    ).slice(0, 10);
  }, [searchInput, allProducts]);

  const updateQty = useCallback((id, delta) => {
    setCart(prev => prev.map(item => 
      item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
    ));
  }, []);

  const removeItem = useCallback((id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  }, []);

  const { subtotal, totalGst, grandTotal } = useMemo(() => {
    return cart.reduce((acc, item) => {
      const price = item.price || 0;
      const gstRate = item.gstRate || 0;
      const itemTotal = price * item.qty;
      const gst = (itemTotal * gstRate) / 100;
      acc.subtotal += itemTotal;
      acc.totalGst += gst;
      acc.grandTotal += (itemTotal + gst);
      return acc;
    }, { subtotal: 0, totalGst: 0, grandTotal: 0 });
  }, [cart]);

  const handleCheckout = async () => {
    if (cart.length === 0 || loading) return;
    setLoading(true);
    try {
      const payload = {
        customerName: customerName || 'Walk-in Customer',
        paymentMode,
        items: cart.map(item => ({
          variantId: item.variants?.[0]?.id || item.id,
          batchId: item.batchId,
          quantity: item.qty,
          unitPrice: item.price
        }))
      };
      const res = await api.post('/billing/invoices', payload);
      setCompletedInvoice(res.data.data);
      setCart([]);
      setCustomerName('Walk-in Customer');
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth={false} sx={{ mt: 2, height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      <Grid container spacing={2} sx={{ flexGrow: 1, overflow: 'hidden' }}>
        
        {/* LEFT PANEL */}
        <Grid item xs={12} md={5} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Paper elevation={3} sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%', borderRadius: 3 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SearchIcon color="primary" /> Product Selection <Chip label="V2" size="small" color="secondary" />
              </Typography>
              <Box sx={{ position: 'relative' }}>
                <TextField
                  fullWidth
                  autoFocus
                  inputRef={searchInputRef}
                  placeholder="Scan Barcode or Type Product Name (F1)"
                  value={searchInput}
                  onChange={(e) => handleBarcodeOrInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && filteredResults.length > 0) {
                      addToCart(filteredResults[0]);
                    }
                  }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <QrCodeScannerIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowScanner(true)} size="small">
                            <QrCodeScannerIcon />
                          </IconButton>
                        </InputAdornment>
                      )
                    }
                  }}
                />
                
                {filteredResults.length > 0 && (
                  <Paper 
                    elevation={10} 
                    sx={{ 
                      position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                      maxHeight: 400, overflowY: 'auto', mt: 1, borderRadius: 2
                    }}
                  >
                    {filteredResults.map(p => (
                      <Box 
                        key={p.id} 
                        sx={{ p: 2, borderBottom: '1px solid #f0f0f0', cursor: 'pointer', '&:hover': { bgcolor: '#f5f9ff' } }}
                        onClick={() => addToCart(p)}
                      >
                        <Grid container justifyContent="space-between" alignItems="center">
                          <Grid item>
                            <Typography variant="body1" fontWeight="bold">{p.name}</Typography>
                            <Typography variant="caption" color="textSecondary">SKU: {p.sku} | Stock: {p.stockQuantity}</Typography>
                          </Grid>
                          <Grid item>
                            <Typography variant="subtitle1" fontWeight="bold" color="primary">₹{p.price}</Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    ))}
                  </Paper>
                )}
              </Box>
            </Box>

            <Box sx={{ flexGrow: 1, overflowY: 'auto', bgcolor: '#fafafa', p: 2, borderRadius: 2 }}>
              <Typography variant="caption" color="textSecondary" sx={{ mb: 1, display: 'block', fontWeight: 'bold' }}>QUICK CATALOG</Typography>
              <Grid container spacing={2}>
                {allProducts.slice(0, 10).map(p => (
                  <Grid item xs={6} key={p.id}>
                    <Paper 
                      variant="outlined" 
                      sx={{ p: 1.5, cursor: 'pointer', '&:hover': { bgcolor: '#fff', boxShadow: 1 } }}
                      onClick={() => addToCart(p)}
                    >
                      <Typography variant="caption" fontWeight="bold" noWrap display="block">{p.name}</Typography>
                      <Typography variant="body2" color="primary">₹{p.price}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* RIGHT PANEL */}
        <Grid item xs={12} md={7} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Paper elevation={3} sx={{ display: 'flex', flexDirection: 'column', height: '100%', borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ p: 2, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                label="Customer"
                size="small"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                sx={{ flexGrow: 1, bgcolor: '#fff' }}
              />
              <Chip label={`Items: ${cart.length}`} color="primary" variant="outlined" />
            </Box>

            <TableContainer sx={{ flexGrow: 1, bgcolor: '#fff' }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8fafc' }}>Item Description</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: '#f8fafc' }}>Quantity</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: '#f8fafc' }}>Price</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: '#f8fafc' }}>GST</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: '#f8fafc' }}>Total</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: '#f8fafc' }}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cart.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                        <Typography color="textSecondary">Cart is empty. Start scanning or searching.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    cart.map(item => (
                      <CartItemRow 
                        key={item.id} 
                        item={item} 
                        onUpdateQty={updateQty} 
                        onRemove={removeItem} 
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ p: 3, bgcolor: '#f1f5f9', borderTop: '2px solid #e2e8f0' }}>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Payment Mode</Typography>
                  <ToggleButtonGroup
                    value={paymentMode}
                    exclusive
                    onChange={(e, val) => val && setPaymentMode(val)}
                    fullWidth
                    color="primary"
                    size="small"
                  >
                    <ToggleButton value="CASH" sx={{ gap: 1 }}><PaymentsIcon fontSize="small" /> Cash</ToggleButton>
                    <ToggleButton value="UPI" sx={{ gap: 1 }}><QrCodeIcon fontSize="small" /> UPI</ToggleButton>
                    <ToggleButton value="CARD" sx={{ gap: 1 }}><AccountBalanceIcon fontSize="small" /> Card</ToggleButton>
                  </ToggleButtonGroup>
                  {error && <Alert severity="error" sx={{ mt: 2, py: 0 }}>{error}</Alert>}
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" color="textSecondary">Subtotal:</Typography>
                    <Typography variant="body2" fontWeight="medium">₹{subtotal.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="textSecondary">Total Tax (GST):</Typography>
                    <Typography variant="body2" fontWeight="medium">₹{totalGst.toFixed(2)}</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <Typography variant="h6" fontWeight="bold">Grand Total:</Typography>
                    <Typography variant="h4" fontWeight="bold" color="primary">₹{grandTotal.toFixed(2)}</Typography>
                  </Box>
                </Grid>
              </Grid>

              <Button
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 3, py: 1.5, fontSize: '1.1rem', fontWeight: 'bold', borderRadius: 2 }}
                startIcon={<PointOfSaleIcon />}
                disabled={cart.length === 0 || loading}
                onClick={handleCheckout}
              >
                {loading ? 'Processing...' : 'Complete Transaction (F2)'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Batch Selection Dialog */}
      <Dialog open={batchDialogOpen} onClose={() => setBatchDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Select Batch: {pendingProduct?.name}</DialogTitle>
        <DialogContent dividers>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Batch No</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Expiry</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Stock</TableCell>
                <TableCell align="right"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {batches.map(b => (
                <TableRow key={b.id} hover>
                  <TableCell>{b.batchNumber}</TableCell>
                  <TableCell>{b.expiryDate || 'No Expiry'}</TableCell>
                  <TableCell align="right">{b.currentQuantity}</TableCell>
                  <TableCell align="right">
                    <Button size="small" variant="outlined" onClick={() => {
                      addToCart(pendingProduct, b);
                      setBatchDialogOpen(false);
                    }} disabled={b.currentQuantity <= 0}>Select</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>

      {/* Webcam Scanner Dialog */}
      <Dialog open={showScanner} onClose={() => setShowScanner(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Scan Barcode</DialogTitle>
        <DialogContent sx={{ p: 0, bgcolor: '#000', minHeight: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {showScanner && (
            <Box sx={{ width: '100%', height: '100%', minHeight: 400 }}>
              <Scanner onScan={(res) => {
                if (res?.[0]?.rawValue) {
                  handleBarcodeOrInput(res[0].rawValue);
                  setShowScanner(false);
                }
              }} allowMultiple={false} />
            </Box>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!completedInvoice} onClose={() => setCompletedInvoice(null)} maxWidth="md" fullWidth>
        <DialogContent sx={{ p: 0 }}>
          <InvoicePreview invoiceData={completedInvoice} onClose={() => setCompletedInvoice(null)} />
        </DialogContent>
      </Dialog>
    </Container>
  );
}
