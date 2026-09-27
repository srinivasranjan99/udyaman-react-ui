import React, { useState, useEffect } from 'react';
import { 
  Box, Container, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, TablePagination,
  TextField, Chip, Grid, Button
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import api from '../api/axios';
import { useForm } from 'react-hook-form';
import { DateInput } from '../components/forms/UdyamanFormFields';

const StockAdjustmentsPage = () => {
  const [adjustments, setAdjustments] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const { control, watch, setValue } = useForm({
    defaultValues: {
      startDate: '',
      endDate: ''
    }
  });

  const startDate = watch('startDate');
  const endDate = watch('endDate');

  useEffect(() => {
    fetchAdjustments();
  }, [page, rowsPerPage, startDate, endDate]);

  const fetchAdjustments = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size: rowsPerPage,
        transactionType: 'ADJUSTMENT',
        startDate: startDate ? `${startDate}T00:00:00` : undefined,
        endDate: endDate ? `${endDate}T23:59:59` : undefined
      };
      const res = await api.get('/inventory/ledger', { params });
      if (res.data && res.data.data) {
        setAdjustments(res.data.data.content || []);
        setTotalElements(res.data.data.totalElements || 0);
      } else {
        setAdjustments([]);
        setTotalElements(0);
      }
    } catch (err) {
      console.error("Failed to fetch adjustments", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <HistoryIcon fontSize="large" color="warning" /> Manual Stock Adjustments
        </Typography>
        <Typography variant="body1" color="textSecondary">
          View all manual corrections, damage removals, and inventory reconciliation entries.
        </Typography>
      </Box>

      <Paper sx={{ p: 2, mb: 3, borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={5}>
            <DateInput 
              name="startDate"
              control={control}
              label="From Date"
              margin="none"
            />
          </Grid>
          <Grid item xs={12} md={5}>
            <DateInput 
              name="endDate"
              control={control}
              label="To Date"
              margin="none"
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button 
              fullWidth 
              variant="text" 
              startIcon={<FilterAltIcon />}
              onClick={() => { setValue('startDate', ''); setValue('endDate', ''); }}
              sx={{ height: 56 }}
            >
              Reset
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#fffaf0' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Timestamp</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Material</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Batch No</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Quantity</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Reason / Notes</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Performed By</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {adjustments.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell variant="caption">{new Date(row.createdAt).toLocaleString()}</TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">{row.variantName}</Typography>
                </TableCell>
                <TableCell sx={{ fontFamily: 'monospace' }}>{row.batchNumber || 'N/A'}</TableCell>
                <TableCell align="right">
                  <Chip 
                    label={row.quantity > 0 ? `+${row.quantity}` : row.quantity} 
                    color={row.quantity > 0 ? 'success' : 'error'} 
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                  />
                </TableCell>
                <TableCell>{row.notes || 'No reason provided'}</TableCell>
                <TableCell>{row.createdBy || 'System'}</TableCell>
              </TableRow>
            ))}
            {adjustments.length === 0 && (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 5 }}>No adjustments found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={totalElements}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, p) => setPage(p)}
          onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
        />
      </TableContainer>
    </Container>
  );
};

export default StockAdjustmentsPage;
