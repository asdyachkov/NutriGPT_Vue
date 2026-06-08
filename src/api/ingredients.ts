import client from './client'
import type {
  CreateIngredientRequest, UpdateIngredientRequest,
  IngredientResponse, IngredientListResponse, IngredientSearchParams, MessageResponse,
} from '@/types/api'

export const ingredientApi = {
  search: (params?: IngredientSearchParams) =>
    client.get<IngredientListResponse>('/ingredients', { params }),

  get: (id: string) =>
    client.get<IngredientResponse>(`/ingredients/${id}`),

  create: (data: CreateIngredientRequest) =>
    client.post<IngredientResponse>('/ingredients', data),

  update: (id: string, data: UpdateIngredientRequest) =>
    client.put<IngredientResponse>(`/ingredients/${id}`, data),

  delete: (id: string) =>
    client.delete<MessageResponse>(`/ingredients/${id}`),
}
