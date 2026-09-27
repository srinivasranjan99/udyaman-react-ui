import api from './axios';

/**
 * Service for managing dynamic custom fields.
 */
export const CustomFieldService = {
  /**
   * Fetch all field definitions for a specific module (e.g., 'PRODUCT', 'INVOICE')
   */
  getFieldDefinitions: async (moduleName) => {
    const response = await api.get(`/custom-fields/module/${moduleName}`);
    return response.data.data || [];
  },

  /**
   * Validate a set of values against the module's field definitions
   */
  validateFields: async (moduleName, customAttributes) => {
    const response = await api.post('/custom-fields/validate', {
      moduleName,
      customAttributes
    });
    return response.data.data;
  },

  /**
   * Create a new field definition (Admin only)
   */
  createFieldDefinition: async (fieldData) => {
    const response = await api.post('/custom-fields', fieldData);
    return response.data.data;
  },

  /**
   * Update an existing field definition
   */
  updateFieldDefinition: async (fieldId, fieldData) => {
    const response = await api.put(`/custom-fields/${fieldId}`, fieldData);
    return response.data.data;
  },

  /**
   * Delete a field definition
   */
  deleteFieldDefinition: async (fieldId) => {
    await api.delete(`/custom-fields/${fieldId}`);
  }
};

export default CustomFieldService;
