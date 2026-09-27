import apiService from './apiService';

/**
 * Workflow and Approval Configuration API layer
 */
export const workflowApi = {
  // Policies
  getPolicies: (params) => apiService.get('/workflow/policies', { params }),
  createPolicy: (data) => apiService.post('/workflow/policies', data),
  updatePolicy: (id, data) => apiService.put(`/workflow/policies/${id}`, data),
  deletePolicy: (id) => apiService.delete(`/workflow/policies/${id}`),

  // Rules (Usually managed as part of Policy in a clean ERP)
  getRules: (policyId) => apiService.get(`/workflow/policies/${policyId}/rules`),
  
  // Instance Status
  getInstanceStatus: (module, refId) => apiService.get(`/workflow/instances/${module}/${refId}`)
};

export default workflowApi;
