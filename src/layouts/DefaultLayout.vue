<template>
  <div class="app-layout">
    <header class="app-header">
      <div class="app-header__inner">
        <button class="app-header__burger" @click="sidebarOpen = !sidebarOpen" aria-label="Меню">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </button>
        <router-link to="/dashboard" class="app-header__logo">
          <span class="app-header__logo-mark">N</span>
          <span class="app-header__logo-text">NutriGPT</span>
        </router-link>
        <div class="app-header__spacer" />
        <div class="app-header__actions">
          <button class="app-header__theme" @click="toggleTheme" :title="isDark ? 'Светлая тема' : 'Тёмная тема'" aria-label="Тема">
            <svg v-if="isDark" width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="4" stroke="currentColor" stroke-width="1.5"/><path d="M9 1.5v2M9 14.5v2M1.5 9h2M14.5 9h2M3.4 3.4l1.4 1.4M13.2 13.2l1.4 1.4M3.4 14.6l1.4-1.4M13.2 4.8l1.4-1.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            <svg v-else width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M15.3 10.5A6.75 6.75 0 017.5 2.7a6.75 6.75 0 107.8 7.8z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <div class="app-header__avatar" :title="user?.first_name">{{ (user?.first_name || 'U')[0] }}</div>
          <button class="app-header__logout" @click="handleLogout" title="Выйти" aria-label="Выйти">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M6.75 15.75H3.75a1.5 1.5 0 01-1.5-1.5v-10.5a1.5 1.5 0 011.5-1.5h3M12 12.75L15.75 9 12 5.25M7.5 9h8.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      </div>
    </header>

    <div class="app-body">
      <aside class="app-sidebar" :class="{ 'app-sidebar--open': sidebarOpen }">
        <nav class="app-nav">
          <router-link
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="app-nav__item"
            active-class="app-nav__item--active"
            @click="sidebarOpen = false"
          >
            <span class="app-nav__icon">{{ item.icon }}</span>
            <span class="app-nav__label">{{ item.label }}</span>
          </router-link>
        </nav>
        <div class="app-sidebar__footer">
          <div class="app-sidebar__brand">
            <span class="app-sidebar__brand-dot" />
            NutriGPT v1.0
          </div>
        </div>
      </aside>

      <main class="app-main">
        <div class="app-content">
          <slot />
        </div>
      </main>
    </div>

    <Transition name="fade">
      <div v-if="sidebarOpen" class="app-overlay" @click="sidebarOpen = false" />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTheme } from '@/composables/useTheme'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const { user, isPrivileged } = storeToRefs(authStore)
const router = useRouter()
const sidebarOpen = ref(false)
const { isDark, toggleTheme } = useTheme()

const navItems = computed(() => {
  const items = [
    { to: '/dashboard', icon: '🏠', label: 'Главная' },
    { to: '/profile', icon: '👤', label: 'Профиль' },
    { to: '/families', icon: '👨‍👩‍👧‍👦', label: 'Семья' },
    { to: '/recipes', icon: '📖', label: 'Рецепты' },
    { to: '/meal-plan', icon: '🗓️', label: 'План питания' },
    { to: '/meal-plan/history', icon: '📋', label: 'История' },
    { to: '/shopping-list', icon: '🛒', label: 'Покупки' },
  ]
  if (isPrivileged.value) {
    items.push({ to: '/admin', icon: '⚙️', label: 'Админ' })
  }
  return items
})

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
}

.app-header {
  position: sticky;
  top: 0;
  z-index: $z-sticky;
  height: $header-height;
  background: var(--header-bg);
  box-shadow: 0 1px 0 rgba(255,255,255,0.06);

  &__inner {
    display: flex;
    align-items: center;
    height: 100%;
    padding: 0 $space-5;
    max-width: calc($max-width + $sidebar-width + $space-10);
    margin: 0 auto;
    gap: $space-4;
  }

  &__burger {
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    color: rgba(255,255,255,0.7);
    cursor: pointer;
    padding: $space-2;
    border-radius: $radius-sm;
    transition: all $transition-fast;
    &:hover { color: #fff; background: rgba(255,255,255,0.08); }
    @media (min-width: $breakpoint-lg) { display: none; }
  }

  &__logo {
    display: flex;
    align-items: center;
    gap: $space-3;
    text-decoration: none;
  }
  &__logo-mark {
    width: 32px;
    height: 32px;
    border-radius: $radius-sm;
    background: linear-gradient(135deg, var(--primary-light), var(--accent));
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: $font-weight-extrabold;
    font-size: $font-size-base;
    letter-spacing: -0.5px;
  }
  &__logo-text {
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    color: #fff;
    letter-spacing: $letter-spacing-tight;
  }

  &__spacer { flex: 1; }

  &__actions {
    display: flex;
    align-items: center;
    gap: $space-3;
  }
  &__avatar {
    width: 34px;
    height: 34px;
    border-radius: $radius-full;
    background: rgba(255,255,255,0.12);
    border: 1.5px solid rgba(255,255,255,0.2);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: $font-size-sm;
    font-weight: $font-weight-bold;
    text-transform: uppercase;
  }
  &__logout {
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    color: rgba(255,255,255,0.4);
    cursor: pointer;
    padding: $space-2;
    border-radius: $radius-sm;
    transition: all $transition-fast;
    &:hover { color: #fff; background: rgba(255,255,255,0.08); }
  }
}

.app-body { display: flex; flex: 1; }

.app-sidebar {
  width: $sidebar-width;
  background: var(--surface);
  border-right: 1px solid var(--border);
  flex-shrink: 0;
  position: fixed;
  top: $header-height;
  left: -$sidebar-width;
  bottom: 0;
  z-index: $z-modal;
  transition: left $transition-slow;
  overflow-y: auto;
  overscroll-behavior: contain;
  display: flex;
  flex-direction: column;
  box-shadow: none;

  &--open {
    left: 0;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.35);
  }

  @media (min-width: $breakpoint-lg) {
    position: sticky;
    left: 0;
    height: calc(100vh - $header-height);
    z-index: $z-fixed;
    box-shadow: none;
  }

  &__footer {
    margin-top: auto;
    padding: $space-5;
    border-top: 1px solid var(--border);
  }
  &__brand {
    display: flex;
    align-items: center;
    gap: $space-2;
    font-size: $font-size-xs;
    color: var(--text-muted);
  }
  &__brand-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--success);
    animation: pulse-soft 2s ease-in-out infinite;
  }
}

.app-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: $space-4 $space-3;

  &__item {
    display: flex;
    align-items: center;
    gap: $space-3;
    padding: 10px $space-4;
    border-radius: $radius-md;
    color: var(--text-secondary);
    text-decoration: none;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    transition: all $transition-fast;
    position: relative;

    &:hover {
      background: var(--bg-subtle);
      color: var(--text);
    }
    &--active {
      background: var(--primary-soft);
      color: var(--primary);
      font-weight: $font-weight-semibold;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 6px;
        bottom: 6px;
        width: 3px;
        border-radius: 0 3px 3px 0;
        background: var(--primary);
      }
    }
  }
  &__icon { font-size: 17px; width: 24px; text-align: center; }
}

.app-main {
  flex: 1;
  min-width: 0;
  padding: $space-7 0;

  @media (min-width: $breakpoint-lg) {
    padding: $space-7 $space-7;
  }
}

.app-content {
  width: 100%;
  max-width: $max-width;
  margin: 0 auto;
  padding: 0 $space-4;
  @media (min-width: $breakpoint-md) { padding: 0; }
}

.app-overlay {
  position: fixed;
  top: $header-height;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--overlay);
  z-index: $z-overlay;
  cursor: pointer;
  @media (min-width: $breakpoint-lg) { display: none; }
}
</style>
