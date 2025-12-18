'use client'

import { useState, useEffect, useCallback } from 'react'
import { taskStorage } from '@/lib/storage'
import { generateId, getCurrentTimeString } from '@/lib/utils'
import type { Task } from '@/types'

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = useCallback(() => {
    const loadedTasks = taskStorage.getAll()
    // Sort by start time
    loadedTasks.sort((a, b) => {
      const aTime = parseInt(a.startTime.replace(':', ''))
      const bTime = parseInt(b.startTime.replace(':', ''))
      return aTime - bTime
    })
    setTasks(loadedTasks)
    setLoading(false)
  }, [])

  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed' | 'order'>) => {
    const newTask: Task = {
      ...task,
      id: generateId(),
      completed: false,
      order: tasks.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    taskStorage.save(newTask)
    loadTasks()
    return newTask
  }, [tasks.length, loadTasks])

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    const task = taskStorage.getById(id)
    if (task) {
      const updatedTask: Task = {
        ...task,
        ...updates,
        updatedAt: new Date().toISOString(),
      }
      taskStorage.save(updatedTask)
      loadTasks()
    }
  }, [loadTasks])

  const deleteTask = useCallback((id: string) => {
    taskStorage.delete(id)
    loadTasks()
  }, [loadTasks])

  const toggleTaskComplete = useCallback((id: string) => {
    const task = taskStorage.getById(id)
    if (task) {
      updateTask(id, {
        completed: !task.completed,
        completedAt: !task.completed ? new Date().toISOString() : undefined,
      })
    }
  }, [updateTask])

  const reorderTasks = useCallback((taskIds: string[]) => {
    const reorderedTasks = taskIds.map((id, index) => {
      const task = taskStorage.getById(id)
      if (task) {
        return { ...task, order: index }
      }
      return null
    }).filter(Boolean) as Task[]
    
    taskStorage.saveAll(reorderedTasks)
    loadTasks()
  }, [loadTasks])

  const getActiveTask = useCallback((): Task | null => {
    const currentTime = getCurrentTimeString()
    return tasks.find(task => 
      !task.completed && isTimeBetween(task.startTime, task.endTime, currentTime)
    ) || null
  }, [tasks])

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    reorderTasks,
    getActiveTask,
    refreshTasks: loadTasks,
  }
}

// Helper function
function isTimeBetween(startTime: string, endTime: string, currentTime: string): boolean {
  const parseTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }
  
  const start = parseTime(startTime)
  const end = parseTime(endTime)
  const current = parseTime(currentTime)
  
  if (end < start) {
    // Overnight task
    return current >= start || current <= end
  }
  
  return current >= start && current <= end
}
