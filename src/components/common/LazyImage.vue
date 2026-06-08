<template>
  <div
    class="lazy-image"
    :class="[
      `lazy-image--${aspect}`,
      { 'lazy-image--loaded': loaded, 'lazy-image--errored': errored },
    ]"
    :style="rootStyle"
  >
    <!-- Shimmer placeholder -->
    <div v-if="!loaded && !errored" class="lazy-image__shimmer" aria-hidden="true" />

    <!-- Image -->
    <img
      v-if="src && !errored"
      v-lazy="src"
      :alt="alt"
      class="lazy-image__img"
      :style="imgStyle"
      draggable="false"
      @load="handleLoad"
      @lazy-error="handleError"
    />

    <!-- Fallback -->
    <div v-if="errored || !src" class="lazy-image__fallback">
      <div class="lazy-image__fallback-inner">
        <span class="lazy-image__emoji" aria-hidden="true">{{ emoji }}</span>
        <span v-if="showLabel && label" class="lazy-image__label">{{ label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import vLazy from '@/directives/vLazy'

interface Props {
  src?: string | null
  alt?: string
  emoji?: string
  label?: string
  showLabel?: boolean
  /** Соотношение сторон контейнера */
  aspect?: 'square' | 'video' | 'card' | 'hero' | 'auto'
  /** object-fit для img */
  fit?: 'cover' | 'contain'
  /** Радиус скругления, если нужно индивидуально */
  radius?: string
  /** Максимальная высота (для aspect='auto') */
  maxHeight?: string
}

const props = withDefaults(defineProps<Props>(), {
  src: null,
  alt: '',
  emoji: '🍽️',
  label: '',
  showLabel: false,
  aspect: 'card',
  fit: 'cover',
  radius: '',
  maxHeight: '',
})

const loaded = ref(false)
const errored = ref(false)

watch(
  () => props.src,
  () => {
    loaded.value = false
    errored.value = false
  }
)

function handleLoad() {
  loaded.value = true
}

function handleError() {
  errored.value = true
  loaded.value = false
}

const rootStyle = computed(() => {
  const s: Record<string, string> = {}
  if (props.radius) s.borderRadius = props.radius
  if (props.aspect === 'auto' && props.maxHeight) s.maxHeight = props.maxHeight
  return s
})

const imgStyle = computed(() => ({
  objectFit: props.fit,
}))
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.lazy-image {
  position: relative;
  overflow: hidden;
  border-radius: $radius-md;
  background: var(--bg-subtle, #{var(--bg-subtle)});
  width: 100%;

  &--square { aspect-ratio: 1 / 1; }
  &--video { aspect-ratio: 16 / 9; }
  &--card { aspect-ratio: 4 / 3; }
  &--hero { aspect-ratio: 21 / 9; }
  &--auto { aspect-ratio: auto; }

  &__img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: opacity $transition-base, transform $transition-slow;
    opacity: 0;
  }

  &--loaded &__img { opacity: 1; }

  &__shimmer {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      var(--bg-subtle, #{var(--bg-subtle)}) 25%,
      var(--border, #{var(--border)}) 50%,
      var(--bg-subtle, #{var(--bg-subtle)}) 75%
    );
    background-size: 400% 100%;
    animation: lazy-shimmer 1.6s ease-in-out infinite;
  }

  &__fallback {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(
      135deg,
      rgba(var(--primary-rgb), 0.12) 0%,
      rgba(var(--accent-rgb), 0.12) 100%
    );
  }

  &__fallback-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $space-1;
    animation: fadeIn 0.3s ease both;
  }

  &__emoji {
    font-size: 48px;
    line-height: 1;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.08));
  }

  &__label {
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;
    color: var(--text-muted, #{var(--text-muted)});
  }
}

@keyframes lazy-shimmer {
  0% { background-position: 100% 0; }
  100% { background-position: -100% 0; }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
