import React, { useEffect, useMemo } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import {
  Box, Typography, Paper, Grid, Button, Divider, Table, 
  TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Card, CardContent, Stack, Chip, Alert
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Send as SendIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  ArrowBack as BackIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import { 
  TextInput, 
  NumberInput, 
  SelectInput, 
  DateInput, 
  AutocompleteInput,
  AsyncAutocompleteInput
} from '../../../components/forms/UdyamanFormFields';
import { purchaseApi } from '../../../api/purchaseApi';
import { useAuth } from '../../../context/AuthContext.jsx';
import { PERMISSIONS, hasPermission } from '../../../utils/rbac';

const PurchaseOrderForm = ({ onBack, initialData = null, suppliers = [], warehouses = [] }) => {
  const { user } = useAuth();
  
  // Requirement 1: Lock Mechanism
  const isLocked = initialData && initialData.status !== 'DRAFT' && initialData.status !== 'REJECTED';

  const getDefaults = () => {
    if (!initialData) return {
      supplierId: '',
      warehouseId: '',
      expectedDeliveryDate: '',
      currency: 'INR',
      paymentTerms: '',
      notes: '',
      items: [{ productId: null, quantity: 1, unitPrice: 0, unit: 'PCS', taxRate: 18 }]
    };

    return {
      supplierId: initialData.supplier?.id || '',
      warehouseId: initialData.warehouse?.id || '',
      expectedDeliveryDate: initialData.expectedDeliveryDate || '',
      currency: initialData.currency || 'INR',
      paymentTerms: initialData.paymentTerms || '',
      notes: initialData.notes || '',
      items: initialData.items?.length > 0 ? initialData.items.map(item => ({
        productId: item.product || { id: item.productId, name: item.productName, sku: item.sku },
        quantity: item.orderQuantity || item.quantity || 1,
        unitPrice: item.unitPrice || 0,
        unit: item.unit || 'PCS',
        taxRate: item.taxRate || 18
      })) : [{ productId: null, quantity: 1, unitPrice: 0, unit: 'PCS', taxRate: 18 }]
    };
  };

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: getDefaults()
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  const watchedItems = watch("items");

  const totals = useMemo(() => {
    const items = watchedItems || [];
    const subtotal = items.reduce((acc, item) => {
      const lineSub = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
      return acc + lineSub;
    }, 0);

    const taxAmount = items.reduce((acc, item) => {
      const lineSub = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
      const lineTax = lineSub * ((Number(item.taxRate) || 0) / 100);
      return acc + lineTax;
    }, 0);

    return {
      subtotal,
      taxAmount,
      total: subtotal + taxAmount
    };
  }, [watchedItems]);

  const onSubmit = async (data) => {
    if (isLocked) return;
    try {
      const payload = {
        ...data,
        items: data.items.map(item => ({
          ...item,
          productId: item.productId?.id || item.productId
        }))
      };

      if (initialData?.id) {
        await purchaseApi.updateOrder(initialData.id, payload);
      } else {
        await purchaseApi.createOrder(payload);
      }
      onBack();
    } catch (err) {
      alert("Failed to save PO: " + (err.response?.data?.message || err.message));
    }
  };

  const handleAction = async (action) => {
    if (!initialData?.id) return;
    try {
      if (action === 'submit') await purchaseApi.submitOrder(initialData.id);
      if (action === 'approve') await purchaseApi.approveOrder(initialData.id, "Approved via UI");
      if (action === 'reject') await purchaseApi.rejectOrder(initialData.id, "Rejected via UI");
      onBack();
    } catch (err) {
      alert(`Action ${action} failed: ` + (err.response?.data?.message || err.message));
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Button startIcon={<BackIcon />} onClick={onBack}>Back to List</Button>
          <Chip label="V2" size="small" color="secondary" />
        </Stack>
        <Stack direction="row" spacing={2} alignItems="center">
          {initialData && (
            <Chip 
              label={`STATUS: ${initialData.status}`} 
              color={initialData.status === 'APPROVED' ? 'success' : initialData.status === 'SUBMITTED' ? 'info' : 'default'} 
              variant="outlined" 
              sx={{ fontWeight: 'bold' }}
            />
          )}
          
          {!isLocked && (
            <Button type="submit" variant="contained" startIcon={<SaveIcon />} sx={{ borderRadius: 2 }}>
              {initialData?.id ? 'Update Draft' : 'Save as Draft'}
            </Button>
          )}

          {/* Workflow Buttons */}
          {initialData?.id && (initialData.status === 'DRAFT' || initialData.status === 'REJECTED') && (
            <Button color="info" variant="contained" startIcon={<SendIcon />} onClick={() => handleAction('submit')}>
              Submit PO
            </Button>
          )}

          {initialData?.status === 'SUBMITTED' && hasPermission(user?.roles, PERMISSIONS.PO_APPROVE) && (
            <>
              <Button color="error" variant="outlined" startIcon={<RejectIcon />} onClick={() => handleAction('reject')}>
                Reject
              </Button>
              <Button color="success" variant="contained" startIcon={<ApproveIcon />} onClick={() => handleAction('approve')}>
                Approve
              </Button>
            </>
          )}
        </Stack>
      </Box>

      {isLocked && (
        <Alert icon={<LockIcon />} severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          This Purchase Order is **{initialData.status}**. View-only mode is enabled.
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 4, borderRadius: 4, border: '1px solid #e0e6ed', pointerEvents: isLocked ? 'none' : 'auto', opacity: isLocked ? 0.8 : 1 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 800, color: '#1e293b' }}>
              Supplier & Logistics
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <AutocompleteInput 
                  name="supplierId" 
                  control={control} 
                  label="Select Supplier" 
                  required 
                  options={(Array.isArray(suppliers) ? suppliers : []).map(s => ({ value: s.id, label: s.name }))}
                  disabled={isLocked}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <AutocompleteInput 
                  name="warehouseId" 
                  control={control} 
                  label="Receiving Warehouse" 
                  required 
                  options={(Array.isArray(warehouses) ? warehouses : []).map(w => ({ value: w.id, label: w.name }))}
                  disabled={isLocked}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <DateInput name="expectedDeliveryDate" control={control} label="Expected Delivery" disabled={isLocked} />
              </Grid>
              <Grid item xs={12} md={4}>
                <SelectInput 
                  name="currency" 
                  control={control} 
                  label="Currency" 
                  options={[
                    { value: 'INR', label: 'INR - Indian Rupee' },
                    { value: 'USD', label: 'USD - US Dollar' },
                    { value: 'EUR', label: 'EUR - Euro' }
                  ]}
                  disabled={isLocked}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextInput name="paymentTerms" control={control} label="Payment Terms" disabled={isLocked} />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 4, borderRadius: 4, border: '1px solid #e0e6ed', pointerEvents: isLocked ? 'none' : 'auto', opacity: isLocked ? 0.8 : 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b' }}>
                Order Line Items
              </Typography>
              {!isLocked && (
                <Button startIcon={<AddIcon />} variant="outlined" onClick={() => append({ productId: null, quantity: 1, unitPrice: 0, unit: 'PCS', taxRate: 18 })}>
                  Add Material
                </Button>
              )}
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary' } }}>
                    <TableCell width="35%">Material / Product</TableCell>
                    <TableCell width="15%">Quantity</TableCell>
                    <TableCell width="12%">Unit</TableCell>
                    <TableCell width="15%">Unit Price</TableCell>
                    <TableCell width="10%">Tax %</TableCell>
                    <TableCell width="13%" align="right">Total</TableCell>
                    {!isLocked && <TableCell width="5%"></TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fields.map((field, index) => {
                    const lineTotal = (watchedItems[index]?.quantity || 0) * (watchedItems[index]?.unitPrice || 0);
                    return (
                      <TableRow key={field.id} sx={{ '& td': { py: 1 } }}>
                        <TableCell>
                          <AsyncAutocompleteInput 
                            name={`items.${index}.productId`} 
                            control={control} 
                            label="" 
                            endpoint="/inventory/products/search"
                            disabled={isLocked}
                            onOptionSelect={(material) => {
                              if (material) {
                                setValue(`items.${index}.unitPrice`, material.purchasePrice || 0);
                                setValue(`items.${index}.unit`, material.unit || 'PCS');
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <NumberInput name={`items.${index}.quantity`} control={control} label="" sx={{ mt: 0 }} disabled={isLocked} />
                        </TableCell>
                        <TableCell>
                          <TextInput name={`items.${index}.unit`} control={control} label="" sx={{ mt: 0 }} disabled={isLocked} />
                        </TableCell>
                        <TableCell>
                          <NumberInput name={`items.${index}.unitPrice`} control={control} label="" sx={{ mt: 0 }} disabled={isLocked} />
                        </TableCell>
                        <TableCell>
                          <NumberInput name={`items.${index}.taxRate`} control={control} label="" sx={{ mt: 0 }} disabled={isLocked} />
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="bold">₹{lineTotal.toLocaleString()}</Typography>
                        </TableCell>
                        {!isLocked && (
                          <TableCell>
                            <IconButton color="error" onClick={() => remove(index)} disabled={fields.length === 1}>
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 4, borderRadius: 4, border: '1px solid #e0e6ed', height: '100%', pointerEvents: isLocked ? 'none' : 'auto', opacity: isLocked ? 0.8 : 1 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 800, color: '#1e293b' }}>
              Notes & Comments
            </Typography>
            <TextInput name="notes" control={control} label="Internal Notes" multiline rows={4} sx={{ mt: 0 }} disabled={isLocked} />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 4, border: '1px solid #e0e6ed', boxShadow: 'none', height: '100%' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 800, color: '#1e293b' }}>
                Financial Summary
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Subtotal</Typography>
                  <Typography fontWeight="bold">₹{totals.subtotal.toLocaleString()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Tax Amount</Typography>
                  <Typography fontWeight="bold">₹{totals.taxAmount.toLocaleString()}</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h5" fontWeight="900" color="primary">Total</Typography>
                  <Typography variant="h5" fontWeight="900" color="primary">₹{totals.total.toLocaleString()}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PurchaseOrderForm;
