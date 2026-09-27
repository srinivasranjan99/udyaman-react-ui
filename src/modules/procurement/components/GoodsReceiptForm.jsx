import React, { useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import {
  Box, Typography, Paper, Grid, Button, Divider, Table, 
  TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Card, CardContent, Stack, Alert, Chip
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as BackIcon,
  LocalShipping as GRNIcon
} from '@mui/icons-material';
import { 
  TextInput, 
  NumberInput, 
  DateInput
} from '../../../components/forms/UdyamanFormFields';
import { purchaseApi } from '../../../api/purchaseApi';

const GoodsReceiptForm = ({ onBack, po }) => {
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      purchaseOrderId: po.id,
      supplierInvoiceNumber: '',
      notes: '',
      items: (po.items || []).map(item => {
        const vId = item.productVariant?.id || 
                    (typeof item.productVariant === 'number' ? item.productVariant : null) ||
                    item.productVariantId ||
                    item.product?.variants?.[0]?.id ||
                    item.product?.id;

        return {
          poItemId: item.id,
          productVariantId: vId,
          productName: item.product?.name || item.productName || 'Material',
          sku: item.product?.sku || item.sku || 'SKU',
          orderedQty: item.orderQuantity || 0,
          receivedQty: item.receivedQuantity || 0,
          pendingQty: (item.orderQuantity || 0) - (item.receivedQuantity || 0),
          acceptedQuantity: (item.orderQuantity || 0) - (item.receivedQuantity || 0),
          rejectedQuantity: 0,
          batchNumber: '',
          expiryDate: '',
          rejectionReason: ''
        };
      })
    }
  });

  const { fields } = useFieldArray({
    control,
    name: "items"
  });

  const onSubmit = async (data) => {
    try {
      if (!data.items || data.items.length === 0) {
        alert("No items to receive.");
        return;
      }

      // Sanitize data: convert null/empty to 0
      const sanitizedItems = data.items.map(item => ({
        ...item,
        acceptedQuantity: Number(item.acceptedQuantity) || 0,
        rejectedQuantity: Number(item.rejectedQuantity) || 0
      }));

      const hasInvalidQty = sanitizedItems.some(item => (item.acceptedQuantity + item.rejectedQuantity) > item.pendingQty);
      if (hasInvalidQty) {
        alert("One or more items exceed the pending quantity.");
        return;
      }

      const missingVariant = sanitizedItems.some(item => !item.productVariantId);
      if (missingVariant) {
        alert("System Error: Product Variant information is missing for some items.");
        return;
      }

      await purchaseApi.createGRN(po.id, { ...data, items: sanitizedItems });
      alert("Goods Receipt created successfully!");
      onBack();
    } catch (err) {
      alert("Failed to create GRN: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button startIcon={<BackIcon />} onClick={onBack}>Cancel</Button>
        <Typography variant="h5" fontWeight="900">Create Goods Receipt Note (GRN)</Typography>
        <Button 
          type="submit" 
          variant="contained" 
          color="success"
          startIcon={<GRNIcon />}
          sx={{ borderRadius: 2, px: 4 }}
        >
          Confirm Receipt
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 4, borderRadius: 4, border: '1px solid #e0e6ed' }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 800 }}>Receipt Details for PO: {po.poNumber}</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextInput name="supplierInvoiceNumber" control={control} label="Supplier Invoice #" placeholder="Inv/2024/..." />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextInput name="notes" control={control} label="Remarks" />
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary' } }}>
                    <TableCell width="30%">Material</TableCell>
                    <TableCell align="center">Ordered / Pending</TableCell>
                    <TableCell width="15%">Accepted Qty</TableCell>
                    <TableCell width="15%">Rejected Qty</TableCell>
                    <TableCell width="15%">Batch #</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">{field.productName}</Typography>
                        <Typography variant="caption" color="textSecondary">{field.sku}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight="bold">{field.orderedQty}</Typography>
                        <Chip 
                          label={`Pending: ${field.pendingQty}`} 
                          size="small" 
                          color="primary" 
                          variant="outlined" 
                          sx={{ mt: 0.5, fontWeight: 'bold' }} 
                        />
                      </TableCell>
                      <TableCell>
                        <NumberInput name={`items.${index}.acceptedQuantity`} control={control} label="" sx={{ mt: 0 }} />
                      </TableCell>
                      <TableCell>
                        <NumberInput name={`items.${index}.rejectedQuantity`} control={control} label="" sx={{ mt: 0 }} />
                      </TableCell>
                      <TableCell>
                        <TextInput name={`items.${index}.batchNumber`} control={control} label="" sx={{ mt: 0 }} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 4, bgcolor: '#f8fafc', boxShadow: 'none', border: '1px solid #e0e6ed' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight="800" sx={{ mb: 2 }}>PO Reference</Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="textSecondary">Supplier</Typography>
                  <Typography fontWeight="bold">{po.supplier?.name || po.supplierName}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">Warehouse</Typography>
                  <Typography fontWeight="bold">{po.warehouse?.name || po.warehouseName}</Typography>
                </Box>
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  Ensure the material matches the physical delivery before confirming.
                </Alert>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default GoodsReceiptForm;
