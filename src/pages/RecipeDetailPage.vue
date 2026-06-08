<template>
  <div class="max-w-3xl mx-auto">
    <BaseButton variant="ghost" class="mb-4" @click="$router.push('/recipes')">← К рецептам</BaseButton>

    <BaseLoader v-if="loading && !recipe" size="lg" class="py-20" />

    <template v-else-if="recipe">
      <!-- Hero фото -->
      <LazyImage
        v-if="recipe.image_url"
        :src="recipe.image_url"
        :alt="recipe.title"
        :emoji="mealEmoji[recipe.meal_type] || '🍽️'"
        aspect="hero"
        class="mb-6"
      />

      <!-- Заголовок -->
      <div class="recipe-hero mb-6">
        <div class="flex-1">
          <h1 class="text-2xl font-semibold">{{ recipe.title }}</h1>
          <p v-if="recipe.description" class="text-gray-500 mt-2">{{ recipe.description }}</p>
          <div class="flex flex-wrap gap-3 mt-3">
            <span v-if="recipe.is_ai_generated" class="badge badge--ai">🤖 AI</span>
            <span v-if="!recipe.is_approved" class="badge badge--draft">⏳ Черновик</span>
            <span v-if="recipe.is_approved" class="badge badge--approved">✅ Одобрен</span>
          </div>
        </div>
        <div class="flex gap-2 flex-shrink-0 items-start">
          <BaseButton v-if="isPrivileged && !recipe.is_approved" variant="primary" size="sm" @click="handleApprove">
            ✅ Одобрить
          </BaseButton>
          <BaseButton v-if="canDelete" variant="ghost" size="sm" @click="handleDelete">🗑️</BaseButton>
        </div>
      </div>

      <!-- Метаданные -->
      <div class="meta-row mb-6">
        <div v-if="recipe.cooking_time_min" class="meta-chip">⏱ {{ recipe.cooking_time_min }} мин</div>
        <div v-if="recipe.servings" class="meta-chip">👤 {{ recipe.servings }} порц.</div>
        <div v-if="recipe.difficulty" class="meta-chip">📊 {{ difficultyLabels[recipe.difficulty] }}</div>
        <div v-if="recipe.cuisine" class="meta-chip">🍳 {{ recipe.cuisine }}</div>
        <div v-if="recipe.meal_type" class="meta-chip">🍽 {{ mealTypeLabels[recipe.meal_type] }}</div>
        <div v-if="recipe.estimated_cost" class="meta-chip meta-chip--cost">💰 {{ formatPrice(recipe.estimated_cost) }}</div>
      </div>

      <!-- КБЖУ -->
      <div class="nutrition-grid mb-6">
        <div class="nutrition-card nutrition-card--cal">
          <span class="nutrition-card__value">{{ Math.round(recipe.total_calories) }}</span>
          <span class="nutrition-card__label">ккал</span>
        </div>
        <div class="nutrition-card nutrition-card--prot">
          <span class="nutrition-card__value">{{ recipe.total_protein.toFixed(1) }}г</span>
          <span class="nutrition-card__label">белки</span>
        </div>
        <div class="nutrition-card nutrition-card--fat">
          <span class="nutrition-card__value">{{ recipe.total_fat.toFixed(1) }}г</span>
          <span class="nutrition-card__label">жиры</span>
        </div>
        <div class="nutrition-card nutrition-card--carb">
          <span class="nutrition-card__value">{{ recipe.total_carbs.toFixed(1) }}г</span>
          <span class="nutrition-card__label">углеводы</span>
        </div>
      </div>

      <!-- Ингредиенты -->
      <BaseCard v-if="recipe.ingredients?.length" class="mb-6">
        <template #header>
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold">🥕 Ингредиенты</h3>
            <span v-if="totalCostDisplay > 0" class="text-sm font-semibold text-primary">
              ~{{ formatPrice(totalCostDisplay) }}
            </span>
          </div>
        </template>
        <div class="ingredients-list">
          <div v-for="ing in recipe.ingredients" :key="ing.id" class="ingredient-row">
            <div class="ingredient-row__name">
              <span>{{ ing.ingredient_name }}</span>
              <span v-if="ing.is_optional" class="ingredient-row__optional">(опц.)</span>
            </div>
            <div class="ingredient-row__details">
              <span class="ingredient-row__amount">{{ ing.amount }} {{ ing.unit }}</span>
              <span v-if="ing.calories" class="ingredient-row__kcal">{{ Math.round(ing.calories) }} ккал</span>
              <span v-if="ing.estimated_price" class="ingredient-row__price">{{ formatPrice(ing.estimated_price) }}</span>
            </div>
          </div>
        </div>
      </BaseCard>

      <!-- Инструкция -->
      <BaseCard>
        <template #header><h3 class="text-lg font-semibold">👨‍🍳 Приготовление</h3></template>
        <div class="steps-list">
          <div v-for="(step, idx) in parsedSteps" :key="idx" class="step-item">
            <div class="step-item__number">{{ idx + 1 }}</div>
            <div class="step-item__text">{{ step }}</div>
          </div>
        </div>
      </BaseCard>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRecipeStore } from '@/stores/recipe'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import { useConfirm } from '@/composables/useConfirm'
import { storeToRefs } from 'pinia'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseLoader from '@/components/common/BaseLoader.vue'
import LazyImage from '@/components/common/LazyImage.vue'
import { difficultyLabels, mealTypeLabels, formatPrice } from '@/utils/formatters'

const mealEmoji: Record<string, string> = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎' }

const route = useRoute()
const router = useRouter()
const store = useRecipeStore()
const authStore = useAuthStore()
const notif = useNotificationStore()
const { confirm } = useConfirm()
const { currentRecipe: recipe, loading } = storeToRefs(store)
const { user, isPrivileged } = storeToRefs(authStore)

const canDelete = computed(() => {
  if (!recipe.value) return false
  if (isPrivileged.value) return true
  return recipe.value.user_id === user.value?.id
})

const ingredientsTotalCost = computed(() => {
  if (!recipe.value?.ingredients) return 0
  return recipe.value.ingredients.reduce((sum, ing) => sum + (ing.estimated_price ?? 0), 0)
})

const totalCostDisplay = computed(() => {
  if (recipe.value?.estimated_cost && recipe.value.estimated_cost > 0) return recipe.value.estimated_cost
  if (ingredientsTotalCost.value > 0) return ingredientsTotalCost.value
  return 0
})

const parsedSteps = computed<string[]>(() => {
  if (!recipe.value?.instructions) return []
  const text = recipe.value.instructions
  // Split by "Шаг N:" pattern or by newlines
  const lines = text.split(/\n+/).map(l => l.trim()).filter(Boolean)
  if (lines.length > 1) {
    return lines.map(l => l.replace(/^(?:Шаг\s*\d+\s*[:.\-]\s*)/i, '').trim()).filter(Boolean)
  }
  // Fallback: split by "Шаг N:" within single line
  const steps = text.split(/(?=Шаг\s+\d+)/i).map(s => s.trim()).filter(Boolean)
  return steps.map(s => s.replace(/^(?:Шаг\s*\d+\s*[:.\-]\s*)/i, '').trim()).filter(Boolean)
})

async function handleApprove() {
  if (!recipe.value) return
  await store.approveRecipe(recipe.value.id)
  notif.success('Рецепт одобрен')
}

async function handleDelete() {
  if (!recipe.value) return
  const ok = await confirm({
    title: 'Удалить рецепт?',
    message: `Рецепт «${recipe.value.title}» будет удалён.`,
    variant: 'danger',
    confirmText: 'Удалить',
  })
  if (!ok) return
  await store.deleteRecipe(recipe.value.id)
  router.push('/recipes')
}

onMounted(() => store.fetchRecipe(route.params.id as string))
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.recipe-hero {
  display: flex;
  justify-content: space-between;
  gap: $space-4;
}

.badge {
  font-size: $font-size-xs;
  padding: 3px 10px;
  border-radius: $radius-full;
  font-weight: $font-weight-medium;
  &--ai { background: rgba(#3B82F6, 0.1); color: #3B82F6; }
  &--draft { background: rgba(#F59E0B, 0.1); color: #D97706; }
  &--approved { background: rgba(var(--success-rgb), 0.1); color: var(--success); }
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: $space-2;
}
.meta-chip {
  font-size: $font-size-sm;
  color: var(--text-secondary);
  background: var(--bg);
  padding: $space-1 $space-3;
  border-radius: $radius-full;

  &--cost {
    background: rgba(var(--primary-rgb), 0.08);
    color: var(--primary);
    font-weight: $font-weight-semibold;
  }
}

.nutrition-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $space-3;

  @media (max-width: $breakpoint-sm) { grid-template-columns: repeat(2, 1fr); }
}

.nutrition-card {
  text-align: center;
  padding: $space-4;
  border-radius: $radius-lg;
  transition: transform $transition-fast;
  &:hover { transform: translateY(-2px); }

  &__value { display: block; font-size: $font-size-xl; font-weight: $font-weight-bold; }
  &__label { display: block; font-size: $font-size-xs; color: var(--text-muted); margin-top: 2px; }
  &--cal { background: rgba(var(--primary-rgb), 0.06); .nutrition-card__value { color: var(--primary); } }
  &--prot { background: rgba(#2563EB, 0.06); .nutrition-card__value { color: #2563EB; } }
  &--fat { background: rgba(#D97706, 0.06); .nutrition-card__value { color: #D97706; } }
  &--carb { background: rgba(#EA580C, 0.06); .nutrition-card__value { color: #EA580C; } }
}

.ingredients-list {
  display: flex;
  flex-direction: column;
}

.ingredient-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $space-2 0;
  border-bottom: 1px solid rgba(var(--border-rgb), 0.5);
  &:last-child { border-bottom: none; }

  &__name {
    font-weight: $font-weight-medium;
    display: flex;
    align-items: center;
    gap: $space-2;
  }
  &__optional { font-size: $font-size-xs; color: var(--text-muted); }
  &__details { display: flex; align-items: center; gap: $space-3; }
  &__amount { font-size: $font-size-sm; color: var(--text-secondary); font-weight: $font-weight-medium; }
  &__kcal { font-size: $font-size-xs; color: var(--text-muted); background: var(--bg); padding: 1px 6px; border-radius: $radius-full; }
  &__price { font-size: $font-size-xs; color: var(--primary); font-weight: $font-weight-semibold; background: rgba(var(--primary-rgb), 0.06); padding: 1px 8px; border-radius: $radius-full; }
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.step-item {
  display: flex;
  gap: $space-4;
  align-items: flex-start;

  &__number {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--primary);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: $font-size-sm;
    font-weight: $font-weight-bold;
  }

  &__text {
    flex: 1;
    font-size: $font-size-base;
    color: var(--text);
    line-height: $line-height-relaxed;
    padding-top: 4px;
  }
}
</style>
