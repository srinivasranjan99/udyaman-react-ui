import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, Button, Card, CardContent, 
  Table, TableBody, TableCell, TableHead, TableRow, Chip, 
  IconButton, Tabs, Tab, CircularProgress, Alert
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  ShoppingCart as ShoppingCartIcon,
  Factory as FactoryIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import api from '../../../api/axios';

const MRPPage = () => {
  const [tab, setTab] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/mrp/suggestions');
      setSuggestions(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleRunMRP = async () => {
    setRunning(true);
    try {
      // For demo, we run MRP with some default demand or prompt user
      await api.post('/mrp/run', { demands: [] }); 
      fetchSuggestions();
    } catch (err) { alert(err.message); }
    finally { setRunning(false); }
  };

  const handleApprove = async (id) => {
    try {
      await api.post(`/mrp/suggestions/${id}/convert`);
      fetchSuggestions();
    } catch (err) { alert(err.message); }
  };

  const purchaseList = suggestions.filter(s => s.suggestionType === 'PURCHASE' && s.status === 'PENDING');
  const productionList = suggestions.filter(s => s.suggestionType === 'PRODUCTION' && s.status === 'PENDING');

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">MRP Planning Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">Automated material requirement planning based on demand and stock.</Typography>
        </Box>
        <Box>
          <Button variant="outlined" startIcon={<RefreshIcon />} sx={{ mr: 1 }} onClick={fetchSuggestions}>Refresh</Button>
          <Button 
            variant="contained" 
            startIcon={running ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />} 
            disabled={running}
            onClick={handleRunMRP}
          >
            {running ? 'Running Engine...' : 'Run MRP Engine'}
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={4}>
          <Card variant="outlined" sx={{ borderRadius: 3, borderLeft: '6px solid #3b82f6' }}>
            <CardContent>
              <Typography variant="overline" fontWeight="bold" color="text.secondary">Purchase Suggestions</Typography>
              <Typography variant="h4" fontWeight="bold">{purchaseList.length}</Typography>
              <Typography variant="caption">Items to procure from suppliers</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card variant="outlined" sx={{ borderRadius: 3, borderLeft: '6px solid #10b981' }}>
            <CardContent>
              <Typography variant="overline" fontWeight="bold" color="text.secondary">Production Suggestions</Typography>
              <Typography variant="h4" fontWeight="bold">{productionList.length}</Typography>
              <Typography variant="caption">Items to manufacture in-house</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: '#f8fafc' }}>
            <CardContent>
              <Typography variant="overline" fontWeight="bold" color="text.secondary">System Status</Typography>
              <Typography variant="h6" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon fontSize="small" /> Optimized
              </Typography>
              <Typography variant="caption">Last run: {new Date().toLocaleTimeString()}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 1 }}>
          <Tab icon={<ShoppingCartIcon />} iconPosition="start" label={`Purchase Requisitions (${purchaseList.length})`} />
          <Tab icon={<FactoryIcon />} iconPosition="start" label={`Production Orders (${productionList.length})`} />
        </Tabs>

        <Box sx={{ p: 0 }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Product</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Recommended Qty</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Target Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Priority</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 5 }}><CircularProgress /></TableCell></TableRow>
              ) : (tab === 0 ? purchaseList : productionList).length === 0 ? (
                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 10 }}>No suggestions. Run MRP to generate plans.</TableCell></TableRow>
              ) : (tab === 0 ? purchaseList : productionList).map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">{item.productName}</Typography>
                    <Typography variant="caption" color="text.secondary">{item.productSku}</Typography>
                  </TableCell>
                  <TableCell><Typography fontWeight="bold">{item.requiredQuantity}</Typography></TableCell>
                  <TableCell>{item.suggestedDate}</TableCell>
                  <TableCell>
                    <Chip label="High" size="small" sx={{ bgcolor: '#fee2e2', color: '#991b1b', fontWeight: 'bold', fontSize: '0.65rem' }} />
                  </TableCell>
                  <TableCell>
                    <Button 
                      size="small" 
                      variant="contained" 
                      color={tab === 0 ? "primary" : "success"}
                      startIcon={<CheckCircleIcon />}
                      onClick={() => handleApprove(item.id)}
                    >
                      Approve & Convert
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Paper>
      
      <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
        Suggestions are calculated based on current physical stock, safety stock levels, and active Sales/Production demand.
      </Alert>
    </Box>
  );
};

export default MRPPage;
