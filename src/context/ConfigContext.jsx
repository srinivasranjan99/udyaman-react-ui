import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext.jsx';

const ConfigContext = createContext(null);

export const ConfigProvider = ({ children }) => {
  const { tenant } = useAuth();
  const [features, setFeatures] = useState({});
  const [customFields, setCustomFields] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tenant?.id) {
      fetchConfigs();
    }
  }, [tenant]);

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const [featuresRes, productFieldsRes] = await Promise.all([
        api.get('/config/features'),
        api.get('/config/custom-fields/PRODUCT')
      ]);
      
      setFeatures(featuresRes.data.data);
      setCustomFields(prev => ({ ...prev, PRODUCT: productFieldsRes.data.data }));
    } catch (err) {
      console.error("Failed to fetch tenant configs", err);
    } finally {
      setLoading(false);
    }
  };

  const isFeatureEnabled = (key) => features[key] === 'true';

  return (
    <ConfigContext.Provider value={{ features, customFields, isFeatureEnabled, loading }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => useContext(ConfigContext);
