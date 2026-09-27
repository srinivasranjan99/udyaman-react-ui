import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, IconButton, Button, 
  List, ListItem, ListItemText, ListItemIcon, Collapse,
  Tooltip, TextField, Dialog, DialogTitle, DialogContent, 
  DialogActions, MenuItem, Select, FormControl, InputLabel,
  Breadcrumbs, Link, Chip, Divider, CircularProgress, Alert
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Inventory2 as Inventory2Icon
} from '@mui/icons-material';
import { inventoryApi } from '../api/inventoryApi';
import UdyamanTreeView from '../components/common/UdyamanTreeView';

export default function CategoriesPage() {
  const mapToTree = (node) => ({
    ...node,
    label: node.name,
    hasChildren: node.children && node.children.length > 0,
    children: node.children ? node.children.map(mapToTree) : null
  });

  const [treeData, setTreeData] = useState([]);
  const [flatCategories, setFlatCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expanded, setExpanded] = useState([]);
  const [error, setError] = useState(null);
  
  // Form State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    description: '',
    code: '',
    parentId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [treeRes, flatRes] = await Promise.all([
        inventoryApi.getCategoryTree(),
        inventoryApi.getCategories()
      ]);
      setTreeData(treeRes.data || []);
      setFlatCategories(flatRes.data || []);
      
      // Expand first level by default
      if (treeRes.data && treeRes.data.length > 0) {
        setExpanded(prev => [...new Set([...prev, ...treeRes.data.map(c => c.id)])]);
      }
    } catch (err) {
      console.error("Failed to fetch categories", err);
      setError("Failed to load category tree.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (id) => {
    setExpanded(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelect = (category) => {
    setSelectedCategory(category);
  };

  const handleOpenAdd = (parentId = null) => {
    setIsEdit(false);
    setFormData({
      id: null,
      name: '',
      description: '',
      code: '',
      parentId: parentId || ''
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = () => {
    if (!selectedCategory) return;
    setIsEdit(true);
    setFormData({
      id: selectedCategory.id,
      name: selectedCategory.name,
      description: selectedCategory.description || '',
      code: selectedCategory.code || '',
      parentId: selectedCategory.parentId || ''
    });
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;
    if (!window.confirm(`Are you sure you want to delete "${selectedCategory.name}"?`)) return;
    
    setLoading(true);
    try {
      await inventoryApi.deleteCategory(selectedCategory.id);
      setSelectedCategory(null);
      fetchData();
    } catch (err) {
      setError("Failed to delete category. Ensure it is not in use.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        code: formData.code,
        parentId: formData.parentId === '' ? null : formData.parentId
      };

      if (isEdit) {
        await inventoryApi.updateCategory(formData.id, payload);
      } else {
        await inventoryApi.createCategory(payload);
      }
      
      setDialogOpen(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>Material Categories</Typography>
          <Breadcrumbs separator={<ChevronRightIcon fontSize="small" />} sx={{ color: 'text.secondary' }}>
            <Link underline="hover" color="inherit" href="/">Dashboard</Link>
            <Link underline="hover" color="inherit" href="/inventory">Inventory</Link>
            <Typography color="text.primary">Categories</Typography>
          </Breadcrumbs>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => handleOpenAdd()}
          sx={{ borderRadius: 2, px: 3 }}
        >
          Root Category
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3} sx={{ flexGrow: 1, minHeight: 0 }}>
        {/* Left Sidebar: Tree View */}
        <Grid item xs={12} md={4} sx={{ height: '100%', display: 'flex' }}>
          <Paper 
            sx={{ 
              width: '100%', 
              p: 2, 
              borderRadius: 3, 
              display: 'flex', 
              flexDirection: 'column',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              overflow: 'hidden'
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 2, px: 1, color: 'text.secondary', fontWeight: 'bold' }}>
              HIERARCHY EXPLORER
            </Typography>
            <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress /></Box>
              ) : (
                <UdyamanTreeView 
                  data={treeData.map(node => mapToTree(node))}
                  onSelect={handleSelect}
                  actions={[
                    { label: 'Edit', icon: EditIcon, onClick: handleOpenEdit },
                    { label: 'Add Sub', icon: AddIcon, onClick: (n) => handleOpenAdd(n.id) },
                    { label: 'Delete', icon: DeleteIcon, onClick: handleDelete, color: 'error.main' }
                  ]}
                />
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Right Area: Category Details */}
        <Grid item xs={12} md={8} sx={{ height: '100%', display: 'flex' }}>
          <Paper 
            sx={{ 
              width: '100%', 
              p: 4, 
              borderRadius: 3, 
              display: 'flex', 
              flexDirection: 'column',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              bgcolor: selectedCategory ? 'white' : '#f8fafc',
              border: selectedCategory ? 'none' : '2px dashed #e2e8f0',
              justifyContent: selectedCategory ? 'flex-start' : 'center',
              alignItems: selectedCategory ? 'stretch' : 'center'
            }}
          >
            {selectedCategory ? (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Inventory2Icon color="primary" />
                      <Typography variant="h5" fontWeight="bold">{selectedCategory.name}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {selectedCategory.parentName ? `Subcategory of ${selectedCategory.parentName}` : 'Root Level Category'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Add Subcategory">
                      <IconButton onClick={() => handleOpenAdd(selectedCategory.id)} color="primary"><AddIcon /></IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton onClick={handleOpenEdit} color="info"><EditIcon /></IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton onClick={handleDelete} color="error"><DeleteIcon /></IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Divider sx={{ mb: 4 }} />

                <Grid container spacing={4}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>IDENTIFIER CODE</Typography>
                    <Typography variant="body1" fontWeight="medium">{selectedCategory.code || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>STATUS</Typography>
                    <Chip 
                      label={selectedCategory.isActive ? 'Active' : 'Inactive'} 
                      color={selectedCategory.isActive ? 'success' : 'default'} 
                      size="small" 
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>DESCRIPTION</Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {selectedCategory.description || 'No description provided.'}
                    </Typography>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 'auto', pt: 4 }}>
                   <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>DIRECT SUB-CATEGORIES</Typography>
                   <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedCategory.children?.length > 0 ? (
                        selectedCategory.children.map(child => (
                          <Chip 
                            key={child.id} 
                            label={child.name} 
                            onClick={() => handleSelect(child)}
                            variant="outlined"
                            sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                          />
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">No sub-categories.</Typography>
                      )}
                   </Box>
                </Box>
              </>
            ) : (
              <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                <FolderIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
                <Typography variant="h6">Select a Category</Typography>
                <Typography variant="body2">Select a category from the tree to view details or manage sub-categories.</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{isEdit ? 'Edit Category' : 'Add New Category'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField 
                fullWidth 
                label="Category Name" 
                required
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                fullWidth 
                label="Identifier Code" 
                placeholder="e.g. MED-TAB"
                value={formData.code} 
                onChange={(e) => setFormData({...formData, code: e.target.value})} 
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Parent Category</InputLabel>
                <Select
                  label="Parent Category"
                  value={formData.parentId}
                  onChange={(e) => setFormData({...formData, parentId: e.target.value})}
                >
                  <MenuItem value=""><em>None (Root)</em></MenuItem>
                  {flatCategories
                    .filter(c => c.id !== formData.id) // Prevent self-parenting
                    .map(c => (
                    <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField 
                fullWidth 
                label="Description" 
                multiline 
                rows={3}
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" sx={{ px: 4 }}>
            {isEdit ? 'Update Category' : 'Create Category'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
