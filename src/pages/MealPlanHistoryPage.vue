<template>
  <div class="max-w-4xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-semibold">📋 История планов</h1>
      <BaseButton variant="primary" @click="$router.push('/meal-plan')">+ Новый план</BaseButton>
    </div>

    <!-- Skeleton -->
    <div v-if="loading" class="space-y-3">
      <SkeletonCard v-for="n in 4" :key="n" compact />
    </div>

    <div v-else-if="plans.length === 0" class="text-center py-20 text-gray-500">
      <p class="text-4xl mb-3">📋</p>
      <p>Планы ещё не создавались</p>
      <BaseButton variant="primary" class="mt-4" @click="$router.push('/meal-plan')">Сгенерировать первый план</BaseButton>
    </div>

    <div v-else class="space-y-3">
      <BaseCard v-for="p in plans" :key="p.id" hoverable @click="$router.push(`/meal-plans/${p.id}`)">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-semibold">{{ p.title }}</h3>
            <p class="text-sm text-gray-500 mt-1">
              {{ formatDateShort(p.start_date) }} — {{ formatDateShort(p.end_date) }} · {{ p.day_count }} дн.
            </p>
          </div>
          <div class="flex items-center gap-3">
            <span v-if="p.total_estimated_cost" class="text-sm text-gray-500">{{ formatPrice(p.total_estimated_cost) }}</span>
            <span class="text-xs px-2 py-1 rounded-full" :class="statusClass(p.status)">{{ statusLabel(p.status) }}</span>
            <BaseButton variant="ghost" size="sm" @click.stop="handleDelete(p.id)">🗑</BaseButton>
          </div>
        </div>
      </BaseCard>
    </div>

    <div v-if="totalCount > 10" class="flex justify-center gap-2 mt-6">
      <BaseButton variant="ghost" size="sm" :disabled="offset === 0" @click="offset -= 10; load()">← Назад</BaseButton>
      <BaseButton variant="ghost" size="sm" :disabled="offset + 10 >= totalCount" @click="offset += 10; load()">Вперёд →</BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMealPlanStore } from '@/stores/mealPlan'
import { useConfirm } from '@/composables/useConfirm'
import { storeToRefs } from 'pinia'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import SkeletonCard from '@/components/common/SkeletonCard.vue'
import { formatDateShort, formatPrice } from '@/utils/formatters'

const store = useMealPlanStore()
const { plans, totalCount, loading } = storeToRefs(store)
const offset = ref(0)

function load() { store.fetchPlans({ limit: 10, offset: offset.value }) }
function statusLabel(s: string) { return ({ draft: 'Черновик', active: 'Активный', completed: 'Завершён', archived: 'Архив' })[s] || s }
function statusClass(s: string) { return ({ active: 'bg-green-100 text-green-700', completed: 'bg-blue-100 text-blue-700', archived: 'bg-gray-100 text-gray-500' })[s] || 'bg-gray-100 text-gray-600' }

const { confirm } = useConfirm()

async function handleDelete(id: string) {
  const ok = await confirm({ title: 'Удалить план?', message: 'Это действие нельзя отменить.', variant: 'danger', confirmText: 'Удалить' })
  if (!ok) return
  await store.deletePlan(id)
}

onMounted(load)
</script>
