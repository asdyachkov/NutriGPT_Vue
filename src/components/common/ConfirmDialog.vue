<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" class="confirm-overlay" @click.self="handleCancel">
        <Transition name="slide-up" appear>
          <div v-if="isOpen" class="confirm-dialog" role="alertdialog">
            <div class="confirm-icon" :class="`confirm-icon--${options.variant || 'warning'}`">
              {{ iconMap[options.variant || 'warning'] }}
            </div>
            <h3 v-if="options.title" class="confirm-title">{{ options.title }}</h3>
            <p class="confirm-message">{{ options.message }}</p>
            <div class="confirm-actions">
              <button class="confirm-btn confirm-btn--cancel" @click="handleCancel">
                {{ options.cancelText || 'Отмена' }}
              </button>
              <button
                class="confirm-btn"
                :class="`confirm-btn--${options.variant || 'warning'}`"
                @click="handleConfirm"
              >
                {{ options.confirmText || 'Подтвердить' }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useConfirm } from '@/composables/useConfirm'

const { isOpen, options, handleConfirm, handleCancel } = useConfirm()

const iconMap: Record<string, string> = {
  danger: '🗑️',
  warning: '⚠️',
  primary: '❓',
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.confirm-overlay {
  position: fixed;
  inset: 0;
  background: var(--overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  padding: $space-4;
}

.confirm-dialog {
  background: var(--surface);
  border-radius: $radius-lg;
  box-shadow: $shadow-xl;
  padding: $space-6;
  max-width: 400px;
  width: 100%;
  text-align: center;
}

.confirm-icon {
  font-size: 40px;
  margin-bottom: $space-3;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin: 0 auto $space-3;

  &--danger { background: rgba(var(--danger-rgb), 0.1); }
  &--warning { background: rgba(var(--warning-rgb), 0.1); }
  &--primary { background: rgba(var(--primary-rgb), 0.1); }
}

.confirm-title {
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  margin-bottom: $space-2;
}

.confirm-message {
  font-size: $font-size-sm;
  color: var(--text-secondary);
  margin-bottom: $space-5;
  line-height: $line-height-relaxed;
}

.confirm-actions {
  display: flex;
  gap: $space-3;
  justify-content: center;
}

.confirm-btn {
  padding: 10px 24px;
  border-radius: $radius-sm;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  cursor: pointer;
  border: none;
  transition: all $transition-fast;

  &--cancel {
    background: var(--bg);
    color: var(--text-secondary);
    &:hover { background: var(--border); }
  }
  &--danger {
    background: var(--danger);
    color: white;
    &:hover { background: #c62d38; transform: translateY(-1px); }
  }
  &--warning {
    background: var(--accent);
    color: var(--text);
    &:hover { background: var(--accent-light); transform: translateY(-1px); }
  }
  &--primary {
    background: var(--primary);
    color: white;
    &:hover { background: var(--primary-light); transform: translateY(-1px); }
  }
}
</style>
