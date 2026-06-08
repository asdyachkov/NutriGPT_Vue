import client from './client'
import type {
  LoginRequest, RegisterRequest, RefreshRequest,
  ForgotPasswordRequest, ResetPasswordRequest,
  AuthResponse, MessageResponse,
} from '@/types/api'

export const authApi = {
  register: (data: RegisterRequest) =>
    client.post<AuthResponse>('/auth/register', data),

  login: (data: LoginRequest) =>
    client.post<AuthResponse>('/auth/login', data),

  logout: (refreshToken?: string) =>
    client.post<MessageResponse>('/auth/logout', { refresh_token: refreshToken }),

  refresh: (data: RefreshRequest) =>
    client.post<AuthResponse>('/auth/refresh', data),

  forgotPassword: (data: ForgotPasswordRequest) =>
    client.post<MessageResponse>('/auth/forgot-password', data),

  resetPassword: (data: ResetPasswordRequest) =>
    client.post<MessageResponse>('/auth/reset-password', data),
}
