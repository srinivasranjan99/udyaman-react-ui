import React from 'react';
import { useForm } from 'react-hook-form';
import { Box, Button, Grid, CircularProgress } from '@mui/material';
import { 
  TextInput, 
  NumberInput, 
  SelectInput, 
  DateInput, 
  AutocompleteInput,
  AsyncAutocompleteInput
} from './UdyamanFormFields';
import { Typography, Paper, Divider } from '@mui/material';

const DynamicForm = ({ 
  config, 
  initialData = {}, 
  onSubmit, 
  loading = false, 
  externalErrors = {}, 
  sections = false,
  nestedAttributes = false 
}) => {
  // Pre-process default values from initialData (including nested custom fields)
  // Pre-process default values from initialData (including nested custom fields)
  const defaultValues = React.useMemo(() => {
    if (!initialData || Object.keys(initialData).length === 0) return {};
    const values = { ...initialData };
    const custom = initialData?.customFields || initialData?.customAttributes || {};
    Object.assign(values, custom);
    return values;
  }, [initialData]);

  const { control, handleSubmit, setError, reset, formState: { errors } } = useForm({
    defaultValues,
    mode: 'onBlur',
    shouldFocusError: true
  });

  // Sync form when initialData changes (only if initialData has values to prevent clearing manual input)
  React.useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      reset(defaultValues);
    }
  }, [initialData, defaultValues, reset]);

  // Effect to map backend/external errors to fields
  React.useEffect(() => {
    if (externalErrors && Object.keys(externalErrors).length > 0) {
      Object.entries(externalErrors).forEach(([field, message]) => {
        setError(field, { type: 'manual', message });
      });
    }
  }, [externalErrors, setError]);

  const handleFormSubmit = (data) => {
    if (nestedAttributes) {
      // Separate system fields from custom fields for backend DTOs
      const systemFields = [
        'id', 'name', 'sku', 'code', 'address', 'price', 'costPrice', 'wholesalePrice', 
        'gstRate', 'categoryId', 'stockQuantity', 'unit', 'isActive', 'hsnCode', 
        'taxCategory', 'barcode', 'qrCode', 'materialType', 'productionAllowed', 
        'bomApplicable', 'reorderLevel', 'maxStockLevel', 'brand', 'manufacturer', 
        'shelfLife', 'shelfLifeUnit', 'isBatchTracked', 'isExpiryTracked', 
        'preferredSupplierId'
      ];
      const payload = {};
      const customFields = {};
      
      Object.entries(data).forEach(([key, val]) => {
        if (systemFields.includes(key)) {
          payload[key] = val;
        } else {
          customFields[key] = val;
        }
      });
      payload.customFields = customFields;
      onSubmit(payload);
    } else {
      onSubmit(data);
    }
  };

  const renderField = (field) => {
    const { type, name, field: fieldKey, label, required, icon, ...rest } = field;
    
    if (type === 'header') {
      return (
        <Box sx={{ mt: 4, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: '2px solid #eef2f6', pb: 1 }}>
          {icon && <Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>}
          <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 800, color: '#1a2027', letterSpacing: '0.02em' }}>
            {label}
          </Typography>
        </Box>
      );
    }

    const finalName = fieldKey || name;
    const commonProps = { key: finalName, name: finalName, control, label, required, ...rest };

    switch (type) {
      case 'text': return <TextInput {...commonProps} />;
      case 'number': return <NumberInput {...commonProps} />;
      case 'select': return <SelectInput {...commonProps} />;
      case 'date': return <DateInput {...commonProps} />;
      case 'autocomplete': return <AutocompleteInput {...commonProps} />;
      case 'async-autocomplete': return <AsyncAutocompleteInput {...commonProps} />;
      default: return null;
    }
  };

  const renderContent = () => {
    // Group fields into sections based on 'header' type
    const groupedSections = [];
    let currentSection = { label: 'General Information', fields: [] };

    config.forEach((field) => {
      if (field.type === 'header') {
        if (currentSection.fields.length > 0) groupedSections.push(currentSection);
        currentSection = { ...field, fields: [] };
      } else {
        currentSection.fields.push(field);
      }
    });
    if (currentSection.fields.length > 0) groupedSections.push(currentSection);

    return groupedSections.map((section, sIdx) => (
      <Paper 
        key={sIdx} 
        elevation={0} 
        sx={{ 
          p: 4, 
          mb: 4, 
          borderRadius: 4, 
          border: '1px solid #e0e6ed',
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, borderBottom: '1px solid #f1f5f9', pb: 2 }}>
          {section.icon && <Box sx={{ color: 'primary.main', display: 'flex', fontSize: '1.5rem' }}>{section.icon}</Box>}
          <Typography variant="h6" sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>
            {section.label}
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {section.fields.map((field, fIdx) => (
            <Grid item xs={12} md={field.md || 6} key={field.name || fIdx}>
              {renderField(field)}
            </Grid>
          ))}
        </Grid>
      </Paper>
    ));
  };

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      {renderContent()}
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{ minWidth: 150, borderRadius: 2, py: 1.2, fontWeight: 'bold' }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
        </Button>
      </Box>
    </Box>
  );
};

export default DynamicForm;
