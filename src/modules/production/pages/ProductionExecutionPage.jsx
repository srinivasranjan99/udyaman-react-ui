import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, TextField, Button, 
  Divider, Card, CardContent, List, ListItem, ListItemText,
  Alert, Stepper, Step, StepLabel, CircularProgress
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Factory as FactoryIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import api from '../../../api/axios';

const ProductionExecutionPage = ({ orderId, onComplete }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [consumptionData, setConsumptionData] = useState({ components: [] });
  const [completionData, setCompletionData] = useState({
    producedQuantity: 0,
    batchNumber: '',
    manufacturingDate: new Date().toISOString().split('T')[0],
    expiryDate: ''
  });

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const res = await api.get(`/production/orders/${orderId}`);
      const data = res.data.data;
      setOrder(data);
      setCompletionData({ ...completionData, producedQuantity: data.plannedQuantity, batchNumber: `BATCH-${data.orderNumber}` });
      
      // Auto-populate consumption based on BOM
      const components = data.bomItems?.map(item => ({
        componentId: item.componentId,
        componentName: item.componentName,
        quantity: item.quantity * data.plannedQuantity,
        batchId: '' // User needs to select a batch
      })) || [];
      setConsumptionData({ components });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleConsume = async () => {
    try {
      await api.post(`/production/orders/${orderId}/consume`, consumptionData);
      alert("Materials consumed successfully");
    } catch (err) { alert(err.response?.data?.message); }
  };

  const handleComplete = async () => {
    try {
      await api.post(`/production/orders/${orderId}/complete`, completionData);
      alert("Production completed. Stock updated.");
      if (onComplete) onComplete();
    } catch (err) { alert(err.response?.data?.message); }
  };

  if (loading) return <CircularProgress />;

  const steps = ['Plan Created', 'In Progress', 'Consumed', 'Completed'];
  const activeStep = order.status === 'PLANNED' ? 0 : order.status === 'IN_PROGRESS' ? 1 : 3;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>Execution: {order.orderNumber}</Typography>
      
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}><StepLabel>{label}</StepLabel></Step>
        ))}
      </Stepper>

      <Grid container spacing={3}>
        {/* Production Summary */}
        <Grid item xs={4}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Typography color="text.secondary" variant="overline" fontWeight="bold">Target Product</Typography>
              <Typography variant="h6" fontWeight="bold">{order.productName}</Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2">Planned Qty: <b>{order.plannedQuantity}</b></Typography>
              <Typography variant="body2">BOM Version: <b>{order.bomVersion}</b></Typography>
              <Typography variant="body2">Status: <Chip label={order.status} size="small" sx={{ ml: 1 }} /></Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Consumption Section */}
        <Grid item xs={8}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <InventoryIcon color="primary" />
              <Typography variant="h6" fontWeight="bold">Material Consumption</Typography>
            </Box>
            <List dense>
              {consumptionData.components.map((comp, idx) => (
                <ListItem key={idx} divider>
                  <ListItemText primary={comp.componentName} secondary={`Required: ${comp.quantity}`} />
                  <TextField 
                    size="small" label="Batch ID" sx={{ width: 150, ml: 2 }}
                    value={comp.batchId}
                    onChange={(e) => {
                      const newComps = [...consumptionData.components];
                      newComps[idx].batchId = e.target.value;
                      setConsumptionData({ components: newComps });
                    }}
                  />
                </ListItem>
              ))}
            </List>
            <Button variant="contained" sx={{ mt: 2 }} onClick={handleConsume}>Record Consumption</Button>
          </Paper>
        </Grid>

        {/* Completion Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 3, borderLeft: '6px solid #10b981' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <FactoryIcon color="success" />
              <Typography variant="h6" fontWeight="bold">Finish Production</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={3}>
                <TextField 
                  fullWidth label="Produced Quantity" type="number" 
                  value={completionData.producedQuantity}
                  onChange={(e) => setCompletionData({ ...completionData, producedQuantity: Number(e.target.value) })}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField 
                  fullWidth label="New Batch #" 
                  value={completionData.batchNumber}
                  onChange={(e) => setCompletionData({ ...completionData, batchNumber: e.target.value })}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField 
                  fullWidth type="date" label="Mfg Date" InputLabelProps={{ shrink: true }}
                  value={completionData.manufacturingDate}
                  onChange={(e) => setCompletionData({ ...completionData, manufacturingDate: e.target.value })}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField 
                  fullWidth type="date" label="Expiry Date" InputLabelProps={{ shrink: true }}
                  value={completionData.expiryDate}
                  onChange={(e) => setCompletionData({ ...completionData, expiryDate: e.target.value })}
                />
              </Grid>
            </Grid>
            <Button 
              variant="contained" color="success" sx={{ mt: 3 }} 
              startIcon={<CheckCircleIcon />}
              onClick={handleComplete}
            >
              Complete Order & Inward Stock
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductionExecutionPage;
