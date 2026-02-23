// app/composables/useNotifications.ts
import type { NotificationSettings } from '~/types/todo'

const STORAGE_KEY = 'notification-settings'

export const useNotifications = () => {
  const isSupported = process.client && 'Notification' in window
  const permission = ref<NotificationPermission>(
    process.client ? Notification.permission : 'default',
  )

  const settings = ref<NotificationSettings>({
    enabled: true,
    deadlineWarnings: {
      oneDayBefore: true,
      threeHoursBefore: true,
      oneHourBefore: true,
    },
    overdueReminders: true,
    soundEnabled: false,
  })

  // Load persisted settings
  if (process.client) {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try { settings.value = JSON.parse(saved) } catch {}
    }
  }

  watch(settings, (val) => {
    if (process.client) localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
  }, { deep: true })

  async function requestPermission() {
    if (!isSupported) return
    permission.value = await Notification.requestPermission()
  }

  function send(title: string, options?: NotificationOptions) {
    if (!isSupported || permission.value !== 'granted' || !settings.value.enabled) return
    new Notification(title, { icon: '/favicon.ico', ...options })
  }

  async function checkDeadlines() {
    if (!settings.value.enabled) return
    try {
      const res = await $fetch<{ success: boolean; data: any[] }>('/api/todos/upcoming')
      if (!res.success) return
      const now = Date.now()
      res.data.forEach((todo) => {
        if (!todo.deadline) return
        const diff = new Date(todo.deadline).getTime() - now
        const hours = diff / 3_600_000

        if (settings.value.deadlineWarnings.oneDayBefore && hours > 23 && hours <= 24)
          send(`📅 Deadline sắp tới: ${todo.title}`, { body: 'Còn 1 ngày để hoàn thành.', tag: `${todo._id}-1d` })

        if (settings.value.deadlineWarnings.threeHoursBefore && hours > 2.5 && hours <= 3)
          send(`⚠️ Cảnh báo: ${todo.title}`, { body: 'Còn 3 giờ đến deadline!', tag: `${todo._id}-3h` })

        if (settings.value.deadlineWarnings.oneHourBefore && hours > 0.5 && hours <= 1)
          send(`🚨 Khẩn cấp: ${todo.title}`, { body: 'Chỉ còn 1 giờ!', tag: `${todo._id}-1h` })

        if (settings.value.overdueReminders && hours < 0 && !todo.completed)
          send(`❌ Quá hạn: ${todo.title}`, { body: 'Task này đã quá deadline.', tag: `${todo._id}-overdue` })
      })
    } catch {}
  }

  let _interval: ReturnType<typeof setInterval> | null = null

  function startMonitoring() {
    if (_interval) return
    checkDeadlines()
    _interval = setInterval(checkDeadlines, 15 * 60 * 1000)
  }

  function stopMonitoring() {
    if (_interval) { clearInterval(_interval); _interval = null }
  }

  return { isSupported, permission, settings, requestPermission, send, checkDeadlines, startMonitoring, stopMonitoring }
}
