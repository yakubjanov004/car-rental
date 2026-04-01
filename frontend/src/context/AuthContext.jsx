import React, { createContext, useState, useEffect, useContext } from 'react';
import apiClient from '../services/api/apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const res = await apiClient.get('/auth/me/');
          setUser(res.data);
        } catch (err) {
          console.error('Failed to fetch user', err);
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const login = async (username, password) => {
    const res = await apiClient.post('/auth/login/', { username, password });
    localStorage.setItem('access_token', res.data.access);
    localStorage.setItem('refresh_token', res.data.refresh);
    
    // Set headers for immediate use
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${res.data.access}`;
    
    const userRes = await apiClient.get('/auth/me/');
    setUser(userRes.data);
    return userRes.data;
  };

  const register = async (userData) => {
    const res = await apiClient.post('/auth/register/', userData);
    return res.data;
  };

  const logout = async () => {
    const refresh = localStorage.getItem('refresh_token');
    try {
      if (refresh) {
        await apiClient.post('/auth/logout/', { refresh });
      }
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      delete apiClient.defaults.headers.common['Authorization'];
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
