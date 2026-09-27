import apiService from './apiService';

/**
 * Purchase Order and Procurement API layer
 */
export const purchaseApi = {
  // Purchase Orders
  getOrders: (params) => apiService.get('/purchase/orders', { params }),
  getOrderById: (id) => apiService.get(`/purchase/orders/${id}`),
  createOrder: (data) => apiService.post('/purchase/orders', data),
  updateOrder: (id, data) => apiService.put(`/purchase/orders/${id}`, data),
  deleteOrder: (id) => apiService.delete(`/purchase/orders/${id}`),

  // Workflow Actions
  submitOrder: (id) => apiService.post(`/purchase/orders/${id}/submit`),
  approveOrder: (id, comments) => apiService.post(`/purchase/orders/${id}/approve`, null, { params: { comments } }),
  rejectOrder: (id, comments) => apiService.post(`/purchase/orders/${id}/reject`, null, { params: { comments } }),

  // GRN (Goods Receipt Note)
  createGRN: (poId, data) => apiService.post(`/grn/from-po/${poId}`, data),
  getGRNs: (params) => apiService.get('/purchase/receipts', { params })
};

export default purchaseApi;
