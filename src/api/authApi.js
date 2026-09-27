import apiService from './apiService';

/**
 * Authentication and User Management API layer
 */
export const authApi = {
  // Authentication
  login: (credentials) => apiService.post('/auth/login', credentials),
  register: (userData) => apiService.post('/auth/register', userData),
  
  // User Management
  getUsers: (config) => apiService.get('/users', config),
  getUserById: (id) => apiService.get(`/users/${id}`),
  updateUser: (id, userData) => apiService.put(`/users/${id}`, userData),
  deleteUser: (id) => apiService.delete(`/users/${id}`),
  
  // Roles & Permissions
  getRoles: () => apiService.get('/roles'),
  assignRoles: (userId, roleNames) => apiService.post(`/users/${userId}/roles`, { roleNames }),
  removeRoles: (userId, roleNames) => apiService.delete(`/users/${userId}/roles`, { data: { roleNames } })
};

export default authApi;
