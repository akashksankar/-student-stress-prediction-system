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
  quickLogin: (role: 'student' | 'admin' | 'counsellor') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setStoredUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.getCurrentUser();
      setUser(res.user);
      setStoredUser(res.user);
    } catch (err) {
      console.warn('Session verification fallback to cached profile:', err);
      const cached = getStoredUser();
      if (cached) {
        setUser(cached);
      } else {
        setStoredToken(null);
        setStoredUser(null);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.login({ email, password: pass });
    setStoredToken(res.token);
    setStoredUser(res.user);
    setUser(res.user);
  };

  const register = async (data: any) => {
    const res = await api.register(data);
    setStoredToken(res.token);
    setStoredUser(res.user);
    setUser(res.user);
  };

  const logout = () => {
    setStoredToken(null);
    setStoredUser(null);
    setUser(null);
  };

  const quickLogin = async (role: 'student' | 'admin' | 'counsellor') => {
    if (role === 'admin') {
      await login('admin@stresspredict.edu', 'Admin@12345');
    } else if (role === 'counsellor') {
      await login('counsellor@stresspredict.edu', 'Counsellor@12345');
    } else {
      // Try demo student login or register if not existing
      try {
        await login('alex.student@stresspredict.edu', 'Student@12345');
      } catch {
        await register({
          fullName: 'Alex Morgan',
          email: 'alex.student@stresspredict.edu',
          password: 'Student@12345',
          confirmPassword: 'Student@12345',
          course: 'MCA Computer Applications',
          academicYear: 'Year 2',
          age: 22
        });
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, quickLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
