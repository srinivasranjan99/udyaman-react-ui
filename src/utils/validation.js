/**
 * Centralized Validation Rules for Udyaman ERP
 * These rules can be passed to the 'rules' prop of our form components.
 */

export const VALIDATION_RULES = {
  REQUIRED: (label) => ({
    required: `${label} is required`
  }),
  
  MIN_LENGTH: (label, min) => ({
    minLength: {
      value: min,
      message: `${label} must be at least ${min} characters`
    }
  }),
  
  MAX_LENGTH: (label, max) => ({
    maxLength: {
      value: max,
      message: `${label} cannot exceed ${max} characters`
    }
  }),
  
  NUMERIC: (label) => ({
    pattern: {
      value: /^[0-9]*$/,
      message: `${label} must contain only numbers`
    }
  }),
  
  EMAIL: {
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: "Invalid email address"
    }
  },

  DATE_PAST: (label) => ({
    validate: (value) => {
      if (!value) return true;
      const selectedDate = new Date(value);
      const today = new Date();
      return selectedDate <= today || `${label} cannot be in the future`;
    }
  }),

  DATE_FUTURE: (label) => ({
    validate: (value) => {
      if (!value) return true;
      const selectedDate = new Date(value);
      const today = new Date();
      return selectedDate >= today || `${label} must be in the future`;
    }
  })
};

/**
 * Utility to map backend validation errors to React Hook Form fields.
 * Expected backend format: { field: "error message" } or { errors: [{ field: "name", message: "req" }] }
 */
export const mapBackendErrors = (err, setError) => {
  const serverErrors = err.response?.data?.errors;
  
  if (Array.isArray(serverErrors)) {
    serverErrors.forEach(error => {
      setError(error.field, {
        type: 'manual',
        message: error.message
      });
    });
  } else if (typeof serverErrors === 'object') {
    Object.entries(serverErrors).forEach(([field, message]) => {
      setError(field, { type: 'manual', message });
    });
  }
};
