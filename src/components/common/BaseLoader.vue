<template>
  <div class="base-loader" :class="`base-loader--${size}`">
    <div class="base-loader__dots">
      <span class="base-loader__dot" />
      <span class="base-loader__dot" />
      <span class="base-loader__dot" />
    </div>
    <p v-if="text" class="base-loader__text">{{ text }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  size?: 'sm' | 'md' | 'lg'
  text?: string
}>()
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.base-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $space-3;

  &__dots {
    display: flex;
    gap: 6px;
  }

  &__dot {
    border-radius: 50%;
    background: var(--primary);
    animation: loaderPulse 1.2s ease-in-out infinite;

    &:nth-child(2) { animation-delay: 0.15s; }
    &:nth-child(3) { animation-delay: 0.3s; }
  }

  &--sm &__dot { width: 6px; height: 6px; }
  &--md &__dot { width: 10px; height: 10px; }
  &--lg &__dot { width: 14px; height: 14px; }

  &__text { font-size: $font-size-sm; color: var(--text-secondary); }
}

@keyframes loaderPulse {
  0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1.2); }
}
</style>
