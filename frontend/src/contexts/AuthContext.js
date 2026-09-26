import React, { createContext, useState, useEffect } from 'react';
import { authAPI } from '../api/client';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token) {
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          // ignore parsing error
        }
      }
      authAPI.me()
        .then(res => {
          if (res.data) {
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authAPI.login(email, password);
      const token = res.data.access_token || res.data.token;
      const resolveRole = (em) => {
        if (em.includes('admin') || em.includes('affan')) return 'admin';
        if (em.includes('executer') || em.includes('exec')) return 'executer';
        if (em.includes('operator') || em.includes('dispatch')) return 'operator';
        return 'analyst';
      };

      const resolveName = (em, r) => {
        if (em === 'affan@urbantransit.iq') return 'Muhammad Affan';
        if (r === 'admin') return 'System Administrator';
        if (r === 'executer') return 'Executive Director';
        if (r === 'operator') return 'Transit Operations Controller';
        return 'Transit Operations Analyst';
      };

      const userData = res.data.user || {
        email,
        full_name: resolveName(email, resolveRole(email)),
        role: resolveRole(email)
      };
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (err) {
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const res = await authAPI.register(userData);
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};