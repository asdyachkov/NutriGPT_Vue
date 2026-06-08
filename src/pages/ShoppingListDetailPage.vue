<template>
  <div class="max-w-3xl mx-auto">
    <BaseButton variant="ghost" class="mb-4" @click="$router.push('/shopping-list')">← К спискам</BaseButton>

    <BaseLoader v-if="loading && !list" size="lg" class="py-20" />

    <template v-else-if="list">
      <!-- Header -->
      <div class="list-header mb-6">
        <div>
          <h1 class="text-2xl font-semibold">{{ list.title }}</h1>
          <div class="list-header__meta">
            <span>{{ list.purchased_count }}/{{ list.item_count }} куплено</span>
            <span v-if="list.total_estimated_cost" class="list-header__cost">~{{ formatPrice(list.total_estimated_cost) }}</span>
          </div>
        </div>
        <div class="list-header__actions">
          <BaseButton variant="ghost" size="sm" @click="cycleSortMode">{{ sortIcon }} {{ sortLabel }}</BaseButton>
          <BaseButton variant="ghost" size="sm" @click="exportToText">📄 Экспорт</BaseButton>
          <BaseButton variant="outline" size="sm" @click="showAddItem = true">+ Добавить</BaseButton>
          <BaseButton variant="primary" size="sm" @click="handleMarkAll">✓ Всё куплено</BaseButton>
        </div>
      </div>

      <!-- Прогресс -->
      <div class="progress-bar mb-6">
        <div class="progress-bar__fill" :style="{ width: `${progress}%` }" />
        <span class="progress-bar__label">{{ progress }}%</span>
      </div>

      <!-- Группировка по категориям -->
      <div v-for="[category, items] in groupedItems" :key="category" class="category-group mb-5">
        <h3 class="category-group__title">
          <span class="category-group__icon">{{ categoryIcons[category] || '📦' }}</span>
          {{ categoryLabels[category] || category || 'Другое' }}
          <span class="category-group__count">{{ items.length }}</span>
        </h3>
        <div class="category-group__items">
          <div v-for="item in items" :key="item.id"
            class="shopping-item"
            :class="{ 'shopping-item--purchased': item.is_purchased }"
          >
            <label class="shopping-item__check">
              <input type="checkbox" :checked="item.is_purchased" @change="toggleItem(item.id, !item.is_purchased)" />
              <span class="shopping-item__checkmark">
                <svg v-if="item.is_purchased" width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M10 3L4.5 8.5L2 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </span>
            </label>

            <div class="shopping-item__body">
              <span class="shopping-item__name">{{ item.name }}</span>
              <span class="shopping-item__amount">{{ item.amount }} {{ item.unit }}</span>
            </div>

            <span v-if="item.estimated_price" class="shopping-item__price">{{ formatPrice(item.estimated_price) }}</span>

            <button class="shopping-item__delete" @click="handleDeleteItem(item.id)" title="Удалить">✕</button>
          </div>
        </div>
      </div>

      <p v-if="list.items.length === 0" class="text-center py-12 text-gray-400">Список пуст</p>
    </template>

    <!-- Модалка добавления -->
    <BaseModal v-model="showAddItem" title="Добавить продукт" size="sm" :close-on-overlay="true">
      <form @submit.prevent="handleAddItem" class="space-y-3">
        <BaseInput v-model="addForm.name" label="Название" required placeholder="Молоко" />
        <div class="grid grid-cols-2 gap-3">
          <BaseInput v-model.number="addForm.amount" label="Количество" type="number" required />
          <BaseInput v-model="addForm.unit" label="Единица" placeholder="л" required />
        </div>
        <BaseSelect v-model="addForm.category" label="Категория" :options="categoryOptions" placeholder="Выберите" />
      </form>
      <template #footer>
        <BaseButton variant="ghost" @click="showAddItem = false">Отмена</BaseButton>
        <BaseButton variant="primary" @click="handleAddItem">Добавить</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useShoppingListStore } from '@/stores/shoppingList'
import { useConfirm } from '@/composables/useConfirm'
import { storeToRefs } from 'pinia'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseLoader from '@/components/common/BaseLoader.vue'
import { formatPrice, categoryLabels } from '@/utils/formatters'
import type { ShoppingListItemResponse } from '@/types/api'

const route = useRoute()
const store = useShoppingListStore()
const { currentList: list, loading } = storeToRefs(store)

const listId = computed(() => route.params.id as string)
const showAddItem = ref(false)
const addForm = reactive({ name: '', amount: 1, unit: 'шт', category: '' })
const { confirm: confirmAction } = useConfirm()

const categoryIcons: Record<string, string> = {
  vegetables: '🥬', fruits: '🍎', meat: '🥩', dairy: '🥛',
  grains: '🌾', spices: '🧂', other: '📦', all: '📋',
}

const categoryOptions = Object.entries(categoryLabels).map(([v, l]) => ({ value: v, label: l }))

const progress = computed(() => {
  if (!list.value || list.value.item_count === 0) return 0
  return Math.round(list.value.purchased_count / list.value.item_count * 100)
})

const sortMode = ref<'category' | 'name' | 'status'>('category')
const sortIcon = computed(() => ({ category: '📂', name: '🔤', status: '✅' })[sortMode.value])
const sortLabel = computed(() => ({ category: 'По категории', name: 'По названию', status: 'По статусу' })[sortMode.value])

function cycleSortMode() {
  const modes: ('category' | 'name' | 'status')[] = ['category', 'name', 'status']
  const idx = modes.indexOf(sortMode.value)
  sortMode.value = modes[(idx + 1) % modes.length]
}

function sortedItems(items: ShoppingListItemResponse[]): ShoppingListItemResponse[] {
  const sorted = [...items]
  if (sortMode.value === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name))
  if (sortMode.value === 'status') sorted.sort((a, b) => Number(a.is_purchased) - Number(b.is_purchased))
  return sorted
}

const groupedItems = computed<[string, ShoppingListItemResponse[]][]>(() => {
  if (!list.value) return []
  if (sortMode.value !== 'category') {
    return [['all', sortedItems(list.value.items)]]
  }
  const groups: Record<string, ShoppingListItemResponse[]> = {}
  for (const item of list.value.items) {
    const cat = item.category || 'other'
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(item)
  }
  // Sort by predefined order
  const order = ['vegetables', 'fruits', 'meat', 'dairy', 'grains', 'spices', 'other']
  return Object.entries(groups).sort(([a], [b]) => {
    const ia = order.indexOf(a), ib = order.indexOf(b)
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
  })
})

function exportToText() {
  if (!list.value) return
  let text = `🛒 ${list.value.title}\n${'='.repeat(40)}\n\n`
  for (const [cat, items] of groupedItems.value) {
    if (sortMode.value === 'category') text += `📂 ${categoryLabels[cat] || cat}:\n`
    for (const item of items) {
      const check = item.is_purchased ? '✅' : '⬜'
      const price = item.estimated_price ? ` ~ ${item.estimated_price}₽` : ''
      text += `  ${check} ${item.name} — ${item.amount} ${item.unit}${price}\n`
    }
    text += '\n'
  }
  if (list.value.total_estimated_cost) {
    text += `Итого: ~${Math.round(list.value.total_estimated_cost)}₽\n`
  }
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `shopping-list-${listId.value}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

async function toggleItem(itemId: string, purchased: boolean) {
  await store.togglePurchased(listId.value, itemId, purchased)
}

async function handleDeleteItem(itemId: string) {
  await store.deleteItem(listId.value, itemId)
}

async function handleAddItem() {
  if (!addForm.name || !addForm.amount) return
  await store.addItem(listId.value, {
    name: addForm.name, amount: addForm.amount, unit: addForm.unit,
    category: addForm.category || undefined,
  })
  showAddItem.value = false
  addForm.name = ''; addForm.amount = 1; addForm.unit = 'шт'; addForm.category = ''
}

async function handleMarkAll() {
  const ok = await confirmAction({ title: 'Всё куплено?', message: 'Отметить все позиции как купленные?', variant: 'primary', confirmText: 'Отметить' })
  if (!ok) return
  await store.markAllPurchased(listId.value)
}

onMounted(() => store.fetchList(listId.value))
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: $space-3;

  &__meta {
    display: flex;
    align-items: center;
    gap: $space-3;
    font-size: $font-size-sm;
    color: var(--text-muted);
    margin-top: $space-1;
  }
  &__cost {
    font-weight: $font-weight-bold;
    color: var(--primary);
    background: rgba(var(--primary-rgb), 0.08);
    padding: 2px 10px;
    border-radius: $radius-full;
  }
  &__actions {
    display: flex;
    gap: $space-2;
    flex-wrap: wrap;
  }
}

.progress-bar {
  position: relative;
  height: 8px;
  background: var(--bg);
  border-radius: $radius-full;
  overflow: hidden;

  &__fill {
    height: 100%;
    background: linear-gradient(90deg, var(--primary), var(--primary-light));
    border-radius: $radius-full;
    transition: width 0.4s ease;
  }
  &__label {
    position: absolute;
    right: 0;
    top: -20px;
    font-size: 11px;
    color: var(--text-muted);
    font-weight: $font-weight-medium;
  }
}

.category-group {
  &__title {
    display: flex;
    align-items: center;
    gap: $space-2;
    font-size: $font-size-sm;
    font-weight: $font-weight-semibold;
    color: var(--text-secondary);
    margin-bottom: $space-2;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }
  &__icon { font-size: 16px; }
  &__count {
    font-size: 11px;
    color: var(--text-muted);
    background: var(--bg);
    padding: 0 6px;
    border-radius: $radius-full;
    font-weight: $font-weight-normal;
  }
  &__items {
    background: var(--surface);
    border-radius: $radius-lg;
    box-shadow: $shadow-sm;
    overflow: hidden;
  }
}

.shopping-item {
  display: flex;
  align-items: center;
  gap: $space-3;
  padding: $space-3 $space-4;
  border-bottom: 1px solid rgba(var(--border-rgb), 0.5);
  transition: all $transition-fast;

  &:last-child { border-bottom: none; }
  &:hover { background: rgba(var(--primary-rgb), 0.02); }

  &--purchased {
    opacity: 0.5;
    .shopping-item__name { text-decoration: line-through; }
  }

  &__check {
    display: flex;
    cursor: pointer;
    input { display: none; }
  }
  &__checkmark {
    width: 22px;
    height: 22px;
    border-radius: 6px;
    border: 2px solid var(--border-hover);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all $transition-fast;
    color: white;

    .shopping-item--purchased & {
      background: var(--primary);
      border-color: var(--primary);
    }
  }

  &__body {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: baseline;
    gap: $space-2;
  }
  &__name { font-weight: $font-weight-medium; }
  &__amount { font-size: $font-size-sm; color: var(--text-muted); white-space: nowrap; }
  &__price {
    font-size: $font-size-sm;
    color: var(--text-secondary);
    font-weight: $font-weight-medium;
    white-space: nowrap;
  }
  &__delete {
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    font-size: 14px;
    padding: 4px;
    border-radius: $radius-sm;
    opacity: 0;
    transition: all $transition-fast;
    .shopping-item:hover & { opacity: 1; }
    &:hover { color: var(--danger); background: rgba(var(--danger-rgb), 0.08); }
  }
}
</style>
