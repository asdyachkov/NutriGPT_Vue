<template>
  <div class="max-w-5xl mx-auto">
    <BaseButton variant="ghost" class="mb-4" @click="$router.push('/meal-plan/history')">← К истории</BaseButton>

    <BaseLoader v-if="loading && !plan" size="lg" class="py-20" />

    <template v-else-if="plan">
      <!-- Заголовок -->
      <div class="plan-header mb-6">
        <div>
          <h1 class="text-2xl font-semibold">{{ plan.title }}</h1>
          <p class="text-sm text-gray-500 mt-1">
            {{ formatDate(plan.start_date) }} — {{ formatDate(plan.end_date) }}
            <span v-if="planServings > 1" class="ml-2">· 👥 {{ planServings }} {{ pluralize(planServings, 'человек', 'человека', 'человек') }}</span>
          </p>
        </div>
        <div class="flex items-center gap-3 flex-wrap">
          <div v-if="plan.total_estimated_cost" class="cost-badge-group">
            <span class="cost-badge">💰 {{ formatPrice(plan.total_estimated_cost) }}</span>
            <span v-if="planServings > 1" class="cost-badge cost-badge--per-person">
              ≈{{ formatPrice(plan.total_estimated_cost / planServings) }}/чел
            </span>
          </div>
          <BaseButton variant="ghost" @click="handleExportPdf">📄 Экспорт PDF</BaseButton>
          <BaseButton variant="primary" @click="handleCreateShoppingList">🛒 Список покупок</BaseButton>
        </div>
      </div>

      <!-- Дни плана -->
      <div class="space-y-5">
        <div v-for="(day, idx) in plan.days" :key="day.id" :class="`stagger-${idx + 1}`" class="day-card">
          <!-- Заголовок дня -->
          <div class="day-card__header">
            <div class="day-card__title">
              <span class="day-card__weekday">{{ formatDayOfWeek(day.date) }}</span>
              <span class="day-card__date">{{ formatDateShort(day.date) }}</span>
            </div>
            <!-- Дневные итоги -->
            <div v-if="day.day_calories" class="day-card__macros">
              <span class="macro macro--cal">{{ Math.round(day.day_calories) }} ккал</span>
              <span v-if="day.day_protein" class="macro macro--prot">Б: {{ Math.round(day.day_protein) }}г</span>
              <span v-if="day.day_fat" class="macro macro--fat">Ж: {{ Math.round(day.day_fat) }}г</span>
              <span v-if="day.day_carbs" class="macro macro--carb">У: {{ Math.round(day.day_carbs) }}г</span>
              <span v-if="getDayCost(day) > 0" class="macro macro--cost">
                💰 {{ formatPrice(getDayCost(day)) }}
                <template v-if="planServings > 1"> (≈{{ formatPrice(getDayCost(day) / planServings) }}/чел)</template>
              </span>
            </div>
          </div>

          <!-- Приёмы пищи -->
          <div class="day-card__body">
            <div v-for="mealType in mealTypes" :key="mealType" class="meal-group">
              <p class="meal-group__label">{{ mealTypeLabels[mealType] }}</p>
              <div v-for="meal in getMealsOfType(day, mealType)" :key="meal.id"
                class="meal-item"
                @click="$router.push(`/recipes/${meal.recipe_id}`)"
              >
                <LazyImage
                  v-if="meal.image_url"
                  :src="meal.image_url"
                  :alt="meal.recipe_title"
                  :emoji="mealEmoji[mealType] || '🍽️'"
                  aspect="square"
                  class="meal-item__thumb"
                />
                <div v-else class="meal-item__icon">{{ mealEmoji[mealType] || '🍽️' }}</div>
                <div class="meal-item__info">
                  <p class="meal-item__title">{{ meal.recipe_title }}</p>
                  <div class="meal-item__meta">
                    <span>{{ Math.round(meal.total_calories) }} ккал</span>
                    <span>Б: {{ Math.round(meal.total_protein) }}г</span>
                    <span>Ж: {{ Math.round(meal.total_fat) }}г</span>
                    <span>У: {{ Math.round(meal.total_carbs) }}г</span>
                    <span>⏱ {{ meal.cooking_time_min }} мин</span>
                  </div>
                </div>
                <div v-if="meal.estimated_cost" class="meal-item__cost-group">
                  <span class="meal-item__cost">{{ formatPrice(meal.estimated_cost) }}</span>
                  <span v-if="meal.servings > 1" class="meal-item__cost-per">×{{ meal.servings }}</span>
                </div>
                <span class="meal-item__arrow">→</span>
              </div>
              <p v-if="getMealsOfType(day, mealType).length === 0" class="text-xs text-gray-300 italic pl-2">—</p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMealPlanStore } from '@/stores/mealPlan'
import { useShoppingListStore } from '@/stores/shoppingList'
import { useNotificationStore } from '@/stores/notification'
import { storeToRefs } from 'pinia'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseLoader from '@/components/common/BaseLoader.vue'
import LazyImage from '@/components/common/LazyImage.vue'
import { formatDate, formatDateShort, formatDayOfWeek, formatPrice, mealTypeLabels, pluralize } from '@/utils/formatters'
import { exportMealPlanPdf } from '@/utils/pdf'
import type { MealPlanDayResponse, MealPlanRecipeResponse, MealType } from '@/types/api'

const route = useRoute()
const router = useRouter()
const store = useMealPlanStore()
const shoppingStore = useShoppingListStore()
const notif = useNotificationStore()
const { currentPlan: plan, loading } = storeToRefs(store)

const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']
const mealEmoji: Record<string, string> = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎' }

const planServings = computed(() => {
  if (!plan.value?.days?.length) return 1
  const firstDay = plan.value.days[0]
  if (!firstDay?.meals?.length) return 1
  return Math.max(1, firstDay.meals[0]?.servings || 1)
})

function getMealsOfType(day: MealPlanDayResponse, type: string): MealPlanRecipeResponse[] {
  return (day.meals || []).filter(m => m.meal_type === type).sort((a, b) => a.sort_order - b.sort_order)
}

function getDayCost(day: MealPlanDayResponse): number {
  return (day.meals || []).reduce((sum, m) => sum + (m.estimated_cost ?? 0), 0)
}

async function handleCreateShoppingList() {
  if (!plan.value) return
  try {
    const list = await shoppingStore.createFromPlan({ meal_plan_id: plan.value.id, title: `Покупки: ${plan.value.title}` })
    router.push(`/shopping-lists/${list.id}`)
  } catch {
    notif.error('Не удалось создать список покупок')
  }
}

function handleExportPdf() {
  if (!plan.value) return
  try {
    exportMealPlanPdf(plan.value, planServings.value)
  } catch (err) {
    console.error(err)
    notif.error('Не удалось сформировать PDF')
  }
}

onMounted(() => store.fetchPlan(route.params.id as string))
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: $space-3;
}

.cost-badge-group {
  display: flex;
  align-items: center;
  gap: $space-2;
}

.cost-badge {
  font-size: $font-size-base;
  font-weight: $font-weight-bold;
  color: var(--primary);
  background: rgba(var(--primary-rgb), 0.08);
  padding: $space-1 $space-3;
  border-radius: $radius-full;

  &--per-person {
    font-size: $font-size-xs;
    font-weight: $font-weight-semibold;
    color: var(--text-secondary);
    background: var(--bg-subtle);
  }
}

.day-card {
  background: var(--surface);
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  overflow: hidden;
  transition: box-shadow $transition-base;
  &:hover { box-shadow: $shadow-md; }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $space-4 $space-5;
    background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.04) 0%, rgba(var(--accent-rgb), 0.04) 100%);
    border-bottom: 1px solid var(--border);
    flex-wrap: wrap;
    gap: $space-2;
  }
  &__title { display: flex; align-items: baseline; gap: $space-2; }
  &__weekday { font-size: $font-size-lg; font-weight: $font-weight-semibold; text-transform: capitalize; }
  &__date { font-size: $font-size-sm; color: var(--text-muted); }
  &__macros { display: flex; gap: $space-2; flex-wrap: wrap; }
  &__body { padding: $space-4 $space-5; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: $space-4; }
}

.macro {
  font-size: $font-size-xs;
  font-weight: $font-weight-semibold;
  padding: 2px 8px;
  border-radius: $radius-full;
  &--cal { background: rgba(var(--primary-rgb), 0.1); color: var(--primary); }
  &--prot { background: rgba(#2563EB, 0.1); color: #2563EB; }
  &--fat { background: rgba(#D97706, 0.1); color: #D97706; }
  &--carb { background: rgba(#EA580C, 0.1); color: #EA580C; }
  &--cost { background: rgba(var(--primary-rgb), 0.1); color: var(--primary); }
}

.meal-group {
  &__label {
    font-size: $font-size-xs;
    font-weight: $font-weight-semibold;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: $space-2;
  }
}

.meal-item {
  display: flex;
  align-items: center;
  gap: $space-3;
  padding: $space-3;
  border-radius: $radius-md;
  cursor: pointer;
  transition: all $transition-fast;
  background: var(--bg);
  margin-bottom: $space-2;

  &:hover {
    background: rgba(var(--primary-rgb), 0.04);
    transform: translateX(2px);
  }
  &__icon { font-size: 24px; flex-shrink: 0; }
  &__thumb {
    width: 48px;
    height: 48px;
    flex-shrink: 0;
    border-radius: $radius-sm;
    overflow: hidden;
  }
  &__info { flex: 1; min-width: 0; }
  &__title { font-size: $font-size-sm; font-weight: $font-weight-medium; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  &__meta { display: flex; gap: $space-2; flex-wrap: wrap; font-size: 11px; color: var(--text-muted); margin-top: 2px; }
  &__cost-group {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }
  &__cost {
    font-size: $font-size-xs;
    font-weight: $font-weight-semibold;
    color: var(--primary);
    background: rgba(var(--primary-rgb), 0.06);
    padding: 2px 8px;
    border-radius: $radius-full;
    white-space: nowrap;
  }
  &__cost-per {
    font-size: 10px;
    color: var(--text-muted);
    white-space: nowrap;
  }
  &__arrow { color: var(--text-muted); font-size: $font-size-sm; flex-shrink: 0; }
}

@media (max-width: $breakpoint-md) {
  .day-card__body { grid-template-columns: 1fr; }
}
</style>
