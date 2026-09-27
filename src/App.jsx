import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext.jsx';
import { ConfigProvider } from './context/ConfigContext.jsx';
// Layout
import AppLayout from './components/layout/AppLayout.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import { ROLES, PERMISSIONS } from './utils/rbac';

// Pages
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import MaterialDashboard from './pages/MaterialDashboard.jsx';
import QCInspectionPage from './modules/audit/pages/QCInspectionPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import RolesPage from './pages/RolesPage.jsx';
import SalesOrderPage from './modules/sales/pages/SalesOrderPage.jsx';
import InvoiceListPage from './modules/sales/pages/InvoiceListPage.jsx';
import BillingPage from './pages/BillingPage.jsx';
import MaterialMasterPage from './pages/MaterialMasterPage.jsx';
import PurchasePage from './pages/PurchasePage.jsx';
import GrnListPage from './modules/procurement/pages/GrnListPage.jsx';
import SuppliersPage from './pages/SuppliersPage.jsx';
import CategoriesPage from './pages/CategoriesPage.jsx';
import AuditLogsPage from './pages/AuditLogsPage.jsx';
import CustomFieldsPage from './pages/CustomFieldsPage.jsx';
import BarcodePage from './pages/BarcodePage.jsx';
import StockLedgerPage from './pages/StockLedgerPage.jsx';
import StockAdjustmentsPage from './pages/StockAdjustmentsPage.jsx';

// Manufacturing & Warehouse Pages
import BOMPage from './modules/production/pages/BOMPage.jsx';
import ProductionOrderPage from './modules/production/pages/ProductionOrderPage.jsx';
import ProductionExecutionPage from './modules/production/pages/ProductionExecutionPage.jsx';
import WarehousePage from './modules/inventory/pages/WarehousePage.jsx';
import StockTransferPage from './modules/inventory/pages/StockTransferPage.jsx';
import StockSummaryPage from './modules/inventory/pages/StockSummaryPage.jsx';
import OpeningStockForm from './modules/inventory/pages/OpeningStockForm.jsx';
import MRPPage from './modules/production/pages/MRPPage.jsx';

// System Admin Pages
import WorkflowConfigPage from './modules/admin/workflow/WorkflowConfigPage.jsx';
import TenantManagementPage from './pages/system-admin/TenantManagementPage.jsx';
import GlobalUserOversightPage from './pages/system-admin/GlobalUserOversightPage.jsx';
import SystemReportsPage from './pages/system-admin/SystemReportsPage.jsx';
import GlobalAuditLogsPage from './pages/system-admin/GlobalAuditLogsPage.jsx';

// Material-UI Theme
const theme = createTheme({
  palette: {
    primary: { main: '#3b82f6' },
    secondary: { main: '#10b981' },
    background: { default: '#f1f5f9' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, textTransform: 'none', fontWeight: 600 }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 12 }
      }
    },
    // Global Form Field Standardization (High Contrast ERP Mode)
    MuiTextField: {
      defaultProps: {
        fullWidth: true,
        variant: 'outlined',
        margin: 'normal',
        size: 'medium'
      },
      styleOverrides: {
        root: {
          backgroundColor: '#fff',
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: '#999' }, // High contrast border
            '&:hover fieldset': { borderColor: '#555' },
            '&.Mui-focused fieldset': { borderColor: '#3b82f6', borderWidth: '2px' },
            '&.Mui-disabled fieldset': { borderColor: '#e2e8f0' }, // Clearly distinct disabled state
          }
        }
      }
    },
    MuiInputLabel: {
      defaultProps: {
        shrink: true
      },
      styleOverrides: {
        root: {
          color: '#333', // Deep gray labels
          fontWeight: 600,
          '&.Mui-focused': { color: '#3b82f6' }
        }
      }
    },
    MuiAutocomplete: {
      defaultProps: {
        fullWidth: true,
        autoHighlight: true
      },
      styleOverrides: {
        listbox: {
          padding: 0,
          '& .MuiAutocomplete-option': {
            borderBottom: '1px solid #f0f0f0',
            typography: 'body2'
          }
        }
      }
    }
  }
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <ConfigProvider>
            <Routes>
              {/* ============ PUBLIC ROUTES ============ */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* ============ PROTECTED ROUTES (WRAPPED IN LAYOUT) ============ */}
              <Route path="/*" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Routes>
                      <Route path="/dashboard" element={<MaterialDashboard />} />
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      
                      {/* Material Management */}
                      <Route path="/material/list" element={<MaterialMasterPage />} />
                      <Route path="/material/categories" element={<CategoriesPage />} />
                      <Route path="/material/attributes" element={<CustomFieldsPage />} />
                      <Route path="/material/barcodes" element={<BarcodePage />} />

                      {/* Inventory */}
                      <Route path="/inventory/summary" element={<StockSummaryPage />} />
                      <Route path="/inventory/warehouses" element={<WarehousePage />} />
                      <Route path="/inventory/transfers" element={<StockTransferPage />} />
                      <Route path="/inventory/batches" element={<StockLedgerPage />} />
                      <Route path="/inventory/adjustments" element={<StockAdjustmentsPage />} />
                      <Route path="/inventory/opening-stock" element={<OpeningStockForm />} />

                      {/* Procurement */}
                      <Route path="/procurement/orders" element={<PurchasePage />} />
                      <Route path="/procurement/vendors" element={<SuppliersPage />} />
                      <Route path="/procurement/grn" element={<GrnListPage />} />

                      {/* Manufacturing */}
                      <Route path="/manufacturing/bom" element={<BOMPage />} />
                      <Route path="/manufacturing/orders" element={<ProductionOrderPage />} />
                      <Route path="/manufacturing/orders/:id" element={<ProductionExecutionPage />} />
                      <Route path="/manufacturing/mrp" element={<MRPPage />} />

                      {/* Sales */}
                      <Route path="/sales/orders" element={<SalesOrderPage />} />
                      <Route path="/sales/customers" element={<SuppliersPage />} />
                      <Route path="/sales/invoices" element={<InvoiceListPage />} />
                      <Route path="/sales/billing" element={<BillingPage />} />

                      {/* Audit */}
                      <Route path="/audit/logs" element={<AuditLogsPage />} />
                      <Route path="/audit/ledger" element={<StockLedgerPage />} />
                      <Route path="/audit/qc" element={<QCInspectionPage />} />

                      {/* Admin */}
                      <Route path="/admin/users" element={<UsersPage />} />
                      <Route path="/admin/roles" element={<RolesPage />} />
                      <Route path="/admin/forms" element={<CustomFieldsPage />} />
                      <Route path="/admin/workflow" element={<WorkflowConfigPage />} />
                      <Route path="/admin/tenant" element={<TenantManagementPage />} />

                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </AppLayout>
                </ProtectedRoute>
              } />
            </Routes>
          </ConfigProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

/**
 * Admin Page - Placeholder
 */
function AdminPage() {
  return (
    <div style={{ padding: '24px' }}>
      <h2>Admin Panel</h2>
      <p>System configuration and management.</p>
    </div>
  );
}

/**
 * Reports Page - Placeholder
 */
function ReportsPage() {
  return (
    <div style={{ padding: '24px' }}>
      <h2>Reports</h2>
      <p>View system reports and analytics.</p>
    </div>
  );
}

