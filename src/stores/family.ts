import { defineStore } from 'pinia'
import { ref } from 'vue'
import { familyApi } from '@/api/family'
import type { FamilyResponse, FamilyListResponse, CreateFamilyRequest, UpdateFamilyRequest, FamilyMemberResponse } from '@/types/api'
import { getErrorMessage } from '@/api/client'
import { useNotificationStore } from './notification'

export const useFamilyStore = defineStore('family', () => {
  const families = ref<FamilyListResponse[]>([])
  const currentFamily = ref<FamilyResponse | null>(null)
  const loading = ref(false)
  const error = ref('')

  const notif = useNotificationStore()

  async function fetchFamilies() {
    loading.value = true; error.value = ''
    try {
      const { data } = await familyApi.list()
      families.value = data
    } catch (e) { error.value = getErrorMessage(e) }
    finally { loading.value = false }
  }

  async function fetchFamily(id: string) {
    loading.value = true; error.value = ''
    try {
      const { data } = await familyApi.get(id)
      currentFamily.value = data
    } catch (e) { error.value = getErrorMessage(e) }
    finally { loading.value = false }
  }

  async function createFamily(data: CreateFamilyRequest) {
    loading.value = true
    try {
      const { data: resp } = await familyApi.create(data)
      notif.success('Семья создана')
      await fetchFamilies()
      return resp
    } catch (e) { notif.error(getErrorMessage(e)); throw e }
    finally { loading.value = false }
  }

  async function updateFamily(id: string, data: UpdateFamilyRequest) {
    try {
      const { data: resp } = await familyApi.update(id, data)
      currentFamily.value = resp
      notif.success('Семья обновлена')
      return resp
    } catch (e) { notif.error(getErrorMessage(e)); throw e }
  }

  async function deleteFamily(id: string) {
    try {
      await familyApi.delete(id)
      notif.success('Семья удалена')
      currentFamily.value = null
      await fetchFamilies()
    } catch (e) { notif.error(getErrorMessage(e)); throw e }
  }

  async function addMember(familyId: string, email: string): Promise<FamilyMemberResponse> {
    const { data } = await familyApi.addMember(familyId, { email })
    notif.success('Участник добавлен')
    await fetchFamily(familyId)
    return data
  }

  async function removeMember(familyId: string, userId: string) {
    await familyApi.removeMember(familyId, userId)
    notif.success('Участник удалён')
    await fetchFamily(familyId)
  }

  async function leaveFamily(familyId: string) {
    await familyApi.leave(familyId)
    notif.success('Вы покинули семью')
    currentFamily.value = null
    await fetchFamilies()
  }

  async function changeMemberRole(familyId: string, userId: string, role: 'admin' | 'member') {
    await familyApi.updateMemberRole(familyId, userId, { role })
    notif.success('Роль изменена')
    await fetchFamily(familyId)
  }

  return { families, currentFamily, loading, error, fetchFamilies, fetchFamily, createFamily, updateFamily, deleteFamily, addMember, removeMember, leaveFamily, changeMemberRole }
})
