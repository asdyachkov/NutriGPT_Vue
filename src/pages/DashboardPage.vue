<template>
  <div class="dashboard">
    <!-- Hero-секция -->
    <section class="hero">
      <div class="hero__bg-mesh" />
      <div class="hero__content">
        <p class="hero__greeting">Добро пожаловать</p>
        <h1 class="hero__title">
          {{ user?.first_name || 'Друг' }}<span class="hero__wave">👋</span>
        </h1>
        <p class="hero__subtitle">Ваш персональный AI-помощник по питанию</p>
      </div>
      <div v-if="profileData?.nutrition?.target_calories > 0" class="hero__stats">
        <div class="stat-pill stat-pill--cal">
          <span class="stat-pill__value">{{ Math.round(profileData.nutrition.target_calories) }}</span>
          <span class="stat-pill__label">ккал/день</span>
        </div>
        <div class="stat-pill stat-pill--prot">
          <span class="stat-pill__value">{{ profileData.nutrition.target_protein.toFixed(0) }}г</span>
          <span class="stat-pill__label">белки</span>
        </div>
        <div class="stat-pill stat-pill--fat">
          <span class="stat-pill__value">{{ profileData.nutrition.target_fat.toFixed(0) }}г</span>
          <span class="stat-pill__label">жиры</span>
        </div>
        <div class="stat-pill stat-pill--carb">
          <span class="stat-pill__value">{{ profileData.nutrition.target_carbs.toFixed(0) }}г</span>
          <span class="stat-pill__label">углеводы</span>
        </div>
      </div>
      <div v-else class="hero__cta">
        <p class="text-sm text-gray-500">Заполните профиль для расчёта КБЖУ</p>
        <BaseButton variant="primary" size="sm" @click="$router.push('/profile')">Заполнить профиль</BaseButton>
      </div>
    </section>

    <!-- Активный план -->
    <section v-if="activePlan" class="mb-6">
      <div class="section-header">
        <h2 class="section-title">📅 Активный план питания</h2>
        <BaseButton variant="ghost" size="sm" @click="$router.push(`/meal-plans/${activePlan.id}`)">Подробнее →</BaseButton>
      </div>
      <BaseCard hoverable @click="$router.push(`/meal-plans/${activePlan.id}`)">
        <div class="active-plan">
          <div class="active-plan__info">
            <h3 class="font-semibold text-lg">{{ activePlan.title }}</h3>
            <p class="text-sm text-gray-500">
              {{ formatDateShort(activePlan.start_date) }} — {{ formatDateShort(activePlan.end_date) }}
              · {{ activePlan.day_count }} дн.
            </p>
          </div>
          <div class="active-plan__meta">
            <span v-if="activePlan.total_estimated_cost" class="text-sm font-medium text-primary">
              {{ formatPrice(activePlan.total_estimated_cost) }}
            </span>
            <span class="status-badge status-badge--active">Активный</span>
          </div>
        </div>
      </BaseCard>
    </section>

    <!-- Быстрые действия -->
    <section class="mb-6">
      <h2 class="section-title mb-4">⚡ Быстрые действия</h2>
      <div class="actions-grid">
        <div class="action-card action-card--primary" @click="$router.push('/meal-plan')">
          <span class="action-card__icon">🤖</span>
          <div>
            <h3 class="action-card__title">Сгенерировать план</h3>
            <p class="action-card__desc">AI составит план питания на неделю</p>
          </div>
        </div>
        <div class="action-card" @click="$router.push('/recipes')">
          <span class="action-card__icon">📖</span>
          <div>
            <h3 class="action-card__title">Рецепты</h3>
            <p class="action-card__desc">Каталог блюд</p>
          </div>
        </div>
        <div class="action-card" @click="$router.push('/shopping-list')">
          <span class="action-card__icon">🛒</span>
          <div>
            <h3 class="action-card__title">Покупки</h3>
            <p class="action-card__desc">Списки покупок</p>
          </div>
        </div>
        <div class="action-card" @click="$router.push('/families')">
          <span class="action-card__icon">👨‍👩‍👧‍👦</span>
          <div>
            <h3 class="action-card__title">Семья</h3>
            <p class="action-card__desc">Семейные профили</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Последние планы -->
    <section v-if="recentPlans.length > 0">
      <div class="section-header">
        <h2 class="section-title">📋 Последние планы</h2>
        <BaseButton variant="ghost" size="sm" @click="$router.push('/meal-plan/history')">Все планы →</BaseButton>
      </div>
      <div class="space-y-2">
        <BaseCard v-for="p in recentPlans" :key="p.id" hoverable @click="$router.push(`/meal-plans/${p.id}`)">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-medium">{{ p.title }}</h3>
              <p class="text-sm text-gray-500">{{ formatDateShort(p.start_date) }} — {{ formatDateShort(p.end_date) }}</p>
            </div>
            <span class="status-badge" :class="`status-badge--${p.status}`">{{ statusLabels[p.status] || p.status }}</span>
          </div>
        </BaseCard>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useMealPlanStore } from '@/stores/mealPlan'
import { useProfileStore } from '@/stores/profile'
import { storeToRefs } from 'pinia'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { formatDateShort, formatPrice, statusLabels } from '@/utils/formatters'
import type { MealPlanResponse } from '@/types/api'

const { user } = storeToRefs(useAuthStore())
const mealPlanStore = useMealPlanStore()
const profileStore = useProfileStore()
const { plans } = storeToRefs(mealPlanStore)
const { profile: profileData } = storeToRefs(profileStore)

const activePlan = computed<MealPlanResponse | null>(() =>
  plans.value.find(p => p.status === 'active') || null
)

const recentPlans = computed<MealPlanResponse[]>(() =>
  plans.value.filter(p => p.id !== activePlan.value?.id).slice(0, 3)
)

onMounted(async () => {
  await Promise.all([
    profileStore.fetchProfile(),
    mealPlanStore.fetchPlans({ limit: 5 }),
  ])
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.dashboard {
  max-width: 900px;
  margin: 0 auto;
}

// --- Hero ---
.hero {
  background: linear-gradient(135deg, var(--header-bg) 0%, var(--primary-dark) 50%, rgba(var(--primary-rgb), 0.9) 100%);
  border-radius: $radius-xl;
  padding: $space-8 $space-6;
  margin-bottom: $space-7;
  position: relative;
  overflow: hidden;
  color: #fff;

  &__bg-mesh {
    position: absolute;
    inset: 0;
    background-image:
      radial-gradient(ellipse 300px 200px at 80% 20%, rgba(var(--primary-light-rgb), 0.3) 0%, transparent 70%),
      radial-gradient(ellipse 250px 250px at 10% 80%, rgba(var(--accent-rgb), 0.15) 0%, transparent 70%),
      radial-gradient(ellipse 150px 150px at 50% 50%, rgba(255,255,255, 0.04) 0%, transparent 60%);
    animation: heroMesh 12s ease-in-out infinite alternate;
    pointer-events: none;
  }

  &__content { position: relative; z-index: 1; margin-bottom: $space-5; }
  &__greeting {
    font-size: $font-size-xs;
    font-weight: $font-weight-semibold;
    text-transform: uppercase;
    letter-spacing: $letter-spacing-wider;
    color: rgba(255,255,255,0.5);
    margin-bottom: $space-1;
  }
  &__title {
    font-size: $font-size-3xl;
    font-weight: $font-weight-extrabold;
    color: #fff;
    display: flex;
    align-items: center;
    gap: $space-2;
    letter-spacing: $letter-spacing-tight;
  }
  &__wave {
    display: inline-block;
    animation: wave 1.5s ease-in-out infinite;
    transform-origin: 70% 70%;
  }
  &__subtitle {
    font-size: $font-size-base;
    color: rgba(255,255,255,0.6);
    margin-top: $space-1;
  }
  &__stats {
    display: flex;
    gap: $space-3;
    flex-wrap: wrap;
    position: relative;
    z-index: 1;
  }
  &__cta {
    display: flex;
    align-items: center;
    gap: $space-3;
    position: relative;
    z-index: 1;
    p { color: rgba(255,255,255,0.5); }
  }
}

@keyframes heroMesh {
  0% { opacity: 1; transform: scale(1); }
  100% { opacity: 0.7; transform: scale(1.05); }
}

@keyframes wave {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(20deg); }
  75% { transform: rotate(-10deg); }
}

.stat-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $space-3 $space-5;
  border-radius: $radius-lg;
  background: rgba(255,255,255, 0.1);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255, 0.1);
  min-width: 85px;
  transition: all $transition-base;

  &:hover { background: rgba(255,255,255,0.15); transform: translateY(-2px); }

  &__value { font-size: $font-size-lg; font-weight: $font-weight-bold; color: #fff; }
  &__label { font-size: $font-size-xs; color: rgba(255,255,255,0.5); }
  &--cal &__value { color: #A7F3D0; }
  &--prot &__value { color: #93C5FD; }
  &--fat &__value { color: #FCD34D; }
  &--carb &__value { color: #FCA5A5; }
}

// --- Section ---
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $space-3;
}
.section-title {
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
}

// --- Active plan ---
.active-plan {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: $space-4;

  &__meta {
    display: flex;
    align-items: center;
    gap: $space-3;
    flex-shrink: 0;
  }
}

.status-badge {
  font-size: $font-size-xs;
  padding: 2px 10px;
  border-radius: $radius-full;
  font-weight: $font-weight-medium;

  &--active { background: rgba(var(--success-rgb), 0.1); color: var(--success); }
  &--completed { background: rgba(var(--info-rgb), 0.1); color: var(--info); }
  &--draft { background: rgba(var(--warning-rgb), 0.1); color: var(--warning); }
  &--archived { background: var(--bg); color: var(--text-muted); }
}

// --- Actions ---
.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $space-3;

  @media (min-width: $breakpoint-md) {
    grid-template-columns: repeat(4, 1fr);
  }
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: $space-2;
  padding: $space-5 $space-3;
  background: var(--surface);
  border-radius: $radius-xl;
  border: 1px solid var(--border);
  cursor: pointer;
  transition: all $transition-base;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(var(--primary-rgb), 0) 0%, rgba(var(--primary-rgb), 0.03) 100%);
    opacity: 0;
    transition: opacity $transition-base;
  }
  &:hover {
    border-color: rgba(var(--primary-rgb), 0.3);
    box-shadow: $shadow-lg, $shadow-glow-primary;
    transform: translateY(-4px);
    &::after { opacity: 1; }
  }

  &--primary {
    background: linear-gradient(135deg, var(--primary-dark), var(--primary));
    border-color: transparent;
    color: white;
    box-shadow: 0 8px 24px rgba(var(--primary-rgb), 0.25);

    .action-card__title { color: white; }
    .action-card__desc { color: rgba(255, 255, 255, 0.7); }
    &:hover { box-shadow: 0 12px 32px rgba(var(--primary-rgb), 0.35); }
  }

  &__icon { font-size: 32px; position: relative; z-index: 1; }
  &__title { font-size: $font-size-sm; font-weight: $font-weight-semibold; color: var(--text); position: relative; z-index: 1; }
  &__desc { font-size: $font-size-xs; color: var(--text-muted); position: relative; z-index: 1; }
}


</style>
