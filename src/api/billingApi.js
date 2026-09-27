import apiService from './apiService';

/**
 * POS Billing and Invoice API layer
 */
export const billingApi = {
  // Invoices
  createInvoice: (invoiceData) => apiService.post('/billing/invoices', invoiceData),
  getInvoices: (config) => apiService.get('/billing/invoices', config),
  getInvoiceById: (id) => apiService.get(`/billing/invoices/${id}`),
  
  // Dashboard Metrics
  getDailySales: (date) => apiService.get('/billing/invoices/daily-sales', { params: { date } }),
  getWeeklySales: () => apiService.get('/billing/invoices/weekly-sales'),
  
  // PDF Generation
  /**
   * Fetches the PDF blob for a specific invoice.
   * @param {string|number} id Invoice ID
   * @returns {Promise<Blob>} The PDF file Blob
   */
  downloadInvoicePdf: async (id) => {
    // We bypass the standard apiService to specifically request a blob response
    const response = await apiService.get(`/billing/invoices/${id}/download`, { responseType: 'blob' });
    return response;
  }
};

export default billingApi;
