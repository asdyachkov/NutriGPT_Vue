<template>
  <div class="max-w-4xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-semibold">👨‍👩‍👧‍👦 Мои семьи</h1>
      <BaseButton variant="primary" @click="showCreate = true">+ Создать семью</BaseButton>
    </div>

    <!-- Skeleton -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <SkeletonCard v-for="n in 2" :key="n" />
    </div>

    <!-- Empty state -->
    <div v-else-if="families.length === 0" class="empty-state">
      <div class="empty-state__icon">👨‍👩‍👧</div>
      <h3 class="empty-state__title">Нет семейных групп</h3>
      <p class="empty-state__text">Создайте семью, чтобы генерировать общие планы питания, учитывающие потребности каждого члена</p>
      <BaseButton variant="primary" @click="showCreate = true">Создать первую семью</BaseButton>
    </div>

    <!-- Cards -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <BaseCard v-for="(f, idx) in families" :key="f.id" hoverable :class="`stagger-${idx + 1}`" @click="$router.push(`/families/${f.id}`)">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="text-lg font-semibold">{{ f.name }}</h3>
            <p class="text-sm text-gray-500 mt-1">
              {{ f.member_count }} {{ pluralize(f.member_count, 'участник', 'участника', 'участников') }}
            </p>
            <p v-if="f.monthly_budget" class="text-sm text-gray-500">
              Бюджет: {{ formatPrice(f.monthly_budget) }}/мес
            </p>
          </div>
          <span class="role-badge" :class="f.my_role === 'admin' ? 'role-badge--admin' : 'role-badge--member'">
            {{ f.my_role === 'admin' ? 'Админ' : 'Участник' }}
          </span>
        </div>
      </BaseCard>
    </div>

    <!-- Модальное окно создания -->
    <BaseModal v-model="showCreate" title="Новая семья" size="sm" :close-on-overlay="true">
      <form @submit.prevent="handleCreate" class="space-y-4">
        <BaseInput v-model="createForm.name" label="Название" placeholder="Семья Ивановых" required />
        <BaseInput v-model.number="createForm.monthly_budget" label="Бюджет (₽/мес)" type="number" placeholder="50000" />
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
import { useFamilyStore } from '@/stores/family'
import { storeToRefs } from 'pinia'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import SkeletonCard from '@/components/common/SkeletonCard.vue'
import { pluralize, formatPrice } from '@/utils/formatters'

const store = useFamilyStore()
const { families, loading } = storeToRefs(store)

const showCreate = ref(false)
const createForm = reactive({ name: '', monthly_budget: 0 })

async function handleCreate() {
  if (!createForm.name) return
  await store.createFamily({ name: createForm.name, monthly_budget: createForm.monthly_budget || undefined })
  showCreate.value = false
  createForm.name = ''; createForm.monthly_budget = 0
}

onMounted(() => store.fetchFamilies())
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
    max-width: 400px;
    margin: 0 auto $space-5;
    line-height: $line-height-relaxed;
  }
}

.role-badge {
  font-size: $font-size-xs;
  padding: 3px 10px;
  border-radius: $radius-full;
  font-weight: $font-weight-medium;

  &--admin { background: rgba(var(--primary-rgb), 0.1); color: var(--primary); }
  &--member { background: var(--bg); color: var(--text-muted); }
}
</style>
