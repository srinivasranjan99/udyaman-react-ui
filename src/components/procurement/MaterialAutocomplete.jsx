import React, { useState, useEffect, useCallback } from 'react';
import { 
  Autocomplete, 
  TextField, 
  CircularProgress, 
  Box, 
  Typography 
} from '@mui/material';
import api from '../../api/axios';

/**
 * MaterialAutocomplete: Enterprise-grade searchable dropdown for Materials.
 * Features: Debounced API calls, custom label formatting, and auto-population.
 */
const MaterialAutocomplete = ({ 
  value, 
  onChange, 
  onSelect, 
  label = "Select Material",
  required = false,
  error = false,
  helperText = ""
}) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // Search logic with 300ms debounce
  const fetchMaterials = useCallback(
    async (searchQuery) => {
      setLoading(true);
      try {
        const response = await api.get('/materials/search', {
          params: { q: searchQuery, size: 20 }
        });
        // API returns a flat list as per requirements
        setOptions(response.data || []);
      } catch (err) {
        console.error("Material search failed", err);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    let active = true;

    if (inputValue === '' && !open) {
      return undefined;
    }

    const timer = setTimeout(() => {
      if (active) fetchMaterials(inputValue);
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [inputValue, open, fetchMaterials]);

  return (
    <Autocomplete
      id="material-search-autocomplete"
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      isOptionEqualToValue={(option, val) => option.id === val?.id}
      getOptionLabel={(option) => {
        if (typeof option === 'string') return option;
        // Requirement: "Paracetamol 500mg (PCM500)"
        return `${option.name} (${option.code})`;
      }}
      options={options}
      loading={loading}
      value={value || null}
      onChange={(_, newValue) => {
        onChange(newValue?.id || null);
        if (onSelect) onSelect(newValue);
      }}
      onInputChange={(_, newInputValue) => {
        setInputValue(newInputValue);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          required={required}
          error={error}
          helperText={helperText}
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <React.Fragment>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </React.Fragment>
              ),
            },
          }}
        />
      )}
      renderOption={(props, option) => (
        <Box component="li" {...props} key={option.id}>
          <Box>
            <Typography variant="body1">{option.name}</Typography>
            <Typography variant="caption" color="textSecondary">
              Code: {option.code} | Unit: {option.unit} | Price: ₹{option.purchasePrice}
            </Typography>
          </Box>
        </Box>
      )}
    />
  );
};

export default MaterialAutocomplete;
