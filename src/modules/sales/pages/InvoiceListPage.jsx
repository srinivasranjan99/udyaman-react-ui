import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, Chip, IconButton,
  Tooltip, LinearProgress, TextField, InputAdornment
} from '@mui/material';
import {
  Receipt as InvoiceIcon,
  Search as SearchIcon,
  PointOfSale as PosIcon,
  PictureAsPdf as PdfIcon,
  Email as EmailIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import api from '../../../api/axios';
import { useNavigate } from 'react-router-dom';

/**
 * InvoiceListPage: Focused on finalized financial records and payment tracking.
 * Distinct from Sales Orders by its focus on billing and tax compliance.
 */
const InvoiceListPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/billing/invoices').catch(() => ({ data: { data: [] } }));
      const rawData = res.data.data;
      // Handle both flat arrays and paginated object structures
      setInvoices(Array.isArray(rawData) ? rawData : (rawData?.content || []));
    } catch (err) {
      console.error(err);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Customer Invoices</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage tax invoices, monitor payment statuses, and generate financial reports.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<PosIcon />} 
          onClick={() => navigate('/sales/billing')}
          sx={{ borderRadius: 2, px: 3 }}
        >
          New POS Invoice
        </Button>
      </Box>

      <Paper sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <TextField
            placeholder="Search by Invoice # or Customer..."
            size="small"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ width: 400 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
                ),
                sx: { borderRadius: 2 }
              }
            }}
          />
        </Box>

        {loading && <LinearProgress />}

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Invoice #</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Billing Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Total Amount</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Payment</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                    {loading ? 'Processing financial data...' : 'No invoices found.'}
                  </TableCell>
                </TableRow>
              ) : invoices.map((inv) => (
                <TableRow key={inv.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <InvoiceIcon color="action" fontSize="small" />
                      <Typography variant="body2" fontWeight="bold">{inv.invoiceNumber || `INV-${inv.id}`}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{inv.customerName}</TableCell>
                  <TableCell>{new Date(inv.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell fontWeight="bold">₹{inv.grandTotal?.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={inv.paymentMode || 'PAID'} 
                      color="success" 
                      size="small" 
                      variant="outlined"
                      sx={{ fontWeight: 'bold', fontSize: '0.65rem' }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Details">
                      <IconButton size="small"><ViewIcon fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Download PDF">
                      <IconButton size="small" color="error"><PdfIcon fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Email Invoice">
                      <IconButton size="small" color="primary"><EmailIcon fontSize="small" /></IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default InvoiceListPage;
