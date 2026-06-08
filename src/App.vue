<template>
  <component :is="layout">
    <router-view v-slot="{ Component }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </router-view>
  </component>
  <BaseToast />
  <ConfirmDialog />
</template>

<script setup lang="ts">
import { computed, h, defineComponent } from 'vue'
import { useRoute } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import BaseToast from '@/components/common/BaseToast.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

const route = useRoute()
const BlankLayout = defineComponent({
  setup(_, { slots }) {
    return () => h('div', { style: 'min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #f5f7fa 0%, #e4e9f0 100%);' }, slots.default?.())
  }
})

const layouts: Record<string, any> = {
  default: DefaultLayout,
  auth: AuthLayout,
  blank: BlankLayout,
}

const layout = computed(() => {
  const name = (route.meta.layout as string) || 'default'
  return layouts[name] || DefaultLayout
})
</script>
