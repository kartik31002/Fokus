'use client'

import { useState, useEffect } from 'react'
import Clock from '@/components/Clock'
import TaskSchedule from '@/components/TaskSchedule'
import FocusMode from '@/components/FocusMode'
import Rewards from '@/components/Rewards'
import StreakCounter from '@/components/StreakCounter'
import NotificationBell from '@/components/Notifications'
import SharedTimer from '@/components/SharedTimer'
import { useTasks } from '@/hooks/useTasks'
import { useTheme } from '@/hooks/useTheme'
import { useRewards } from '@/hooks/useRewards'
import { dailyStatsStorage, initializeDefaultRewards } from '@/lib/storage'
import { getTodayDateString } from '@/lib/utils'
import type { Task } from '@/types'
import Snowfall from 'react-snowfall'

type View = 'dashboard' | 'focus' | 'rewards' | 'shared-timer'

export default function Home() {
  const [currentView, setCurrentView] = useState<View>('dashboard')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const { tasks, getActiveTask } = useTasks()
  const { theme, setTheme, resolvedTheme } = useTheme()

  useEffect(() => {
    initializeDefaultRewards()
    
    // Initialize today's stats if needed
    const today = getTodayDateString()
    const stats = dailyStatsStorage.get(today)
    if (!stats) {
      dailyStatsStorage.save({
        date: today,
        tasksCompleted: 0,
        totalTasks: tasks.length,
        focusTime: 0,
        pointsEarned: 0,
        streak: 0,
      })
    }
  }, [])

  useEffect(() => {
    // Apply theme class
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(resolvedTheme)
  }, [resolvedTheme])

  const activeTask = getActiveTask()

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setCurrentView('focus')
  }

  const handleFocusComplete = () => {
    setCurrentView('dashboard')
    setSelectedTask(null)
  }

  return (
    <main className={`min-h-screen transition-colors duration-300 ${
      resolvedTheme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
    }`}>
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-reward-600 bg-clip-text text-transparent">
                ❤️ Fokus
              </h1>
              <nav className="hidden md:flex gap-2">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentView === 'dashboard'
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setCurrentView('focus')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentView === 'focus'
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  Focus Mode
                </button>
                <button
                  onClick={() => setCurrentView('rewards')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentView === 'rewards'
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  Rewards
                </button>
                <button
                  onClick={() => setCurrentView('shared-timer')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentView === 'shared-timer'
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  Shared Timer
                </button>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell />
              <button
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Toggle theme"
              >
                {resolvedTheme === 'dark' ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'dashboard' && (
          <div className="space-y-8">
            {/* Streak Counter */}
            <div className="max-w-md mx-auto">
              <StreakCounter />
            </div>

            {/* Clock */}
            <Clock activeTask={activeTask || undefined} className="mb-12" />

            {/* Task Schedule */}
            <TaskSchedule onTaskClick={handleTaskClick} />
          </div>
        )}

        {currentView === 'focus' && (
          <div className="max-w-4xl mx-auto">
            <FocusMode taskId={selectedTask?.id} onComplete={handleFocusComplete} />
          </div>
        )}

        {currentView === 'rewards' && (
          <Rewards />
        )}

        {currentView === 'shared-timer' && (
          <SharedTimer />
        )}
      </div>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 z-30">
        <div className="flex justify-around py-3">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              currentView === 'dashboard'
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <span className="text-xl">📊</span>
            <span className="text-xs font-medium">Dashboard</span>
          </button>
          <button
            onClick={() => setCurrentView('focus')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              currentView === 'focus'
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <span className="text-xl">🎯</span>
            <span className="text-xs font-medium">Focus</span>
          </button>
          <button
            onClick={() => setCurrentView('rewards')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              currentView === 'rewards'
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <span className="text-xl">💝</span>
            <span className="text-xs font-medium">Rewards</span>
          </button>
          <button
            onClick={() => setCurrentView('shared-timer')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              currentView === 'shared-timer'
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <span className="text-xl">⏱️</span>
            <span className="text-xs font-medium">Timer</span>
          </button>
        </div>
      </nav>
    </main>
  )
}
