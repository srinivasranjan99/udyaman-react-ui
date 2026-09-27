import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, IconButton, Chip,
  Dialog, DialogTitle, DialogContent, Stack, Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Settings as ConfigIcon,
  AssignmentTurnedIn as WorkflowIcon
} from '@mui/icons-material';
import { workflowApi } from '../../../api/workflowApi';
import WorkflowBuilderWizard from './components/WorkflowBuilderWizard';

const WorkflowConfigPage = () => {
  const [policies, setPolicies] = useState([]);
  const [openWizard, setOpenWizard] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  const roles = ['ROLE_MANAGER', 'ROLE_ADMIN', 'ROLE_FINANCE', 'ROLE_DIRECTOR'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await workflowApi.getPolicies();
      setPolicies(response.data || []);
    } catch (err) {
      console.error("Failed to fetch policies", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setSelectedPolicy(null);
    setOpenWizard(true);
  };

  const handleEditPolicy = (policy) => {
    setSelectedPolicy(policy);
    setOpenWizard(true);
  };

  const handleDeletePolicy = async (id) => {
    if (!window.confirm("Are you sure you want to delete this policy?")) return;
    try {
      await workflowApi.deletePolicy(id);
      fetchData();
    } catch (err) {
      alert("Failed to delete policy: " + (err.response?.data?.message || err.message));
    }
  };

  const handleSavePolicy = async (data) => {
    try {
      if (selectedPolicy) {
        await workflowApi.updatePolicy(selectedPolicy.id, data);
      } else {
        await workflowApi.createPolicy(data);
      }
      setOpenWizard(false);
      fetchData();
    } catch (err) {
      alert("Failed to save policy: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="900" sx={{ color: '#1e293b', mb: 1 }}>
            Workflow Governance
          </Typography>
          <Typography color="textSecondary" sx={{ fontWeight: 500 }}>
            Configure multi-tenant approval hierarchies and business rules for ERP modules.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={handleCreateNew}
          sx={{ borderRadius: 2, px: 3, fontWeight: 'bold' }}
        >
          Create Policy
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TableContainer component={Paper} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
            <Table>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow sx={{ '& th': { fontWeight: 800, color: '#475569', py: 2 } }}>
                  <TableCell>MODULE</TableCell>
                  <TableCell>POLICY NAME</TableCell>
                  <TableCell>ACTIVE RULES</TableCell>
                  <TableCell>STATUS</TableCell>
                  <TableCell align="center">ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {policies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                      <ConfigIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                      <Typography variant="subtitle1" color="text.secondary">No workflow policies configured.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  policies.map((policy) => (
                    <TableRow key={policy.id} hover>
                      <TableCell>
                        <Chip label={policy.module} size="small" variant="outlined" sx={{ fontWeight: 'bold' }} />
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="700">{policy.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{policy.rules?.length || 0} Rules defined</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={policy.isActive ? "Active" : "Inactive"} 
                          color={policy.isActive ? "success" : "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <IconButton size="small" color="primary" onClick={() => handleEditPolicy(policy)}><EditIcon /></IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDeletePolicy(policy.id)}><DeleteIcon /></IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      <Dialog 
        open={openWizard} 
        onClose={() => setOpenWizard(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, p: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, display: 'flex', alignItems: 'center' }}>
          <WorkflowIcon sx={{ mr: 1, color: 'primary.main' }} />
          {selectedPolicy ? 'Edit Approval Workflow' : 'Configure Approval Workflow'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <WorkflowBuilderWizard 
              onSave={handleSavePolicy} 
              onCancel={() => setOpenWizard(false)}
              roles={roles}
              initialData={selectedPolicy}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default WorkflowConfigPage;
