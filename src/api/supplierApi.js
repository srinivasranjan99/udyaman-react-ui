import apiService from './apiService';

/**
 * Supplier Master API layer
 */
export const supplierApi = {
  getSuppliers: (params) => apiService.get('/suppliers', { params }),
  getSupplierById: (id) => apiService.get(`/suppliers/${id}`),
  createSupplier: (data) => apiService.post('/suppliers', data),
  updateSupplier: (id, data) => apiService.put(`/suppliers/${id}`, data),
  deleteSupplier: (id) => apiService.delete(`/suppliers/${id}`)
};

export default supplierApi;
