import React, { useState, useEffect } from 'react';
import { 
  Box, Container, Typography, Paper, Grid, Button, 
  Tabs, Tab, IconButton, Tooltip, Chip, Avatar,
  TextField, InputAdornment, Menu, MenuItem, Divider,
  Dialog, DialogContent
} from '@mui/material';
import {
  Add as AddIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Close as CloseIcon,
  Inventory2 as Inventory2Icon,
  WarningAmber as WarningAmberIcon,
  LocalOffer as LocalOfferIcon,
  History as HistoryIcon
} from '@mui/icons-material';

import api from '../api/axios';
import { useAuth } from '../context/AuthContext.jsx';
import { PERMISSIONS, hasPermission } from '../utils/rbac';
import MaterialList from '../modules/material/pages/MaterialList.jsx';
import MaterialForm from '../modules/material/pages/MaterialForm.jsx';
import MaterialDetailsDrawer from '../components/inventory/MaterialDetailsDrawer.jsx';

export default function MaterialMasterPage() {
  const [stats, setStats] = useState({ total: 0, lowStock: 0, outOfStock: 0, expired: 0 });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [globalError, setGlobalError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    try {
      fetchStats();
    } catch (err) {
      setGlobalError("Critical failure in statistics engine.");
      console.error(err);
    }
  }, [refreshTrigger]);

  const fetchStats = async () => {
    try {
      const [all, low, out] = await Promise.all([
        api.get('/inventory/products', { params: { size: 1 } }),
        api.get('/inventory/products/alerts/low-stock'),
        api.get('/inventory/products/alerts/out-of-stock')
      ]);
      
      const safeTotal = all?.data?.data?.totalElements ?? 0;
      const safeLow = Array.isArray(low?.data?.data) ? low.data.data.length : 0;
      const safeOut = Array.isArray(out?.data?.data) ? out.data.data.length : 0;

      setStats({
        total: safeTotal,
        lowStock: safeLow,
        outOfStock: safeOut,
        expired: 0
      });
    } catch (err) {
      console.error("Failed to fetch inventory stats", err);
    }
  };

  const handleOpenAdd = () => {
    setSelectedProduct(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (product) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setIsDrawerOpen(true);
  };

  const handleSave = () => {
    setIsFormOpen(false);
    setIsDrawerOpen(false);
    setRefreshTrigger(prev => prev + 1);
  };

  if (globalError) {
    return (
      <Container sx={{ mt: 10, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>Oops! Something went wrong.</Typography>
        <Typography variant="body1" color="textSecondary">{globalError}</Typography>
        <Button variant="contained" sx={{ mt: 3 }} onClick={() => window.location.reload()}>Reload System</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Inventory2Icon fontSize="large" /> Material Master
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Global catalog for raw materials, finished goods, and consumable assets.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<HistoryIcon />}>Audit Trail</Button>
          {hasPermission(user?.roles, PERMISSIONS.PRODUCT_CREATE) && (
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              onClick={handleOpenAdd}
              sx={{ px: 3, borderRadius: 2, fontWeight: 'bold' }}
            >
              Create Material
            </Button>
          )}
        </Box>
      </Box>

      {/* Stats Dashboard */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Total Materials', value: stats.total, color: '#3b82f6', icon: <Inventory2Icon /> },
          { label: 'Low Stock Alerts', value: stats.lowStock, color: '#f59e0b', isWarning: true, icon: <WarningAmberIcon /> },
          { label: 'Out of Stock', value: stats.outOfStock, color: '#ef4444', isError: true, icon: <CloseIcon /> },
          { label: 'Valuation', value: '₹4.2L', color: '#10b981', icon: <LocalOfferIcon /> }
        ].map((stat, idx) => (
          <Grid xs={12} sm={6} md={3} key={idx}>
            <Paper 
              sx={{ 
                p: 3, 
                borderRadius: 4, 
                border: '1px solid #e2e8f0', 
                boxShadow: '0 2px 12px rgba(0,0,0,0.02)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color={stat.isError ? 'error.main' : stat.isWarning ? 'warning.main' : 'text.primary'}>
                    {stat.value}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight="500">{stat.label}</Typography>
                </Box>
                <Avatar sx={{ bgcolor: `${stat.color}15`, color: stat.color, borderRadius: 2 }}>
                  {stat.icon}
                </Avatar>
              </Box>
              <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 4, bgcolor: stat.color }} />
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Main Content Area */}
      <Paper elevation={0} sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
        <MaterialList 
          key={refreshTrigger}
          onAddClick={handleOpenAdd} 
          onEditClick={handleOpenEdit}
          onViewClick={handleViewDetails}
          isCompact={false}
        />
      </Paper>

      {/* Slide-out Drawer for Details */}
      {selectedProduct && (
        <MaterialDetailsDrawer 
          open={isDrawerOpen} 
          onClose={() => setIsDrawerOpen(false)}
          product={selectedProduct}
          onEdit={() => { setIsDrawerOpen(false); setIsFormOpen(true); }}
        />
      )}

      {/* Add/Edit Full-Screen or Large Modal */}
      <MaterialFormModal 
        open={isFormOpen} 
        onClose={() => setIsFormOpen(false)}
        product={selectedProduct}
        onSave={handleSave}
      />
    </Container>
  );
}

// Sub-component for the Modal using standard MUI Dialog for stability
function MaterialFormModal({ open, onClose, product, onSave }) {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: { borderRadius: 4, bgcolor: '#fdfdfd', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }
      }}
    >
      <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" fontWeight="bold">
          {product ? `Editing: ${product.name}` : 'Create New Material Master'}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>
      <DialogContent sx={{ p: 4 }}>
        <MaterialForm initialData={product} onSave={onSave} />
      </DialogContent>
    </Dialog>
  );
}
