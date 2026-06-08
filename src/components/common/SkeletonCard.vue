<template>
  <div class="skeleton-card" :class="{ 'skeleton-card--compact': compact }">
    <div v-if="!compact" class="skeleton-line skeleton-line--image" />
    <div class="skeleton-body">
      <div class="skeleton-line skeleton-line--title" />
      <div class="skeleton-line skeleton-line--text" />
      <div v-if="!compact" class="skeleton-line skeleton-line--text skeleton-line--short" />
      <div v-if="showFooter" class="skeleton-footer">
        <div class="skeleton-line skeleton-line--badge" />
        <div class="skeleton-line skeleton-line--badge" />
        <div class="skeleton-line skeleton-line--badge" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  compact?: boolean
  showFooter?: boolean
}>()
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

@keyframes skeleton-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skeleton-card {
  background: var(--surface, #{var(--surface)});
  border: 1px solid var(--border, #{var(--border)});
  border-radius: $radius-lg;
  box-shadow: var(--card-shadow, #{$shadow-sm});
  overflow: hidden;
  padding: $space-5;

  &--compact { padding: $space-3 $space-4; }
}

.skeleton-body {
  display: flex;
  flex-direction: column;
  gap: $space-2;
}

.skeleton-line {
  height: 14px;
  border-radius: $radius-sm;
  background-image: linear-gradient(
    90deg,
    var(--bg-subtle, #{var(--bg-subtle)}) 0%,
    var(--border, #{var(--border)}) 50%,
    var(--bg-subtle, #{var(--bg-subtle)}) 100%
  );
  background-size: 400% 100%;
  animation: skeleton-shimmer 1.6s ease-in-out infinite;

  &--image {
    height: 140px;
    border-radius: $radius-md;
    margin-bottom: $space-3;
  }
  &--title { height: 18px; width: 70%; }
  &--text { width: 90%; }
  &--short { width: 50%; }
  &--badge { height: 12px; width: 60px; display: inline-block; }
}

.skeleton-footer {
  display: flex;
  gap: $space-3;
  margin-top: $space-2;
}
</style>
