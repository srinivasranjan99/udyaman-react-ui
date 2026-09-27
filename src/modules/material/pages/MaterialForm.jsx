import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, Paper } from '@mui/material';
import api from '../../../api/axios';
import DynamicForm from '../../../components/forms/DynamicForm.jsx';

import {
  Inventory as InventoryIcon,
  Payments as PaymentsIcon,
  LocalShipping as LocalShippingIcon,
  SettingsSuggest as SettingsSuggestIcon,
  Info as InfoIcon,
  History as HistoryIcon
} from '@mui/icons-material';

/**
 * MaterialForm: Orchestrates the dynamic creation and editing of Material Master records.
 * Fetches form blueprint from the Configuration Engine and renders a responsive UI.
 */
const MaterialForm = ({ initialData, onSave }) => {
  const [fieldConfigs, setFieldConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    setLoading(true);
    try {
      // 1. Fetch reference data and field configuration with graceful failover
      const fetchSafe = async (endpoint, fallback = []) => {
        try {
          const res = await api.get(endpoint);
          const raw = res.data?.data || res.data;
          // Extract array from Page object or direct array
          return raw?.content || (Array.isArray(raw) ? raw : fallback);
        } catch (e) {
          console.warn(`Soft fail on ${endpoint}:`, e.message);
          return fallback;
        }
      };

      const [categories, suppliers, backendUnits, warehouses, rawConfigs] = await Promise.all([
        fetchSafe('/inventory/categories'),
        fetchSafe('/suppliers'),
        fetchSafe('/master/units'),
        fetchSafe('/inventory/warehouses'),
        fetchSafe('/config/fields/MATERIAL')
      ]);
      
      const units = Array.isArray(backendUnits) && backendUnits.length > 0 ? backendUnits : [
        { code: 'PCS', name: 'Pieces' }, { code: 'KGS', name: 'Kilograms' },
        { code: 'NOS', name: 'Numbers' }, { code: 'MTR', name: 'Metres' }
      ];

      const getCategoryPath = (cat, all) => {
        if (!cat || !cat.name) return 'Unknown';
        if (!cat.parentName) return cat.name;
        const parent = Array.isArray(all) ? all.find(p => p.id === cat.parentId) : null;
        if (!parent) return cat.name;
        return `${getCategoryPath(parent, all)} > ${cat.name}`;
      };

      // 1. Architect 3-Section Strategy
      const sections = [
        // SECTION 1: Basic Info
        { type: 'header', label: 'Section 1: Basic Information', icon: <InfoIcon />, displayOrder: 10 },
        { name: 'name', label: 'Material Name', type: 'text', required: true, md: 12, displayOrder: 11 },
        { name: 'sku', label: 'SKU / Item Code', type: 'text', required: true, md: 6, displayOrder: 12 },
        { name: 'brand', label: 'Brand', type: 'text', md: 6, displayOrder: 13 },
        { name: 'categoryId', label: 'Category', type: 'select', md: 12, displayOrder: 14, options: categories.map(c => ({ value: c.id, label: getCategoryPath(c, categories) })) },
        { name: 'materialType', label: 'Material Type', type: 'select', md: 6, displayOrder: 15, options: [
            { value: 'RAW_MATERIAL', label: 'Raw Material' },
            { value: 'FINISHED_GOOD', label: 'Finished Good' },
            { value: 'SEMI_FINISHED', label: 'Semi-Finished' },
            { value: 'CONSUMABLE', label: 'Consumable' }
        ]},
        { name: 'unit', label: 'Base Unit', type: 'select', required: true, md: 6, displayOrder: 16, options: units.map(u => ({ value: u.code, label: `${u.name || u.code} (${u.code})` })) },

        // SECTION 2: Pricing
        { type: 'header', label: 'Section 2: Pricing & Tax', icon: <PaymentsIcon />, displayOrder: 20 },
        { name: 'price', label: 'MRP (Standard Sales Price)', type: 'number', required: true, md: 6, displayOrder: 21 },
        { name: 'costPrice', label: 'Cost Price', type: 'number', md: 6, displayOrder: 22 },
        { name: 'wholesalePrice', label: 'Wholesale Price', type: 'number', md: 6, displayOrder: 23 },
        { name: 'gstRate', label: 'GST Percentage', type: 'select', required: true, md: 6, displayOrder: 24, options: [0, 5, 12, 18, 28].map(r => ({ value: r, label: `${r}%` })) },
        { name: 'hsnCode', label: 'HSN / SAC Code', type: 'text', md: 6, displayOrder: 25 },
        
        // SECTION 3: Inventory Settings
        { type: 'header', label: 'Section 3: Inventory Controls', icon: <InventoryIcon />, displayOrder: 30 },
        { name: 'defaultWarehouseId', label: 'Default Warehouse', type: 'select', md: 6, displayOrder: 31, options: warehouses.map(w => ({ value: w.id, label: w.name })) },
        { name: 'reorderLevel', label: 'Reorder Point (Min Stock)', type: 'number', md: 3, displayOrder: 32 },
        { name: 'maxStockLevel', label: 'Max Stock Capacity', type: 'number', md: 3, displayOrder: 33 },
        
        { type: 'header', label: 'Section 4: Technical & Logistics', icon: <LocalShippingIcon />, displayOrder: 40 },
        { name: 'barcode', label: 'Barcode', type: 'text', md: 6, displayOrder: 41 },
        { name: 'preferredSupplierId', label: 'Preferred Supplier', type: 'select', md: 6, displayOrder: 42, options: suppliers.map(s => ({ value: s.id, label: s.name })) },
        { name: 'isBatchTracked', label: 'Batch Tracking', type: 'select', md: 6, displayOrder: 43, options: [{value: true, label: 'Yes'}, {value: false, label: 'No'}] },
        { name: 'isExpiryTracked', label: 'Expiry Tracking', type: 'select', md: 6, displayOrder: 44, options: [{value: true, label: 'Yes'}, {value: false, label: 'No'}] }
      ];

      // 2. Dynamic Custom Attributes
      const customFields = rawConfigs
        .filter(f => f && f.isVisible && !sections.find(sf => sf.name === f.fieldName))
        .map(f => ({
          name: f.fieldName,
          label: f.displayLabel,
          type: (f.fieldType || 'TEXT').toLowerCase(),
          required: !!f.isMandatory,
          md: 6,
          displayOrder: 1000 + (f.displayOrder || 0)
        }));

      const finalLayout = [...sections, ...customFields]
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

      setFieldConfigs(finalLayout);
      setError(null);
    } catch (err) {
      console.error("Critical: Failed to load material form configuration", err);
      setError("Unable to initialize form. Please verify backend connectivity.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (payload) => {
    try {
      // 1. Sanitize and Transform Payload for Backend DTO compatibility
      const sanitized = { ...payload };
      
      // Ensure numeric fields are numbers, and provide safety defaults for mandatory fields
      const numericFields = ['price', 'costPrice', 'gstRate', 'reorderLevel', 'maxStockLevel'];
      numericFields.forEach(field => {
        if (sanitized[field] !== undefined && sanitized[field] !== '' && sanitized[field] !== null) {
          sanitized[field] = Number(sanitized[field]);
        } else if (sanitized[field] === '' || sanitized[field] === null || sanitized[field] === undefined) {
          // Safety defaults for NotNull backend fields
          if (field === 'price') sanitized[field] = 0;
          else if (field === 'gstRate') sanitized[field] = 0;
          else sanitized[field] = null;
        }
      });

      // Handle category and supplier IDs
      if (sanitized.categoryId === '') sanitized.categoryId = null;
      if (sanitized.preferredSupplierId === '') sanitized.preferredSupplierId = null;

      const endpoint = initialData?.id ? `/inventory/products/${initialData.id}` : '/inventory/products';
      const method = initialData?.id ? 'put' : 'post';
      const response = await api[method](endpoint, sanitized);
      onSave(response.data.data || response.data);
    } catch (err) {
      console.error("Persistence failed", err);
      // Map backend validation errors if possible
      const message = err.response?.data?.message || err.message;
      alert("Validation Failed: " + message);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 8, gap: 2 }}>
        <CircularProgress size={60} thickness={4} sx={{ color: 'primary.main' }} />
        <Typography variant="overline" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
          Architecting Form...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
      
      <DynamicForm 
        config={fieldConfigs} 
        initialData={initialData} 
        onSubmit={handleSave}
        sections={true}
        nestedAttributes={true}
      />
    </Box>
  );
};

export default MaterialForm;
