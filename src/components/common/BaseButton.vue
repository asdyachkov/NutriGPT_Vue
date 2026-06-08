<template>
  <button
    :class="['base-btn', `base-btn--${variant}`, `base-btn--${size}`, { 'base-btn--loading': loading, 'base-btn--block': block }]"
    :disabled="disabled || loading"
    :type="type"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="base-btn__spinner" />
    <span :class="{ 'opacity-0': loading }">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
  block?: boolean
}>()

defineEmits<{ click: [e: MouseEvent] }>()
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.base-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: $space-2;
  font-family: $font-family;
  font-weight: $font-weight-semibold;
  border: 1.5px solid transparent;
  border-radius: $radius-md;
  cursor: pointer;
  transition: background $transition-base, color $transition-base, border-color $transition-base, box-shadow $transition-base, transform $transition-base;
  white-space: nowrap;
  user-select: none;
  line-height: 1.25;
  letter-spacing: 0.01em;
  will-change: transform;

  &:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }

  // --- Variants ---
  &--primary {
    background: var(--primary);
    color: var(--text-on-primary);
    box-shadow: 0 1px 2px rgba(var(--primary-rgb), 0.15);
    &:hover:not(:disabled) {
      background: var(--primary-light);
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(var(--primary-rgb), 0.28);
    }
    &:active:not(:disabled) { transform: translateY(0); box-shadow: 0 1px 2px rgba(var(--primary-rgb), 0.2); }
  }
  &--secondary {
    background: var(--accent);
    color: #1A1206;
    box-shadow: 0 1px 2px rgba(var(--accent-rgb), 0.2);
    &:hover:not(:disabled) {
      background: var(--accent-light);
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(var(--accent-rgb), 0.28);
    }
    &:active:not(:disabled) { transform: translateY(0); }
  }
  &--outline {
    background: transparent;
    color: var(--primary);
    border-color: var(--primary);
    &:hover:not(:disabled) {
      background: rgba(var(--primary-rgb), 0.08);
      border-color: var(--primary-light);
      color: var(--primary-light);
    }
    &:active:not(:disabled) { background: rgba(var(--primary-rgb), 0.14); }
  }
  &--danger {
    background: var(--danger);
    color: #fff;
    box-shadow: 0 1px 2px rgba(var(--danger-rgb), 0.2);
    &:hover:not(:disabled) {
      background: rgba(var(--danger-rgb), 0.92);
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(var(--danger-rgb), 0.28);
    }
    &:active:not(:disabled) { transform: translateY(0); }
  }
  &--ghost {
    background: transparent;
    color: var(--text-secondary);
    &:hover:not(:disabled) {
      background: var(--surface-hover);
      color: var(--text);
    }
    &:active:not(:disabled) { background: var(--bg-subtle); }
  }

  // --- Sizes (generous horizontal padding + min-height so text never kisses borders) ---
  &--sm {
    padding: 8px 18px;
    font-size: $font-size-sm;
    min-height: 36px;
    border-radius: $radius-sm;
  }
  &--md {
    padding: 11px 24px;
    font-size: $font-size-base;
    min-height: 44px;
  }
  &--lg {
    padding: 14px 32px;
    font-size: $font-size-lg;
    min-height: 52px;
    border-radius: $radius-lg;
  }

  &--block { width: 100%; }
  &--loading { pointer-events: none; }

  &__spinner {
    position: absolute;
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255, 255, 255, 0.35);
    border-top-color: currentColor;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }
}
</style>
