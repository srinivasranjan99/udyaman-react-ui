import apiService from './apiService';

/**
 * Inventory, Warehouse and Product Management API layer
 */
export const inventoryApi = {
  // Products / Materials
  getProducts: (params) => apiService.get('/inventory/products', { params }),
  getProductById: (id) => apiService.get(`/inventory/products/${id}`),
  createProduct: (data) => apiService.post('/inventory/products', data),
  updateProduct: (id, data) => apiService.put(`/inventory/products/${id}`, data),
  deleteProduct: (id) => apiService.delete(`/inventory/products/${id}`),
  
  // Categories
  getCategories: () => apiService.get('/inventory/categories'),
  getCategoryTree: () => apiService.get('/inventory/categories/tree'),
  createCategory: (data) => apiService.post('/inventory/categories', data),
  updateCategory: (id, data) => apiService.put(`/inventory/categories/${id}`, data),
  deleteCategory: (id) => apiService.delete(`/inventory/categories/${id}`),

  // Warehouses
  getWarehouses: () => apiService.get('/inventory/warehouses'),
  createWarehouse: (data) => apiService.post('/inventory/warehouses', data),
  updateWarehouse: (id, data) => apiService.put(`/inventory/warehouses/${id}`, data),
  deleteWarehouse: (id) => apiService.delete(`/inventory/warehouses/${id}`),
  getStorageLocations: (whId) => apiService.get(`/inventory/warehouses/${whId}/locations`),
  createStorageLocation: (whId, data) => apiService.post(`/inventory/warehouses/${whId}/locations`, data),
  deleteStorageLocation: (locId) => apiService.delete(`/inventory/warehouses/locations/${locId}`),

  // Stock Operations
  transferStock: (data) => apiService.post('/inventory/stock/transfer', data),
  recordTransaction: (data) => apiService.post('/inventory/stock/transaction', data),
  getWarehouseStock: (whId) => apiService.get(`/inventory/stock/warehouse/${whId}`),
  getLocationStock: (whId, locId) => apiService.get(`/inventory/stock/warehouse/${whId}/location/${locId}`),

  // Stock Ledger
  getLedger: (params) => apiService.get('/inventory/ledger', { params }),
  
  // Alerts
  getLowStockAlerts: () => apiService.get('/inventory/products/alerts/low-stock'),
  getOutOfStockAlerts: () => apiService.get('/inventory/products/alerts/out-of-stock')
};

export default inventoryApi;
