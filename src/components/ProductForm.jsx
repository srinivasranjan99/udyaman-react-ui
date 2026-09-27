import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  TextField,
  Button,
  Grid,
  MenuItem,
  Box,
} from '@mui/material';

const CATEGORIES = [
  'Electronics',
  'Groceries',
  'Clothing',
  'Pharmacy',
  'Hardware',
  'Other',
];

export default function ProductForm({ initialValues, onSubmit, isSubmitting }) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      category: '',
      price: '',
      gstRate: '',
      expiryDate: '',
      barcode: '',
    },
  });

  useEffect(() => {
    if (initialValues) {
      // Format date if needed to YYYY-MM-DD for native date input
      const formattedValues = { ...initialValues };
      if (formattedValues.expiryDate && formattedValues.expiryDate.includes('T')) {
        formattedValues.expiryDate = formattedValues.expiryDate.split('T')[0];
      }
      reset(formattedValues);
    }
  }, [initialValues, reset]);

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Controller
            name="name"
            control={control}
            rules={{ required: 'Product Name is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Product Name"
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Controller
            name="category"
            control={control}
            rules={{ required: 'Category is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                select
                fullWidth
                label="Category"
                error={!!errors.category}
                helperText={errors.category?.message}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {CATEGORIES.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="price"
            control={control}
            rules={{
              required: 'Price is required',
              min: { value: 0.01, message: 'Price must be greater than 0' }
            }}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                fullWidth
                label="Price"
                error={!!errors.price}
                helperText={errors.price?.message}
                InputProps={{ inputProps: { min: 0, step: '0.01' } }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="gstRate"
            control={control}
            rules={{
              required: 'GST Rate is required',
              min: { value: 0, message: 'GST Rate cannot be negative' },
              max: { value: 100, message: 'GST Rate cannot exceed 100' }
            }}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                fullWidth
                label="GST Rate (%)"
                error={!!errors.gstRate}
                helperText={errors.gstRate?.message}
                InputProps={{ inputProps: { min: 0, max: 100, step: '0.1' } }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="expiryDate"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="date"
                fullWidth
                label="Expiry Date"
                InputLabelProps={{ shrink: true }}
                error={!!errors.expiryDate}
                helperText={errors.expiryDate?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="barcode"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Barcode / QR"
                error={!!errors.barcode}
                helperText={errors.barcode?.message}
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 1 }}>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={isSubmitting}
              size="large"
            >
              {initialValues ? 'Update Product' : 'Add Product'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
