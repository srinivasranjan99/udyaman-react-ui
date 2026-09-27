import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  Inventory as InventoryIcon,
  Description as InvoiceIcon,
  Business as SupplierIcon,
  Keyboard as KeyboardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

/**
 * GlobalSearch: A command-palette style search interface for the ERP.
 * Triggered by Ctrl+K. Searches across Materials, Invoices, and Suppliers.
 */
const GlobalSearch = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ materials: [], invoices: [], suppliers: [] });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounced search logic
  useEffect(() => {
    if (!query.trim()) {
      setResults({ materials: [], invoices: [], suppliers: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [matRes, suppRes] = await Promise.all([
          api.get('/inventory/products', { params: { search: query, size: 5 } }),
          api.get('/suppliers', { params: { search: query, size: 5 } })
        ]);

        setResults({
          materials: matRes.data.data.content || [],
          suppliers: suppRes.data.data || [],
          invoices: [] // Placeholder until real invoice API is integrated
        });
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (path) => {
    setOpen(false);
    setQuery('');
    navigate(path);
  };

  return (
    <Dialog 
      open={open} 
      onClose={() => setOpen(false)} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 4, 
          position: 'fixed', 
          top: '10%',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
        }
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <TextField
            autoFocus
            fullWidth
            placeholder="Search materials, invoices, suppliers... (Ctrl+K)"
            variant="standard"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{
              disableUnderline: true,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: loading && <CircularProgress size={20} color="inherit" sx={{ opacity: 0.5 }} />
            }}
            sx={{ fontSize: '1.2rem' }}
          />
        </Box>

        <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
          {query.trim() && !loading && Object.values(results).every(r => r.length === 0) && (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">No results found for "{query}"</Typography>
            </Box>
          )}

          {/* Materials Section */}
          {results.materials.length > 0 && (
            <SearchSection 
              title="MATERIALS" 
              items={results.materials} 
              icon={InventoryIcon}
              onSelect={(item) => handleSelect(`/inventory/summary`)} // Could be specific details page
              labelKey="name"
            />
          )}

          {/* Suppliers Section */}
          {results.suppliers.length > 0 && (
            <SearchSection 
              title="SUPPLIERS" 
              items={results.suppliers} 
              icon={SupplierIcon}
              onSelect={(item) => handleSelect(`/procurement/vendors`)}
              labelKey="name"
            />
          )}

          {/* Fast Navigation Hints */}
          {!query.trim() && (
            <Box sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold', mb: 1, display: 'block' }}>
                QUICK ACCESS
              </Typography>
              <List dense>
                <ListItemButton onClick={() => handleSelect('/dashboard')} sx={{ borderRadius: 2 }}>
                  <ListItemIcon><KeyboardIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Go to Dashboard" />
                  <Chip label="G+D" size="small" variant="outlined" sx={{ fontSize: '0.6rem' }} />
                </ListItemButton>
                <ListItemButton onClick={() => handleSelect('/inventory/warehouses')} sx={{ borderRadius: 2 }}>
                  <ListItemIcon><KeyboardIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Manage Warehouses" />
                  <Chip label="G+W" size="small" variant="outlined" sx={{ fontSize: '0.6rem' }} />
                </ListItemButton>
              </List>
            </Box>
          )}
        </Box>

        <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary">
            Use ↑↓ to navigate, Enter to select
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
             <Chip label="ESC" size="small" sx={{ fontSize: '0.6rem', height: 18 }} />
             <Typography variant="caption" color="text.secondary">to close</Typography>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

const SearchSection = ({ title, items, icon: Icon, onSelect, labelKey }) => (
  <Box sx={{ py: 1 }}>
    <Typography variant="caption" sx={{ px: 2, py: 1, fontWeight: 'bold', color: 'primary.main', letterSpacing: 1 }}>
      {title}
    </Typography>
    <List dense>
      {items.map((item) => (
        <ListItemButton key={item.id} onClick={() => onSelect(item)} sx={{ px: 2 }}>
          <ListItemIcon sx={{ minWidth: 36 }}><Icon fontSize="small" color="action" /></ListItemIcon>
          <ListItemText 
            primary={item[labelKey]} 
            secondary={item.code || item.contactPerson}
            primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }}
          />
        </ListItemButton>
      ))}
    </List>
    <Divider />
  </Box>
);

export default GlobalSearch;
