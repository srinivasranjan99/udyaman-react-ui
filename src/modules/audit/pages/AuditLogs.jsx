import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, TablePagination, 
  TextField, MenuItem, Chip, IconButton, Collapse, Grid
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import api from '../../../api/axios';

const AuditRow = ({ log }) => {
  const [open, setOpen] = useState(false);

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
        <TableCell>
          <Chip label={log.module} size="small" variant="outlined" />
        </TableCell>
        <TableCell>
          <Typography variant="body2" fontWeight="bold">{log.action}</Typography>
        </TableCell>
        <TableCell>{log.entityId}</TableCell>
        <TableCell>{log.createdBy}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1, bgcolor: '#f8fafc', p: 2, borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom component="div">
                Change Details (JSON Payload)
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">BEFORE</Typography>
                  <pre style={{ fontSize: '0.75rem', overflowX: 'auto' }}>
                    {log.oldValue ? JSON.stringify(JSON.parse(log.oldValue), null, 2) : 'No previous state recorded'}
                  </pre>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">AFTER</Typography>
                  <pre style={{ fontSize: '0.75rem', overflowX: 'auto' }}>
                    {log.newValue ? JSON.stringify(JSON.parse(log.newValue), null, 2) : 'New state recorded'}
                  </pre>
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [module, setModule] = useState('PRODUCT');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, [page, rowsPerPage, module]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/audit/${module}`, {
        params: { page, size: rowsPerPage }
      });
      if (response.data && response.data.data) {
        setLogs(response.data.data.content || []);
        setTotalElements(response.data.data.totalElements || 0);
      }
    } catch (err) {
      console.error("Failed to fetch audit logs", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">System Audit Trail</Typography>
        <TextField
          select
          label="Filter by Module"
          value={module}
          onChange={(e) => setModule(e.target.value)}
          sx={{ minWidth: 200 }}
          size="small"
        >
          <MenuItem value="PRODUCT">Material Master</MenuItem>
          <MenuItem value="STOCK">Inventory</MenuItem>
          <MenuItem value="INVOICE">Billing</MenuItem>
          <MenuItem value="PURCHASE">Procurement</MenuItem>
        </TextField>
      </Box>

      <TableContainer component={Paper}>
        <Table aria-label="collapsible table">
          <TableHead sx={{ bgcolor: '#f1f5f9' }}>
            <TableRow>
              <TableCell width={50} />
              <TableCell>Timestamp</TableCell>
              <TableCell>Module</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Entity ID</TableCell>
              <TableCell>User</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <AuditRow key={log.id} log={log} />
            ))}
            {logs.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  No audit logs found for the selected module.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={totalElements}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, p) => setPage(p)}
          onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
        />
      </TableContainer>
    </Box>
  );
}
