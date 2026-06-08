import { defineStore } from 'pinia'
import { ref } from 'vue'
import { recipeApi } from '@/api/recipe'
import type { RecipeResponse, RecipeDetailResponse, CreateRecipeRequest, RecipeSearchParams } from '@/types/api'
import { getErrorMessage } from '@/api/client'
import { useNotificationStore } from './notification'

export const useRecipeStore = defineStore('recipe', () => {
  const recipes = ref<RecipeResponse[]>([])
  const totalCount = ref(0)
  const currentRecipe = ref<RecipeDetailResponse | null>(null)
  const loading = ref(false)
  const error = ref('')

  const notif = useNotificationStore()

  async function search(params?: RecipeSearchParams) {
    loading.value = true; error.value = ''
    try {
      const { data } = await recipeApi.search(params)
      recipes.value = data.items
      totalCount.value = data.total_count
    } catch (e) { error.value = getErrorMessage(e) }
    finally { loading.value = false }
  }

  async function fetchRecipe(id: string) {
    loading.value = true; error.value = ''
    try {
      const { data } = await recipeApi.get(id)
      currentRecipe.value = data
    } catch (e) { error.value = getErrorMessage(e) }
    finally { loading.value = false }
  }

  async function createRecipe(data: CreateRecipeRequest) {
    loading.value = true
    try {
      const { data: resp } = await recipeApi.create(data)
      notif.success('Рецепт создан')
      return resp
    } catch (e) { notif.error(getErrorMessage(e)); throw e }
    finally { loading.value = false }
  }

  async function approveRecipe(id: string) {
    try {
      await recipeApi.approve(id)
      notif.success('Рецепт одобрен')
      if (currentRecipe.value?.id === id) currentRecipe.value.is_approved = true
    } catch (e) { notif.error(getErrorMessage(e)) }
  }

  async function deleteRecipe(id: string) {
    try {
      await recipeApi.delete(id)
      notif.success('Рецепт удалён')
      recipes.value = recipes.value.filter(r => r.id !== id)
    } catch (e) { notif.error(getErrorMessage(e)) }
  }

  return { recipes, totalCount, currentRecipe, loading, error, search, fetchRecipe, createRecipe, approveRecipe, deleteRecipe }
})
