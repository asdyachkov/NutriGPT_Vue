import { defineStore } from 'pinia'
import { ref } from 'vue'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: number
  type: NotificationType
  message: string
  duration: number
}

let nextId = 0

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>([])

  function add(type: NotificationType, message: string, duration = 4000) {
    const id = nextId++
    notifications.value.push({ id, type, message, duration })
    if (duration > 0) {
      setTimeout(() => remove(id), duration)
    }
  }

  function remove(id: number) {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }

  function success(message: string, duration?: number) { add('success', message, duration) }
  function error(message: string, duration?: number)   { add('error', message, duration ?? 6000) }
  function warning(message: string, duration?: number) { add('warning', message, duration) }
  function info(message: string, duration?: number)    { add('info', message, duration) }

  return { notifications, add, remove, success, error, warning, info }
})
