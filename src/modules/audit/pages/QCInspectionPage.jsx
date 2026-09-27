import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, Chip, IconButton,
  Tooltip, LinearProgress, TextField, InputAdornment, Dialog,
  DialogTitle, DialogContent, DialogActions, Grid, MenuItem
} from '@mui/material';
import {
  FactCheck as QcIcon,
  Search as SearchIcon,
  Add as AddIcon,
  CheckCircle as SuccessIcon,
  Cancel as FailIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import api from '../../../api/axios';

/**
 * QCInspectionPage: Management of Quality Control checks for production and procurement.
 * Essential for compliance and material reliability.
 */
const QCInspectionPage = () => {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchInspections();
  }, []);

  const fetchInspections = async () => {
    setLoading(true);
    try {
      // Mocking or using QC endpoint if available
      const res = await api.get('/qc/inspections').catch(() => ({ data: { data: [] } }));
      setInspections(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">QC Inspections</Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor and record quality assurance checks for raw materials and finished goods.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} sx={{ borderRadius: 2 }} onClick={() => setOpen(true)}>
          New Inspection
        </Button>
      </Box>

      <Paper sx={{ borderRadius: 4, overflow: 'hidden' }}>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <TextField
            placeholder="Search by Batch or Product..."
            size="small"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ width: 350 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
              ),
              sx: { borderRadius: 2 }
            }}
          />
          <IconButton><FilterIcon /></IconButton>
        </Box>

        {loading && <LinearProgress />}

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Reference</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Product / Batch</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Inspector</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Result</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inspections.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    {loading ? 'Analyzing quality records...' : 'No QC records found.'}
                  </TableCell>
                </TableRow>
              ) : inspections.map((qc) => (
                <TableRow key={qc.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <QcIcon color="action" />
                      <Typography variant="body2" fontWeight="bold">QC-{qc.id.toString().padStart(5, '0')}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">{qc.productName}</Typography>
                    <Typography variant="caption" color="text.secondary">Batch: {qc.batchNumber || 'N/A'}</Typography>
                  </TableCell>
                  <TableCell>{new Date(qc.inspectionDate).toLocaleDateString()}</TableCell>
                  <TableCell>{qc.inspectorName}</TableCell>
                  <TableCell>
                    <Chip 
                      icon={qc.result === 'PASS' ? <SuccessIcon /> : <FailIcon />}
                      label={qc.result} 
                      color={qc.result === 'PASS' ? 'success' : 'error'} 
                      size="small" 
                      sx={{ fontWeight: 'bold', borderRadius: 1.5 }} 
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small"><ViewIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* New Inspection Placeholder Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Log New QC Inspection</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Product / SKU" />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Batch Number" />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField select fullWidth label="Result">
                <MenuItem value="PASS">Pass</MenuItem>
                <MenuItem value="FAIL">Fail</MenuItem>
                <MenuItem value="REPROCESS">Requires Reprocessing</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth type="date" label="Inspection Date" InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={3} label="Observation Notes" />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained">Submit Result</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QCInspectionPage;
