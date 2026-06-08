<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="modal-overlay" @click.self="closeOnOverlay && $emit('update:modelValue', false)">
        <Transition name="slide-up" appear>
          <div v-if="modelValue" class="modal" :class="`modal--${size}`" role="dialog" aria-modal="true">
            <header v-if="$slots.header || title" class="modal__header">
              <slot name="header">
                <h3 class="modal__title">{{ title }}</h3>
              </slot>
              <button class="modal__close" @click="$emit('update:modelValue', false)" aria-label="Закрыть">✕</button>
            </header>
            <div class="modal__body">
              <slot />
            </div>
            <footer v-if="$slots.footer" class="modal__footer">
              <slot name="footer" />
            </footer>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg'
  closeOnOverlay?: boolean
}>()

defineEmits<{ 'update:modelValue': [value: boolean] }>()
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: $space-4;
}

.modal {
  background: var(--surface);
  border-radius: $radius-lg;
  box-shadow: $shadow-xl;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &--sm { max-width: 400px; }
  &--md { max-width: 560px; }
  &--lg { max-width: 720px; }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $space-5 $space-5 $space-3;
  }
  &__title { font-size: $font-size-xl; font-weight: $font-weight-semibold; }
  &__close {
    background: none;
    border: none;
    font-size: 20px;
    color: var(--text-muted);
    cursor: pointer;
    padding: $space-1;
    border-radius: $radius-sm;
    transition: all $transition-fast;
    &:hover { background: var(--bg); color: var(--text); }
  }
  &__body { padding: $space-3 $space-5 $space-5; overflow-y: auto; flex: 1; }
  &__footer {
    padding: $space-3 $space-5 $space-5;
    display: flex;
    justify-content: flex-end;
    gap: $space-3;
    border-top: 1px solid var(--border);
  }
}
</style>
