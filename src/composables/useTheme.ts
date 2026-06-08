import { ref, watch } from 'vue'

type Theme = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'nutrigpt.theme.v1'
const LEGACY_KEY = 'nutrigpt-theme'

function readStored(): Theme {
  try {
    const v = localStorage.getItem(STORAGE_KEY) as Theme | null
    if (v === 'light' || v === 'dark' || v === 'system') return v
    const legacy = localStorage.getItem(LEGACY_KEY) as Theme | null
    if (legacy === 'light' || legacy === 'dark' || legacy === 'system') {
      localStorage.setItem(STORAGE_KEY, legacy)
      return legacy
    }
  } catch (_e) {
    // localStorage unavailable
  }
  return 'system'
}

const theme = ref<Theme>(readStored())
const isDark = ref(false)

function prefersDark(): boolean {
  if (typeof window === 'undefined') return false
  if (typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyTheme(): void {
  isDark.value = theme.value === 'dark' || (theme.value === 'system' && prefersDark())
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  root.style.colorScheme = isDark.value ? 'dark' : 'light'
}

if (typeof document !== 'undefined') {
  applyTheme()
  try {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', () => {
      if (theme.value === 'system') applyTheme()
    })
  } catch (_e) {
    // matchMedia unsupported
  }
}

watch(theme, (val) => {
  try {
    localStorage.setItem(STORAGE_KEY, val)
  } catch (_e) {
    // ignore
  }
  applyTheme()
})

export function useTheme() {
  function toggleTheme(): void {
    theme.value = isDark.value ? 'light' : 'dark'
  }
  function setTheme(t: Theme): void {
    theme.value = t
  }
  return { theme, isDark, toggleTheme, setTheme }
}
