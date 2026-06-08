import { ref, computed, watch, onMounted } from 'vue'
import type { MealType } from '@/types/api'

/**
 * useReminders — напоминания о приёмах пищи через Web Notifications API.
 *
 * Хранит расписание в localStorage, раз в минуту сравнивает текущее время
 * с расписанием и отправляет уведомление. Не требует серверного push-канала
 * — работает локально на устройстве пользователя.
 *
 * Для бэкграунд-доставки (когда вкладка закрыта) в будущем можно подключить
 * Push API + VAPID на бэкенде — интерфейс останется совместимым.
 */

export type ReminderTime = string // HH:MM

export interface ReminderSchedule {
  enabled: boolean
  breakfast: ReminderTime
  lunch: ReminderTime
  dinner: ReminderTime
  snack: ReminderTime
}

const STORAGE_KEY = 'nutrigpt.reminders.v1'

const DEFAULT_SCHEDULE: ReminderSchedule = {
  enabled: false,
  breakfast: '08:30',
  lunch: '13:00',
  dinner: '19:00',
  snack: '16:00',
}

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Завтрак',
  lunch: 'Обед',
  dinner: 'Ужин',
  snack: 'Перекус',
}

const MEAL_BODIES: Record<MealType, string> = {
  breakfast: '🌅 Пора позавтракать — загляните в план питания!',
  lunch: '☀️ Время обеда — не забудьте поесть.',
  dinner: '🌙 Ужин по расписанию.',
  snack: '🍎 Время перекуса.',
}

const schedule = ref<ReminderSchedule>(loadFromStorage())
const permission = ref<NotificationPermission>(
  typeof Notification !== 'undefined' ? Notification.permission : 'default'
)

// Сет ключей «YYYY-MM-DD_mealType», для которых уже отправили уведомление сегодня
const sentToday = new Set<string>()
let tickerId: number | null = null

function loadFromStorage(): ReminderSchedule {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_SCHEDULE }
    const parsed = JSON.parse(raw)
    return { ...DEFAULT_SCHEDULE, ...parsed }
  } catch {
    return { ...DEFAULT_SCHEDULE }
  }
}

function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schedule.value))
  } catch {
    // ignore
  }
}

function todayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function isNowAtOrJustPast(targetHHmm: ReminderTime): boolean {
  const [h, m] = targetHHmm.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return false
  const now = new Date()
  const target = new Date()
  target.setHours(h, m, 0, 0)
  const diffMs = now.getTime() - target.getTime()
  // Срабатываем в окне 0..60 секунд после целевого времени
  return diffMs >= 0 && diffMs < 60_000
}

function fireNotification(mealType: MealType) {
  if (typeof Notification === 'undefined') return
  if (Notification.permission !== 'granted') return
  const title = `NutriGPT — ${MEAL_LABELS[mealType]}`
  const body = MEAL_BODIES[mealType]
  try {
    const n = new Notification(title, {
      body,
      icon: '/favicon.svg',
      tag: `nutrigpt-${mealType}`,
    } as NotificationOptions)
    n.onclick = () => {
      window.focus()
      window.location.href = '/meal-plan'
      n.close()
    }
  } catch {
    // Некоторые браузеры (Safari) не любят отдельные опции — попробуем минимально
    try {
      new Notification(title, { body })
    } catch {
      /* no-op */
    }
  }
}

function tick() {
  if (!schedule.value.enabled) return
  if (permission.value !== 'granted') return
  const today = todayKey()

  ;(Object.keys(MEAL_LABELS) as MealType[]).forEach((meal) => {
    const time = schedule.value[meal]
    if (!time) return
    if (!isNowAtOrJustPast(time)) return
    const key = `${today}_${meal}`
    if (sentToday.has(key)) return
    fireNotification(meal)
    sentToday.add(key)
  })

  // Очищаем ключи «вчерашних» сработок (простая сборка мусора)
  if (sentToday.size > 8) {
    for (const key of Array.from(sentToday)) {
      if (!key.startsWith(today)) sentToday.delete(key)
    }
  }
}

function startTicker() {
  if (tickerId !== null) return
  // Проверяем каждые 20 секунд — дешёво и надёжно
  tickerId = window.setInterval(tick, 20_000)
}

function stopTicker() {
  if (tickerId !== null) {
    window.clearInterval(tickerId)
    tickerId = null
  }
}

export function useReminders() {
  const isSupported = computed(() => typeof Notification !== 'undefined')

  async function requestPermission(): Promise<NotificationPermission> {
    if (!isSupported.value) return 'denied'
    try {
      const p = await Notification.requestPermission()
      permission.value = p
      return p
    } catch {
      return 'denied'
    }
  }

  async function setEnabled(enabled: boolean) {
    if (enabled) {
      const p = await requestPermission()
      if (p !== 'granted') {
        schedule.value = { ...schedule.value, enabled: false }
        return false
      }
    }
    schedule.value = { ...schedule.value, enabled }
    return enabled
  }

  function setTime(meal: MealType, time: ReminderTime) {
    schedule.value = { ...schedule.value, [meal]: time }
  }

  function testNow() {
    if (permission.value !== 'granted') return
    fireNotification('snack')
  }

  onMounted(() => {
    // Синхронизируем permission после маунта (SSR-safe)
    if (typeof Notification !== 'undefined') {
      permission.value = Notification.permission
    }
    startTicker()
  })

  watch(schedule, saveToStorage, { deep: true })

  return {
    schedule,
    permission,
    isSupported,
    requestPermission,
    setEnabled,
    setTime,
    testNow,
    stopTicker,
  }
}
