import { api } from './api';
import {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  User,
} from '../types/auth';

export const authService = {
  /**
   * Đăng ký tài khoản mới
   */
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', credentials);
    return response.data;
  },

  /**
   * Đăng nhập thông minh bằng username hoặc email
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  /**
   * Lấy thông tin tài khoản đang đăng nhập
   */
  async getProfile(): Promise<{ message: string; user: User }> {
    const response = await api.get<{ message: string; user: User }>('/auth/profile');
    return response.data;
  },

  /**
   * Đăng xuất tài khoản
   */
  async logout(): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>('/auth/logout');
      return response.data;
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('unilearn_access_token');
        localStorage.removeItem('unilearn_refresh_token');
        localStorage.removeItem('unilearn_user');
      }
    }
  },
};
