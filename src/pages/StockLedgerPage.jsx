import React, { useState, useEffect } from 'react';
import { 
  Box, Container, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, TablePagination,
  TextField, Chip, Grid, Button, Dialog
} from '@mui/material';
import {
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  FilterAlt as FilterAltIcon
} from '@mui/icons-material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import api from '../api/axios';
import InvoicePreview from '../components/InvoicePreview.jsx';

export default function StockLedgerPage() {
  const [ledger, setLedger] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [products, setProducts] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/inventory/products', { params: { size: 100 } });
        if (res.data?.data?.content) setProducts(res.data.data.content);
      } catch (err) { console.error(err); }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchLedger = async () => {
      setLoading(true);
      try {
        const params = {
          page, size: rowsPerPage, variantId: selectedVariantId || undefined,
          startDate: startDate ? `${startDate}T00:00:00` : undefined,
          endDate: endDate ? `${endDate}T23:59:59` : undefined
        };
        const res = await api.get('/inventory/ledger', { params });
        if (res.data?.data) {
          setLedger(res.data.data.content || []);
          setTotalElements(res.data.data.totalElements || 0);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchLedger();
  }, [page, rowsPerPage, startDate, endDate, selectedVariantId]);

  const getMovementIcon = (type) => {
    if (['PURCHASE_IN', 'RETURN_IN'].includes(type)) return <TrendingUpIcon color="success" />;
    if (['SALE_OUT', 'DAMAGE_OUT'].includes(type)) return <TrendingDownIcon color="error" />;
    return <HistoryIcon color="info" />;
  };

  const getStatusColor = (type) => {
    switch (type) {
      case 'PURCHASE_IN': return 'success';
      case 'SALE_OUT': return 'primary';
      case 'DAMAGE_OUT': return 'error';
      case 'RETURN_IN': return 'info';
      case 'ADJUSTMENT': return 'warning';
      default: return 'default';
    }
  };

  const handleDrillDown = async (row) => {
    if (!row.referenceId || row.referenceType !== 'INVOICE') {
      alert("Only Invoice drill-down is supported.");
      return;
    }
    try {
      setLoading(true);
      const res = await api.get(`/billing/invoices/${row.referenceId}`);
      setSelectedInvoice(res.data.data);
    } catch (err) { alert("Failed to load source document."); }
    finally { setLoading(false); }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 2 }}>
          <HistoryIcon fontSize="large" color="primary" /> Stock Ledger
        </Typography>
        <Typography variant="body1" color="textSecondary">Trace every material movement and audit stock levels.</Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              select fullWidth label="Select Material" size="small"
              value={selectedVariantId} onChange={(e) => setSelectedVariantId(e.target.value)}
              SelectProps={{ native: true }}
            >
              <option value="">All Materials</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button variant="outlined" fullWidth onClick={() => { setStartDate(''); setEndDate(''); setSelectedVariantId(''); }}>Reset Filters</Button>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f1f5f9' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Timestamp</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Material / Variant</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Movement</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Qty</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Balance</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Source</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 5 }}>Loading...</TableCell></TableRow>
            ) : ledger.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 10 }}>No stock movements recorded.</TableCell></TableRow>
            ) : (
              ledger.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell variant="caption">{row.createdAt ? new Date(row.createdAt).toLocaleString() : '-'}</TableCell>
                  <TableCell><Typography variant="body2" sx={{ fontWeight: 'bold' }}>{row.variantName}</Typography></TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getMovementIcon(row.transactionType)}
                      <Chip label={row.transactionType} size="small" color={getStatusColor(row.transactionType)} sx={{ fontWeight: 'bold', fontSize: '0.7rem' }} />
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: (row.quantity || 0) < 0 ? 'error.main' : 'success.main' }}>
                    {row.quantity > 0 ? `+${row.quantity}` : row.quantity}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>{row.runningBalance}</TableCell>
                  <TableCell>
                    {row.referenceId ? (
                      <Button size="small" startIcon={<ReceiptIcon />} onClick={() => handleDrillDown(row)} sx={{ textTransform: 'none' }}>
                        {row.referenceType} #{row.referenceId}
                      </Button>
                    ) : (
                      <Typography variant="caption" color="textSecondary">{row.notes || '-'}</Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div" count={totalElements} rowsPerPage={rowsPerPage} page={page}
          onPageChange={(e, p) => setPage(p)}
          onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
        />
      </TableContainer>

      <Dialog open={!!selectedInvoice} onClose={() => setSelectedInvoice(null)} maxWidth="md" fullWidth>
        <Box sx={{ p: 0 }}>
          {selectedInvoice && <InvoicePreview invoiceData={selectedInvoice} onClose={() => setSelectedInvoice(null)} />}
        </Box>
      </Dialog>
    </Container>
  );
}
