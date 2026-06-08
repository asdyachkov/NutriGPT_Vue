import client from './client'
import type {
  AdminUserSearchParams, AdminUpdateUserRequest,
  AdminUserListResponse, AdminStatsResponse,
  RecipeListResponse, MessageResponse,
} from '@/types/api'

export const adminApi = {
  listUsers: (params?: AdminUserSearchParams) =>
    client.get<AdminUserListResponse>('/admin/users', { params }),

  updateUser: (id: string, data: AdminUpdateUserRequest) =>
    client.patch<MessageResponse>(`/admin/users/${id}`, data),

  getStats: () =>
    client.get<AdminStatsResponse>('/admin/stats'),

  listPendingRecipes: (params?: { limit?: number; offset?: number }) =>
    client.get<RecipeListResponse>('/admin/recipes/pending', { params }),

  approveRecipe: (id: string) =>
    client.post<MessageResponse>(`/admin/recipes/${id}/approve`),
}
