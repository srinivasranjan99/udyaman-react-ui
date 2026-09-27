import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedTenantId = localStorage.getItem('tenantId');
    if (storedUser && storedTenantId) {
      setUser(JSON.parse(storedUser));
      setTenant({ id: storedTenantId });
    }
    setLoading(false);
  }, []);

  const login = async (username, password, tenantId) => {
    // We pass the tenantId in headers explicitly because the axios interceptor
    // only picks it up from localStorage AFTER login succeeds.
    const response = await api.post('/auth/login', 
      { username, password }, 
      { headers: { 'X-Tenant-ID': tenantId } }
    );
    const { token, ...userData } = response.data.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('tenantId', tenantId);
    localStorage.setItem('user', JSON.stringify(userData));
    
    setUser(userData);
    setTenant({ id: tenantId });
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('tenantId');
    localStorage.removeItem('user');
    setUser(null);
    setTenant(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, tenant, login, logout, loading, isAuthenticated }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
