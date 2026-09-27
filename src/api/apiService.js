import api from './axios';

/**
 * Core API Service
 * Provides centralized and reusable HTTP methods.
 * Abstracts Axios configuration and standardizes response/error handling for the UI.
 */
const apiService = {
  get: async (url, config = {}) => {
    try {
      const response = await api.get(url, config);
      return response.data; // Strips out the top-level axios response object
    } catch (error) {
      handleGlobalError(error);
      throw error;
    }
  },

  post: async (url, data = {}, config = {}) => {
    try {
      const response = await api.post(url, data, config);
      return response.data;
    } catch (error) {
      handleGlobalError(error);
      throw error;
    }
  },

  put: async (url, data = {}, config = {}) => {
    try {
      const response = await api.put(url, data, config);
      return response.data;
    } catch (error) {
      handleGlobalError(error);
      throw error;
    }
  },

  delete: async (url, config = {}) => {
    try {
      const response = await api.delete(url, config);
      return response.data;
    } catch (error) {
      handleGlobalError(error);
      throw error;
    }
  }
};

/**
 * Centralized error handler
 * Used to log or trigger global UI toast notifications
 */
const handleGlobalError = (error) => {
  const status = error.response?.status;
  const message = error.response?.data?.message || error.message;

  // 401 is handled by the Axios interceptor (logout), but we can log others
  if (status === 403) {
    console.error('API Error (403): Access Denied. Insufficient permissions.');
  } else if (status >= 500) {
    console.error('API Error (500+): Server error occurred.', message);
  } else {
    console.error(`API Error (${status || 'Network'}):`, message);
  }
};

export default apiService;
