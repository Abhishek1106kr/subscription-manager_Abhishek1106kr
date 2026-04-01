import { apiClient } from '@/utils/api-client';

export interface AuthUser {
  username: string;
  role?: string;
  name?: string;
  email?: string;
}

export const authApi = {
  async me(): Promise<{ user: AuthUser }> {
    return apiClient.get('/auth/me');
  },
  async login(username: string, password: string): Promise<{ message: string }> {
    return apiClient.post('/auth/login', { username, password });
  },
  async register(payload: { name: string; email: string; password: string }): Promise<{ message: string, user: AuthUser }> {
    return apiClient.post('/auth/register', payload);
  },
  async logout(): Promise<{ message: string }> {
    return apiClient.post('/auth/logout', {});
  },
  async changePassword(payload: { currentPassword: string; newPassword: string; confirmPassword?: string }): Promise<{ message: string }> {
    return apiClient.post('/auth/change-password', payload);
  },
};

