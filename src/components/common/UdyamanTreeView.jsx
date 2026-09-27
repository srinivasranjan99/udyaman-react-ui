import React, { useState } from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import {
  ChevronRight,
  ExpandMore,
  MoreVert,
  Folder,
  InsertDriveFile
} from '@mui/icons-material';

/**
 * UdyamanTreeView: A robust, reusable hierarchical navigation component.
 * Features: Lazy loading, context actions, recursive rendering, and premium aesthetics.
 */
const UdyamanTreeView = ({ 
  data = [], 
  onSelect, 
  onExpand, 
  actions = [],
  loadingNodes = {} 
}) => {
  return (
    <List sx={{ width: '100%', bgcolor: 'transparent' }} dense disablePadding>
      {data.map((node) => (
        <TreeItem 
          key={node.id} 
          node={node} 
          level={0}
          onSelect={onSelect}
          onExpand={onExpand}
          actions={actions}
          loading={loadingNodes[node.id]}
        />
      ))}
    </List>
  );
};

const TreeItem = ({ node, level, onSelect, onExpand, actions, loading }) => {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  
  const hasChildren = node.hasChildren || (node.children && node.children.length > 0);
  const Icon = node.icon || (hasChildren ? Folder : InsertDriveFile);

  const handleToggle = (e) => {
    e.stopPropagation();
    const nextState = !open;
    setOpen(nextState);
    if (nextState && onExpand && !node.children) {
      onExpand(node);
    }
  };

  const handleSelect = () => {
    if (onSelect) onSelect(node);
  };

  const handleMenuOpen = (e) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleAction = (action) => {
    handleMenuClose();
    if (action.onClick) action.onClick(node);
  };

  return (
    <React.Fragment>
      <ListItem
        disablePadding
        sx={{ 
          pl: level * 2, 
          transition: 'background 0.2s',
          '&:hover .action-button': { opacity: 1 }
        }}
      >
        <ListItemButton
          onClick={handleSelect}
          sx={{
            py: 0.5,
            px: 1,
            borderRadius: 2,
            mb: 0.5,
            '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.05)' }
          }}
        >
          <Box 
            onClick={handleToggle}
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mr: 1, 
              visibility: hasChildren ? 'visible' : 'hidden',
              cursor: 'pointer'
            }}
          >
            {open ? <ExpandMore fontSize="small" /> : <ChevronRight fontSize="small" />}
          </Box>
          
          <ListItemIcon sx={{ minWidth: 32, color: hasChildren ? 'primary.main' : 'text.secondary' }}>
            {loading ? <CircularProgress size={16} /> : <Icon fontSize="small" />}
          </ListItemIcon>

          <ListItemText 
            primary={node.label} 
            primaryTypographyProps={{ 
              fontSize: '0.85rem', 
              fontWeight: hasChildren ? 600 : 400,
              noWrap: true 
            }} 
          />

          {actions.length > 0 && (
            <IconButton 
              size="small" 
              className="action-button"
              sx={{ opacity: 0, transition: '0.2s' }}
              onClick={handleMenuOpen}
            >
              <MoreVert fontSize="inherit" />
            </IconButton>
          )}
        </ListItemButton>

        {/* Context Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{ sx: { minWidth: 120, borderRadius: 2, boxShadow: 3 } }}
        >
          {actions.map((action, idx) => (
            <MenuItem 
              key={idx} 
              onClick={() => handleAction(action)}
              sx={{ fontSize: '0.8rem', gap: 1 }}
            >
              {action.icon && <action.icon fontSize="small" color={action.color || 'inherit'} />}
              <Typography variant="inherit" color={action.color || 'inherit'}>{action.label}</Typography>
            </MenuItem>
          ))}
        </Menu>
      </ListItem>

      {hasChildren && node.children && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {node.children.map((child) => (
              <TreeItem 
                key={child.id} 
                node={child} 
                level={level + 1}
                onSelect={onSelect}
                onExpand={onExpand}
                actions={actions}
              />
            ))}
          </List>
        </Collapse>
      )}
    </React.Fragment>
  );
};

export default UdyamanTreeView;
