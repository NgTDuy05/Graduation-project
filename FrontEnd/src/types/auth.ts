export type UserRole = 'HOC_SINH' | 'GIAO_VIEN' | 'PHU_HUYNH';

export interface UserStats {
  userId: number;
  streakDays: number;
  lastActiveDate?: string | null;
  lightningPoints: number;
  rankTier: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  role: UserRole;
  studentCode?: string | null;
  phoneNumber?: string | null;
  stats?: UserStats | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  fullName: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}
