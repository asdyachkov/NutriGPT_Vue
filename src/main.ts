import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import vLazy from './directives/vLazy'
import './assets/styles/global.scss'
// Side-effect: applies data-theme before first paint
import './composables/useTheme'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.directive('lazy', vLazy)

app.mount('#app')

// -------------------- PWA Service Worker --------------------
// Registration only runs in production build (vite-plugin-pwa).
if ('serviceWorker' in navigator) {
  import('virtual:pwa-register')
    .then(({ registerSW }) => {
      registerSW({
        immediate: true,
        onOfflineReady() {
          console.info('[PWA] app is ready for offline use')
        },
        onNeedRefresh() {
          console.info('[PWA] update available — please reload')
        },
        onRegisterError(err) {
          console.warn('[PWA] SW registration failed:', err)
        },
      })
    })
    .catch(() => {
      // virtual:pwa-register may be absent in dev mode — that is expected
    })
}
