import React, { useState, useEffect } from 'react';
import {
  Container, Paper, Typography, Box, Grid, TextField, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Checkbox, IconButton, Card, CardContent, Divider, Dialog,
  DialogTitle, DialogContent, DialogActions, FormControl, InputLabel,
  Select, MenuItem
} from '@mui/material';
import {
  Print as PrintIcon,
  Autorenew as AutorenewIcon,
  AddCircle as AddCircleIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { inventoryApi } from '../api/inventoryApi';
import api from '../api/axios';

export default function BarcodePage() {
  const [products, setProducts] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]); // [{id, sku, name, barcode, copies}]
  const [loading, setLoading] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [labelTemplate, setLabelTemplate] = useState('a4_3x8');
  const [error, setError] = useState(null);

  const labelTemplates = {
    'a4_3x8': { name: 'A4 - 3x8 (24 Labels)', cols: 3, width: '65mm', height: '34mm', gap: '2mm' },
    'a4_4x10': { name: 'A4 - 4x10 (40 Labels)', cols: 4, width: '48mm', height: '27mm', gap: '1.5mm' },
    'roll_50x25': { name: 'Roll - 50x25mm', cols: 1, width: '50mm', height: '25mm', gap: '0mm' }
  };

  const currentTemplate = labelTemplates[labelTemplate];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await inventoryApi.getProducts();
      setProducts(res.data.content || []);
    } catch (err) {
      console.error('Failed to fetch products', err);
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  const addToSelection = (product) => {
    if (selectedItems.find(item => item.id === product.id)) return;
    setSelectedItems([...selectedItems, { ...product, copies: 1 }]);
  };

  const updateCopies = (id, copies) => {
    setSelectedItems(selectedItems.map(item => 
      item.id === id ? { ...item, copies: Math.max(1, parseInt(copies) || 1) } : item
    ));
  };

  const removeItem = (id) => {
    setSelectedItems(selectedItems.filter(item => item.id !== id));
  };

  const generateBarcodeForProduct = async (productId) => {
    try {
      setLoading(true);
      // Directly using axios instance for specific generate call as it might be specific to variant
      const res = await api.post(`/inventory/products/${productId}/barcode/generate`);
      const updatedProduct = res.data.data;
      
      // Update local products list
      setProducts(products.map(p => p.id === productId ? updatedProduct : p));
      
      // Update selected items if present
      setSelectedItems(selectedItems.map(item => 
        item.id === productId ? { ...item, barcode: updatedProduct.barcode } : item
      ));
    } catch (err) {
      console.error('Failed to generate barcode', err);
      setError("Failed to generate barcode.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Barcode Label Architect
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
        Generate and print professional barcode labels for your inventory.
      </Typography>

      <Grid container spacing={3}>
        {/* Product Selection */}
        <Grid item xs={12} md={7}>
          <Paper elevation={3} sx={{ p: 0, overflow: 'hidden' }}>
            <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
              <Typography variant="h6" fontWeight="bold">Select Products</Typography>
            </Box>
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product Name</TableCell>
                    <TableCell>SKU</TableCell>
                    <TableCell>Current Barcode</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id} hover>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.sku}</TableCell>
                      <TableCell>
                        {product.barcode ? (
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{product.barcode}</Typography>
                        ) : (
                          <Typography variant="caption" color="error">None</Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Button 
                          size="small" 
                          startIcon={<AddCircleIcon />}
                          onClick={() => addToSelection(product)}
                          disabled={!product.barcode}
                        >
                          Add
                        </Button>
                        {!product.barcode && (
                          <IconButton 
                            size="small" 
                            color="primary" 
                            onClick={() => generateBarcodeForProduct(product.id)}
                            title="Generate Barcode"
                          >
                            <AutorenewIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Print Queue */}
        <Grid item xs={12} md={5}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Print Queue</Typography>
            <Divider sx={{ mb: 2 }} />

            {selectedItems.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                <Typography>No items selected for printing.</Typography>
              </Box>
            ) : (
              <Box sx={{ mb: 4 }}>
                {selectedItems.map((item) => (
                  <Box key={item.id} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography fontWeight="bold">{item.name}</Typography>
                      <IconButton size="small" color="error" onClick={() => removeItem(item.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <TextField
                        label="Copies"
                        type="number"
                        size="small"
                        value={item.copies}
                        onChange={(e) => updateCopies(item.id, e.target.value)}
                        sx={{ width: 80 }}
                      />
                      <Box sx={{ flexGrow: 1, textAlign: 'right' }}>
                        <img 
                          src={`${api.defaults.baseURL}/inventory/barcodes/render/${item.barcode}`} 
                          alt={item.barcode}
                          style={{ height: '30px', maxWidth: '100%' }}
                        />
                      </Box>
                    </Box>
                  </Box>
                ))}
                
                <Button 
                  fullWidth 
                  variant="contained" 
                  size="large" 
                  startIcon={<PrintIcon />}
                  onClick={() => setShowPrintPreview(true)}
                  sx={{ mt: 2 }}
                >
                  Proceed to Print ({selectedItems.reduce((a, b) => a + b.copies, 0)} labels)
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Dialog 
        fullScreen 
        open={showPrintPreview} 
        onClose={() => setShowPrintPreview(false)}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f5f5f5' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Typography variant="h6" fontWeight="bold">Standard Sticker Printing Architect</Typography>
            <FormControl size="small" sx={{ minWidth: 250 }}>
              <InputLabel>Sticker Sheet Template</InputLabel>
              <Select
                value={labelTemplate}
                label="Sticker Sheet Template"
                onChange={(e) => setLabelTemplate(e.target.value)}
              >
                {Object.entries(labelTemplates).map(([key, t]) => (
                  <MenuItem key={key} value={key}>{t.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box>
            <Button onClick={() => setShowPrintPreview(false)} sx={{ mr: 2 }}>Close</Button>
            <Button variant="contained" color="success" startIcon={<PrintIcon />} onClick={handlePrint}>Print Now</Button>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ bgcolor: '#525659' }}>
          <Box className="print-area" sx={{ 
            bgcolor: 'white', 
            width: labelTemplate.startsWith('roll') ? currentTemplate.width : '210mm', 
            minHeight: labelTemplate.startsWith('roll') ? 'auto' : '297mm',
            margin: '20px auto',
            p: labelTemplate.startsWith('roll') ? 0 : '10mm',
            boxShadow: 3,
            display: 'grid',
            gridTemplateColumns: `repeat(${currentTemplate.cols}, ${currentTemplate.width})`,
            gap: currentTemplate.gap,
            justifyContent: 'center'
          }}>
            {selectedItems.flatMap(item => 
              Array.from({ length: item.copies }).map((_, idx) => (
                <Box key={`${item.id}-${idx}`} sx={{ 
                  width: currentTemplate.width, 
                  height: currentTemplate.height, 
                  border: '1px dashed #eee', // Dashed border for cutting guide (hidden in print)
                  p: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '8px',
                  textAlign: 'center',
                  overflow: 'hidden',
                  '@media print': {
                    border: 'none',
                    margin: 0
                  }
                }}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: '9px', mb: 0.5, lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden' }}>
                    {item.name}
                  </Typography>
                  <img 
                    src={`${api.defaults.baseURL}/inventory/barcodes/render/${item.barcode}`} 
                    alt={item.barcode}
                    style={{ width: '90%', height: 'auto', maxHeight: '15mm' }}
                  />
                  <Typography variant="caption" sx={{ mt: 0.5, fontFamily: 'monospace', fontSize: '8px' }}>
                    {item.barcode}
                  </Typography>
                </Box>
              ))
            )}
          </Box>
        </DialogContent>
      </Dialog>

      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-area, .print-area * {
              visibility: visible;
            }
            .print-area {
              position: absolute;
              left: 0;
              top: 0;
              margin: 0 !important;
              padding: 0 !important;
              box-shadow: none !important;
              width: 100% !important;
            }
            @page {
              size: A4;
              margin: 0;
            }
          }
        `}
      </style>
    </Container>
  );
}
