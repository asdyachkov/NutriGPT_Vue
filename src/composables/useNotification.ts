import { useNotificationStore } from '@/stores/notification'

export function useNotification() {
  const store = useNotificationStore()
  return {
    success: store.success,
    error: store.error,
    warning: store.warning,
    info: store.info,
  }
}
