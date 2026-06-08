<template>
  <div class="base-select" :class="{ 'base-select--error': !!error }">
    <label v-if="label" :for="selectId" class="base-select__label">
      {{ label }}
      <span v-if="required" class="base-select__required">*</span>
    </label>
    <select
      :id="selectId"
      :value="modelValue"
      :disabled="disabled"
      :required="required"
      class="base-select__field"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option v-for="opt in options" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>
    <p v-if="error" class="base-select__error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface SelectOption {
  value: string
  label: string
}

const props = defineProps<{
  modelValue?: string
  options: SelectOption[]
  label?: string
  placeholder?: string
  error?: string
  disabled?: boolean
  required?: boolean
}>()

defineEmits<{ 'update:modelValue': [value: string] }>()

const selectId = computed(() => `select-${props.label?.replace(/\s/g, '-').toLowerCase() || Math.random().toString(36).slice(2)}`)
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.base-select {
  display: flex;
  flex-direction: column;
  gap: $space-1;

  &__label {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: var(--text);
  }
  &__required { color: var(--danger); margin-left: 2px; }

  &__field {
    width: 100%;
    padding: 11px 14px;
    font-size: $font-size-base;
    color: var(--text);
    background-color: var(--input-bg);
    border: 1.5px solid var(--input-border);
    border-radius: $radius-md;
    transition: border-color $transition-fast, box-shadow $transition-fast;
    outline: none;
    cursor: pointer;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background-image: var(--select-arrow);
    background-repeat: no-repeat;
    background-position: right 14px center;
    padding-right: 36px;

    &:hover:not(:disabled) { border-color: var(--input-border-hover); }
    &:focus {
      border-color: var(--border-focus);
      box-shadow: 0 0 0 3px var(--input-focus-ring);
    }
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      background-color: var(--input-disabled-bg);
    }

    // Нативные option’ы в dark-теме браузер отрендерит за нас через color-scheme: dark
    option {
      background: var(--surface);
      color: var(--text);
    }
  }

  &__error { font-size: $font-size-xs; color: var(--danger); margin-top: 2px; }
  &--error .base-select__field {
    border-color: var(--danger);
    &:focus { box-shadow: 0 0 0 3px var(--danger-soft); }
  }
}
</style>
