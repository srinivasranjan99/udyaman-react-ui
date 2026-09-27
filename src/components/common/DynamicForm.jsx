import React, { useState, useEffect, useMemo } from 'react';
import { 
  TextField, 
  Switch, 
  MenuItem, 
  Grid, 
  Button, 
  Box, 
  Typography,
  Paper,
  Divider,
  Tooltip,
  IconButton
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

/**
 * DynamicForm: A high-performance, metadata-driven form engine.
 */
const DynamicForm = ({ 
  config = [], 
  initialData = {}, 
  onSubmit, 
  submitLabel = "Save Changes",
  nestedAttributes = true
}) => {
  // Initialize form state safely
  const [formData, setFormData] = useState(() => {
    const initial = {};
    // Safely merge initial data if it exists
    const merged = initialData ? { ...initialData } : {};
    
    // Support both customFields and customAttributes keys from backend
    const custom = initialData?.customFields || initialData?.customAttributes || {};
    Object.assign(merged, custom);
    
    if (Array.isArray(config)) {
      config.forEach(field => {
        if (field.type === 'header') return;
        const key = field.fieldName || field.name;
        if (key) {
          initial[key] = merged[key] !== undefined ? merged[key] : (field.defaultValue || '');
        }
      });
    }
    return initial;
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Sync state if initialData changes externally (e.g. after a save or load)
  useEffect(() => {
    if (initialData && typeof initialData === 'object') {
      const merged = { ...initialData };
      const custom = initialData.customFields || initialData.customAttributes || {};
      Object.assign(merged, custom);
      setFormData(prev => ({ ...prev, ...merged }));
    }
  }, [initialData]);

  const isFieldVisible = (field) => {
    if (!field.dependsOn) return true;
    const dependencyValue = String(formData[field.dependsOn] || '');
    return dependencyValue === String(field.showIf || 'true');
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const validate = () => {
    const newErrors = {};
    config.forEach(field => {
      if (field.type === 'header' || !isFieldVisible(field)) return;
      const key = field.fieldName || field.name;
      const value = formData[key];
      const isMandatory = field.required || field.isMandatory;
      const label = field.label || field.displayLabel;

      if (isMandatory && (value === '' || value === null || value === undefined)) {
        newErrors[key] = `${label} is required`;
      }
    });
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Mark all visible fields as touched to show errors
      const allTouched = {};
      config.forEach(f => { if(f.fieldName) allTouched[f.fieldName] = true; });
      setTouched(allTouched);
      return;
    }

    if (nestedAttributes) {
      // Re-bundle custom fields into customFields for the backend
      const systemFields = ['name', 'sku', 'price', 'costPrice', 'gstRate', 'hsnCode', 'categoryId', 'stockQuantity', 'unit', 'reorderLevel', 'maxStockLevel', 'isActive', 'description', 'id', 'brand', 'manufacturer', 'preferredSupplierId', 'minStock', 'maxStock', 'isBatchTracked', 'isExpiryTracked', 'shelfLife', 'shelfLifeUnit', 'mrp', 'wholesalePrice', 'purchasePrice'];
      const payload = {};
      const customFields = {};
      
      Object.keys(formData).forEach(key => {
        if (systemFields.includes(key)) {
          payload[key] = formData[key];
        } else if (key !== 'customFields' && key !== 'customAttributes') {
          // Preserve types for custom fields (Numbers should stay numbers)
          const val = formData[key];
          payload.customFields[key] = (typeof val === 'string' && val.trim() === '') ? null : val;
        }
      });
      onSubmit(payload);
    } else {
      onSubmit(formData);
    }
  };

  const sections = useMemo(() => {
    if (!Array.isArray(config)) return [];
    const result = [];
    let currentSection = { label: 'General Information', fields: [], icon: null };

    config.forEach(field => {
      if (!field) return;
      if (field.type === 'header') {
        if (currentSection.fields.length > 0) result.push(currentSection);
        currentSection = { label: field.label, fields: [], icon: field.icon };
      } else if (isFieldVisible(field)) {
        currentSection.fields.push(field);
      }
    });
    if (currentSection.fields.length > 0) result.push(currentSection);
    return result;
  }, [config, formData]);

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {sections.length === 0 ? (
        <Box sx={{ p: 4, textAlign: 'center' }}><Typography color="textSecondary">No configuration available.</Typography></Box>
      ) : (
        sections.map((section, sIdx) => (
          <Box key={sIdx} sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              {section.icon && <Box sx={{ color: 'primary.main', display: 'flex' }}>{section.icon}</Box>}
              <Typography variant="h6" fontWeight="bold">{section.label}</Typography>
            </Box>
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 'none', border: '1px solid #e0e0e0' }}>
              <Grid container spacing={3}>
                {section.fields.map((field, fIdx) => (
                  <Grid item xs={12} sm={field.width || 6} key={field.fieldName || fIdx}>
                    <FieldRenderer 
                      field={field} 
                      formData={formData} 
                      errors={errors} 
                      touched={touched} 
                      onChange={handleChange}
                    />
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Box>
        ))
      )}
      
      <Box sx={{ mt: 6, display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          type="submit" 
          variant="contained" 
          size="large" 
          sx={{ py: 1.5, px: 8, borderRadius: 2, fontWeight: 'bold' }}
        >
          {submitLabel}
        </Button>
      </Box>
    </Box>
  );
};

/**
 * FieldRenderer: Extracted to top-level to prevent remounting and focus loss on keystrokes.
 */
const FieldRenderer = ({ field, formData, errors, touched, onChange }) => {
  const key = field.fieldName || field.name;
  const value = formData[key] !== undefined ? formData[key] : '';
  const error = touched[key] && errors[key];
  const label = field.displayLabel || field.label;

  const commonProps = {
    fullWidth: true,
    label: label,
    value: value,
    onChange: (e) => onChange(key, e.target.type === 'checkbox' ? e.target.checked : e.target.value),
    error: !!error,
    helperText: error || field.helpText,
    variant: "outlined",
    size: "medium",
    disabled: field.readOnly
  };

  switch (field.type?.toLowerCase()) {
    case 'dropdown':
    case 'select':
      return (
        <TextField {...commonProps} select>
          {(field.options || []).map(opt => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const lab = typeof opt === 'object' ? opt.label : opt;
            return <MenuItem key={val} value={val}>{lab}</MenuItem>;
          })}
        </TextField>
      );
    case 'boolean':
    case 'switch':
    case 'toggle':
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: '#fcfcfc' }}>
          <Typography variant="body2" color="textPrimary" fontWeight="medium">{label}</Typography>
          <Switch 
            checked={!!value} 
            onChange={(e) => onChange(key, e.target.checked)}
            color="primary"
          />
        </Box>
      );
    case 'number':
      return <TextField {...commonProps} type="number" inputProps={{ step: "any" }} />;
    case 'date':
      return <TextField {...commonProps} type="date" InputLabelProps={{ shrink: true }} />;
    case 'textarea':
      return <TextField {...commonProps} multiline rows={3} />;
    default:
      return <TextField {...commonProps} />;
  }
};

export default DynamicForm;
