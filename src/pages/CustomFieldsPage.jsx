import React, { useState, useEffect } from 'react';
import { 
  Box, Container, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Button, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  Chip, CircularProgress, Alert, Grid, Switch, FormControlLabel,
  Tabs, Tab, Tooltip, Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import api from '../api/axios';

const FIELD_TYPES = [
  { value: 'TEXT', label: 'Text Input' },
  { value: 'NUMBER', label: 'Numeric Value' },
  { value: 'DATE', label: 'Date Picker' },
  { value: 'SELECT', label: 'Dropdown Menu' },
  { value: 'BOOLEAN', label: 'Toggle/Switch' }
];

const MODULES = [
  { value: 'MATERIAL', label: 'Products / Material Master' },
  { value: 'SUPPLIER', label: 'Suppliers' },
  { value: 'INVOICE', label: 'Sales Invoices' }
];

export default function CustomFieldsPage() {
  const [activeModule, setActiveModule] = useState('MATERIAL');
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState(null);
  
  const [formData, setFormData] = useState({
    fieldName: '',
    displayLabel: '',
    fieldType: 'TEXT',
    isMandatory: false,
    isVisible: true,
    displayOrder: 0,
    helpText: '',
    isSystemField: false
  });

  useEffect(() => {
    loadConfigs();
  }, [activeModule]);

  const loadConfigs = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/config/fields/${activeModule}`);
      setConfigs(res.data.data || []);
      setError(null);
    } catch (err) {
      console.error("Failed to load configs", err);
      setError("Failed to fetch form configurations.");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveModule(newValue);
  };

  const handleOpenAdd = () => {
    setSelectedConfig(null);
    setFormData({
      fieldName: '',
      displayLabel: '',
      fieldType: 'TEXT',
      isMandatory: false,
      isVisible: true,
      displayOrder: configs.length > 0 ? Math.max(...configs.map(c => c.displayOrder)) + 1 : 100,
      helpText: '',
      isSystemField: false
    });
    setOpenDialog(true);
  };

  const handleOpenEdit = (config) => {
    setSelectedConfig(config);
    setFormData({ ...config });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedConfig(null);
  };

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    try {
      await api.post(`/config/fields/${activeModule}`, [formData]);
      handleCloseDialog();
      loadConfigs();
    } catch (err) {
      console.error("Save failed", err);
      setError("Failed to save configuration: " + (err.response?.data?.message || err.message));
    }
  };

  const handleReset = async () => {
    if (window.confirm("Reset all customizations for this module to system defaults? This cannot be undone.")) {
      try {
        await api.delete(`/config/fields/${activeModule}/reset`);
        loadConfigs();
      } catch (err) {
        console.error("Reset failed", err);
      }
    }
  };

  const handleDelete = async (fieldName) => {
    if (window.confirm("Delete this custom field? All data associated with it in existing records may be inaccessible.")) {
      alert("Custom field deletion requires backend archival support. Feature coming soon.");
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <SettingsSuggestIcon color="primary" fontSize="large" />
            Form Architect
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Configure system fields and define custom attributes for your tenant.
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          color="warning" 
          startIcon={<RestoreIcon />} 
          onClick={handleReset}
          sx={{ borderRadius: 2 }}
        >
          Reset Defaults
        </Button>
      </Box>

      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs 
          value={activeModule} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          {MODULES.map(m => (
            <Tab key={m.value} label={m.label} value={m.value} sx={{ py: 2, fontWeight: 'bold' }} />
          ))}
        </Tabs>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={handleOpenAdd}
          sx={{ borderRadius: 2, px: 3 }}
        >
          Add Custom Attribute
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>}

      <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell width={80}>Order</TableCell>
              <TableCell>Field Label</TableCell>
              <TableCell>Internal Key</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Visible</TableCell>
              <TableCell>Required</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                  <CircularProgress size={30} />
                </TableCell>
              </TableRow>
            ) : configs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                  <Typography color="textSecondary">No configuration found.</Typography>
                </TableCell>
              </TableRow>
            ) : configs.map((config) => (
              <TableRow key={config.fieldName} hover sx={{ opacity: config.isVisible ? 1 : 0.6 }}>
                <TableCell>{config.displayOrder}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" fontWeight="bold">{config.displayLabel}</Typography>
                    {config.isSystemField && (
                      <Tooltip title="Core ERP Field">
                        <Chip label="System" size="small" sx={{ height: 18, fontSize: '0.65rem', bgcolor: '#e0f2fe', color: '#0369a1' }} />
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
                <TableCell><code>{config.fieldName}</code></TableCell>
                <TableCell>
                  <Chip label={config.fieldType} size="small" variant="outlined" sx={{ borderRadius: 1 }} />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={config.isVisible ? "Visible" : "Hidden"} 
                    color={config.isVisible ? "success" : "default"} 
                    size="small" 
                    variant={config.isVisible ? "filled" : "outlined"}
                  />
                </TableCell>
                <TableCell>
                  {config.isMandatory ? <Chip label="Yes" color="error" size="small" /> : <Chip label="No" size="small" variant="outlined" />}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Configure Behavior">
                    <IconButton color="primary" onClick={() => handleOpenEdit(config)} size="small">
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {!config.isSystemField && (
                    <IconButton color="error" onClick={() => handleDelete(config.fieldName)} size="small">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <SettingsSuggestIcon color="primary" />
          {formData.isSystemField ? 'Override System Field' : 'Architect Custom Attribute'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField 
                fullWidth 
                label="Display Label" 
                name="displayLabel" 
                value={formData.displayLabel} 
                onChange={handleInputChange} 
                helperText="How this field appears in the form"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                fullWidth 
                label="Internal Field Name" 
                name="fieldName" 
                value={formData.fieldName} 
                onChange={handleInputChange} 
                disabled={formData.isSystemField}
                placeholder="e.g. fabric_color"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField 
                fullWidth 
                select 
                label="Data Type" 
                name="fieldType" 
                value={formData.fieldType || 'TEXT'} 
                onChange={handleInputChange}
                disabled={formData.isSystemField}
              >
                {FIELD_TYPES.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField 
                fullWidth 
                type="number" 
                label="Display Order" 
                name="displayOrder" 
                value={formData.displayOrder} 
                onChange={handleInputChange} 
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ mb: 1 }}>Control Flags</Divider>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={<Switch name="isVisible" checked={formData.isVisible} onChange={handleInputChange} />}
                    label="Visible in Form"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={<Switch name="isMandatory" checked={formData.isMandatory} onChange={handleInputChange} />}
                    label="Mandatory Field"
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <TextField 
                fullWidth 
                multiline 
                rows={2} 
                label="Help Text / Description" 
                name="helpText" 
                value={formData.helpText} 
                onChange={handleInputChange} 
              />
            </Grid>
          </Grid>
          
          {formData.isSystemField && (
            <Alert icon={<InfoOutlinedIcon />} severity="info" sx={{ mt: 3 }}>
              You are overriding a core ERP field. Hiding critical fields may affect some business workflows.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={handleCloseDialog} color="inherit">Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={!formData.fieldName || !formData.displayLabel}>
            Apply Configuration
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
