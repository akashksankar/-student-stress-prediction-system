import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api, getStoredToken, setStoredToken, getStoredUser, setStoredUser } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, []);

  const refreshUser = async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setStoredUser(null);
      return;
    }

    try {
      const res = await api.getCurrentUser();
      setUser(res.user);
      setStoredUser(res.user);
    } catch {
      // In case of network glitch or client session on Vercel, keep local session
      const cached = getStoredUser();
      if (cached) {
        setUser(cached);
      }
    }
  };

  const login = async (email: string, pass: string) => {
    const res = await api.login({ email, password: pass });
    setStoredToken(res.token);
    setUser(res.user);
    setStoredUser(res.user);
  };

  const register = async (data: any) => {
    const res = await api.register(data);
    setStoredToken(res.token);
    setUser(res.user);
    setStoredUser(res.user);
  };

  const logout = () => {
    setStoredToken(null);
    setStoredUser(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
