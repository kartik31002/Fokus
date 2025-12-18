// LocalStorage and IndexedDB persistence layer
// Extensible for future backend sync

import type { Task, Reward, FocusSession, DailyStats, UserSettings, NotificationData } from '@/types'

const STORAGE_KEYS = {
  TASKS: 'fokus:tasks',
  REWARDS: 'fokus:rewards',
  FOCUS_SESSIONS: 'fokus:focus-sessions',
  DAILY_STATS: 'fokus:daily-stats',
  SETTINGS: 'fokus:settings',
  NOTIFICATIONS: 'fokus:notifications',
  CURRENT_STREAK: 'fokus:current-streak',
} as const

// Generic storage helpers
const storage = {
  get<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error)
      return defaultValue
    }
  },

  set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error)
    }
  },

  remove(key: string): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  },
}

// Task storage
export const taskStorage = {
  getAll(): Task[] {
    return storage.get<Task[]>(STORAGE_KEYS.TASKS, [])
  },

  getByDate(date: string): Task[] {
    // For now, return all tasks. In future, can filter by date
    return this.getAll()
  },

  getById(id: string): Task | undefined {
    return this.getAll().find(task => task.id === id)
  },

  save(task: Task): void {
    const tasks = this.getAll()
    const index = tasks.findIndex(t => t.id === task.id)
    if (index >= 0) {
      tasks[index] = task
    } else {
      tasks.push(task)
    }
    storage.set(STORAGE_KEYS.TASKS, tasks)
  },

  saveAll(tasks: Task[]): void {
    storage.set(STORAGE_KEYS.TASKS, tasks)
  },

  delete(id: string): void {
    const tasks = this.getAll().filter(t => t.id !== id)
    storage.set(STORAGE_KEYS.TASKS, tasks)
  },
}

// Reward storage
export const rewardStorage = {
  getAll(): Reward[] {
    return storage.get<Reward[]>(STORAGE_KEYS.REWARDS, [])
  },

  getById(id: string): Reward | undefined {
    return this.getAll().find(reward => reward.id === id)
  },

  save(reward: Reward): void {
    const rewards = this.getAll()
    const index = rewards.findIndex(r => r.id === reward.id)
    if (index >= 0) {
      rewards[index] = reward
    } else {
      rewards.push(reward)
    }
    storage.set(STORAGE_KEYS.REWARDS, rewards)
  },

  unlock(id: string): void {
    const rewards = this.getAll()
    const reward = rewards.find(r => r.id === id)
    if (reward) {
      reward.unlocked = true
      reward.unlockedAt = new Date().toISOString()
      storage.set(STORAGE_KEYS.REWARDS, rewards)
    }
  },

  claim(id: string): boolean {
    const rewards = this.getAll()
    const reward = rewards.find(r => r.id === id)
    if (reward) {
      reward.unlocked = true
      reward.unlockedAt = new Date().toISOString()
      storage.set(STORAGE_KEYS.REWARDS, rewards)
      return true
    }
    return false
  },
}

// Focus session storage
export const focusSessionStorage = {
  getAll(): FocusSession[] {
    return storage.get<FocusSession[]>(STORAGE_KEYS.FOCUS_SESSIONS, [])
  },

  getByDate(date: string): FocusSession[] {
    return this.getAll().filter(session => {
      const sessionDate = new Date(session.startTime).toISOString().split('T')[0]
      return sessionDate === date
    })
  },

  save(session: FocusSession): void {
    const sessions = this.getAll()
    sessions.push(session)
    storage.set(STORAGE_KEYS.FOCUS_SESSIONS, sessions)
  },
}

// Daily stats storage
export const dailyStatsStorage = {
  get(date: string): DailyStats | null {
    const allStats = storage.get<Record<string, DailyStats>>(STORAGE_KEYS.DAILY_STATS, {})
    return allStats[date] || null
  },

  save(stats: DailyStats): void {
    const allStats = storage.get<Record<string, DailyStats>>(STORAGE_KEYS.DAILY_STATS, {})
    allStats[stats.date] = stats
    storage.set(STORAGE_KEYS.DAILY_STATS, allStats)
  },

  updateStreak(): number {
    const today = new Date().toISOString().split('T')[0]
    const stats = this.get(today)
    
    if (stats && stats.tasksCompleted > 0) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]
      const yesterdayStats = this.get(yesterdayStr)
      
      if (yesterdayStats && yesterdayStats.streak > 0) {
        stats.streak = yesterdayStats.streak + 1
      } else {
        stats.streak = 1
      }
      
      this.save(stats)
      return stats.streak
    }
    
    return stats?.streak || 0
  },
}

// Settings storage
export const settingsStorage = {
  get(): UserSettings {
    return storage.get<UserSettings>(STORAGE_KEYS.SETTINGS, {
      theme: 'auto',
      pomodoroDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      notificationsEnabled: true,
      focusModeEnabled: true,
      tabSwitchPenalty: 5,
      rewardPointsPerMinute: 1,
    })
  },

  save(settings: UserSettings): void {
    storage.set(STORAGE_KEYS.SETTINGS, settings)
  },
}

// Notification storage
export const notificationStorage = {
  getAll(): NotificationData[] {
    return storage.get<NotificationData[]>(STORAGE_KEYS.NOTIFICATIONS, [])
  },

  getUnread(): NotificationData[] {
    return this.getAll().filter(n => !n.read)
  },

  save(notification: NotificationData): void {
    const notifications = this.getAll()
    notifications.push(notification)
    // Keep only last 50 notifications
    if (notifications.length > 50) {
      notifications.shift()
    }
    storage.set(STORAGE_KEYS.NOTIFICATIONS, notifications)
  },

  markAsRead(id: string): void {
    const notifications = this.getAll()
    const notification = notifications.find(n => n.id === id)
    if (notification) {
      notification.read = true
      storage.set(STORAGE_KEYS.NOTIFICATIONS, notifications)
    }
  },

  markAllAsRead(): void {
    const notifications = this.getAll()
    notifications.forEach(n => n.read = true)
    storage.set(STORAGE_KEYS.NOTIFICATIONS, notifications)
  },
}

// Initialize default rewards if none exist, or add missing ones
export function initializeDefaultRewards(): void {
  const existingRewards = rewardStorage.getAll()
  const existingIds = new Set(existingRewards.map(r => r.id))
  
  const defaultRewards: Reward[] = [
      {
        id: '1',
        name: 'Kiss',
        description: 'A sweet, loving kiss',
        icon: '💋',
        pointsRequired: 15,
        unlocked: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Hug',
        description: 'A warm, comforting hug',
        icon: '🤗',
        pointsRequired: 20,
        unlocked: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        name: 'Forehead Kiss',
        description: 'A tender forehead kiss',
        icon: '😘',
        pointsRequired: 25,
        unlocked: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: '4',
        name: 'Cuddle Time',
        description: 'Cozy cuddle session together',
        icon: '💕',
        pointsRequired: 40,
        unlocked: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: '5',
        name: 'Massage',
        description: 'A relaxing massage',
        icon: '💆',
        pointsRequired: 50,
        unlocked: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: '6',
        name: 'Love Note',
        description: 'A handwritten love note',
        icon: '💌',
        pointsRequired: 30,
        unlocked: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: '7',
        name: 'Movie Night',
        description: 'Cozy movie night together',
        icon: '🎬',
        pointsRequired: 60,
        unlocked: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: '8',
        name: 'Cook Together',
        description: 'Prepare a meal together',
        icon: '👨‍🍳',
        pointsRequired: 70,
        unlocked: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: '9',
        name: 'Stargazing',
        description: 'Watch the stars together',
        icon: '⭐',
        pointsRequired: 80,
        unlocked: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: '10',
        name: 'Breakfast in Bed',
        description: 'Wake up to breakfast in bed',
        icon: '🥐',
        pointsRequired: 90,
        unlocked: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: '11',
        name: 'Date Night',
        description: 'Special date night out',
        icon: '🌹',
        pointsRequired: 120,
        unlocked: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: '12',
        name: 'Weekend Getaway',
        description: 'A romantic weekend trip',
        icon: '✈️',
        pointsRequired: 300,
        unlocked: false,
        createdAt: new Date().toISOString(),
      },
    ]
  
  // Add only rewards that don't already exist
  defaultRewards.forEach(reward => {
    if (!existingIds.has(reward.id)) {
      rewardStorage.save(reward)
    }
  })
}
