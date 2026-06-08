import { defineStore } from 'pinia'
import { ref } from 'vue'
import { mealPlanApi } from '@/api/mealPlan'
import type { MealPlanResponse, MealPlanDetailResponse, GenerateMealPlanRequest, TaskStatusResponse } from '@/types/api'
import { getErrorMessage } from '@/api/client'
import { useNotificationStore } from './notification'

export const useMealPlanStore = defineStore('mealPlan', () => {
  const plans = ref<MealPlanResponse[]>([])
  const totalCount = ref(0)
  const currentPlan = ref<MealPlanDetailResponse | null>(null)
  const taskStatus = ref<TaskStatusResponse | null>(null)
  const loading = ref(false)
  const generating = ref(false)
  const error = ref('')

  const notif = useNotificationStore()

  async function fetchPlans(params?: { status?: string; limit?: number; offset?: number }) {
    loading.value = true; error.value = ''
    try {
      const { data } = await mealPlanApi.list(params)
      plans.value = data.items
      totalCount.value = data.total_count
    } catch (e) { error.value = getErrorMessage(e) }
    finally { loading.value = false }
  }

  async function fetchPlan(id: string) {
    loading.value = true; error.value = ''
    try {
      const { data } = await mealPlanApi.get(id)
      currentPlan.value = data
    } catch (e) { error.value = getErrorMessage(e) }
    finally { loading.value = false }
  }

  async function generate(req: GenerateMealPlanRequest): Promise<string> {
    generating.value = true; error.value = ''
    try {
      const { data } = await mealPlanApi.generate(req)
      taskStatus.value = { task_id: data.task_id, status: 'processing' }
      return data.task_id
    } catch (e) {
      error.value = getErrorMessage(e)
      notif.error(error.value)
      throw e
    } finally { generating.value = false }
  }

  async function pollTaskStatus(taskId: string): Promise<TaskStatusResponse> {
    const { data } = await mealPlanApi.getTaskStatus(taskId)
    taskStatus.value = data
    return data
  }

  async function deletePlan(id: string) {
    try {
      await mealPlanApi.delete(id)
      notif.success('План удалён')
      plans.value = plans.value.filter(p => p.id !== id)
    } catch (e) { notif.error(getErrorMessage(e)) }
  }

  return { plans, totalCount, currentPlan, taskStatus, loading, generating, error, fetchPlans, fetchPlan, generate, pollTaskStatus, deletePlan }
})
