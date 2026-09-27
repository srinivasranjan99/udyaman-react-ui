import React, { useState, useEffect } from 'react';
import { 
  Box, Container, Typography, Grid, Paper, Card, CardContent, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Button, Alert, Divider, CircularProgress
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import InventoryIcon from '@mui/icons-material/Inventory';
import AssessmentIcon from '@mui/icons-material/Assessment';
import api from '../api/axios';

const ExpiryDashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await api.get('/inventory/reports/expiry-summary');
      setSummary(res.data.data);
    } catch (err) {
      setError("Failed to load expiry report.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
  if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AssessmentIcon fontSize="large" color="primary" /> Expiry Command Center
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Proactively manage expiring stock and minimize inventory loss.
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: '#fff5f5', borderLeft: '6px solid #f44336' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="error" variant="subtitle2" fontWeight="bold">TOTAL EXPIRED</Typography>
                  <Typography variant="h3" fontWeight="bold">{summary.expiredCount}</Typography>
                </Box>
                <ErrorIcon sx={{ fontSize: 50, opacity: 0.2 }} color="error" />
              </Box>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Batches past their use-by date.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: '#fffbeb', borderLeft: '6px solid #fbbf24' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="warning" variant="subtitle2" fontWeight="bold">EXPIRING WITHIN 30 DAYS</Typography>
                  <Typography variant="h3" fontWeight="bold">{summary.expiringSoonCount}</Typography>
                </Box>
                <WarningIcon sx={{ fontSize: 50, opacity: 0.2 }} color="warning" />
              </Box>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Urgent action required for stock rotation.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: '#f8fafc', borderLeft: '6px solid #64748b' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="textSecondary" variant="subtitle2" fontWeight="bold">POTENTIAL LOSS VALUE</Typography>
                  <Typography variant="h3" fontWeight="bold">₹{summary.potentialLoss.toLocaleString()}</Typography>
                </Box>
                <InventoryIcon sx={{ fontSize: 50, opacity: 0.2 }} />
              </Box>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Estimated cost of expired inventory.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* Expired List */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 0, borderRadius: 3, overflow: 'hidden', border: '1px solid #fee2e2' }}>
            <Box sx={{ p: 2, bgcolor: '#fef2f2', display: 'flex', alignItems: 'center', gap: 2 }}>
              <ErrorIcon color="error" />
              <Typography variant="h6" fontWeight="bold" color="error">Expired Inventory</Typography>
            </Box>
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Product</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Batch</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Qty</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Expired On</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {summary.expired.map((b) => (
                    <TableRow key={b.id} hover>
                      <TableCell sx={{ fontWeight: 'medium' }}>{b.productName}</TableCell>
                      <TableCell>{b.batchNumber}</TableCell>
                      <TableCell align="center">{b.quantity}</TableCell>
                      <TableCell color="error">{new Date(b.expiryDate).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                  {summary.expired.length === 0 && <TableRow><TableCell colSpan={4} align="center">No expired stock found.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Expiring Soon List */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 0, borderRadius: 3, overflow: 'hidden', border: '1px solid #fef3c7' }}>
            <Box sx={{ p: 2, bgcolor: '#fffbeb', display: 'flex', alignItems: 'center', gap: 2 }}>
              <WarningIcon color="warning" />
              <Typography variant="h6" fontWeight="bold" color="warning.dark">Expiring Within 30 Days</Typography>
            </Box>
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Product</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Batch</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Qty</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Expiry Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {summary.expiringSoon.map((b) => (
                    <TableRow key={b.id} hover>
                      <TableCell sx={{ fontWeight: 'medium' }}>{b.productName}</TableCell>
                      <TableCell>{b.batchNumber}</TableCell>
                      <TableCell align="center">{b.quantity}</TableCell>
                      <TableCell>{new Date(b.expiryDate).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                  {summary.expiringSoon.length === 0 && <TableRow><TableCell colSpan={4} align="center">No near-expiry stock found.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ExpiryDashboardPage;
