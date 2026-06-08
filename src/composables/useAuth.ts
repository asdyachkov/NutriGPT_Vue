import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

export function useAuth() {
  const store = useAuthStore()
  const { user, isAuthenticated, isAdmin, isDietitian, isPrivileged } = storeToRefs(store)

  const userName = computed(() => {
    if (!user.value) return 'Гость'
    return [user.value.first_name, user.value.last_name].filter(Boolean).join(' ')
  })

  return {
    user,
    isAuthenticated,
    isAdmin,
    isDietitian,
    isPrivileged,
    userName,
    login: store.login,
    register: store.register,
    logout: store.logout,
  }
}
