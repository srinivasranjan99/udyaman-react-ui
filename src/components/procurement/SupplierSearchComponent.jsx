import React, { useState, useCallback } from 'react';
import { 
  Box, TextField, InputAdornment, List, ListItem, 
  ListItemText, Paper, CircularProgress, Typography, Chip,
  Fade, Popper, ClickAwayListener
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon 
} from '@mui/icons-material';
import api from '../../api/axios';

/**
 * SupplierSearchComponent: High-performance search component for vendors.
 * Supports searching by Name, Phone, and GST Number.
 */
const SupplierSearchComponent = ({ onSelect, placeholder = "Search by Name, Phone or GST..." }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  // Debounced API call simulation/logic
  const searchSuppliers = useCallback(
    async (searchQuery) => {
      if (searchQuery.length < 2) {
        setResults([]);
        return;
      }
      
      setLoading(true);
      try {
        const response = await api.get('/suppliers', {
          params: { search: searchQuery, size: 10 }
        });
        // Handle paginated response
        const data = response.data.data;
        setResults(data.content || []);
      } catch (err) {
        console.error("Supplier search failed", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setAnchorEl(e.currentTarget);
    
    // Simple debounce
    const timer = setTimeout(() => searchSuppliers(val), 300);
    return () => clearTimeout(timer);
  };

  const handleSelect = (supplier) => {
    onSelect(supplier);
    setQuery('');
    setResults([]);
    setAnchorEl(null);
  };

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
        <Box>
          <TextField
            fullWidth
            variant="outlined"
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            autoComplete="off"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="primary" />
                </InputAdornment>
              ),
              endAdornment: loading && (
                <InputAdornment position="end">
                  <CircularProgress size={20} />
                </InputAdornment>
              ),
              sx: { borderRadius: 3, bgcolor: '#fff' }
            }}
          />

          <Popper 
            open={Boolean(anchorEl) && (results.length > 0 || (loading && query.length > 1))} 
            anchorEl={anchorEl} 
            placement="bottom-start" 
            transition
            style={{ width: anchorEl?.clientWidth, zIndex: 1300 }}
          >
            {({ TransitionProps }) => (
              <Fade {...TransitionProps} timeout={200}>
                <Paper elevation={8} sx={{ mt: 1, borderRadius: 3, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
                  <List sx={{ py: 0, maxHeight: 400, overflow: 'auto' }}>
                    {results.map((supplier) => (
                      <ListItem 
                        key={supplier.id} 
                        button 
                        onClick={() => handleSelect(supplier)}
                        sx={{ 
                          borderBottom: '1px solid #f0f0f0',
                          '&:hover': { bgcolor: '#f0f7ff' },
                          py: 1.5
                        }}
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body1" fontWeight="bold">{supplier.name}</Typography>
                              <Chip label={supplier.supplierCode} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: 0.5, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary">{supplier.phone}</Typography>
                              </Box>
                              {supplier.gstNumber && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <BadgeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                  <Typography variant="caption" color="text.secondary">GST: {supplier.gstNumber}</Typography>
                                </Box>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                    {!loading && results.length === 0 && query.length > 1 && (
                      <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="body2" color="textSecondary">No suppliers found matching "{query}"</Typography>
                      </Box>
                    )}
                  </List>
                </Paper>
              </Fade>
            )}
          </Popper>
        </Box>
      </ClickAwayListener>
    </Box>
  );
};

export default SupplierSearchComponent;
