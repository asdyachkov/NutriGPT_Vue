import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosError } from 'axios'
import type { ErrorResponse } from '@/types/api'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'
const TIMEOUT = 30_000

const client: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
})

// --- Request interceptor: JWT ---
client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('access_token')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// --- Response interceptor: error handling ---
client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ErrorResponse>) => {
    const status = error.response?.status

    if (status === 401) {
      // Попытка обновить токен
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken && !error.config?.url?.includes('/auth/refresh')) {
        try {
          const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          }, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('access_token')}`,
              'Content-Type': 'application/json',
            },
          })
          localStorage.setItem('access_token', data.tokens.access_token)
          localStorage.setItem('refresh_token', data.tokens.refresh_token)
          // Повторяем оригинальный запрос
          if (error.config) {
            error.config.headers.Authorization = `Bearer ${data.tokens.access_token}`
            return client(error.config)
          }
        } catch {
          // Refresh не удался — логаут
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('user')
          window.location.href = '/login'
        }
      } else {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  },
)

export default client

// Хелпер для извлечения сообщения об ошибке
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ErrorResponse | undefined
    return data?.error || data?.details || error.message
  }
  if (error instanceof Error) return error.message
  return 'Неизвестная ошибка'
}
