import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  ShoppingCart as ShoppingCartIcon,
  Factory as FactoryIcon,
  PointOfSale as PointOfSaleIcon,
  History as HistoryIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Warehouse as WarehouseIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';

export const navigationConfig = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: DashboardIcon,
    path: '/dashboard',
    roles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'STAFF']
  },
  {
    id: 'material',
    label: 'Material Management',
    icon: CategoryIcon,
    roles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'STAFF'],
    children: [
      { label: 'Materials', path: '/material/list' },
      { label: 'Categories', path: '/material/categories' },
      { label: 'Attributes', path: '/material/attributes' },
      { label: 'Barcode Labels', path: '/material/barcodes' }
    ]
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: InventoryIcon,
    roles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'STAFF'],
    children: [
      { label: 'Stock Summary', path: '/inventory/summary' },
      { label: 'Warehouses', path: '/inventory/warehouses' },
      { label: 'Transfers', path: '/inventory/transfers' },
      { label: 'Stock Adjustments', path: '/inventory/adjustments' },
      { label: 'Opening Stock', path: '/inventory/opening-stock' },
      { label: 'Batches', path: '/inventory/batches' }
    ]
  },
  {
    id: 'procurement',
    label: 'Procurement',
    icon: ShoppingCartIcon,
    roles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'STAFF'],
    children: [
      { label: 'Purchase Orders', path: '/procurement/orders' },
      { label: 'Vendors', path: '/procurement/vendors' },
      { label: 'GRN (Goods Receipt)', path: '/procurement/grn' }
    ]
  },
  {
    id: 'manufacturing',
    label: 'Manufacturing',
    icon: FactoryIcon,
    roles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'STAFF'],
    children: [
      { label: 'BOM', path: '/manufacturing/bom' },
      { label: 'Production Orders', path: '/manufacturing/orders' },
      { label: 'MRP Planning', path: '/manufacturing/mrp' }
    ]
  },
  {
    id: 'sales',
    label: 'Sales',
    icon: PointOfSaleIcon,
    roles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'STAFF'],
    children: [
      { label: 'Sales Orders', path: '/sales/orders' },
      { label: 'Customers', path: '/sales/customers' },
      { label: 'Invoices', path: '/sales/invoices' },
      { label: 'POS Billing', path: '/sales/billing' }
    ]
  },
  {
    id: 'audit',
    label: 'Audit & Compliance',
    icon: HistoryIcon,
    roles: ['SUPER_ADMIN', 'TENANT_ADMIN'],
    children: [
      { label: 'QC Inspections', path: '/audit/qc' },
      { label: 'Stock Ledger', path: '/audit/ledger' },
      { label: 'Activity Logs', path: '/audit/logs' }
    ]
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: AdminPanelSettingsIcon,
    roles: ['SUPER_ADMIN', 'TENANT_ADMIN'],
    children: [
      { label: 'Users & Roles', path: '/admin/users' },
      { label: 'Tenant Settings', path: '/admin/tenant' },
      { label: 'Workflow Governance', path: '/admin/workflow' },
      { label: 'Form Configurations', path: '/admin/forms' }
    ]
  }
];
