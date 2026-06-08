<template>
  <div class="base-card" :class="{ 'base-card--hoverable': hoverable, 'base-card--bordered': bordered }">
    <div v-if="$slots.header || title" class="base-card__header">
      <slot name="header">
        <h4 class="base-card__title">{{ title }}</h4>
        <p v-if="subtitle" class="base-card__subtitle">{{ subtitle }}</p>
      </slot>
    </div>
    <div class="base-card__body" :class="{ 'base-card__body--no-padding': noPadding }">
      <slot />
    </div>
    <div v-if="$slots.footer" class="base-card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
  subtitle?: string
  hoverable?: boolean
  bordered?: boolean
  noPadding?: boolean
}>()
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.base-card {
  background: var(--surface);
  border-radius: $radius-xl;
  border: 1px solid var(--border);
  overflow: hidden;
  transition: border-color $transition-base, box-shadow $transition-base, transform $transition-base, background $transition-base;
  color: var(--text);

  &--hoverable {
    cursor: pointer;
    &:hover {
      border-color: var(--primary);
      box-shadow: var(--card-shadow-hover);
      transform: translateY(-3px);
    }
    &:active {
      transform: translateY(-1px);
      box-shadow: var(--card-shadow);
    }
  }
  &--bordered { border: 1px solid var(--border); }

  &__header { padding: $space-5 $space-5 0; }
  &__title { font-size: $font-size-lg; font-weight: $font-weight-semibold; color: var(--text); }
  &__subtitle { font-size: $font-size-sm; color: var(--text-secondary); margin-top: $space-1; }
  &__body { padding: $space-5; }
  &__body--no-padding { padding: 0; }
  &__footer { padding: $space-3 $space-5 $space-5; border-top: 1px solid var(--border); }
}
</style>
