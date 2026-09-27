import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Grid, Divider, List, ListItem, ListItemText, ListItemSecondaryAction
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Visibility as VisibilityIcon, 
  PlayArrow as PlayArrowIcon 
} from '@mui/icons-material';
import api from '../../../api/axios';

const BOMPage = () => {
  const [boms, setBoms] = useState([]);
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    productId: '',
    version: '1.0',
    description: '',
    effectiveFrom: new Date().toISOString().split('T')[0],
    items: []
  });
  const [currentItem, setCurrentItem] = useState({ componentId: '', quantity: 1, unit: 'PCS' });

  useEffect(() => {
    fetchBoms();
    fetchProducts();
  }, []);

  const fetchBoms = async () => {
    try {
      const res = await api.get('/production/boms/product/0'); // Placeholder to get all if backend supports or just fetch a few
      // For demo purposes, we might need a general GET /boms
      setBoms(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    const res = await api.get('/inventory/products');
    setProducts(res.data.data.content || []);
  };

  const handleAddComponent = () => {
    if (!currentItem.componentId) return;
    const component = products.find(p => p.id === currentItem.componentId);
    setFormData({
      ...formData,
      items: [...formData.items, { ...currentItem, componentName: component.name, componentSku: component.sku }]
    });
    setCurrentItem({ componentId: '', quantity: 1, unit: 'PCS' });
  };

  const handleRemoveComponent = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleSave = async () => {
    try {
      await api.post('/production/boms', formData);
      setOpen(false);
      fetchBoms();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">Bill of Materials (BOM)</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Create New BOM</Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Product</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Version</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Effective From</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {boms.length === 0 ? (
              <TableRow><TableCell colSpan={5} align="center">No BOMs defined yet</TableCell></TableRow>
            ) : boms.map((bom) => (
              <TableRow key={bom.id}>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">{bom.productName}</Typography>
                  <Typography variant="caption" color="text.secondary">{bom.productSku}</Typography>
                </TableCell>
                <TableCell>{bom.version}</TableCell>
                <TableCell>{bom.effectiveFrom}</TableCell>
                <TableCell><Chip label={bom.status} color={bom.status === 'ACTIVE' ? 'success' : 'default'} size="small" /></TableCell>
                <TableCell>
                  <IconButton size="small"><VisibilityIcon /></IconButton>
                  {bom.status !== 'ACTIVE' && (
                    <Button size="small" variant="outlined" sx={{ ml: 1 }} onClick={async () => {
                      await api.put(`/production/boms/${bom.id}/activate`);
                      fetchBoms();
                    }}>Activate</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create BOM Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Define Bill of Materials</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                select
                fullWidth
                label="Parent Product"
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              >
                {products.filter(p => p.bomApplicable).map(p => (
                  <MenuItem key={p.id} value={p.id}>{p.name} ({p.sku})</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={3}>
              <TextField
                fullWidth
                label="Version"
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                fullWidth
                type="date"
                label="Effective From"
                InputLabelProps={{ shrink: true }}
                value={formData.effectiveFrom}
                onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>Components</Divider>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  select
                  sx={{ flexGrow: 1 }}
                  size="small"
                  label="Component"
                  value={currentItem.componentId}
                  onChange={(e) => setCurrentItem({ ...currentItem, componentId: e.target.value })}
                >
                  {products.map(p => (
                    <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                  ))}
                </TextField>
                <TextField
                  sx={{ width: 120 }}
                  size="small"
                  label="Qty"
                  type="number"
                  value={currentItem.quantity}
                  onChange={(e) => setCurrentItem({ ...currentItem, quantity: Number(e.target.value) })}
                />
                <Button variant="outlined" onClick={handleAddComponent}>Add</Button>
              </Box>

              <List dense>
                {formData.items.map((item, index) => (
                  <ListItem key={index} divider>
                    <ListItemText 
                      primary={item.componentName} 
                      secondary={`${item.quantity} ${item.unit} | SKU: ${item.componentSku}`} 
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" onClick={() => handleRemoveComponent(index)}><DeleteIcon /></IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Create BOM</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BOMPage;
