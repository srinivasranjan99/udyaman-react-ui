import React, { useState, useEffect } from 'react';
import { 
  Box, Container, Typography, Paper, Grid, Button, 
  Tabs, Tab, Chip, IconButton, Tooltip, Divider, Dialog,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  LocalShipping as LocalShippingIcon,
  Add as AddIcon,
  Receipt as ReceiptIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import api from '../api/axios';
import PurchaseOrderForm from '../features/procurement/PurchaseOrderForm.jsx';
import GrnForm from '../features/procurement/GrnForm.jsx';

export default function ProcurementPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [goodsReceipts, setGoodsReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (activeTab === 0) fetchPOs();
    else fetchGRNs();
  }, [activeTab, refreshTrigger]);

  const fetchPOs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/procurement/po');
      setPurchaseOrders(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch POs", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGRNs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/procurement/grn');
      setGoodsReceipts(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch GRNs", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    setIsFormOpen(false);
    setRefreshTrigger(prev => prev + 1);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DRAFT': return 'default';
      case 'APPROVED': return 'primary';
      case 'PARTIALLY_DELIVERED': return 'warning';
      case 'DELIVERED': return 'success';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ShoppingCartIcon fontSize="large" color="primary" /> Procurement Center
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Manage vendor purchase orders, approvals, and goods receipts.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          size="large" 
          onClick={() => setIsFormOpen(true)}
          sx={{ borderRadius: 2, px: 3, fontWeight: 'bold' }}
        >
          {activeTab === 0 ? 'Create Purchase Order' : 'Process Goods Receipt'}
        </Button>
      </Box>

      <Paper sx={{ mb: 4, borderRadius: 3, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', px: 2, bgcolor: '#f8fafc' }}>
          <Tab icon={<ReceiptIcon />} label="Purchase Orders" sx={{ py: 2, fontWeight: 'bold' }} />
          <Tab icon={<LocalShippingIcon />} label="Goods Receipts (GRN)" sx={{ py: 2, fontWeight: 'bold' }} />
        </Tabs>

        <Box sx={{ p: 0 }}>
          {activeTab === 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>PO Number</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Supplier</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total Amount</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {purchaseOrders.length === 0 ? (
                    <TableRow><TableCell colSpan={6} align="center" sx={{ py: 5 }}>No Purchase Orders found.</TableCell></TableRow>
                  ) : (
                    purchaseOrders.map((po) => (
                      <TableRow key={po.id} hover>
                        <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>{po.poNumber}</TableCell>
                        <TableCell>{po.supplierName}</TableCell>
                        <TableCell>{new Date(po.orderDate).toLocaleDateString()}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>₹{po.totalAmount?.toFixed(2)}</TableCell>
                        <TableCell>
                          <Chip label={po.status} color={getStatusColor(po.status)} size="small" sx={{ fontWeight: 'bold' }} />
                        </TableCell>
                        <TableCell align="right">
                          <Button size="small">Details</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>GRN Number</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>PO Reference</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Supplier Invoice</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {goodsReceipts.length === 0 ? (
                    <TableRow><TableCell colSpan={5} align="center" sx={{ py: 5 }}>No Goods Receipts found.</TableCell></TableRow>
                  ) : (
                    goodsReceipts.map((grn) => (
                      <TableRow key={grn.id} hover>
                        <TableCell sx={{ fontWeight: 'bold', color: 'success.main' }}>{grn.grnNumber}</TableCell>
                        <TableCell sx={{ color: 'primary.main', fontWeight: 'medium' }}>{grn.poNumber || 'N/A'}</TableCell>
                        <TableCell>{new Date(grn.receiptDate).toLocaleDateString()}</TableCell>
                        <TableCell>{grn.supplierInvoiceNumber || '-'}</TableCell>
                        <TableCell align="right">
                          <Button size="small">Details</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Paper>

      {/* Full Screen Form Modal */}
      <Dialog
        fullScreen
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      >
        <Box sx={{ p: 4, bgcolor: '#f8fafc', minHeight: '100vh' }}>
          <Container maxWidth="lg">
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5" fontWeight="bold">
                {activeTab === 0 ? 'Create New Purchase Order' : 'Goods Receipt Note (GRN)'}
              </Typography>
              <IconButton onClick={() => setIsFormOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              {activeTab === 0 ? (
                <PurchaseOrderForm onSave={handleSave} onCancel={() => setIsFormOpen(false)} />
              ) : (
                <GrnForm onSave={handleSave} onCancel={() => setIsFormOpen(false)} />
              )}
            </Paper>
          </Container>
        </Box>
      </Dialog>
    </Container>
  );
}
