import client from './client'
import type {
  CreateShoppingListRequest, UpdateShoppingListRequest,
  AddShoppingListItemRequest, UpdateShoppingListItemRequest,
  ShoppingListResponse, ShoppingListListResponse,
  ShoppingListItemResponse, MessageResponse,
} from '@/types/api'

export const shoppingListApi = {
  create: (data: CreateShoppingListRequest) =>
    client.post<ShoppingListResponse>('/shopping-lists', data),

  list: (params?: { status?: string; limit?: number; offset?: number }) =>
    client.get<ShoppingListListResponse>('/shopping-lists', { params }),

  get: (id: string) =>
    client.get<ShoppingListResponse>(`/shopping-lists/${id}`),

  update: (id: string, data: UpdateShoppingListRequest) =>
    client.put<ShoppingListResponse>(`/shopping-lists/${id}`, data),

  delete: (id: string) =>
    client.delete<MessageResponse>(`/shopping-lists/${id}`),

  addItem: (listId: string, data: AddShoppingListItemRequest) =>
    client.post<ShoppingListItemResponse>(`/shopping-lists/${listId}/items`, data),

  updateItem: (listId: string, itemId: string, data: UpdateShoppingListItemRequest) =>
    client.put<ShoppingListItemResponse>(`/shopping-lists/${listId}/items/${itemId}`, data),

  deleteItem: (listId: string, itemId: string) =>
    client.delete<MessageResponse>(`/shopping-lists/${listId}/items/${itemId}`),

  markPurchased: (listId: string, itemId: string, purchased = true) =>
    client.patch<MessageResponse>(`/shopping-lists/${listId}/items/${itemId}/purchase`, { is_purchased: purchased }),

  markAllPurchased: (listId: string) =>
    client.patch<MessageResponse>(`/shopping-lists/${listId}/purchase-all`),
}
