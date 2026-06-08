<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="slide-toast">
        <div
          v-for="n in notifications"
          :key="n.id"
          class="toast"
          :class="`toast--${n.type}`"
          @click="remove(n.id)"
        >
          <span class="toast__icon">{{ icons[n.type] }}</span>
          <span class="toast__message">{{ n.message }}</span>
          <button class="toast__close" @click.stop="remove(n.id)">✕</button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useNotificationStore, type NotificationType } from '@/stores/notification'
import { storeToRefs } from 'pinia'

const store = useNotificationStore()
const { notifications } = storeToRefs(store)
const { remove } = store

const icons: Record<NotificationType, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.toast-container {
  position: fixed;
  top: $space-5;
  right: $space-5;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: $space-2;
  max-width: 400px;
  width: 100%;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: $space-3;
  padding: $space-3 $space-4;
  border-radius: $radius-sm;
  background: var(--surface);
  box-shadow: $shadow-lg;
  border-left: 4px solid;
  cursor: pointer;
  pointer-events: all;
  animation: slideInRight 0.3s ease;

  &--success { border-color: var(--success); }
  &--error   { border-color: var(--danger); }
  &--warning { border-color: var(--warning); }
  &--info    { border-color: var(--info); }

  &__icon {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
    color: #fff;
    flex-shrink: 0;
  }
  &--success &__icon { background: var(--success); }
  &--error   &__icon { background: var(--danger); }
  &--warning &__icon { background: var(--warning); }
  &--info    &__icon { background: var(--info); }

  &__message { flex: 1; font-size: $font-size-sm; color: var(--text); }

  &__close {
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    font-size: 14px;
    padding: 2px;
    &:hover { color: var(--text); }
  }
}

.slide-toast-enter-active { transition: all 0.3s ease; }
.slide-toast-leave-active { transition: all 0.2s ease; }
.slide-toast-enter-from { opacity: 0; transform: translateX(40px); }
.slide-toast-leave-to { opacity: 0; transform: translateX(40px) scale(0.95); }
</style>
