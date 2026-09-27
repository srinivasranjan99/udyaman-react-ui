import React, { useState, useEffect } from 'react';
import { 
  Box, Container, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, TablePagination,
  TextField, InputAdornment, Chip, IconButton, Collapse,
  Grid, Card, CardContent, Divider, Alert, Button
} from '@mui/material';
import {
  Search as SearchIcon,
  History as HistoryIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  CompareArrows as CompareArrowsIcon,
  FilterAlt as FilterAltIcon
} from '@mui/icons-material';
import api from '../api/axios';

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  
  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedUser, setSelectedUser] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [page, rowsPerPage, startDate, endDate, selectedModule, selectedUser]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size: rowsPerPage,
        sort: 'createdAt,desc',
        module: selectedModule || undefined,
        user: selectedUser || undefined,
        startDate: startDate ? `${startDate}T00:00:00` : undefined,
        endDate: endDate ? `${endDate}T23:59:59` : undefined
      };
      const res = await api.get('/admin/audit-logs', { params });
      setLogs(res.data.data.content || []);
      setTotalElements(res.data.data.totalElements || 0);
    } catch (err) {
      console.error("Failed to fetch audit logs", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <HistoryIcon fontSize="large" color="primary" /> System Audit Trail
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Complete historical record of all critical entity changes across the platform.
        </Typography>
      </Box>

      {/* Filter Bar */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Module"
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              SelectProps={{ native: true }}
              size="small"
            >
              <option value="">All Modules</option>
              <option value="PRODUCT">Material Master</option>
              <option value="INVENTORY">Inventory</option>
              <option value="BILLING">Billing</option>
              <option value="STOCK">Stock Management</option>
              <option value="PURCHASE">Procurement</option>
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="User ID"
              placeholder="Filter by user..."
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              size="small"
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField
              fullWidth
              label="From"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField
              fullWidth
              label="To"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button 
              fullWidth 
              variant="outlined" 
              startIcon={<FilterAltIcon />}
              onClick={() => { setStartDate(''); setEndDate(''); setSelectedModule(''); setSelectedUser(''); }}
            >
              Reset
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f8fafc' }}>
              <TableCell />
              <TableCell sx={{ fontWeight: 'bold' }}>Timestamp</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>User</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Module</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Entity ID</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <Row key={log.id} log={log} isExpanded={expandedRow === log.id} setExpanded={setExpandedRow} />
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[15, 30, 50]}
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

const Row = ({ log, isExpanded, setExpanded }) => {
  const getActionColor = (action) => {
    switch (action) {
      case 'CREATE': return 'success';
      case 'UPDATE': return 'primary';
      case 'DELETE': return 'error';
      default: return 'default';
    }
  };

  const renderDiff = (oldVal, newVal) => {
    try {
      const oldObj = oldVal ? JSON.parse(oldVal) : {};
      const newObj = newVal ? JSON.parse(newVal) : {};
      
      const allKeys = Array.from(new Set([...Object.keys(oldObj), ...Object.keys(newObj)]));
      
      return (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Field</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'error.main' }}>Old Value</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'success.main' }}>New Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {allKeys.map(key => {
              if (key === 'updatedAt' || key === 'createdAt') return null;
              const isDiff = JSON.stringify(oldObj[key]) !== JSON.stringify(newObj[key]);
              if (!isDiff && oldVal && newVal) return null; // Show only changes if both exist
              
              return (
                <TableRow key={key} sx={{ bgcolor: isDiff ? '#fffbeb' : 'inherit' }}>
                  <TableCell variant="caption">{key}</TableCell>
                  <TableCell sx={{ color: 'text.secondary', textDecoration: isDiff ? 'line-through' : 'none' }}>
                    {String(oldObj[key] ?? '-') }
                  </TableCell>
                  <TableCell sx={{ fontWeight: isDiff ? 'bold' : 'normal' }}>
                    {String(newObj[key] ?? '-') }
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      );
    } catch (e) {
      return <Typography color="error">Data format error: Cannot render diff</Typography>;
    }
  };

  return (
    <React.Fragment>
      <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton size="small" onClick={() => setExpanded(isExpanded ? null : log.id)}>
            {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell variant="caption">{new Date(log.createdAt).toLocaleString()}</TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" fontWeight="medium">{log.createdBy}</Typography>
          </Box>
        </TableCell>
        <TableCell><Chip label={log.moduleName} size="small" variant="outlined" /></TableCell>
        <TableCell>
          <Chip label={log.action} size="small" color={getActionColor(log.action)} sx={{ fontWeight: 'bold' }} />
        </TableCell>
        <TableCell sx={{ fontFamily: 'monospace' }}>#{log.entityId}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2, p: 2, bgcolor: '#fafafa', borderRadius: 2, border: '1px solid #eee' }}>
              <Typography variant="subtitle2" gutterBottom component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CompareArrowsIcon fontSize="small" /> Change Details (JSON Diff)
              </Typography>
              {renderDiff(log.oldValue, log.newValue)}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

export default AuditLogsPage;
