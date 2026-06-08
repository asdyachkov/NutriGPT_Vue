<template>
  <div class="max-w-3xl mx-auto">
    <BaseButton variant="ghost" class="mb-4" @click="$router.push('/families')">← Назад к семьям</BaseButton>

    <BaseLoader v-if="loading && !family" size="lg" class="py-20" />

    <template v-else-if="family">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-semibold">{{ family.name }}</h1>
        <div class="flex gap-2">
          <BaseButton v-if="isAdmin" variant="outline" size="sm" @click="showAddMember = true">+ Участник</BaseButton>
          <BaseButton v-if="!isAdmin" variant="danger" size="sm" @click="handleLeave">Покинуть</BaseButton>
          <BaseButton v-if="isAdmin" variant="danger" size="sm" @click="handleDelete">Удалить семью</BaseButton>
        </div>
      </div>

      <!-- Бюджет + быстрая навигация -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <BaseCard v-if="family.monthly_budget">
          <p class="text-sm text-gray-500">Месячный бюджет</p>
          <p class="text-2xl font-bold text-primary">{{ formatPrice(family.monthly_budget) }}</p>
        </BaseCard>
        <BaseCard hoverable @click="$router.push({ path: '/meal-plan', query: { family_id: familyId } })">
          <div class="flex items-center gap-3">
            <span class="text-3xl">🤖</span>
            <div>
              <p class="font-medium">Семейный план питания</p>
              <p class="text-sm text-gray-500">Сгенерировать план для всей семьи</p>
            </div>
          </div>
        </BaseCard>
      </div>

      <!-- Участники -->
      <BaseCard>
        <template #header><h3 class="text-lg font-semibold">Участники ({{ family.members.length }})</h3></template>
        <div class="divide-y">
          <div v-for="m in family.members" :key="m.id" class="flex items-center justify-between py-3">
            <div>
              <p class="font-medium">{{ m.first_name }} {{ m.last_name }}</p>
              <p class="text-sm text-gray-500">{{ m.email }}</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs px-2 py-1 rounded-full" :class="m.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600'">
                {{ m.role === 'admin' ? 'Админ' : 'Участник' }}
              </span>
              <template v-if="isAdmin && m.user_id !== authUser?.id">
                <BaseButton variant="ghost" size="sm" @click="handleChangeRole(m.user_id, m.role === 'admin' ? 'member' : 'admin')">
                  {{ m.role === 'admin' ? '↓' : '↑' }}
                </BaseButton>
                <BaseButton variant="ghost" size="sm" @click="handleRemove(m.user_id)">✕</BaseButton>
              </template>
            </div>
          </div>
        </div>
      </BaseCard>
    </template>

    <BaseModal v-model="showAddMember" title="Добавить участника" size="sm" :close-on-overlay="true">
      <BaseInput v-model="memberEmail" label="Email пользователя" type="email" placeholder="user@email.com" />
      <template #footer>
        <BaseButton variant="ghost" @click="showAddMember = false">Отмена</BaseButton>
        <BaseButton variant="primary" :loading="loading" @click="handleAddMember">Добавить</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFamilyStore } from '@/stores/family'
import { useAuthStore } from '@/stores/auth'
import { useConfirm } from '@/composables/useConfirm'
import { storeToRefs } from 'pinia'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseLoader from '@/components/common/BaseLoader.vue'
import { formatPrice } from '@/utils/formatters'

const route = useRoute()
const router = useRouter()
const familyStore = useFamilyStore()
const authStore = useAuthStore()
const { confirm } = useConfirm()
const { currentFamily: family, loading } = storeToRefs(familyStore)
const { user: authUser } = storeToRefs(authStore)

const showAddMember = ref(false)
const memberEmail = ref('')

const familyId = computed(() => route.params.id as string)
const isAdmin = computed(() => family.value?.members.some(m => m.user_id === authUser.value?.id && m.role === 'admin') ?? false)

async function handleAddMember() {
  if (!memberEmail.value) return
  try {
    await familyStore.addMember(familyId.value, memberEmail.value)
    showAddMember.value = false; memberEmail.value = ''
  } catch { /* handled in store */ }
}

async function handleRemove(userId: string) {
  const ok = await confirm({
    title: 'Удалить участника?',
    message: 'Участник потеряет доступ к семейным функциям.',
    variant: 'danger',
    confirmText: 'Удалить',
  })
  if (!ok) return
  await familyStore.removeMember(familyId.value, userId)
}

async function handleChangeRole(userId: string, role: 'admin' | 'member') {
  await familyStore.changeMemberRole(familyId.value, userId, role)
}

async function handleLeave() {
  const ok = await confirm({
    title: 'Покинуть семью?',
    message: 'Вы потеряете доступ к семейным планам и рецептам.',
    variant: 'warning',
    confirmText: 'Покинуть',
  })
  if (!ok) return
  await familyStore.leaveFamily(familyId.value)
  router.push('/families')
}

async function handleDelete() {
  const ok = await confirm({
    title: 'Удалить семью?',
    message: 'Все данные семьи будут удалены. Это действие необратимо.',
    variant: 'danger',
    confirmText: 'Удалить навсегда',
  })
  if (!ok) return
  await familyStore.deleteFamily(familyId.value)
  router.push('/families')
}

onMounted(() => familyStore.fetchFamily(familyId.value))
</script>
