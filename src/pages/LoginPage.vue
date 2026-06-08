<template>
  <div class="login-page">
    <h2 class="login-page__title">Добро пожаловать</h2>
    <p class="login-page__subtitle">Войдите в аккаунт для продолжения</p>

    <form @submit.prevent="handleLogin" class="login-page__form">
      <BaseInput
        v-model="form.email"
        label="Email"
        type="email"
        placeholder="your@email.com"
        :error="errors.email"
        required
      />
      <BaseInput
        v-model="form.password"
        label="Пароль"
        type="password"
        placeholder="Введите пароль"
        :error="errors.password"
        required
      />

      <BaseButton type="submit" variant="primary" size="lg" block :loading="loading">
        Войти
      </BaseButton>
    </form>

    <div class="login-page__divider">
      <span>или</span>
    </div>

    <div class="login-page__links">
      <router-link to="/register" class="login-page__link">
        Нет аккаунта? <strong>Зарегистрироваться</strong>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import { getErrorMessage } from '@/api/client'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const authStore = useAuthStore()
const notif = useNotificationStore()
const router = useRouter()
const route = useRoute()
const loading = ref(false)
const form = reactive({ email: '', password: '' })
const errors = reactive({ email: '', password: '' })

async function handleLogin() {
  errors.email = ''
  errors.password = ''
  if (!form.email) { errors.email = 'Введите email'; return }
  if (!form.email.includes('@')) { errors.email = 'Некорректный email'; return }
  if (!form.password) { errors.password = 'Введите пароль'; return }
  if (form.password.length < 6) { errors.password = 'Минимум 6 символов'; return }

  loading.value = true
  try {
    await authStore.login({ email: form.email, password: form.password })
    const redirect = (route.query.redirect as string) || '/dashboard'
    router.push(redirect)
  } catch (e) {
    notif.error(getErrorMessage(e))
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.login-page {
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
  &__links {
    text-align: center;
  }
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
