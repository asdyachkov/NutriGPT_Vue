<template>
  <div class="max-w-4xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-semibold">🗓️ План питания</h1>
      <BaseButton v-if="!showGenerator" variant="primary" @click="showGenerator = true">+ Новый план</BaseButton>
      <BaseButton v-else variant="ghost" @click="showGenerator = false">← Назад к плану</BaseButton>
    </div>

    <!-- Загрузка -->
    <BaseLoader v-if="loadingPlans && !activePlan && !showGenerator" size="lg" class="py-20" />

    <!-- Активный план (когда генератор скрыт) -->
    <template v-if="activePlan && !showGenerator && !isGenerating">
      <BaseCard class="mb-6 active-plan-hero">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-xl font-semibold">{{ activePlan.title }}</h2>
            <p class="text-sm text-gray-500 mt-1">
              {{ formatDate(activePlan.start_date) }} — {{ formatDate(activePlan.end_date) }}
              · {{ activePlan.day_count }} дн.
              <span v-if="activePlan.total_estimated_cost"> · {{ formatPrice(activePlan.total_estimated_cost) }}</span>
            </p>
          </div>
          <div class="flex gap-2">
            <BaseButton variant="outline" size="sm" @click="$router.push(`/meal-plans/${activePlan.id}`)">Подробнее</BaseButton>
            <BaseButton variant="primary" size="sm" @click="handleCreateShoppingList(activePlan)">🛒 Покупки</BaseButton>
          </div>
        </div>

        <!-- Preview дней -->
        <div v-if="activePlanDetail?.days?.length" class="plan-days-preview">
          <div v-for="day in activePlanDetail.days.slice(0, 3)" :key="day.id" class="day-preview">
            <div class="day-preview__header">
              <span class="font-semibold text-sm">{{ formatDayOfWeek(day.date) }}</span>
              <span class="text-xs text-gray-400">{{ formatDateShort(day.date) }}</span>
            </div>
            <div class="day-preview__meals">
              <div v-for="meal in day.meals" :key="meal.id" class="meal-chip" :title="meal.recipe_title">
                <span class="meal-chip__type">{{ mealEmoji[meal.meal_type] || '🍽️' }}</span>
                <span class="meal-chip__name">{{ meal.recipe_title }}</span>
              </div>
            </div>
          </div>
          <div v-if="activePlanDetail.days.length > 3" class="text-center mt-2">
            <BaseButton variant="ghost" size="sm" @click="$router.push(`/meal-plans/${activePlan.id}`)">
              Показать все {{ activePlanDetail.days.length }} дней →
            </BaseButton>
          </div>
        </div>
      </BaseCard>

      <!-- Быстрые ссылки -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BaseCard hoverable @click="$router.push('/meal-plan/history')">
          <div class="text-center py-4">
            <span class="text-3xl">📋</span>
            <p class="font-medium mt-2">История планов</p>
            <p class="text-sm text-gray-500">Все сгенерированные планы</p>
          </div>
        </BaseCard>
        <BaseCard hoverable @click="showGenerator = true">
          <div class="text-center py-4">
            <span class="text-3xl">🤖</span>
            <p class="font-medium mt-2">Новый план</p>
            <p class="text-sm text-gray-500">Сгенерировать через AI</p>
          </div>
        </BaseCard>
      </div>
    </template>

    <!-- Нет активного плана и генератор не показан -->
    <template v-if="!activePlan && !showGenerator && !isGenerating && !loadingPlans">
      <BaseCard class="mb-6">
        <div class="text-center py-10">
          <span class="text-5xl block mb-4">🍽️</span>
          <h2 class="text-xl font-semibold mb-2">У вас нет активного плана</h2>
          <p class="text-gray-500 mb-4">Сгенерируйте персональный план питания с помощью AI</p>
          <BaseButton variant="primary" size="lg" @click="showGenerator = true">🤖 Создать план</BaseButton>
        </div>
      </BaseCard>
      <BaseCard v-if="plans.length > 0" hoverable @click="$router.push('/meal-plan/history')">
        <div class="text-center py-3">
          <p class="text-sm text-gray-500">У вас {{ plans.length }} архивных планов</p>
          <p class="text-sm text-primary font-medium mt-1">Посмотреть историю →</p>
        </div>
      </BaseCard>
    </template>

    <!-- Форма генерации -->
    <template v-if="showGenerator && !isGenerating">
      <BaseCard class="mb-6">
        <template #header><h3 class="text-lg font-semibold">Параметры нового плана</h3></template>
        <form @submit.prevent="handleGenerate" class="space-y-4">
          <BaseInput v-model="form.title" label="Название (опционально)" placeholder="Мой план на неделю" />
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BaseInput v-model.number="form.days" label="Количество дней" type="number" placeholder="7" />
            <BaseInput v-model.number="form.budget" label="Бюджет (₽, опционально)" type="number" placeholder="5000" />
          </div>

          <!-- Выбор семьи -->
          <BaseSelect
            v-if="families.length > 0"
            v-model="form.family_id"
            label="Для кого?"
            :options="familySelectOptions"
            placeholder="Только для меня"
          />

          <BaseInput v-model="form.special_requests" label="Пожелания" type="textarea" :rows="3" placeholder="Больше овощей, без острого, простые рецепты..." />
          <div class="flex justify-end">
            <BaseButton type="submit" variant="primary" size="lg" :loading="generating">
              🤖 Сгенерировать через AI
            </BaseButton>
          </div>
        </form>
      </BaseCard>
    </template>

    <!-- Индикатор генерации -->
    <BaseCard v-if="isGenerating" class="mb-6">
      <div class="text-center py-8">
        <BaseLoader size="lg" />
        <p class="text-lg font-medium mt-4">AI генерирует ваш план питания...</p>
        <p class="text-sm text-gray-500 mt-2">Статус: {{ taskStatus?.status || 'processing' }}</p>
        <p class="text-xs text-gray-400 mt-1">Обычно это занимает 15–30 секунд</p>
        <BaseButton variant="ghost" class="mt-4" @click="cancelGeneration">Отменить ожидание</BaseButton>
      </div>
    </BaseCard>

    <!-- Ошибка -->
    <BaseCard v-if="taskStatus?.status === 'failed'" class="mb-6 border-l-4 border-red-500">
      <p class="text-red-600 font-medium">Ошибка генерации</p>
      <p class="text-sm text-gray-500 mt-1">{{ taskStatus.error }}</p>
      <BaseButton variant="primary" class="mt-3" @click="isGenerating = false; showGenerator = true">Попробовать снова</BaseButton>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMealPlanStore } from '@/stores/mealPlan'
import { useFamilyStore } from '@/stores/family'
import { useShoppingListStore } from '@/stores/shoppingList'
import { useNotificationStore } from '@/stores/notification'
import { storeToRefs } from 'pinia'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseLoader from '@/components/common/BaseLoader.vue'
import { formatDate, formatDateShort, formatDayOfWeek, formatPrice } from '@/utils/formatters'
import type { MealPlanResponse } from '@/types/api'

const router = useRouter()
const route = useRoute()
const store = useMealPlanStore()
const familyStore = useFamilyStore()
const shoppingStore = useShoppingListStore()
const notif = useNotificationStore()
const { plans, currentPlan: activePlanDetail, taskStatus, generating } = storeToRefs(store)
const { families } = storeToRefs(familyStore)

const loadingPlans = ref(true)
const isGenerating = ref(false)
const showGenerator = ref(false)
const form = reactive({ title: '', days: 7, budget: 0, special_requests: '', family_id: '' })
let pollTimer: ReturnType<typeof setInterval> | null = null

const mealEmoji: Record<string, string> = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎' }

const activePlan = computed<MealPlanResponse | null>(() =>
  plans.value.find(p => p.status === 'active') || null
)

const familySelectOptions = computed(() => [
  { value: '', label: 'Только для меня' },
  ...families.value.map(f => ({ value: f.id, label: `👨‍👩‍👧‍👦 ${f.name} (${f.member_count} чел.)` }))
])

async function handleGenerate() {
  if (form.days < 1 || form.days > 14) { notif.warning('От 1 до 14 дней'); return }
  try {
    const taskId = await store.generate({
      title: form.title || undefined,
      days: form.days,
      budget: form.budget || undefined,
      special_requests: form.special_requests || undefined,
      family_id: form.family_id || undefined,
    })
    isGenerating.value = true
    showGenerator.value = false
    startPolling(taskId)
  } catch { /* handled in store */ }
}

function startPolling(taskId: string) {
  pollTimer = setInterval(async () => {
    const status = await store.pollTaskStatus(taskId)
    if (status.status === 'completed' && status.meal_plan_id) {
      stopPolling()
      isGenerating.value = false
      notif.success('План питания готов!')
      router.push(`/meal-plans/${status.meal_plan_id}`)
    } else if (status.status === 'failed') {
      stopPolling()
    }
  }, 2000)
}

function stopPolling() {
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null }
}

function cancelGeneration() {
  stopPolling()
  isGenerating.value = false
  showGenerator.value = true
}

async function handleCreateShoppingList(plan: MealPlanResponse) {
  try {
    const list = await shoppingStore.createFromPlan({ meal_plan_id: plan.id, title: `Покупки: ${plan.title}` })
    router.push(`/shopping-lists/${list.id}`)
  } catch {
    notif.error('Не удалось создать список покупок')
  }
}

onMounted(async () => {
  loadingPlans.value = true
  await Promise.all([
    store.fetchPlans({ limit: 10 }),
    familyStore.fetchFamilies(),
  ])
  // Подгрузить детали активного плана
  if (activePlan.value) {
    await store.fetchPlan(activePlan.value.id)
  }
  loadingPlans.value = false

  // Если пришли с query ?family_id=... — открываем генератор с выбранной семьёй
  if (route.query.family_id) {
    form.family_id = route.query.family_id as string
    showGenerator.value = true
  }
})

onUnmounted(stopPolling)
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.active-plan-hero {
  border-left: 4px solid var(--primary);
}

.plan-days-preview {
  display: flex;
  flex-direction: column;
  gap: $space-3;
  margin-top: $space-3;
  padding-top: $space-3;
  border-top: 1px solid var(--border);
}

.day-preview {
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $space-2;
  }
  &__meals {
    display: flex;
    gap: $space-2;
    flex-wrap: wrap;
  }
}

.meal-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: var(--bg);
  border-radius: $radius-full;
  font-size: $font-size-xs;
  max-width: 200px;
  overflow: hidden;

  &__type { flex-shrink: 0; }
  &__name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
