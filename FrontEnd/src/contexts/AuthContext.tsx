'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User, UserRole, LoginCredentials, RegisterCredentials, AuthResponse } from '../types/auth';
import { authService } from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (credentials: RegisterCredentials) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  redirectByRole: (role: UserRole) => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  const redirectByRole = useCallback((role: UserRole) => {
    switch (role) {
      case 'HOC_SINH':
        router.push('/student');
        break;
      case 'GIAO_VIEN':
        router.push('/teacher');
        break;
      case 'PHU_HUYNH':
        router.push('/parent');
        break;
      default:
        router.push('/');
    }
  }, [router]);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('unilearn_access_token');
      const storedUser = localStorage.getItem('unilearn_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setAccessToken(storedToken);

          // Đồng bộ lại profile mới nhất từ server
          const { user: freshUser } = await authService.getProfile();
          setUser(freshUser);
          localStorage.setItem('unilearn_user', JSON.stringify(freshUser));
        } catch {
          // Token không còn hợp lệ
          localStorage.removeItem('unilearn_access_token');
          localStorage.removeItem('unilearn_refresh_token');
          localStorage.removeItem('unilearn_user');
          setUser(null);
          setAccessToken(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      localStorage.setItem('unilearn_access_token', response.accessToken);
      localStorage.setItem('unilearn_refresh_token', response.refreshToken);
      localStorage.setItem('unilearn_user', JSON.stringify(response.user));

      setUser(response.user);
      setAccessToken(response.accessToken);

      return response.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const response = await authService.register(credentials);
      localStorage.setItem('unilearn_access_token', response.accessToken);
      localStorage.setItem('unilearn_refresh_token', response.refreshToken);
      localStorage.setItem('unilearn_user', JSON.stringify(response.user));

      setUser(response.user);
      setAccessToken(response.accessToken);

      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Bỏ qua lỗi nếu backend đã hết phiên
    } finally {
      setUser(null);
      setAccessToken(null);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        redirectByRole,
        setUser,
      }}
    >
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
