<template>
  <div class="max-w-4xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-semibold">🛒 Списки покупок</h1>
    </div>

    <div v-if="loading" class="space-y-3">
      <SkeletonCard v-for="n in 3" :key="n" compact />
    </div>

    <div v-else-if="lists.length === 0" class="empty-state">
      <div class="empty-state__icon">🛒</div>
      <h3 class="empty-state__title">Списков покупок пока нет</h3>
      <p class="empty-state__text">Список покупок создаётся автоматически на основе плана питания</p>
      <BaseButton variant="primary" @click="$router.push('/meal-plan')">Сгенерировать план</BaseButton>
    </div>

    <div v-else class="space-y-3">
      <BaseCard v-for="(list, idx) in lists" :key="list.id" hoverable :class="`stagger-${idx + 1}`" @click="$router.push(`/shopping-lists/${list.id}`)">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-semibold">{{ list.title }}</h3>
            <p class="text-sm text-gray-500 mt-1">
              {{ list.purchased_count }}/{{ list.item_count }} позиций
              <span v-if="list.total_estimated_cost"> · {{ formatPrice(list.total_estimated_cost) }}</span>
            </p>
          </div>
          <div class="flex items-center gap-3">
            <!-- Прогресс -->
            <div class="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div class="h-full bg-primary rounded-full transition-all" :style="{ width: `${list.item_count ? (list.purchased_count / list.item_count * 100) : 0}%` }" />
            </div>
            <span class="text-xs px-2 py-1 rounded-full" :class="list.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'">
              {{ list.status === 'completed' ? 'Завершён' : 'Активный' }}
            </span>
            <BaseButton variant="ghost" size="sm" @click.stop="handleDelete(list.id)">🗑</BaseButton>
          </div>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useShoppingListStore } from '@/stores/shoppingList'
import { useConfirm } from '@/composables/useConfirm'
import { storeToRefs } from 'pinia'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import SkeletonCard from '@/components/common/SkeletonCard.vue'
import { formatPrice } from '@/utils/formatters'

const store = useShoppingListStore()
const { lists, loading } = storeToRefs(store)

const { confirm } = useConfirm()

async function handleDelete(id: string) {
  const ok = await confirm({ title: 'Удалить список?', message: 'Это действие нельзя отменить.', variant: 'danger', confirmText: 'Удалить' })
  if (!ok) return
  await store.deleteList(id)
}

onMounted(() => store.fetchLists())
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.empty-state {
  text-align: center;
  padding: $space-10 $space-5;

  &__icon { font-size: 56px; margin-bottom: $space-4; }
  &__title { font-size: $font-size-xl; font-weight: $font-weight-semibold; margin-bottom: $space-2; }
  &__text {
    font-size: $font-size-sm;
    color: var(--text-muted);
    max-width: 360px;
    margin: 0 auto $space-5;
    line-height: $line-height-relaxed;
  }
}
</style>
