// Core data types for the productivity app

export interface Task {
  id: string
  title: string
  description?: string
  startTime: string // HH:mm format
  endTime: string // HH:mm format
  completed: boolean
  completedAt?: string // ISO timestamp
  createdAt: string // ISO timestamp
  updatedAt: string // ISO timestamp
  color?: string // Optional color tag
  order: number // For reordering
}

export interface Reward {
  id: string
  name: string
  description: string
  icon: string // Emoji or icon identifier
  pointsRequired: number
  unlocked: boolean
  unlockedAt?: string // ISO timestamp
  createdAt: string
}

export interface FocusSession {
  id: string
  taskId?: string // Associated task
  startTime: string // ISO timestamp
  endTime?: string // ISO timestamp
  duration: number // in minutes
  completed: boolean
  pomodoroMode: boolean
  pointsEarned: number
  tabSwitches: number // Count of tab visibility changes
}

export interface DailyStats {
  date: string // YYYY-MM-DD format
  tasksCompleted: number
  totalTasks: number
  focusTime: number // in minutes
  pointsEarned: number
  streak: number
  lastActiveDate?: string
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'auto'
  pomodoroDuration: number // in minutes (default 25)
  shortBreakDuration: number // in minutes (default 5)
  longBreakDuration: number // in minutes (default 15)
  notificationsEnabled: boolean
  focusModeEnabled: boolean
  tabSwitchPenalty: number // Points lost per tab switch
  rewardPointsPerMinute: number // Points earned per minute of focus
}

export interface NotificationData {
  id: string
  type: 'task-start' | 'task-checkin' | 'task-end' | 'focus-complete' | 'reward-unlocked'
  title: string
  message: string
  timestamp: string
  read: boolean
  actionUrl?: string
}
