import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  IconButton,
  Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InventoryList from '../features/inventory/InventoryList.jsx';
import ProductForm from '../features/inventory/ProductForm.jsx';

export default function InventoryPage() {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleOpenAdd = () => {
    setSelectedProduct(null);
    setOpenDialog(true);
  };

  const handleOpenEdit = (product) => {
    setSelectedProduct(product);
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setSelectedProduct(null);
  };

  const handleSave = (savedProduct) => {
    handleClose();
    setRefreshTrigger(prev => prev + 1);
    // You could also show a snackbar notification here
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          📦 Inventory Management
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Centralized product master, stock tracking, and batch management.
        </Typography>
      </Box>

      <InventoryList 
        key={refreshTrigger}
        onAddClick={handleOpenAdd} 
        onEditClick={handleOpenEdit} 
      />

      <Dialog 
        open={openDialog} 
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="bold">
            {selectedProduct ? 'Update Product Details' : 'Onboard New Product'}
          </Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <ProductForm 
            initialData={selectedProduct} 
            onSave={handleSave} 
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
}
