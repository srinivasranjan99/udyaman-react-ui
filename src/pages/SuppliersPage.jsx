import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, IconButton,
  CircularProgress, Alert, Tooltip, Chip, Stack, TextField, InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  ArrowBack as BackIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { supplierApi } from '../api/supplierApi';
import SupplierForm from '../modules/procurement/components/SupplierForm';

export default function SuppliersPage() {
  const [view, setView] = useState('list'); // 'list' or 'form'
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (view === 'list') {
      fetchSuppliers();
    }
  }, [view, search]);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const response = await supplierApi.getSuppliers({ search, size: 50 });
      // apiService returns response.data (the ApiResponse), so response.data here is the Page object
      setSuppliers(response.data?.content || response.data || []);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch suppliers", err);
      setError("Unable to load the vendor master. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data) => {
    setLoading(true);
    try {
      if (selectedSupplier) {
        await supplierApi.updateSupplier(selectedSupplier.id, data);
      } else {
        await supplierApi.createSupplier(data);
      }
      setView('list');
      setSelectedSupplier(null);
    } catch (err) {
      setError("Failed to save vendor details: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this supplier? This action cannot be undone.")) {
      try {
        await supplierApi.deleteSupplier(id);
        fetchSuppliers();
      } catch (err) {
        alert("Integrity Violation: Cannot delete supplier with active POs.");
      }
    }
  };

  if (view === 'form') {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <SupplierForm 
          initialData={selectedSupplier} 
          onSave={handleSave} 
          onCancel={() => { setView('list'); setSelectedSupplier(null); }}
          loading={loading}
        />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="900" sx={{ color: '#1e293b', mb: 1 }}>
            Vendor Master
          </Typography>
          <Typography color="textSecondary" sx={{ fontWeight: 500 }}>
            Centralized directory for all procurement partners and service providers.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => setView('form')}
          sx={{ borderRadius: 2, px: 3, py: 1.2, fontWeight: 'bold' }}
        >
          Register Vendor
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      <Paper sx={{ mb: 4, p: 2, borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
        <TextField
          fullWidth
          placeholder="Search by vendor name, code, or phone number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ 
            '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#f8fafc' } 
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              )
            }
          }}
        />
      </Paper>

      {loading && suppliers.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow sx={{ '& th': { fontWeight: 800, color: '#475569', py: 2 } }}>
                <TableCell>VENDOR CODE</TableCell>
                <TableCell>NAME & CONTACT</TableCell>
                <TableCell>LOCATION</TableCell>
                <TableCell>PAYMENT TERMS</TableCell>
                <TableCell>STATUS</TableCell>
                <TableCell align="center">ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!Array.isArray(suppliers) || suppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                    <BusinessIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="subtitle1" color="text.secondary">No vendors found matching your search.</Typography>
                  </TableCell>
                </TableRow>
              ) : suppliers.map((s) => (
                <TableRow key={s.id} hover sx={{ '& td': { py: 2 } }}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold" sx={{ color: 'primary.main' }}>
                      {s.supplierCode || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight="700">{s.name}</Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                      {s.contactPerson} • {s.phone}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{s.city || '-'}, {s.state || '-'}</Typography>
                    <Typography variant="caption" color="textSecondary">{s.country}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={s.paymentTerms || 'Standard'} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={s.status} 
                      color={s.status === 'ACTIVE' ? 'success' : 'default'}
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Tooltip title="Edit Vendor">
                        <IconButton 
                          size="small" 
                          sx={{ color: '#64748b' }} 
                          onClick={() => { setSelectedSupplier(s); setView('form'); }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Vendor">
                        <IconButton 
                          size="small" 
                          sx={{ color: '#ef4444' }}
                          onClick={() => handleDelete(s.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}
