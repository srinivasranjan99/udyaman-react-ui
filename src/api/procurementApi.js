import apiService from './apiService';

/**
 * Procurement and Supplier API layer
 */
export const procurementApi = {
  // Suppliers
  getSuppliers: () => apiService.get('/suppliers'),
  getSupplierById: (id) => apiService.get(`/suppliers/${id}`),
  createSupplier: (data) => apiService.post('/suppliers', data),
  updateSupplier: (id, data) => apiService.put(`/suppliers/${id}`, data),
  deleteSupplier: (id) => apiService.delete(`/suppliers/${id}`),

  // Purchase Orders
  getOrders: (params) => apiService.get('/purchase/orders', { params }),
  createOrder: (data) => apiService.post('/purchase/orders', data),
  approveOrder: (id) => apiService.post(`/purchase/orders/${id}/approve`),
  
  // Goods Receipt (GRN)
  createReceipt: (data) => apiService.post('/purchase/receipts', data)
};

export default procurementApi;
