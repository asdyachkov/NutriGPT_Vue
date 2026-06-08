import client from './client'
import type {
  GenerateMealPlanRequest, GenerateTaskResponse, TaskStatusResponse,
  MealPlanDetailResponse, MealPlanListResponse, MessageResponse,
} from '@/types/api'

export const mealPlanApi = {
  generate: (data: GenerateMealPlanRequest) =>
    client.post<GenerateTaskResponse>('/meal-plans/generate', data),

  getTaskStatus: (taskId: string) =>
    client.get<TaskStatusResponse>(`/meal-plans/tasks/${taskId}`),

  list: (params?: { status?: string; limit?: number; offset?: number }) =>
    client.get<MealPlanListResponse>('/meal-plans', { params }),

  get: (id: string) =>
    client.get<MealPlanDetailResponse>(`/meal-plans/${id}`),

  delete: (id: string) =>
    client.delete<MessageResponse>(`/meal-plans/${id}`),
}
