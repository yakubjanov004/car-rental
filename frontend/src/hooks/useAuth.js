import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
       // Mock for now, in real app verify token with API
       setUser({ username: 'testuser', first_name: 'Suhrob', last_name: 'Xoldorov', is_staff: true, phone: '+998 90 123 45 67' });
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    // Mock login
    if (username === 'admin' && password === 'admin123') {
       const mockUser = { username: 'admin', first_name: 'Admin', is_staff: true };
       setUser(mockUser);
       localStorage.setItem('token', 'mock-token');
       return mockUser;
    }
    throw new Error('Xato');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
