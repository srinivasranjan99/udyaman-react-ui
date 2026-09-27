import apiService from './apiService';

/**
 * Production and Manufacturing API layer
 */
export const productionApi = {
  // Production Orders
  getOrders: (params) => apiService.get('/production/orders', { params }),
  createOrder: (data) => apiService.post('/production/orders', data),
  startProduction: (id) => apiService.put(`/production/orders/${id}/start`),
  recordConsumption: (id, data) => apiService.post(`/production/orders/${id}/consume`, data),
  completeProduction: (id, data) => apiService.post(`/production/orders/${id}/complete`, data),

  // BOM
  getBomsByProduct: (productId) => apiService.get(`/production/boms/product/${productId}`),
  createBom: (data) => apiService.post('/production/boms', data),
  activateBom: (id) => apiService.put(`/production/boms/${id}/activate`)
};

export default productionApi;
