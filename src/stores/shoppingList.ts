import { defineStore } from 'pinia'
import { ref } from 'vue'
import { shoppingListApi } from '@/api/shoppingList'
import type { ShoppingListResponse, ShoppingListSummaryResponse, CreateShoppingListRequest, AddShoppingListItemRequest, UpdateShoppingListItemRequest } from '@/types/api'
import { getErrorMessage } from '@/api/client'
import { useNotificationStore } from './notification'

export const useShoppingListStore = defineStore('shoppingList', () => {
  const lists = ref<ShoppingListSummaryResponse[]>([])
  const totalCount = ref(0)
  const currentList = ref<ShoppingListResponse | null>(null)
  const loading = ref(false)
  const error = ref('')

  const notif = useNotificationStore()

  async function fetchLists(params?: { status?: string; limit?: number; offset?: number }) {
    loading.value = true; error.value = ''
    try {
      const { data } = await shoppingListApi.list(params)
      lists.value = data.items
      totalCount.value = data.total_count
    } catch (e) { error.value = getErrorMessage(e) }
    finally { loading.value = false }
  }

  async function fetchList(id: string) {
    loading.value = true; error.value = ''
    try {
      const { data } = await shoppingListApi.get(id)
      currentList.value = data
    } catch (e) { error.value = getErrorMessage(e) }
    finally { loading.value = false }
  }

  async function createFromPlan(req: CreateShoppingListRequest): Promise<ShoppingListResponse> {
    loading.value = true
    try {
      const { data } = await shoppingListApi.create(req)
      notif.success('Список покупок создан')
      return data
    } catch (e) { notif.error(getErrorMessage(e)); throw e }
    finally { loading.value = false }
  }

  async function addItem(listId: string, req: AddShoppingListItemRequest) {
    try {
      await shoppingListApi.addItem(listId, req)
      notif.success('Позиция добавлена')
      await fetchList(listId)
    } catch (e) { notif.error(getErrorMessage(e)) }
  }

  async function updateItem(listId: string, itemId: string, req: UpdateShoppingListItemRequest) {
    try {
      await shoppingListApi.updateItem(listId, itemId, req)
      await fetchList(listId)
    } catch (e) { notif.error(getErrorMessage(e)) }
  }

  async function deleteItem(listId: string, itemId: string) {
    try {
      await shoppingListApi.deleteItem(listId, itemId)
      await fetchList(listId)
    } catch (e) { notif.error(getErrorMessage(e)) }
  }

  async function togglePurchased(listId: string, itemId: string, purchased: boolean) {
    try {
      await shoppingListApi.markPurchased(listId, itemId, purchased)
      if (currentList.value) {
        const item = currentList.value.items.find(i => i.id === itemId)
        if (item) {
          item.is_purchased = purchased
          currentList.value.purchased_count += purchased ? 1 : -1
        }
      }
    } catch (e) { notif.error(getErrorMessage(e)) }
  }

  async function markAllPurchased(listId: string) {
    try {
      await shoppingListApi.markAllPurchased(listId)
      notif.success('Все отмечено')
      await fetchList(listId)
    } catch (e) { notif.error(getErrorMessage(e)) }
  }

  async function deleteList(id: string) {
    try {
      await shoppingListApi.delete(id)
      notif.success('Список удалён')
      lists.value = lists.value.filter(l => l.id !== id)
    } catch (e) { notif.error(getErrorMessage(e)) }
  }

  return { lists, totalCount, currentList, loading, error, fetchLists, fetchList, createFromPlan, addItem, updateItem, deleteItem, togglePurchased, markAllPurchased, deleteList }
})
