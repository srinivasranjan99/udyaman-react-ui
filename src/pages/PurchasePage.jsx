import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, Chip, IconButton,
  Stack, Card, CardContent, Divider, Tooltip, Grid, Alert, CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  LocalShipping as ReceiveIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { purchaseApi } from '../api/purchaseApi';
import { inventoryApi } from '../api/inventoryApi';
import apiService from '../api/apiService';
import PurchaseOrderForm from '../modules/procurement/components/PurchaseOrderForm';
import GoodsReceiptForm from '../modules/procurement/components/GoodsReceiptForm';
import { useAuth } from '../context/AuthContext.jsx';
import { PERMISSIONS, hasPermission } from '../utils/rbac';

export default function PurchasePage() {
  const [view, setView] = useState('LIST');
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);
  const [error, setError] = useState(null);
  
  const { user } = useAuth();

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        purchaseApi.getOrders(),
        apiService.get('/suppliers'),
        inventoryApi.getWarehouses()
      ]);

      const extractData = (result) => {
        if (result.status !== 'fulfilled') return [];
        const res = result.value;
        return res?.data?.content || res?.content || res?.data || (Array.isArray(res) ? res : []);
      };

      setPurchaseOrders(extractData(results[0]));
      setSuppliers(extractData(results[1]));
      setWarehouses(extractData(results[2]));
    } catch (err) {
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPO = async (poId, nextView) => {
    setActionLoading(true);
    try {
      const res = await purchaseApi.getOrderById(poId);
      const fullPO = res.data?.data || res.data || res;
      setSelectedPO(fullPO);
      setView(nextView);
    } catch (err) {
      alert("Failed to load PO details.");
    } finally {
      setActionLoading(false);
    }
  };

  if (view === 'FORM') {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <PurchaseOrderForm 
          onBack={() => { setView('LIST'); fetchInitialData(); }} 
          initialData={selectedPO}
          suppliers={suppliers}
          warehouses={warehouses}
        />
      </Container>
    );
  }

  if (view === 'GRN') {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <GoodsReceiptForm 
          onBack={() => { setView('LIST'); fetchInitialData(); }} 
          po={selectedPO}
        />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box>
          <Typography variant="h4" fontWeight="900" color="primary.main">Procurement</Typography>
          <Typography color="text.secondary">Manage Purchase Orders and Receipts</Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          {actionLoading && <CircularProgress size={24} sx={{ alignSelf: 'center' }} />}
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchInitialData}>Refresh</Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => { setSelectedPO(null); setView('FORM'); }}
            disabled={!hasPermission(user?.roles, PERMISSIONS.PO_CREATE)}
          >
            New PO
          </Button>
        </Stack>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid #e2e8f0' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'grey.50' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>PO #</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Supplier</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Amount</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {purchaseOrders.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 8 }}>{loading ? 'Loading...' : 'No orders found.'}</TableCell></TableRow>
            ) : (
              purchaseOrders.map((po) => {
                const isEditable = po.status === 'DRAFT' || po.status === 'REJECTED';
                const canReceive = po.status === 'APPROVED' || po.status === 'PARTIALLY_RECEIVED';
                
                return (
                  <TableRow key={po.id} hover>
                    <TableCell sx={{ fontWeight: 'bold' }}>{po.poNumber}</TableCell>
                    <TableCell>{po.supplier?.name || po.supplierName}</TableCell>
                    <TableCell>{new Date(po.orderDate || po.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      {po.currency} {po.totalAmount?.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip 
                          label={po.status} 
                          size="small" 
                          color={po.status === 'APPROVED' ? 'success' : po.status === 'SUBMITTED' ? 'info' : po.status === 'COMPLETED' ? 'secondary' : 'default'}
                          sx={{ fontWeight: 'bold' }}
                        />
                        {po.status === 'PARTIALLY_RECEIVED' && (
                          <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                            {Math.round((po.items?.reduce((acc, i) => acc + (i.receivedQuantity || 0), 0) / po.items?.reduce((acc, i) => acc + (i.orderQuantity || 0), 0)) * 100)}% Received
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title={isEditable ? "Edit" : "View"}>
                          <IconButton size="small" color="primary" onClick={() => handleOpenPO(po.id, 'FORM')}>
                            {isEditable ? <EditIcon /> : <ViewIcon />}
                          </IconButton>
                        </Tooltip>
                        {canReceive && hasPermission(user?.roles, PERMISSIONS.GRN_CREATE) && (
                          <Tooltip title="Create GRN">
                            <IconButton size="small" color="success" onClick={() => handleOpenPO(po.id, 'GRN')}>
                              <ReceiveIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
