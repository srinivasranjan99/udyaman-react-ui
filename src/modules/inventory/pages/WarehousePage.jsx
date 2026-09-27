import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, Button, Card, CardContent, 
  List, ListItem, ListItemButton, ListItemText, ListItemIcon, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Table, TableBody, TableCell, TableHead, TableRow, Chip,
  TableContainer
} from '@mui/material';
import {
  Warehouse as WarehouseIcon,
  Inventory2 as Inventory2Icon,
  Layers as LayersIcon,
  Add as AddIcon,
  ExpandLess,
  ExpandMore
} from '@mui/icons-material';
import { inventoryApi } from '../../../api/inventoryApi';
import api from '../../../api/axios';
import UdyamanTreeView from '../../../components/common/UdyamanTreeView';
import DynamicForm from '../../../components/forms/DynamicForm';

const warehouseConfig = [
  { type: 'text', name: 'name', label: 'Warehouse Name', placeholder: 'e.g. Central Distribution', required: true, md: 12 },
  { type: 'text', name: 'code', label: 'Warehouse Code', placeholder: 'e.g. WH-001', required: true, md: 6 },
  { type: 'text', name: 'address', label: 'Full Address', placeholder: 'Enter street address...', md: 6, multiline: true, rows: 2 }
];

const WarehousePage = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [locations, setLocations] = useState({}); // { whId: [locations] }
  const [selectedNode, setSelectedNode] = useState(null);
  const [stock, setStock] = useState([]);
  const [openWh, setOpenWh] = useState(false);
  const [openLoc, setOpenLoc] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeWhId, setActiveWhId] = useState(null);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const res = await inventoryApi.getWarehouses();
      const data = res.data?.content || res.data || [];
      setWarehouses(data);
      if (data.length > 0 && !selectedNode) handleSelect(data[0], 'WAREHOUSE');
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchLocations = async (whId) => {
    try {
      const res = await inventoryApi.getStorageLocations(whId);
      setLocations(prev => ({ ...prev, [whId]: res.data || [] }));
    } catch (err) { console.error(err); }
  };

  const handleSelect = async (node, type) => {
    setSelectedNode({ ...node, nodeType: type });
    try {
      let res;
      if (type === 'WAREHOUSE') {
        res = await inventoryApi.getWarehouseStock(node.id);
      } else {
        // Find warehouse ID for this location
        const whId = Object.keys(locations).find(id => locations[id].some(l => l.id === node.id));
        res = await inventoryApi.getLocationStock(whId, node.id);
      }
      setStock(res.data || []);
    } catch (err) { 
      console.error(err);
      setStock([]);
    }
  };

  const handleExpand = (node) => {
    if (node.nodeType === 'WAREHOUSE' && !locations[node.id]) {
      fetchLocations(node.id);
    }
  };

  const handleCreateWarehouse = async (data) => {
    setLoading(true);
    try {
      await inventoryApi.createWarehouse(data);
      setOpenWh(false);
      fetchWarehouses();
    } catch (err) {
      alert("Failed to create warehouse: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLocation = async (data) => {
    setLoading(true);
    try {
      await inventoryApi.createStorageLocation(activeWhId, data);
      setOpenLoc(false);
      fetchLocations(activeWhId);
    } catch (err) {
      alert("Failed to create location: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const treeActions = [
    { 
      label: 'Add Bin / Rack', 
      icon: AddIcon, 
      onClick: (node) => {
        if (node.nodeType === 'WAREHOUSE') {
          setActiveWhId(node.id);
          setOpenLoc(true);
        }
      }
    }
  ];

  const treeData = warehouses.map(wh => ({
    ...wh,
    label: wh.name,
    nodeType: 'WAREHOUSE',
    icon: WarehouseIcon,
    hasChildren: true,
    children: (locations[wh.id] || []).map(loc => ({
      ...loc,
      label: `${loc.code} - ${loc.name}`,
      nodeType: 'LOCATION',
      icon: LayersIcon
    }))
  }));

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">Warehouse Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenWh(true)}>Add Warehouse</Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, borderRadius: 3, mb: 3, minHeight: 400 }}>
            <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" gutterBottom>LOCATIONS</Typography>
            <UdyamanTreeView 
              data={treeData}
              onSelect={(node) => handleSelect(node, node.nodeType)}
              onExpand={handleExpand}
              actions={treeActions}
            />
          </Paper>

          {selectedNode && selectedNode.nodeType === 'WAREHOUSE' && (
            <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: 'primary.main', color: 'white', border: 'none', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <WarehouseIcon />
                  <Typography variant="h6" fontWeight="bold">{selectedNode.name}</Typography>
                </Box>
                <Typography variant="body2">{selectedNode.address || 'No address provided'}</Typography>
                <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.2)' }} />
                <Typography variant="caption" sx={{ opacity: 0.8 }}>SYSTEM CODE: {selectedNode.code}</Typography>
              </CardContent>
            </Card>
          )}
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 0, borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <Box sx={{ p: 2, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Stock: {selectedNode?.label || selectedNode?.name}
              </Typography>
              <Chip label={`${stock.length} Items`} size="small" color="primary" variant="outlined" sx={{ fontWeight: 'bold' }} />
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f1f5f9' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Product</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>SKU</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="right">On Hand</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stock.length === 0 ? (
                    <TableRow><TableCell colSpan={4} align="center" sx={{ py: 10, color: 'text.secondary' }}>No stock found in this area</TableCell></TableRow>
                  ) : stock.map((item, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">{item.productName}</Typography>
                      </TableCell>
                      <TableCell>{item.sku}</TableCell>
                      <TableCell>
                        <Chip label={item.storageLocationName} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight="bold" color="primary">{item.quantity} {item.unit}</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Add Warehouse Dialog */}
      <Dialog open={openWh} onClose={() => setOpenWh(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Create New Warehouse</DialogTitle>
        <DialogContent dividers sx={{ pt: 2 }}>
          <DynamicForm config={warehouseConfig} onSubmit={handleCreateWarehouse} loading={loading} />
        </DialogContent>
      </Dialog>

      {/* Add Location Dialog */}
      <Dialog open={openLoc} onClose={() => setOpenLoc(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Create New Bin / Rack</DialogTitle>
        <DialogContent dividers sx={{ pt: 2 }}>
          <DynamicForm 
            config={[
              { type: 'text', name: 'name', label: 'Location Name', placeholder: 'e.g. Rack A1', required: true, md: 12 },
              { type: 'text', name: 'code', label: 'Location Code', placeholder: 'e.g. A1-01', required: true, md: 6 },
              { type: 'select', name: 'locationType', label: 'Type', options: [
                { value: 'BIN', label: 'Bin' },
                { value: 'RACK', label: 'Rack' },
                { value: 'SHELF', label: 'Shelf' },
                { value: 'FLOOR', label: 'Floor' }
              ], md: 6 }
            ]} 
            onSubmit={handleCreateLocation} 
            loading={loading} 
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default WarehousePage;
