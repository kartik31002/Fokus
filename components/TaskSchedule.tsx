'use client'

import { useState, useEffect } from 'react'
import { useTasks } from '@/hooks/useTasks'
import { formatTime, getCurrentTimeString, isTimeBetween } from '@/lib/utils'
import type { Task } from '@/types'

interface TaskScheduleProps {
  onTaskClick?: (task: Task) => void
}

export default function TaskSchedule({ onTaskClick }: TaskScheduleProps) {
  const { tasks, toggleTaskComplete, deleteTask, updateTask, addTask } = useTasks()
  const [currentTime, setCurrentTime] = useState(getCurrentTimeString())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
  })

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTask.title && newTask.startTime && newTask.endTime) {
      addTask({
        title: newTask.title,
        description: newTask.description || undefined,
        startTime: newTask.startTime,
        endTime: newTask.endTime,
      })
      setNewTask({ title: '', description: '', startTime: '', endTime: '' })
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTimeString())
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [])


  const getActiveTask = (): Task | null => {
    return tasks.find(task => 
      !task.completed && isTimeBetween(task.startTime, task.endTime, currentTime)
    ) || null
  }

  const isTaskActive = (task: Task): boolean => {
    return task.id === getActiveTask()?.id
  }

  const isTaskUpcoming = (task: Task): boolean => {
    if (task.completed) return false
    const current = parseInt(currentTime.replace(':', ''))
    const start = parseInt(task.startTime.replace(':', ''))
    return start > current && !isTaskActive(task)
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Today&apos;s Schedule
        </h2>

        {/* Add Task Form */}
        <form onSubmit={handleAddTask} className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Task title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
              required
            />
            <input
              type="time"
              value={newTask.startTime}
              onChange={(e) => setNewTask({ ...newTask, startTime: e.target.value })}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
              required
            />
            <input
              type="time"
              value={newTask.endTime}
              onChange={(e) => setNewTask({ ...newTask, endTime: e.target.value })}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
              required
            />
            <button
              type="submit"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Add Task
            </button>
          </div>
          <input
            type="text"
            placeholder="Description (optional)"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            className="mt-3 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
          />
        </form>

        {/* Task List */}
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p className="text-lg">No tasks scheduled for today</p>
              <p className="text-sm mt-2">Add your first task above to get started!</p>
            </div>
          ) : (
            tasks.map((task) => {
              const active = isTaskActive(task)
              const upcoming = isTaskUpcoming(task)
              
              return (
                <div
                  key={task.id}
                  className={`
                    p-4 rounded-xl border-2 transition-all cursor-pointer
                    ${task.completed 
                      ? 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 opacity-60' 
                      : active
                      ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 shadow-lg'
                      : upcoming
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                  onClick={() => onTaskClick?.(task)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={(e) => {
                            e.stopPropagation()
                            toggleTaskComplete(task.id)
                          }}
                          className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                        />
                        <div className="flex-1">
                          <h3 className={`
                            text-lg font-semibold
                            ${task.completed 
                              ? 'line-through text-gray-500 dark:text-gray-400' 
                              : 'text-gray-900 dark:text-white'
                            }
                          `}>
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              {task.startTime} - {task.endTime}
                            </span>
                            {active && (
                              <span className="px-2 py-1 bg-primary-500 text-white text-xs font-medium rounded-full animate-pulse">
                                Active Now
                              </span>
                            )}
                            {upcoming && (
                              <span className="px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
                                Upcoming
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm('Are you sure you want to delete this task?')) {
                          deleteTask(task.id)
                        }
                      }}
                      className="ml-4 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
