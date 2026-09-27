import React, { useState, useEffect, useMemo } from 'react';
import { 
  Autocomplete, TextField, CircularProgress, 
  Box, Typography 
} from '@mui/material';
import api from '../../api/axios';

/**
 * AsyncSelect: Optimized searchable dropdown for ERP modules.
 */
const AsyncSelect = ({ 
  endpoint, 
  label, 
  placeholder, 
  value, 
  onChange, 
  error, 
  helperText,
  getOptionLabel,
  required = false,
  queryParam = 'q',
  ...props 
}) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // Search Logic with standard useEffect debounce
  useEffect(() => {
    let active = true;
    
    if (!open) return;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await api.get(endpoint, {
          params: { [queryParam]: inputValue }
        });
        
        if (active) {
          const rawData = response.data;
          const results = Array.isArray(rawData) ? rawData : (rawData?.data?.content || rawData?.data || []);
          setOptions(results);
        }
      } catch (err) {
        console.error("AsyncSelect fetch failed", err);
        if (active) setOptions([]);
      } finally {
        if (active) setLoading(false);
      }
    }, 400);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [inputValue, open, endpoint, queryParam]);

  // Destructure props to avoid passing non-standard props to Autocomplete/DOM
  const { freeSolo, forcePopupIcon, ...autocompleteProps } = props;

  return (
    <Autocomplete
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      inputValue={inputValue}
      onInputChange={(_, val) => setInputValue(val)}
      value={options.find(opt => opt.id === (value?.id || value)) || value || null}
      onChange={(_, newValue) => {
        onChange(newValue);
      }}
      options={options}
      loading={loading}
      fullWidth
      forcePopupIcon={forcePopupIcon !== undefined ? forcePopupIcon : true}
      freeSolo={freeSolo}
      getOptionLabel={(option) => {
        if (typeof option === 'string') return option;
        if (getOptionLabel) return getOptionLabel(option);
        return option.name || option.label || '';
      }}
      isOptionEqualToValue={(option, val) => {
        if (!val) return false;
        const valId = val?.id || val;
        return option.id === valId;
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          required={required}
          error={!!error}
          helperText={helperText}
          InputLabelProps={{ 
            ...params.InputLabelProps,
            shrink: true 
          }}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps?.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
      {...autocompleteProps}
    />
  );
};

export default AsyncSelect;
