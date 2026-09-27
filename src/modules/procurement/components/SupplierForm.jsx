import React from 'react';
import { useForm } from 'react-hook-form';
import { 
  Box, Grid, Paper, Typography, Button, Divider, 
  Stack, Alert, Chip 
} from '@mui/material';
import { 
  Save as SaveIcon, 
  Cancel as CancelIcon,
  Business as BusinessIcon,
  ContactPhone as ContactIcon,
  LocationOn as AddressIcon,
  AccountBalance as FinancialIcon,
  Receipt as TaxIcon,
  Settings as AdditionalIcon
} from '@mui/icons-material';
import { 
  TextInput, 
  SelectInput, 
  NumberInput 
} from '../../../components/forms/UdyamanFormFields';

const FormSection = ({ title, icon: Icon, children }) => (
  <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, color: 'primary.main' }}>
      <Icon sx={{ mr: 1.5 }} />
      <Typography variant="h6" fontWeight="800" sx={{ color: '#1e293b' }}>{title}</Typography>
    </Box>
    <Divider sx={{ mb: 3 }} />
    <Grid container spacing={3}>
      {children}
    </Grid>
  </Paper>
);

const SupplierForm = ({ initialData, onSave, onCancel, loading }) => {
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialData || {
      supplierType: 'COMPANY',
      country: 'India',
      currency: 'INR',
      status: 'ACTIVE',
      leadTimeDays: 0
    }
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSave)}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="900" color="#1e293b">
            {initialData ? 'Edit Supplier' : 'New Supplier'}
          </Typography>
          <Typography color="textSecondary">Define vendor details for procurement and finance.</Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<CancelIcon />} onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button variant="contained" type="submit" startIcon={<SaveIcon />} loading={loading}>
            Save Supplier
          </Button>
        </Stack>
      </Stack>

      {Object.keys(errors).length > 0 && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          Please correct the validation errors in the form sections below.
        </Alert>
      )}

      <Grid container spacing={1}>
        <Grid size={12}>
          <FormSection title="Basic Information" icon={BusinessIcon}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextInput name="name" control={control} label="Supplier Name" required />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextInput name="supplierCode" control={control} label="Supplier Code" placeholder="AUTO" />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <SelectInput 
                name="supplierType" 
                control={control} 
                label="Supplier Type" 
                options={[
                  { value: 'COMPANY', label: 'Company / Business' },
                  { value: 'INDIVIDUAL', label: 'Individual / Freelancer' }
                ]}
              />
            </Grid>
          </FormSection>
        </Grid>

        <Grid size={12}>
          <FormSection title="Contact Details" icon={ContactIcon}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextInput name="contactPerson" control={control} label="Contact Person" required />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextInput name="phone" control={control} label="Phone Number" required />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextInput name="email" control={control} label="Email Address" />
            </Grid>
          </FormSection>
        </Grid>

        <Grid size={12}>
          <FormSection title="Address Details" icon={AddressIcon}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextInput name="addressLine1" control={control} label="Address Line 1" required />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextInput name="city" control={control} label="City" required />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextInput name="state" control={control} label="State" required />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextInput name="country" control={control} label="Country" required />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextInput name="pincode" control={control} label="Pincode" required />
            </Grid>
          </FormSection>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormSection title="Financial" icon={FinancialIcon}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextInput name="currency" control={control} label="Currency" required />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextInput name="paymentTerms" control={control} label="Payment Terms" required />
            </Grid>
            <Grid size={12}>
              <NumberInput name="creditLimit" control={control} label="Credit Limit" />
            </Grid>
          </FormSection>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormSection title="Taxation" icon={TaxIcon}>
            <Grid size={12}>
              <TextInput 
                name="gstNumber" 
                control={control} 
                label="GST Number" 
                placeholder="22AAAAA0000A1Z5"
                helperText="Standard 15-digit GSTIN"
              />
            </Grid>
            <Grid size={12}>
              <TextInput name="panNumber" control={control} label="PAN Number" placeholder="ABCDE1234F" />
            </Grid>
          </FormSection>
        </Grid>

        <Grid size={12}>
          <FormSection title="Operational Settings" icon={AdditionalIcon}>
            <Grid size={{ xs: 12, md: 4 }}>
              <NumberInput name="leadTimeDays" control={control} label="Lead Time (Days)" helperText="Typical fulfillment duration" />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <SelectInput 
                name="status" 
                control={control} 
                label="Account Status" 
                options={[
                  { value: 'ACTIVE', label: 'Active' },
                  { value: 'INACTIVE', label: 'Inactive' }
                ]}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                  Dynamic Fields Support
                </Typography>
                <Chip label="Configurable Attributes Active" color="success" variant="outlined" size="small" />
              </Box>
            </Grid>
          </FormSection>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SupplierForm;
