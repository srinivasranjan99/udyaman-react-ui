import React from 'react';
import { 
  TextField, MenuItem, Autocomplete, 
  CircularProgress, Box, Typography 
} from '@mui/material';
import { Controller } from 'react-hook-form';
import AsyncSelect from '../common/AsyncSelect';

const FIELD_STYLE = {
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: '#999' }, // High contrast border
    '&:hover fieldset': { borderColor: '#555' },
    '&.Mui-focused fieldset': { borderColor: '#1976d2', borderWidth: '2px' },
  },
  '& .MuiInputLabel-root': { color: '#333', fontWeight: 600 }, // Dark labels
  '& .MuiInputLabel-root.Mui-focused': { color: '#1976d2' }
};

/**
 * TextInput: High-contrast standard text input.
 */
export const TextInput = ({ name, control, label, required, rules = {}, ...props }) => (
  <Controller
    name={name}
    control={control}
    rules={{ required: required ? `${label} is required` : false, ...rules }}
    render={({ field, fieldState: { error } }) => (
      <TextField
        {...field}
        {...props}
        label={label}
        required={required}
        error={!!error}
        helperText={error?.message}
        fullWidth
        variant="outlined"
        margin="none" // Grid handles spacing
        sx={FIELD_STYLE}
        InputLabelProps={{ shrink: true }}
      />
    )}
  />
);

/**
 * NumberInput: High-contrast numeric input.
 */
export const NumberInput = ({ name, control, label, required, min, max, ...props }) => (
  <Controller
    name={name}
    control={control}
    rules={{ 
      required: required ? `${label} is required` : false,
      min: min !== undefined ? { value: min, message: `Minimum value is ${min}` } : undefined,
      max: max !== undefined ? { value: max, message: `Maximum value is ${max}` } : undefined
    }}
    render={({ field, fieldState: { error } }) => (
      <TextField
        {...field}
        onChange={(e) => {
          const val = e.target.value;
          field.onChange(val === '' ? '' : Number(val));
        }}
        {...props}
        type="number"
        label={label}
        required={required}
        error={!!error}
        helperText={error?.message}
        fullWidth
        variant="outlined"
        margin="none" // Grid handles spacing
        sx={FIELD_STYLE}
        InputLabelProps={{ shrink: true }}
      />
    )}
  />
);

/**
 * SelectInput: Searchable dropdown via Autocomplete.
 */
export const SelectInput = ({ name, control, label, options = [], required, ...props }) => (
  <Controller
    name={name}
    control={control}
    rules={{ required: required ? `${label} is required` : false }}
    render={({ field: { onChange, value }, fieldState: { error } }) => (
      <Autocomplete
        options={options}
        fullWidth
        autoHighlight
        getOptionLabel={(option) => option.label || ''}
        isOptionEqualToValue={(option, val) => option.value === val}
        value={options.find(opt => opt.value === value) || null}
        onChange={(_, newValue) => onChange(newValue?.value)}
        sx={{ ...FIELD_STYLE, minWidth: 280 }}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            required={required}
            error={!!error}
            helperText={error?.message}
            fullWidth
            margin="none"
            InputLabelProps={{ shrink: true }}
          />
        )}
        {...props}
      />
    )}
  />
);

/**
 * DateInput: High-contrast date picker.
 */
export const DateInput = ({ name, control, label, required, ...props }) => (
  <Controller
    name={name}
    control={control}
    rules={{ required: required ? `${label} is required` : false }}
    render={({ field, fieldState: { error } }) => (
      <TextField
        {...field}
        {...props}
        type="date"
        label={label}
        required={required}
        error={!!error}
        helperText={error?.message}
        fullWidth
        variant="outlined"
        margin="none"
        sx={FIELD_STYLE}
        InputLabelProps={{ shrink: true }}
      />
    )}
  />
);

/**
 * AutocompleteInput: Standard searchable dropdown with enhanced menu visibility.
 */
export const AutocompleteInput = ({ name, control, label, options = [], loading, required, ...props }) => (
  <Controller
    name={name}
    control={control}
    rules={{ required: required ? `${label} is required` : false }}
    render={({ field: { onChange, value }, fieldState: { error } }) => (
      <Autocomplete
        options={options}
        fullWidth
        autoHighlight
        getOptionLabel={(option) => option.label || ''}
        isOptionEqualToValue={(option, val) => option.value === val}
        value={options.find(opt => opt.value === value) || null}
        onChange={(_, newValue) => onChange(newValue?.value)}
        loading={loading}
        sx={{ ...FIELD_STYLE, minWidth: 280 }}
        renderOption={(props, option) => (
          <Box component="li" {...props} sx={{ typography: 'body2', py: 1 }}>
            {option.label}
          </Box>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            required={required}
            error={!!error}
            helperText={error?.message}
            fullWidth
            margin="none"
            InputLabelProps={{ shrink: true }}
            InputProps={{
              ...(params.InputProps || {}),
              endAdornment: (
                <React.Fragment>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps?.endAdornment}
                </React.Fragment>
              ),
            }}
          />
        )}
        {...props}
      />
    )}
  />
);

/**
 * AsyncAutocompleteInput: Searchable dropdown that fetches data from an API.
 */
export const AsyncAutocompleteInput = ({ 
  name, 
  control, 
  label, 
  endpoint, 
  required, 
  onOptionSelect, 
  getOptionLabel,
  getOptionSecondary,
  ...props 
}) => (
  <Controller
    name={name}
    control={control}
    rules={{ required: required ? `${label} is required` : false }}
    render={({ field: { onChange, value }, fieldState: { error } }) => (
      <AsyncSelect
        endpoint={endpoint}
        label={label}
        value={value}
        onChange={(newValue) => {
          // Store full object for UI display and auto-fill
          onChange(newValue || null);
          if (onOptionSelect) onOptionSelect(newValue);
        }}
        // Requirement: label = name + code
        getOptionLabel={getOptionLabel || ((opt) => opt ? `${opt.name} (${opt.code || opt.sku || ''})` : '')}
        getOptionSecondary={getOptionSecondary}
        required={required}
        error={!!error}
        helperText={error?.message}
        {...props}
      />
    )}
  />
);
