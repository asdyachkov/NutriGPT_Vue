<template>
  <div class="max-w-5xl mx-auto">
    <h1 class="text-2xl font-semibold mb-6">⚙️ Администрирование</h1>

    <!-- Вкладки -->
    <div class="tabs mb-6">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab"
        :class="{ 'tab--active': activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        <span class="tab__icon">{{ tab.icon }}</span>
        {{ tab.label }}
      </button>
    </div>

    <!-- Статистика -->
    <template v-if="activeTab === 'stats'">
      <BaseLoader v-if="statsLoading" size="lg" class="py-12" />
      <div v-else-if="stats" class="stats-grid">
        <div class="stat-card">
          <span class="stat-card__icon">👥</span>
          <span class="stat-card__value">{{ stats.total_users }}</span>
          <span class="stat-card__label">Пользователей</span>
        </div>
        <div class="stat-card">
          <span class="stat-card__icon">📖</span>
          <span class="stat-card__value">{{ stats.total_recipes }}</span>
          <span class="stat-card__label">Рецептов</span>
        </div>
        <div class="stat-card">
          <span class="stat-card__icon">✅</span>
          <span class="stat-card__value">{{ stats.approved_recipes }}</span>
          <span class="stat-card__label">Одобренных</span>
        </div>
        <div class="stat-card">
          <span class="stat-card__icon">⏳</span>
          <span class="stat-card__value">{{ stats.pending_recipes }}</span>
          <span class="stat-card__label">На модерации</span>
        </div>
        <div class="stat-card">
          <span class="stat-card__icon">📅</span>
          <span class="stat-card__value">{{ stats.total_meal_plans }}</span>
          <span class="stat-card__label">Планов</span>
        </div>
        <div class="stat-card">
          <span class="stat-card__icon">🥕</span>
          <span class="stat-card__value">{{ stats.total_ingredients }}</span>
          <span class="stat-card__label">Ингредиентов</span>
        </div>
      </div>
    </template>

    <!-- Пользователи -->
    <template v-if="activeTab === 'users'">
      <BaseCard class="mb-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <BaseInput v-model="userSearch" placeholder="Поиск по email или имени..." @input="debouncedUserSearch" />
          <BaseSelect v-model="userRoleFilter" :options="roleFilterOptions" placeholder="Все роли" @update:model-value="loadUsers" />
        </div>
      </BaseCard>

      <BaseLoader v-if="usersLoading" size="lg" class="py-12" />
      <div v-else class="space-y-2">
        <BaseCard v-for="u in users" :key="u.id" bordered>
          <div class="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p class="font-medium">{{ u.first_name }} {{ u.last_name }}</p>
              <p class="text-sm text-gray-500">{{ u.email }}</p>
              <p class="text-xs text-gray-400">Регистрация: {{ formatDateShort(u.created_at) }}</p>
            </div>
            <div class="flex items-center gap-3">
              <BaseSelect
                :model-value="u.role"
                :options="roleOptions"
                @update:model-value="(val: string) => handleChangeRole(u.id, val)"
              />
              <button
                class="toggle-active"
                :class="{ 'toggle-active--on': u.is_active }"
                :title="u.is_active ? 'Заблокировать' : 'Разблокировать'"
                @click="handleToggleActive(u.id, !u.is_active)"
              >
                {{ u.is_active ? '🟢' : '🔴' }}
              </button>
            </div>
          </div>
        </BaseCard>
        <p v-if="users.length === 0" class="text-center py-12 text-gray-400">Пользователи не найдены</p>
      </div>
      <div v-if="usersTotalCount > 20" class="flex justify-center gap-2 mt-4">
        <BaseButton variant="ghost" size="sm" :disabled="usersOffset === 0" @click="usersOffset -= 20; loadUsers()">← Назад</BaseButton>
        <BaseButton variant="ghost" size="sm" :disabled="usersOffset + 20 >= usersTotalCount" @click="usersOffset += 20; loadUsers()">Вперёд →</BaseButton>
      </div>
    </template>

    <!-- Модерация рецептов -->
    <template v-if="activeTab === 'recipes'">
      <BaseLoader v-if="recipesLoading" size="lg" class="py-12" />
      <div v-else class="space-y-3">
        <BaseCard v-for="r in pendingRecipes" :key="r.id" bordered>
          <div class="flex items-center justify-between flex-wrap gap-3">
            <div class="flex-1 min-w-0">
              <h3 class="font-medium truncate">{{ r.title }}</h3>
              <p class="text-sm text-gray-500">
                {{ Math.round(r.total_calories) }} ккал · {{ r.cooking_time_min }} мин
                · {{ difficultyLabels[r.difficulty] || r.difficulty }}
                <span v-if="r.is_ai_generated" class="text-blue-500 ml-1">AI</span>
              </p>
            </div>
            <div class="flex gap-2">
              <BaseButton variant="ghost" size="sm" @click="$router.push(`/recipes/${r.id}`)">Просмотр</BaseButton>
              <BaseButton variant="primary" size="sm" @click="handleApprove(r.id)">✅ Одобрить</BaseButton>
            </div>
          </div>
        </BaseCard>
        <p v-if="pendingRecipes.length === 0" class="text-center py-12 text-gray-400">Нет рецептов на модерации</p>
      </div>
    </template>

    <!-- Ингредиенты -->
    <template v-if="activeTab === 'ingredients'">
      <div class="flex justify-between items-center mb-4">
        <BaseInput v-model="ingredientSearch" placeholder="Поиск ингредиентов..." @input="debouncedIngredientSearch" class="flex-1 mr-3" />
        <BaseButton variant="primary" @click="showIngredientForm = true">+ Добавить</BaseButton>
      </div>

      <BaseLoader v-if="ingredientsLoading" size="lg" class="py-12" />
      <div v-else class="space-y-2">
        <BaseCard v-for="ing in ingredients" :key="ing.id" bordered>
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p class="font-medium">{{ ing.name }}</p>
              <p class="text-xs text-gray-500">
                {{ categoryLabels[ing.category] || ing.category }}
                · {{ ing.calories_per_100g }} ккал/100г
                · Б: {{ ing.protein_per_100g }}г Ж: {{ ing.fat_per_100g }}г У: {{ ing.carbs_per_100g }}г
                <span v-if="ing.avg_price_per_unit"> · {{ formatPrice(ing.avg_price_per_unit) }}/{{ ing.default_unit }}</span>
              </p>
            </div>
            <div class="flex gap-2">
              <BaseButton variant="ghost" size="sm" @click="editIngredient(ing)">✏️</BaseButton>
              <BaseButton variant="ghost" size="sm" @click="handleDeleteIngredient(ing.id)">🗑️</BaseButton>
            </div>
          </div>
        </BaseCard>
        <p v-if="ingredients.length === 0" class="text-center py-12 text-gray-400">Ингредиенты не найдены</p>
      </div>

      <!-- Модалка создания/редактирования ингредиента -->
      <BaseModal v-model="showIngredientForm" :title="editingIngredient ? 'Редактировать ингредиент' : 'Новый ингредиент'" size="lg" :close-on-overlay="true">
        <form @submit.prevent="handleSaveIngredient" class="space-y-3">
          <BaseInput v-model="ingForm.name" label="Название" required placeholder="Куриная грудка" />
          <BaseSelect v-model="ingForm.category" label="Категория" :options="categoryOptions" />
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <BaseInput v-model.number="ingForm.calories_per_100g" label="Ккал/100г" type="number" />
            <BaseInput v-model.number="ingForm.protein_per_100g" label="Белки/100г" type="number" />
            <BaseInput v-model.number="ingForm.fat_per_100g" label="Жиры/100г" type="number" />
            <BaseInput v-model.number="ingForm.carbs_per_100g" label="Углев./100г" type="number" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <BaseInput v-model="ingForm.default_unit" label="Единица" placeholder="г" />
            <BaseInput v-model.number="ingForm.avg_price_per_unit" label="Ср. цена за ед." type="number" />
          </div>
        </form>
        <template #footer>
          <BaseButton variant="ghost" @click="showIngredientForm = false">Отмена</BaseButton>
          <BaseButton variant="primary" @click="handleSaveIngredient">{{ editingIngredient ? 'Сохранить' : 'Создать' }}</BaseButton>
        </template>
      </BaseModal>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { adminApi } from '@/api/admin'
import { ingredientApi } from '@/api/ingredients'
import { useNotificationStore } from '@/stores/notification'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { getErrorMessage } from '@/api/client'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseLoader from '@/components/common/BaseLoader.vue'
import { formatDateShort, formatPrice, difficultyLabels, categoryLabels } from '@/utils/formatters'
import type { AdminUserResponse, AdminStatsResponse, RecipeResponse, IngredientResponse } from '@/types/api'

const notif = useNotificationStore()
const { isAdmin } = storeToRefs(useAuthStore())

const tabs = [
  { key: 'stats', icon: '📊', label: 'Статистика' },
  { key: 'recipes', icon: '📝', label: 'Модерация' },
  { key: 'ingredients', icon: '🥕', label: 'Ингредиенты' },
  ...(isAdmin.value ? [{ key: 'users', icon: '👥', label: 'Пользователи' }] : []),
]
const activeTab = ref('stats')

// --- Stats ---
const stats = ref<AdminStatsResponse | null>(null)
const statsLoading = ref(false)

// --- Users ---
const users = ref<AdminUserResponse[]>([])
const usersLoading = ref(false)
const usersTotalCount = ref(0)
const usersOffset = ref(0)
const userSearch = ref('')
const userRoleFilter = ref('')
const roleFilterOptions = [
  { value: '', label: 'Все роли' },
  { value: 'user', label: 'Пользователь' },
  { value: 'dietitian', label: 'Диетолог' },
  { value: 'admin', label: 'Администратор' },
]
const roleOptions = [
  { value: 'user', label: 'Пользователь' },
  { value: 'dietitian', label: 'Диетолог' },
  { value: 'admin', label: 'Администратор' },
]

// --- Recipes moderation ---
const pendingRecipes = ref<RecipeResponse[]>([])
const recipesLoading = ref(false)

// --- Ingredients ---
const ingredients = ref<IngredientResponse[]>([])
const ingredientsLoading = ref(false)
const ingredientSearch = ref('')
const showIngredientForm = ref(false)
const editingIngredient = ref<IngredientResponse | null>(null)
const ingForm = reactive({
  name: '', category: 'other', calories_per_100g: null as number | null, protein_per_100g: null as number | null,
  fat_per_100g: null as number | null, carbs_per_100g: null as number | null, default_unit: 'г', avg_price_per_unit: null as number | null,
})
const categoryOptions = Object.entries(categoryLabels).map(([v, l]) => ({ value: v, label: l }))

// --- Debounce ---
let userDebounce: ReturnType<typeof setTimeout>
function debouncedUserSearch() { clearTimeout(userDebounce); userDebounce = setTimeout(loadUsers, 400) }
let ingDebounce: ReturnType<typeof setTimeout>
function debouncedIngredientSearch() { clearTimeout(ingDebounce); ingDebounce = setTimeout(loadIngredients, 400) }

// --- Loaders ---
async function loadStats() {
  statsLoading.value = true
  try {
    const { data } = await adminApi.getStats()
    stats.value = data
  } catch (e) { notif.error(getErrorMessage(e)) }
  finally { statsLoading.value = false }
}

async function loadUsers() {
  usersLoading.value = true
  try {
    const { data } = await adminApi.listUsers({
      search: userSearch.value || undefined,
      role: (userRoleFilter.value as any) || undefined,
      limit: 20, offset: usersOffset.value,
    })
    users.value = data.items
    usersTotalCount.value = data.total_count
  } catch (e) { notif.error(getErrorMessage(e)) }
  finally { usersLoading.value = false }
}

async function loadPendingRecipes() {
  recipesLoading.value = true
  try {
    const { data } = await adminApi.listPendingRecipes({ limit: 20 })
    pendingRecipes.value = data.items
  } catch (e) { notif.error(getErrorMessage(e)) }
  finally { recipesLoading.value = false }
}

async function loadIngredients() {
  ingredientsLoading.value = true
  try {
    const { data } = await ingredientApi.search({
      search: ingredientSearch.value || undefined, limit: 30,
    })
    ingredients.value = data.items
  } catch (e) { notif.error(getErrorMessage(e)) }
  finally { ingredientsLoading.value = false }
}

// --- Actions ---
async function handleChangeRole(userId: string, role: string) {
  try {
    await adminApi.updateUser(userId, { role: role as any })
    notif.success('Роль обновлена')
    const u = users.value.find(u => u.id === userId)
    if (u) u.role = role
  } catch (e) { notif.error(getErrorMessage(e)) }
}

async function handleToggleActive(userId: string, active: boolean) {
  try {
    await adminApi.updateUser(userId, { is_active: active })
    notif.success(active ? 'Пользователь разблокирован' : 'Пользователь заблокирован')
    const u = users.value.find(u => u.id === userId)
    if (u) u.is_active = active
  } catch (e) { notif.error(getErrorMessage(e)) }
}

async function handleApprove(recipeId: string) {
  try {
    await adminApi.approveRecipe(recipeId)
    notif.success('Рецепт одобрен')
    pendingRecipes.value = pendingRecipes.value.filter(r => r.id !== recipeId)
    if (stats.value) {
      stats.value.approved_recipes++
      stats.value.pending_recipes--
    }
  } catch (e) { notif.error(getErrorMessage(e)) }
}

function editIngredient(ing: IngredientResponse) {
  editingIngredient.value = ing
  ingForm.name = ing.name
  ingForm.category = ing.category
  ingForm.calories_per_100g = ing.calories_per_100g || null
  ingForm.protein_per_100g = ing.protein_per_100g || null
  ingForm.fat_per_100g = ing.fat_per_100g || null
  ingForm.carbs_per_100g = ing.carbs_per_100g || null
  ingForm.default_unit = ing.default_unit || 'г'
  ingForm.avg_price_per_unit = ing.avg_price_per_unit || null
  showIngredientForm.value = true
}

async function handleSaveIngredient() {
  if (!ingForm.name) return
  try {
    const data = {
      name: ingForm.name,
      category: ingForm.category as any,
      calories_per_100g: ingForm.calories_per_100g ?? 0,
      protein_per_100g: ingForm.protein_per_100g ?? 0,
      fat_per_100g: ingForm.fat_per_100g ?? 0,
      carbs_per_100g: ingForm.carbs_per_100g ?? 0,
      default_unit: ingForm.default_unit,
      avg_price_per_unit: ingForm.avg_price_per_unit ?? undefined,
      is_allergen: false,
    }
    if (editingIngredient.value) {
      await ingredientApi.update(editingIngredient.value.id, data)
      notif.success('Ингредиент обновлён')
    } else {
      await ingredientApi.create(data)
      notif.success('Ингредиент создан')
    }
    showIngredientForm.value = false
    editingIngredient.value = null
    loadIngredients()
  } catch (e) { notif.error(getErrorMessage(e)) }
}

async function handleDeleteIngredient(id: string) {
  if (!confirm('Удалить ингредиент?')) return
  try {
    await ingredientApi.delete(id)
    notif.success('Ингредиент удалён')
    ingredients.value = ingredients.value.filter(i => i.id !== id)
  } catch (e) { notif.error(getErrorMessage(e)) }
}

watch(showIngredientForm, (v) => {
  if (!v) {
    editingIngredient.value = null
    Object.assign(ingForm, { name: '', category: 'other', calories_per_100g: null, protein_per_100g: null, fat_per_100g: null, carbs_per_100g: null, default_unit: 'г', avg_price_per_unit: null })
  }
})

// --- Tab change ---
watch(activeTab, (tab) => {
  if (tab === 'stats' && !stats.value) loadStats()
  if (tab === 'users' && users.value.length === 0) loadUsers()
  if (tab === 'recipes' && pendingRecipes.value.length === 0) loadPendingRecipes()
  if (tab === 'ingredients' && ingredients.value.length === 0) loadIngredients()
})

onMounted(loadStats)
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.tabs {
  display: flex;
  gap: 2px;
  background: var(--bg);
  border-radius: $radius-md;
  padding: 4px;
  overflow-x: auto;
}

.tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $space-2;
  padding: $space-2 $space-4;
  border-radius: $radius-sm;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: var(--text-secondary);
  transition: all $transition-fast;
  white-space: nowrap;

  &:hover { background: var(--surface); color: var(--text); }
  &--active {
    background: var(--surface);
    color: var(--primary);
    box-shadow: $shadow-sm;
    font-weight: $font-weight-semibold;
  }
  &__icon { font-size: 16px; }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $space-4;

  @media (min-width: $breakpoint-md) {
    grid-template-columns: repeat(3, 1fr);
  }
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-1;
  padding: $space-6 $space-4;
  background: var(--surface);
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  transition: all $transition-base;

  &:hover { box-shadow: $shadow-md; transform: translateY(-2px); }
  &__icon { font-size: 28px; }
  &__value { font-size: $font-size-2xl; font-weight: $font-weight-bold; color: var(--primary); }
  &__label { font-size: $font-size-sm; color: var(--text-muted); }
}

.toggle-active {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  border-radius: $radius-full;
  transition: all $transition-fast;

  &:hover { background: var(--bg); }
}
</style>
