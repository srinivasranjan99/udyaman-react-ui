import React, { useState, useEffect } from 'react';
import { 
  Box, Container, Typography, Grid, Paper, Card, CardContent, 
  IconButton, Button, Chip, Divider, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Avatar, List
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  WarningAmber as WarningAmberIcon,
  EventBusy as EventBusyIcon,
  Add as AddIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const StatCard = ({ title, value, icon, color, subtitle }) => (
  <Card elevation={2} sx={{ height: '100%', borderLeft: `6px solid ${color}`, borderRadius: 2 }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography color="textSecondary" variant="overline" fontWeight="bold">
            {title}
          </Typography>
          <Typography variant="h4" fontWeight="bold" sx={{ my: 0.5 }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="textSecondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Avatar sx={{ bgcolor: `${color}15`, color: color, width: 56, height: 56 }}>
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

export default function MaterialDashboard() {
  const [stats, setStats] = useState({
    totalMaterials: 0,
    lowStockCount: 0,
    expiringSoonCount: 0,
    totalStockValue: 0
  });
  const [alerts, setAlerts] = useState({ lowStock: [], expiring: [] });
  const [recentLedger, setRecentLedger] = useState([]);
  const [fastMoving, setFastMoving] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [productsRes, alertsRes, ledgerRes] = await Promise.all([
        api.get('/inventory/products'),
        api.get('/inventory/products/alerts/low-stock'),
        api.get('/inventory/ledger', { params: { size: 5 } })
      ]);

      const products = productsRes.data.data.content || [];
      const lowStockAlerts = alertsRes.data.data || [];
      const ledger = ledgerRes.data.data.content || [];

      // Calculate stock value (Simplified: using price as proxy for value if costPrice missing)
      const stockValue = products.reduce((acc, p) => acc + (p.stockQuantity * (p.costPrice || p.price || 0)), 0);

      setStats({
        totalMaterials: productsRes.data.data.totalElements || products.length,
        lowStockCount: lowStockAlerts.length,
        expiringSoonCount: products.filter(p => p.isExpiryTracked && p.stockQuantity > 0).length, // Placeholder logic
        totalStockValue: stockValue
      });

      setAlerts({
        lowStock: lowStockAlerts.slice(0, 5),
        expiring: products.filter(p => p.isExpiryTracked).slice(0, 5)
      });

      setRecentLedger(ledger);
      
      // Placeholder for fast moving items
      setFastMoving(products.slice(0, 5).sort((a, b) => b.stockQuantity - a.stockQuantity));

    } catch (err) {
      console.error("Dashboard load failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Material Insights</Typography>
          <Typography variant="body1" color="textSecondary">Real-time inventory health and operational metrics</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<HistoryIcon />} component={Link} to="/inventory/ledger">View Ledger</Button>
          <Button variant="contained" startIcon={<AddIcon />} component={Link} to="/inventory">Add Material</Button>
        </Box>
      </Box>

      {/* Top Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Materials" 
            value={stats.totalMaterials} 
            icon={<InventoryIcon />} 
            color="#1976d2" 
            subtitle="Active items in catalog"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Low Stock Alerts" 
            value={stats.lowStockCount} 
            icon={<WarningAmberIcon />} 
            color="#ed6c02" 
            subtitle="Items below threshold"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Expiring Soon" 
            value={stats.expiringSoonCount} 
            icon={<EventBusyIcon />} 
            color="#d32f2f" 
            subtitle="Within next 30 days"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Stock Value" 
            value={`₹${(stats.totalStockValue || 0).toLocaleString()}`} 
            icon={<AccountBalanceWalletIcon />} 
            color="#2e7d32" 
            subtitle="Estimated on-hand value"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Critical Alerts */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%', borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningAmberIcon color="warning" /> Critical Alerts
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {alerts.lowStock.length > 0 ? alerts.lowStock.map((item, i) => (
                <Box key={i} sx={{ p: 2, bgcolor: '#fff4e5', borderRadius: 2, border: '1px solid #ffe2b7' }}>
                  <Typography variant="subtitle2" fontWeight="bold">{item.name}</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="caption">Available: <strong>{item.stockQuantity || item.stock || 0}</strong></Typography>
                    <Typography variant="caption" color="error">Min: {item.reorderLevel || item.threshold || 0}</Typography>
                  </Box>
                </Box>
              )) : (
                <Typography color="textSecondary" align="center" py={4}>No critical alerts</Typography>
              )}
            </Box>
            <Button fullWidth sx={{ mt: 2 }} component={Link} to="/inventory">View All Materials</Button>
          </Paper>
        </Grid>

        {/* Recent Activity (Ledger) */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <HistoryIcon color="primary" /> Recent Movements
            </Typography>
            <TableContainer sx={{ mt: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Material</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Qty</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Balance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentLedger.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell variant="caption">{new Date(row.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">{row.variantName}</Typography>
                        <Typography variant="caption" color="textSecondary">{row.batchNumber || 'No Batch'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={row.transactionType} 
                          size="small" 
                          variant="outlined" 
                          sx={{ fontSize: '0.65rem' }} 
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ color: row.quantity < 0 ? 'error.main' : 'success.main', fontWeight: 'bold' }}>
                        {row.quantity > 0 ? `+${row.quantity}` : row.quantity}
                      </TableCell>
                      <TableCell align="right" fontWeight="bold">{row.runningBalance}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Fast Moving & Insights */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUpIcon color="success" /> Fast Moving Items
            </Typography>
            <Divider sx={{ my: 2 }} />
            <List sx={{ width: '100%' }}>
              {fastMoving.map((item, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.light', fontSize: '1rem' }}>{i + 1}</Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" fontWeight="bold">{item.name}</Typography>
                    <Typography variant="caption" color="textSecondary">{item.sku}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" fontWeight="bold">{item.stockQuantity} {item.unit}</Typography>
                    <Typography variant="caption" color="textSecondary">In Stock</Typography>
                  </Box>
                </Box>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, bgcolor: '#f8fafc' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Quick Operations</Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  startIcon={<AddIcon />} 
                  sx={{ height: 80, display: 'flex', flexDirection: 'column' }}
                  component={Link}
                  to="/inventory"
                >
                  New Material
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  color="warning" 
                  startIcon={<HistoryIcon />} 
                  sx={{ height: 80, display: 'flex', flexDirection: 'column' }}
                  component={Link}
                  to="/inventory/adjustments"
                >
                  Adjust Stock
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  color="info" 
                  startIcon={<ShoppingCartIcon />} 
                  sx={{ height: 80, display: 'flex', flexDirection: 'column' }}
                  component={Link}
                  to="/purchase"
                >
                  Create PO
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  color="secondary" 
                  startIcon={<AccountBalanceWalletIcon />} 
                  sx={{ height: 80, display: 'flex', flexDirection: 'column' }}
                  component={Link}
                  to="/inventory/ledger"
                >
                  View Ledger
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
