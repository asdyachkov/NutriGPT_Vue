import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/auth'
import type { UserResponse, LoginRequest, RegisterRequest } from '@/types/api'
import { useNotificationStore } from './notification'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserResponse | null>(null)
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)

  const isAuthenticated = computed(() => !!accessToken.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isDietitian = computed(() => user.value?.role === 'dietitian')
  const isPrivileged = computed(() => isAdmin.value || isDietitian.value)

  // Инициализация из localStorage
  function init() {
    accessToken.value = localStorage.getItem('access_token')
    refreshToken.value = localStorage.getItem('refresh_token')
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try { user.value = JSON.parse(savedUser) } catch { user.value = null }
    }
  }

  function setAuth(u: UserResponse, access: string, refresh: string) {
    user.value = u
    accessToken.value = access
    refreshToken.value = refresh
    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
    localStorage.setItem('user', JSON.stringify(u))
  }

  function clearAuth() {
    user.value = null
    accessToken.value = null
    refreshToken.value = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
  }

  async function login(data: LoginRequest) {
    const { data: resp } = await authApi.login(data)
    setAuth(resp.user, resp.tokens.access_token, resp.tokens.refresh_token)
    useNotificationStore().success('Добро пожаловать!')
    return resp
  }

  async function register(data: RegisterRequest) {
    const { data: resp } = await authApi.register(data)
    setAuth(resp.user, resp.tokens.access_token, resp.tokens.refresh_token)
    useNotificationStore().success('Регистрация успешна!')
    return resp
  }

  async function logout() {
    try {
      await authApi.logout(refreshToken.value || undefined)
    } catch { /* ignore */ }
    clearAuth()
  }

  init()

  return {
    user, accessToken, refreshToken,
    isAuthenticated, isAdmin, isDietitian, isPrivileged,
    login, register, logout, clearAuth, init,
  }
})
