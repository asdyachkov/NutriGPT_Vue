<template>
  <div class="max-w-5xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-semibold">📖 Рецепты</h1>
      <BaseButton variant="primary" @click="showCreate = true">+ Новый рецепт</BaseButton>
    </div>

    <!-- Фильтры -->
    <BaseCard class="mb-6">
      <div class="flex gap-2 mb-3">
        <button
          class="filter-tab" :class="{ 'filter-tab--active': !filters.only_mine && filters.source === '' }"
          @click="filters.only_mine = false; filters.source = ''; doSearch()"
        >Все рецепты</button>
        <button
          class="filter-tab" :class="{ 'filter-tab--active': filters.only_mine }"
          @click="filters.only_mine = true; filters.source = ''; doSearch()"
        >Мои рецепты</button>
        <button
          class="filter-tab" :class="{ 'filter-tab--active': !filters.only_mine && filters.source === 'gpt' }"
          @click="filters.only_mine = false; filters.source = 'gpt'; doSearch()"
        >AI-рецепты</button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
        <BaseInput v-model="filters.search" placeholder="Поиск по названию..." @input="debouncedSearch" />
        <BaseSelect v-model="filters.meal_type" :options="mealTypeOpts" placeholder="Тип блюда" @update:model-value="doSearch" />
        <BaseSelect v-model="filters.difficulty" :options="difficultyOpts" placeholder="Сложность" @update:model-value="doSearch" />
        <BaseInput v-model="filters.cuisine" placeholder="Кухня..." @input="debouncedSearch" />
      </div>
    </BaseCard>

    <!-- Skeleton loading -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <SkeletonCard v-for="n in 6" :key="n" :show-footer="true" />
    </div>

    <div v-else-if="recipes.length === 0" class="text-center py-20 text-gray-500">
      <p class="text-4xl mb-3">🍽️</p>
      <p>Рецепты не найдены</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <BaseCard v-for="(r, idx) in recipes" :key="r.id" hoverable :class="`stagger-${idx + 1}`" @click="$router.push(`/recipes/${r.id}`)">
        <div class="flex flex-col h-full">
          <LazyImage
            :src="r.image_url"
            :alt="r.title"
            :emoji="mealEmoji[r.meal_type] || '🍽️'"
            aspect="card"
            class="mb-3"
          />
          <h3 class="font-semibold text-base mb-1 line-clamp-2">{{ r.title }}</h3>
          <p class="text-sm text-gray-500 mb-2 line-clamp-2">{{ r.description || 'Без описания' }}</p>
          <div class="mt-auto flex items-center justify-between text-xs text-gray-500">
            <span>{{ Math.round(r.total_calories) }} ккал</span>
            <span>{{ r.cooking_time_min }} мин</span>
            <span v-if="r.estimated_cost" class="text-primary font-semibold">{{ formatPrice(r.estimated_cost) }}</span>
            <span v-else>{{ difficultyLabels[r.difficulty] || r.difficulty }}</span>
          </div>
          <div v-if="!r.is_approved" class="mt-2 flex items-center gap-2">
            <span class="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">Черновик</span>
            <BaseButton v-if="isPrivileged" variant="ghost" size="sm" @click.stop="handleApprove(r.id)">Одобрить</BaseButton>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- Пагинация -->
    <div v-if="totalCount > 12" class="flex justify-center gap-2 mt-6">
      <BaseButton variant="ghost" size="sm" :disabled="offset === 0" @click="changePage(-1)">← Назад</BaseButton>
      <span class="py-2 px-3 text-sm text-gray-500">{{ offset + 1 }}–{{ Math.min(offset + 12, totalCount) }} из {{ totalCount }}</span>
      <BaseButton variant="ghost" size="sm" :disabled="offset + 12 >= totalCount" @click="changePage(1)">Вперёд →</BaseButton>
    </div>

    <!-- Модалка создания -->
    <BaseModal v-model="showCreate" title="Новый рецепт" size="lg" :close-on-overlay="true">
      <form @submit.prevent="handleCreate" class="space-y-4">
        <BaseInput v-model="createForm.title" label="Название" required placeholder="Куриная грудка с овощами" />
        <BaseInput v-model="createForm.description" label="Описание" type="textarea" :rows="2" />
        <BaseInput v-model="createForm.instructions" label="Инструкция" type="textarea" :rows="4" required />
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <BaseInput v-model.number="createForm.cooking_time_min" label="Время (мин)" type="number" />
          <BaseInput v-model.number="createForm.servings" label="Порции" type="number" />
          <BaseSelect v-model="createForm.difficulty" label="Сложность" :options="difficultyOpts" />
          <BaseSelect v-model="createForm.meal_type" label="Тип блюда" :options="mealTypeOpts" />
        </div>
        <BaseInput v-model="createForm.cuisine" label="Кухня" placeholder="русская" />
      </form>
      <template #footer>
        <BaseButton variant="ghost" @click="showCreate = false">Отмена</BaseButton>
        <BaseButton variant="primary" :loading="loading" @click="handleCreate">Создать</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRecipeStore } from '@/stores/recipe'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import SkeletonCard from '@/components/common/SkeletonCard.vue'
import LazyImage from '@/components/common/LazyImage.vue'
import { difficultyLabels, mealTypeLabels, formatPrice } from '@/utils/formatters'
import type { Difficulty, MealType } from '@/types/api'

const recipeStore = useRecipeStore()
const { recipes, totalCount, loading } = storeToRefs(recipeStore)
const { isPrivileged } = storeToRefs(useAuthStore())

const offset = ref(0)
const showCreate = ref(false)
const filters = reactive({ search: '', meal_type: '', difficulty: '', cuisine: '', source: '', only_mine: false })
const createForm = reactive({ title: '', description: '', instructions: '', cooking_time_min: 30, servings: 2, difficulty: '' as string, meal_type: '' as string, cuisine: '' })

const mealTypeOpts = [{ value: '', label: 'Все' }, ...Object.entries(mealTypeLabels).map(([v, l]) => ({ value: v, label: l }))]
const difficultyOpts = [{ value: '', label: 'Все' }, ...Object.entries(difficultyLabels).map(([v, l]) => ({ value: v, label: l }))]
const mealEmoji: Record<string, string> = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎' }

let debounceTimer: ReturnType<typeof setTimeout>
function debouncedSearch() { clearTimeout(debounceTimer); debounceTimer = setTimeout(doSearch, 400) }

function doSearch() {
  offset.value = 0
  recipeStore.search({
    search: filters.search || undefined,
    meal_type: (filters.meal_type as MealType) || undefined,
    difficulty: (filters.difficulty as Difficulty) || undefined,
    cuisine: filters.cuisine || undefined,
    source: (filters.source as any) || undefined,
    only_mine: filters.only_mine || undefined,
    limit: 12, offset: offset.value,
  })
}

function changePage(dir: number) {
  offset.value += dir * 12
  doSearch()
}

async function handleCreate() {
  if (!createForm.title || !createForm.instructions) return
  await recipeStore.createRecipe({
    title: createForm.title, description: createForm.description, instructions: createForm.instructions,
    cooking_time_min: createForm.cooking_time_min, servings: createForm.servings,
    difficulty: (createForm.difficulty as Difficulty) || undefined,
    meal_type: (createForm.meal_type as MealType) || undefined,
    cuisine: createForm.cuisine || undefined,
  })
  showCreate.value = false
  doSearch()
}

async function handleApprove(id: string) { await recipeStore.approveRecipe(id); doSearch() }

onMounted(doSearch)
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.filter-tab {
  padding: 6px 16px;
  border-radius: $radius-full;
  border: 1.5px solid var(--border);
  background: transparent;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all $transition-fast;
  white-space: nowrap;

  &:hover { border-color: var(--primary-light); color: var(--primary); }
  &--active {
    background: rgba(var(--primary-rgb), 0.08);
    border-color: var(--primary);
    color: var(--primary);
    font-weight: $font-weight-semibold;
  }
}
</style>
