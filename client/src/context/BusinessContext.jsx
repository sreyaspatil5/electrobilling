import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const BusinessContext = createContext(null);

export const BusinessProvider = ({ children }) => {
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchBusiness = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/business');
      setBusiness(data.data);
    } catch (err) {
      // Not critical on first load
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBusiness = useCallback(async (updates) => {
    const { data } = await api.put('/business', updates);
    setBusiness(data.data);
    return data.data;
  }, []);

  return (
    <BusinessContext.Provider value={{ business, loading, fetchBusiness, updateBusiness, setBusiness }}>
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = () => {
  const ctx = useContext(BusinessContext);
  if (!ctx) throw new Error('useBusiness must be used within BusinessProvider');
  return ctx;
};
