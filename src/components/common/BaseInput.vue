<template>
  <div class="base-input" :class="{ 'base-input--error': !!error, 'base-input--disabled': disabled }">
    <label v-if="label" :for="inputId" class="base-input__label">
      {{ label }}
      <span v-if="required" class="base-input__required">*</span>
    </label>

    <div class="base-input__wrapper">
      <component
        :is="type === 'textarea' ? 'textarea' : 'input'"
        :id="inputId"
        :type="type === 'textarea' ? undefined : inputType"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :rows="type === 'textarea' ? rows : undefined"
        class="base-input__field"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @blur="$emit('blur')"
      />
      <button
        v-if="type === 'password'"
        type="button"
        class="base-input__toggle"
        @click="showPassword = !showPassword"
        tabindex="-1"
      >
        {{ showPassword ? '🙈' : '👁' }}
      </button>
    </div>

    <p v-if="error" class="base-input__error">{{ error }}</p>
    <p v-else-if="hint" class="base-input__hint">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  modelValue?: string | number
  label?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'textarea'
  placeholder?: string
  error?: string
  hint?: string
  disabled?: boolean
  required?: boolean
  rows?: number
}>()

defineEmits<{
  'update:modelValue': [value: string]
  blur: []
}>()

const showPassword = ref(false)
const inputId = computed(() => `input-${props.label?.replace(/\s/g, '-').toLowerCase() || Math.random().toString(36).slice(2)}`)
const inputType = computed(() => {
  if (props.type === 'password') return showPassword.value ? 'text' : 'password'
  return props.type || 'text'
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.base-input {
  display: flex;
  flex-direction: column;
  gap: $space-1;

  &__label {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: var(--text);
  }
  &__required { color: var(--danger); margin-left: 2px; }

  &__wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  &__field {
    width: 100%;
    padding: 11px 14px;
    font-size: $font-size-base;
    color: var(--text);
    background: var(--input-bg);
    border: 1.5px solid var(--input-border);
    border-radius: $radius-md;
    transition: border-color $transition-fast, box-shadow $transition-fast, background $transition-fast;
    outline: none;
    resize: vertical;
    -webkit-appearance: none;
    appearance: none;

    &::placeholder { color: var(--input-placeholder); }
    &:hover:not(:disabled) { border-color: var(--input-border-hover); }
    &:focus {
      border-color: var(--border-focus);
      box-shadow: 0 0 0 3px var(--input-focus-ring);
      background: var(--surface);
    }
  }

  &__toggle {
    position: absolute;
    right: 12px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
    padding: 4px;
    color: var(--text-muted);
    line-height: 1;
  }

  &__error { font-size: $font-size-xs; color: var(--danger); margin-top: 2px; }
  &__hint { font-size: $font-size-xs; color: var(--text-muted); margin-top: 2px; }

  &--error .base-input__field {
    border-color: var(--danger);
    &:focus { box-shadow: 0 0 0 3px var(--danger-soft); }
  }
  &--disabled .base-input__field {
    opacity: 0.6;
    cursor: not-allowed;
    background: var(--input-disabled-bg);
  }
}
</style>
