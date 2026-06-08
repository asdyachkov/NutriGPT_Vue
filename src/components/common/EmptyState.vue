<template>
  <div class="empty-state" :class="{ 'empty-state--compact': compact }">
    <div class="empty-state__illustration" aria-hidden="true">
      <!-- Анимированные SVG по вариантам -->
      <svg v-if="variant === 'recipes'" viewBox="0 0 120 120" width="100" height="100">
        <defs>
          <linearGradient id="es-recipes-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#1A6B4B" stop-opacity="0.85"/>
            <stop offset="1" stop-color="#E8A849" stop-opacity="0.9"/>
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="42" fill="url(#es-recipes-g)" opacity="0.1"/>
        <!-- Plate -->
        <circle cx="60" cy="66" r="30" fill="none" stroke="url(#es-recipes-g)" stroke-width="2.5"
                stroke-dasharray="190" stroke-dashoffset="190">
          <animate attributeName="stroke-dashoffset" from="190" to="0" dur="1.2s" fill="freeze"/>
        </circle>
        <!-- Fork -->
        <g stroke="url(#es-recipes-g)" stroke-width="2.5" stroke-linecap="round">
          <line x1="40" y1="32" x2="40" y2="62"/>
          <line x1="36" y1="32" x2="36" y2="44"/>
          <line x1="44" y1="32" x2="44" y2="44"/>
        </g>
        <!-- Knife -->
        <path d="M78 32 L82 32 L82 62" stroke="url(#es-recipes-g)" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        <!-- Steam -->
        <g stroke="#1A6B4B" stroke-width="1.5" stroke-linecap="round" opacity="0.6">
          <path d="M52 50 Q50 44 54 40 Q58 36 54 30">
            <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2.4s" repeatCount="indefinite"/>
          </path>
          <path d="M62 50 Q60 44 64 40 Q68 36 64 30">
            <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2.4s" begin="0.4s" repeatCount="indefinite"/>
          </path>
          <path d="M72 50 Q70 44 74 40 Q78 36 74 30">
            <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2.4s" begin="0.8s" repeatCount="indefinite"/>
          </path>
        </g>
      </svg>

      <svg v-else-if="variant === 'plan'" viewBox="0 0 120 120" width="100" height="100">
        <circle cx="60" cy="60" r="42" fill="#1A6B4B" opacity="0.08"/>
        <!-- Calendar -->
        <rect x="32" y="34" width="56" height="56" rx="6" fill="none" stroke="#1A6B4B" stroke-width="2.5"
              stroke-dasharray="220" stroke-dashoffset="220">
          <animate attributeName="stroke-dashoffset" from="220" to="0" dur="1.2s" fill="freeze"/>
        </rect>
        <line x1="32" y1="48" x2="88" y2="48" stroke="#1A6B4B" stroke-width="2.5"/>
        <line x1="44" y1="28" x2="44" y2="40" stroke="#1A6B4B" stroke-width="3" stroke-linecap="round"/>
        <line x1="76" y1="28" x2="76" y2="40" stroke="#1A6B4B" stroke-width="3" stroke-linecap="round"/>
        <!-- Dots -->
        <g fill="#E8A849">
          <circle cx="46" cy="62" r="2.5">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1.8s" repeatCount="indefinite"/>
          </circle>
          <circle cx="60" cy="62" r="2.5">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1.8s" begin="0.3s" repeatCount="indefinite"/>
          </circle>
          <circle cx="74" cy="62" r="2.5">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1.8s" begin="0.6s" repeatCount="indefinite"/>
          </circle>
          <circle cx="46" cy="76" r="2.5" opacity="0.4"/>
          <circle cx="60" cy="76" r="2.5" opacity="0.4"/>
        </g>
      </svg>

      <svg v-else-if="variant === 'shopping'" viewBox="0 0 120 120" width="100" height="100">
        <circle cx="60" cy="60" r="42" fill="#E8A849" opacity="0.08"/>
        <!-- Basket -->
        <path d="M32 50 L88 50 L82 90 Q82 94 78 94 L42 94 Q38 94 38 90 Z"
              fill="none" stroke="#1A6B4B" stroke-width="2.5" stroke-linejoin="round"
              stroke-dasharray="200" stroke-dashoffset="200">
          <animate attributeName="stroke-dashoffset" from="200" to="0" dur="1.2s" fill="freeze"/>
        </path>
        <path d="M44 50 L52 28 L68 28 L76 50" fill="none" stroke="#1A6B4B" stroke-width="2.5" stroke-linecap="round"/>
        <!-- Bubbles -->
        <g fill="#E8A849">
          <circle cx="50" cy="70" r="3">
            <animate attributeName="cy" values="70;66;70" dur="2s" repeatCount="indefinite"/>
          </circle>
          <circle cx="60" cy="74" r="3">
            <animate attributeName="cy" values="74;70;74" dur="2s" begin="0.4s" repeatCount="indefinite"/>
          </circle>
          <circle cx="70" cy="72" r="3">
            <animate attributeName="cy" values="72;68;72" dur="2s" begin="0.8s" repeatCount="indefinite"/>
          </circle>
        </g>
      </svg>

      <svg v-else-if="variant === 'family'" viewBox="0 0 120 120" width="100" height="100">
        <circle cx="60" cy="60" r="42" fill="#1A6B4B" opacity="0.08"/>
        <!-- Two people -->
        <g fill="none" stroke="#1A6B4B" stroke-width="2.5" stroke-linecap="round">
          <circle cx="48" cy="50" r="8"/>
          <path d="M36 84 Q36 66 48 66 Q60 66 60 84"/>
          <circle cx="74" cy="50" r="8"/>
          <path d="M62 84 Q62 66 74 66 Q86 66 86 84"/>
        </g>
        <path d="M61 55 L73 55" stroke="#E8A849" stroke-width="2.5" stroke-linecap="round">
          <animate attributeName="stroke-dasharray" values="0 20;20 0" dur="2s" repeatCount="indefinite"/>
        </path>
      </svg>

      <svg v-else-if="variant === 'search'" viewBox="0 0 120 120" width="100" height="100">
        <circle cx="60" cy="60" r="42" fill="#1A6B4B" opacity="0.08"/>
        <circle cx="52" cy="52" r="20" fill="none" stroke="#1A6B4B" stroke-width="2.5"/>
        <line x1="68" y1="68" x2="86" y2="86" stroke="#1A6B4B" stroke-width="3" stroke-linecap="round"/>
        <circle cx="52" cy="52" r="6" fill="#E8A849">
          <animate attributeName="r" values="6;8;6" dur="1.6s" repeatCount="indefinite"/>
        </circle>
      </svg>

      <!-- Default: sparkle -->
      <svg v-else viewBox="0 0 120 120" width="100" height="100">
        <circle cx="60" cy="60" r="42" fill="#1A6B4B" opacity="0.08"/>
        <g fill="#1A6B4B">
          <path d="M60 32 L64 52 L84 56 L64 60 L60 80 L56 60 L36 56 L56 52 Z">
            <animateTransform attributeName="transform" type="rotate" from="0 60 60" to="360 60 60" dur="8s" repeatCount="indefinite"/>
          </path>
        </g>
      </svg>
    </div>

    <h3 v-if="title" class="empty-state__title">{{ title }}</h3>
    <p v-if="description" class="empty-state__description">{{ description }}</p>

    <div v-if="$slots.action" class="empty-state__action">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup lang="ts">
export type EmptyStateVariant = 'recipes' | 'plan' | 'shopping' | 'family' | 'search' | 'default'

withDefaults(defineProps<{
  variant?: EmptyStateVariant
  title?: string
  description?: string
  compact?: boolean
}>(), {
  variant: 'default',
  title: '',
  description: '',
  compact: false,
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $space-3;
  padding: $space-10 $space-4;
  text-align: center;
  color: var(--text-secondary, #{var(--text-secondary)});

  &--compact { padding: $space-6 $space-4; }

  &__illustration {
    animation: empty-float 3s ease-in-out infinite;
  }

  &__title {
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    color: var(--text, #{var(--text)});
    margin: 0;
  }

  &__description {
    font-size: $font-size-sm;
    color: var(--text-muted, #{var(--text-muted)});
    max-width: 360px;
    line-height: $line-height-relaxed;
  }

  &__action {
    margin-top: $space-3;
  }
}

@keyframes empty-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
</style>
