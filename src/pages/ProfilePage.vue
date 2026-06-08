<template>
  <div class="max-w-3xl mx-auto">
    <h1 class="text-2xl font-semibold mb-6">👤 Мой профиль</h1>

    <BaseLoader v-if="loading && !profile" size="lg" text="Загрузка профиля..." class="py-20" />

    <template v-else-if="profile">
      <!-- Карточка КБЖУ -->
      <div v-if="profile.nutrition.target_calories > 0" class="nutrition-hero mb-6">
        <div class="nutrition-hero__bg" />
        <h3 class="nutrition-hero__title">🎯 Ваши нормы КБЖУ</h3>
        <div class="nutrition-hero__grid">
          <div class="nutrition-hero__pill nutrition-hero__pill--cal">
            <span class="nutrition-hero__value">{{ Math.round(profile.nutrition.target_calories) }}</span>
            <span class="nutrition-hero__label">ккал/день</span>
          </div>
          <div class="nutrition-hero__pill nutrition-hero__pill--prot">
            <span class="nutrition-hero__value">{{ profile.nutrition.target_protein.toFixed(0) }}г</span>
            <span class="nutrition-hero__label">Белки</span>
          </div>
          <div class="nutrition-hero__pill nutrition-hero__pill--fat">
            <span class="nutrition-hero__value">{{ profile.nutrition.target_fat.toFixed(0) }}г</span>
            <span class="nutrition-hero__label">Жиры</span>
          </div>
          <div class="nutrition-hero__pill nutrition-hero__pill--carb">
            <span class="nutrition-hero__value">{{ profile.nutrition.target_carbs.toFixed(0) }}г</span>
            <span class="nutrition-hero__label">Углеводы</span>
          </div>
          <div class="nutrition-hero__pill nutrition-hero__pill--bmr">
            <span class="nutrition-hero__value">{{ Math.round(profile.nutrition.bmr) }}</span>
            <span class="nutrition-hero__label">BMR</span>
          </div>
        </div>
      </div>

      <!-- Форма -->
      <BaseCard class="mb-6">
        <template #header><h3 class="text-lg font-semibold">Данные профиля</h3></template>
        <form @submit.prevent="handleSave" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BaseSelect v-model="form.gender" label="Пол" :options="genderOptions" placeholder="Выберите пол" />
            <BaseInput v-model="form.birth_date" label="Дата рождения" type="text" placeholder="2000-01-15" :error="errors.birth_date" />
            <BaseInput v-model.number="form.height_cm" label="Рост (см)" type="number" placeholder="175" :error="errors.height_cm" />
            <BaseInput v-model.number="form.weight_kg" label="Вес (кг)" type="number" placeholder="70" :error="errors.weight_kg" />
            <BaseSelect v-model="form.activity_level" label="Уровень активности" :options="activityOptions" />
            <BaseSelect v-model="form.goal" label="Цель" :options="goalOptions" />
          </div>

          <BaseInput v-model="restrictionsInput" label="Диетические ограничения" placeholder="vegan, halal (через запятую)" />
          <BaseInput v-model="allergiesInput" label="Аллергии" placeholder="nuts, lactose (через запятую)" />
          <BaseInput v-model="cuisineInput" label="Предпочтения кухни" placeholder="русская, азиатская (через запятую)" />

          <div class="flex justify-end pt-2">
            <BaseButton type="submit" variant="primary" :loading="loading">Сохранить</BaseButton>
          </div>
        </form>
      </BaseCard>

      <!-- Кухонное оборудование -->
      <BaseCard>
        <template #header>
          <div>
            <h3 class="text-lg font-semibold">🍳 Кухонное оборудование</h3>
            <p class="text-sm text-gray-500 mt-1">Отметьте технику, которая у вас есть. AI не будет предлагать рецепты, требующие отсутствующего оборудования.</p>
          </div>
        </template>
        <div class="equipment-grid">
          <label
            v-for="eq in equipmentOptions"
            :key="eq.key"
            class="equipment-item"
            :class="{ 'equipment-item--active': selectedEquipment.has(eq.key) }"
          >
            <input
              type="checkbox"
              :checked="selectedEquipment.has(eq.key)"
              class="sr-only"
              @change="toggleEquipment(eq.key)"
            />
            <span class="equipment-item__icon">{{ eq.icon }}</span>
            <span class="equipment-item__label">{{ eq.label }}</span>
            <span class="equipment-item__check">
              <svg v-if="selectedEquipment.has(eq.key)" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
          </label>
        </div>
        <div class="flex justify-end pt-4">
          <BaseButton variant="primary" :loading="loading" @click="handleSaveEquipment">Сохранить оборудование</BaseButton>
        </div>
      </BaseCard>

      <!-- Напоминания -->
      <BaseCard class="mt-6">
        <template #header>
          <div>
            <h3 class="text-lg font-semibold">🔔 Напоминания о приёмах пищи</h3>
            <p class="text-sm text-gray-500 mt-1">Локальные push-уведомления в браузере, когда наступает время еды.</p>
          </div>
        </template>

        <div v-if="!reminders.isSupported.value" class="reminders-note">
          ⚠️ Ваш браузер не поддерживает уведомления. Попробуйте Chrome, Edge или Firefox.
        </div>

        <template v-else>
          <div class="reminders-row">
            <label class="reminders-switch">
              <input
                type="checkbox"
                :checked="reminders.schedule.value.enabled"
                @change="handleToggleReminders($event)"
              />
              <span class="reminders-switch__track"></span>
              <span class="reminders-switch__label">
                {{ reminders.schedule.value.enabled ? 'Включены' : 'Выключены' }}
              </span>
            </label>

            <span
              v-if="reminders.permission.value === 'denied'"
              class="reminders-pill reminders-pill--warn"
            >Разрешение запрещено в браузере</span>
            <span
              v-else-if="reminders.permission.value === 'granted'"
              class="reminders-pill reminders-pill--ok"
            >Разрешение получено</span>
          </div>

          <div class="reminders-grid">
            <div class="reminders-item">
              <span class="reminders-item__icon">🌅</span>
              <div class="reminders-item__body">
                <span class="reminders-item__label">Завтрак</span>
                <input
                  type="time"
                  class="reminders-item__time"
                  :value="reminders.schedule.value.breakfast"
                  :disabled="!reminders.schedule.value.enabled"
                  @change="e => reminders.setTime('breakfast', (e.target as HTMLInputElement).value)"
                />
              </div>
            </div>
            <div class="reminders-item">
              <span class="reminders-item__icon">☀️</span>
              <div class="reminders-item__body">
                <span class="reminders-item__label">Обед</span>
                <input
                  type="time"
                  class="reminders-item__time"
                  :value="reminders.schedule.value.lunch"
                  :disabled="!reminders.schedule.value.enabled"
                  @change="e => reminders.setTime('lunch', (e.target as HTMLInputElement).value)"
                />
              </div>
            </div>
            <div class="reminders-item">
              <span class="reminders-item__icon">🍎</span>
              <div class="reminders-item__body">
                <span class="reminders-item__label">Перекус</span>
                <input
                  type="time"
                  class="reminders-item__time"
                  :value="reminders.schedule.value.snack"
                  :disabled="!reminders.schedule.value.enabled"
                  @change="e => reminders.setTime('snack', (e.target as HTMLInputElement).value)"
                />
              </div>
            </div>
            <div class="reminders-item">
              <span class="reminders-item__icon">🌙</span>
              <div class="reminders-item__body">
                <span class="reminders-item__label">Ужин</span>
                <input
                  type="time"
                  class="reminders-item__time"
                  :value="reminders.schedule.value.dinner"
                  :disabled="!reminders.schedule.value.enabled"
                  @change="e => reminders.setTime('dinner', (e.target as HTMLInputElement).value)"
                />
              </div>
            </div>
          </div>

          <div class="flex justify-end pt-4">
            <BaseButton
              variant="secondary"
              :disabled="reminders.permission.value !== 'granted'"
              @click="reminders.testNow"
            >
              Отправить тестовое уведомление
            </BaseButton>
          </div>
        </template>
      </BaseCard>
    </template>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, watch } from 'vue'
import { useProfile } from '@/composables/useProfile'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseLoader from '@/components/common/BaseLoader.vue'
import { activityLabels, goalLabels, kitchenEquipmentOptions } from '@/utils/formatters'
import { useReminders } from '@/composables/useReminders'

const { profile, loading, fetchProfile, updateProfile } = useProfile()
const reminders = useReminders()

async function handleToggleReminders(e: Event) {
  const target = e.target as HTMLInputElement
  await reminders.setEnabled(target.checked)
  // если permission не удалось получить, принудительно вернём чекбокс в выключенное состояние
  if (!reminders.schedule.value.enabled) {
    target.checked = false
  }
}

const form = reactive({ gender: '', birth_date: '', height_cm: 0, weight_kg: 0, activity_level: '', goal: '' })
const errors = reactive({ birth_date: '', height_cm: '', weight_kg: '' })
const restrictionsInput = ref('')
const allergiesInput = ref('')
const cuisineInput = ref('')
const selectedEquipment = ref<Set<string>>(new Set())

const equipmentOptions = kitchenEquipmentOptions

const genderOptions = [{ value: 'male', label: 'Мужской' }, { value: 'female', label: 'Женский' }]
const activityOptions = Object.entries(activityLabels).map(([v, l]) => ({ value: v, label: l }))
const goalOptions = Object.entries(goalLabels).map(([v, l]) => ({ value: v, label: l }))

watch(profile, (p) => {
  if (!p) return
  form.gender = p.gender || ''
  form.birth_date = p.birth_date || ''
  form.height_cm = p.height_cm || 0
  form.weight_kg = p.weight_kg || 0
  form.activity_level = p.activity_level || ''
  form.goal = p.goal || ''
  restrictionsInput.value = (p.dietary_restrictions || []).join(', ')
  allergiesInput.value = (p.allergies || []).join(', ')
  cuisineInput.value = (p.cuisine_preferences || []).join(', ')
  selectedEquipment.value = new Set(p.kitchen_equipment || [])
}, { immediate: true })

function splitComma(s: string): string[] {
  return s.split(',').map(v => v.trim()).filter(Boolean)
}

function toggleEquipment(key: string) {
  const s = new Set(selectedEquipment.value)
  if (s.has(key)) s.delete(key)
  else s.add(key)
  selectedEquipment.value = s
}

async function handleSave() {
  errors.birth_date = ''; errors.height_cm = ''; errors.weight_kg = ''
  if (form.birth_date && !/^\d{4}-\d{2}-\d{2}$/.test(form.birth_date)) { errors.birth_date = 'Формат: ГГГГ-ММ-ДД'; return }
  if (form.height_cm && (form.height_cm < 50 || form.height_cm > 300)) { errors.height_cm = '50–300 см'; return }
  if (form.weight_kg && (form.weight_kg < 20 || form.weight_kg > 500)) { errors.weight_kg = '20–500 кг'; return }

  await updateProfile({
    gender: form.gender as 'male' | 'female' || undefined,
    birth_date: form.birth_date || undefined,
    height_cm: form.height_cm || undefined,
    weight_kg: form.weight_kg || undefined,
    activity_level: (form.activity_level as 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active') || undefined,
    goal: (form.goal as 'lose_weight' | 'maintain' | 'gain_weight' | 'gain_muscle') || undefined,
    dietary_restrictions: splitComma(restrictionsInput.value),
    allergies: splitComma(allergiesInput.value),
    cuisine_preferences: splitComma(cuisineInput.value),
  })
}

async function handleSaveEquipment() {
  await updateProfile({
    kitchen_equipment: [...selectedEquipment.value],
  })
}

onMounted(fetchProfile)
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.nutrition-hero {
  background: linear-gradient(135deg, var(--header-bg) 0%, var(--primary-dark) 60%, var(--primary) 100%);
  border-radius: $radius-xl;
  padding: $space-6;
  position: relative;
  overflow: hidden;
  color: #fff;

  &__bg {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 250px 200px at 85% 30%, rgba(var(--accent-rgb), 0.15) 0%, transparent 70%);
    pointer-events: none;
  }
  &__title {
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    color: #fff;
    margin-bottom: $space-4;
    position: relative;
    z-index: 1;
  }
  &__grid {
    display: flex;
    gap: $space-3;
    flex-wrap: wrap;
    position: relative;
    z-index: 1;
  }
  &__pill {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: $space-3 $space-5;
    border-radius: $radius-lg;
    background: rgba(255,255,255,0.1);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255,255,255,0.08);
    min-width: 90px;
    transition: all $transition-base;
    &:hover { background: rgba(255,255,255,0.15); transform: translateY(-2px); }
  }
  &__value { font-size: $font-size-xl; font-weight: $font-weight-bold; }
  &__label { font-size: $font-size-xs; color: rgba(255,255,255,0.5); }
  &__pill--cal &__value { color: #A7F3D0; }
  &__pill--prot &__value { color: #93C5FD; }
  &__pill--fat &__value { color: #FCD34D; }
  &__pill--carb &__value { color: #FCA5A5; }
  &__pill--bmr &__value { color: rgba(255,255,255,0.8); }
}

.equipment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: $space-3;

  @media (min-width: $breakpoint-md) {
    grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  }
}

.reminders-note {
  padding: $space-4;
  border-radius: $radius-md;
  background: rgba(var(--warning-rgb), 0.08);
  color: var(--warning);
  font-size: $font-size-sm;
}

.reminders-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $space-3;
  margin-bottom: $space-5;
  flex-wrap: wrap;
}

.reminders-switch {
  display: inline-flex;
  align-items: center;
  gap: $space-3;
  cursor: pointer;
  user-select: none;

  input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  &__track {
    position: relative;
    display: inline-block;
    width: 44px;
    height: 24px;
    border-radius: 999px;
    background: var(--border);
    transition: background $transition-base;

    &::after {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #fff;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      transition: transform $transition-base;
    }
  }

  input:checked + &__track {
    background: var(--primary);

    &::after {
      transform: translateX(20px);
    }
  }

  &__label {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: var(--text);
  }
}

.reminders-pill {
  display: inline-flex;
  align-items: center;
  padding: $space-1 $space-3;
  border-radius: 999px;
  font-size: $font-size-xs;
  font-weight: $font-weight-medium;

  &--ok {
    background: rgba(var(--success-rgb), 0.1);
    color: var(--success);
  }

  &--warn {
    background: rgba(var(--warning-rgb), 0.1);
    color: var(--warning);
  }
}

.reminders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: $space-3;
}

.reminders-item {
  display: flex;
  align-items: center;
  gap: $space-3;
  padding: $space-3 $space-4;
  border: 1px solid var(--border);
  border-radius: $radius-md;
  background: var(--surface, #fff);

  &__icon {
    font-size: 24px;
    line-height: 1;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__label {
    font-size: $font-size-xs;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  &__time {
    border: none;
    background: transparent;
    padding: 0;
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    color: var(--text);
    font-family: inherit;

    &:focus {
      outline: none;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

.equipment-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-1;
  padding: $space-3 $space-2;
  border: 2px solid var(--border);
  border-radius: $radius-md;
  cursor: pointer;
  transition: all $transition-base;
  position: relative;
  user-select: none;
  text-align: center;

  &:hover {
    border-color: var(--primary-light);
    background: rgba(var(--primary-rgb), 0.02);
  }

  &--active {
    border-color: var(--primary);
    background: rgba(var(--primary-rgb), 0.06);
    box-shadow: 0 0 0 1px var(--primary);
  }

  &__icon {
    font-size: 28px;
    line-height: 1;
  }

  &__label {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: var(--text);
  }

  &__check {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    background: var(--primary);
    opacity: 0;
    transform: scale(0.5);
    transition: all $transition-base;
  }

  &--active &__check {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
