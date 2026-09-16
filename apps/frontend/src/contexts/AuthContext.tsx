import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  phone?: string;
  professionalBio?: string;
  specialties?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  login: (email: string, password: string) => Promise<any>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<{ message: string; requiresVerification?: boolean; verificationCode?: string; fallbackCode?: string }>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  resendVerificationCode: (email: string) => Promise<{ message: string; verificationCode?: string; fallbackCode?: string }>;
  forgotPassword: (email: string) => Promise<{ message: string; resetToken?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ message: string }>;
  loginDev: (email?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const response = await api.get('/auth/google/url');
      if (response.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (err) {
      console.error('Erro ao redirecionar para o Google OAuth:', err);
      throw err;
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data?.user) {
        setUser(response.data.user);
      }
      return response.data;
    } catch (err: any) {
      console.error('Erro ao efetuar login:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', { name, email, password, phone });
      return response.data;
    } catch (err) {
      console.error('Erro ao criar conta:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (email: string, code: string) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/verify-email', { email, code });
      if (response.data?.user) {
        setUser(response.data.user);
      }
    } catch (err) {
      console.error('Erro ao verificar e-mail:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationCode = async (email: string) => {
    const response = await api.post('/auth/resend-code', { email });
    return response.data;
  };

  const forgotPassword = async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  };

  const resetPassword = async (token: string, newPassword: string) => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  };

  const loginDev = async (email?: string) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/dev-login', { email });
      setUser(response.data.user);
    } catch (err) {
      console.error('Erro ao efetuar dev login:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Erro ao chamar logout no servidor:', err);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithGoogle,
        login,
        register,
        verifyEmail,
        resendVerificationCode,
        forgotPassword,
        resetPassword,
        loginDev,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
