'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  batchNumber?: string;
  designation?: string;
  managerName?: string;
  location?: string;
  department?: string;
  division?: string;
  isActive?: boolean;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  phoneNumber?: string;
  batchNumber?: string;
  designation?: string;
  managerName?: string;
  location?: string;
  department?: string;
  division?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResult {
  success: boolean;
  message?: string;
  data?: {
    user?: User;
    token?: string;
    refreshToken?: string;
    expiresIn?: number;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  register: (data: RegisterData) => Promise<AuthResult>;
  login: (data: LoginData) => Promise<AuthResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Optionally verify token with backend here
      // For now, we'll assume token is valid
      // You can add token verification logic here
    }
    setLoading(false);
  }, []);

  const register = async (data: RegisterData): Promise<AuthResult> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result = await res.json();
      
      if (result.success && result.data && result.data.user) {
        setUser(result.data.user);
        if (result.data.token) {
          localStorage.setItem('token', result.data.token);
        }
      }
      
      return result;
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Registration failed' };
    }
  };

  const login = async (data: LoginData): Promise<AuthResult> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result = await res.json();
      
      if (result.success && result.data && result.data.user) {
        setUser(result.data.user);
        if (result.data.token) {
          localStorage.setItem('token', result.data.token);
        }
      }
      
      return result;
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed due to network error' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};