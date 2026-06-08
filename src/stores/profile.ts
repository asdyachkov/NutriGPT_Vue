import { defineStore } from 'pinia'
import { ref } from 'vue'
import { profileApi } from '@/api/profile'
import type { ProfileResponse, UpdateProfileRequest } from '@/types/api'
import { getErrorMessage } from '@/api/client'
import { useNotificationStore } from './notification'

export const useProfileStore = defineStore('profile', () => {
  const profile = ref<ProfileResponse | null>(null)
  const loading = ref(false)
  const error = ref('')

  async function fetchProfile() {
    loading.value = true; error.value = ''
    try {
      const { data } = await profileApi.get()
      profile.value = data
    } catch (e) { error.value = getErrorMessage(e) }
    finally { loading.value = false }
  }

  async function updateProfile(data: UpdateProfileRequest) {
    loading.value = true; error.value = ''
    try {
      const { data: resp } = await profileApi.update(data)
      profile.value = resp
      useNotificationStore().success('Профиль обновлён')
      return resp
    } catch (e) {
      error.value = getErrorMessage(e)
      useNotificationStore().error(error.value)
      throw e
    } finally { loading.value = false }
  }

  return { profile, loading, error, fetchProfile, updateProfile }
})
