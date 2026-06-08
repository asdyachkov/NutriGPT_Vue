<template>
  <div class="register-page">
    <h2 class="register-page__title">Создать аккаунт</h2>
    <p class="register-page__subtitle">Начните планировать питание с AI</p>

    <form @submit.prevent="handleRegister" class="register-page__form">
      <div class="register-page__row">
        <BaseInput v-model="form.first_name" label="Имя" placeholder="Ваше имя" :error="errors.first_name" required />
        <BaseInput v-model="form.last_name" label="Фамилия" placeholder="Фамилия" />
      </div>
      <BaseInput v-model="form.email" label="Email" type="email" placeholder="your@email.com" :error="errors.email" required />
      <BaseInput v-model="form.password" label="Пароль" type="password" placeholder="Минимум 8 символов" :error="errors.password" required />

      <label class="register-page__consent">
        <input type="checkbox" v-model="form.consent_given" class="register-page__checkbox" />
        <span>Я даю согласие на обработку персональных данных в соответствии с <strong>152-ФЗ</strong></span>
      </label>
      <p v-if="errors.consent" class="register-page__error">{{ errors.consent }}</p>

      <BaseButton type="submit" variant="primary" size="lg" block :loading="loading">
        Создать аккаунт
      </BaseButton>
    </form>

    <div class="register-page__divider">
      <span>или</span>
    </div>

    <div class="register-page__links">
      <router-link to="/login" class="register-page__link">
        Уже есть аккаунт? <strong>Войти</strong>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import { getErrorMessage } from '@/api/client'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const authStore = useAuthStore()
const notif = useNotificationStore()
const router = useRouter()
const loading = ref(false)
const form = reactive({ first_name: '', last_name: '', email: '', password: '', consent_given: false })
const errors = reactive({ first_name: '', email: '', password: '', consent: '' })

async function handleRegister() {
  errors.first_name = ''; errors.email = ''; errors.password = ''; errors.consent = ''
  if (!form.first_name.trim()) { errors.first_name = 'Введите имя'; return }
  if (!form.email.trim()) { errors.email = 'Введите email'; return }
  if (!form.email.includes('@')) { errors.email = 'Некорректный формат email'; return }
  if (form.password.length < 8) { errors.password = 'Минимум 8 символов'; return }
  if (!form.consent_given) { errors.consent = 'Необходимо дать согласие на обработку данных'; return }

  loading.value = true
  try {
    await authStore.register({
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim() || undefined,
      email: form.email.trim(),
      password: form.password,
      consent_given: form.consent_given,
    })
    router.push('/profile')
  } catch (e) {
    notif.error(getErrorMessage(e))
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.register-page {
  &__title {
    text-align: center;
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
    color: var(--text);
    margin-bottom: $space-1;
  }
  &__subtitle {
    text-align: center;
    font-size: $font-size-sm;
    color: var(--text-muted);
    margin-bottom: $space-6;
  }
  &__form {
    display: flex;
    flex-direction: column;
    gap: $space-4;
  }
  &__row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: $space-3;
  }
  &__consent {
    display: flex;
    align-items: flex-start;
    gap: $space-2;
    font-size: $font-size-sm;
    color: var(--text-secondary);
    cursor: pointer;
    line-height: 1.4;

    strong { color: var(--primary); }
  }
  &__checkbox {
    margin-top: 3px;
    accent-color: var(--primary);
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
  &__error {
    font-size: $font-size-xs;
    color: var(--danger);
    margin-top: -$space-2;
  }
  &__divider {
    display: flex;
    align-items: center;
    gap: $space-3;
    margin: $space-5 0;
    color: var(--text-muted);
    font-size: $font-size-xs;

    &::before, &::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--border);
    }
  }
  &__links { text-align: center; }
  &__link {
    font-size: $font-size-sm;
    color: var(--text-secondary);
    text-decoration: none;
    transition: color $transition-fast;

    strong { color: var(--primary); font-weight: $font-weight-semibold; }
    &:hover { color: var(--primary); }
  }
}
</style>
