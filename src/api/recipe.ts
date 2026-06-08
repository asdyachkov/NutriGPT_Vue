import client from './client'
import type {
  CreateRecipeRequest, UpdateRecipeRequest,
  RecipeDetailResponse, RecipeListResponse, RecipeSearchParams, MessageResponse,
} from '@/types/api'

export const recipeApi = {
  search: (params?: RecipeSearchParams) =>
    client.get<RecipeListResponse>('/recipes', { params }),

  get: (id: string) =>
    client.get<RecipeDetailResponse>(`/recipes/${id}`),

  create: (data: CreateRecipeRequest) =>
    client.post<RecipeDetailResponse>('/recipes', data),

  update: (id: string, data: UpdateRecipeRequest) =>
    client.put<RecipeDetailResponse>(`/recipes/${id}`, data),

  delete: (id: string) =>
    client.delete<MessageResponse>(`/recipes/${id}`),

  approve: (id: string) =>
    client.patch<MessageResponse>(`/recipes/${id}/approve`),
}
