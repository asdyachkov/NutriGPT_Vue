export interface User {
  id: string
  email: string
  firstName: string
  lastName?: string
  role: 'user' | 'dietitian' | 'admin'
  isActive: boolean
  consentGiven: boolean
  consentDate?: string
  createdAt: string
  updatedAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  firstName: string
  lastName?: string
  email: string
  password: string
  consentGiven: boolean
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}
