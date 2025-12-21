'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ref, onValue, set, serverTimestamp, DatabaseReference } from 'firebase/database'
import { database, isFirebaseConfigured } from '@/lib/firebase'
import type { SharedTimer, TimerStatus, TimerUpdate } from '@/types/timer'

const TIMER_PATH = 'sharedTimer'
const ANIMATION_FRAME_INTERVAL = 100 // Update every 100ms for smooth countdown

export function useSharedTimer() {
  const [timer, setTimer] = useState<SharedTimer | null>(null)
  const [remainingTime, setRemainingTime] = useState<number>(0) // in milliseconds
  const [isSynced, setIsSynced] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  
  const timerRef = useRef<DatabaseReference | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const lastUpdateRef = useRef<number>(0)
  const isUpdatingRef = useRef(false) // Track if we're in the middle of an update
  const lastTimerDataRef = useRef<string>('') // Track last timer data as JSON string for comparison

  // Initialize Firebase listener
  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setError('Firebase not configured. Please set up Firebase environment variables.')
      return
    }

    if (!database) {
      setError('Firebase database not available')
      return
    }

    try {
      const timerRefInstance = ref(database, TIMER_PATH)
      timerRef.current = timerRefInstance

      // Listen for real-time updates
      const unsubscribe = onValue(
        timerRefInstance,
        (snapshot) => {
          const data = snapshot.val()
          if (data) {
            const timerData: SharedTimer = {
              timerId: data.timerId || 'default',
              durationMs: data.durationMs || 0,
              startedAt: data.startedAt || null,
              pausedAt: data.pausedAt || null,
              pausedDuration: data.pausedDuration || 0,
              status: data.status || 'idle',
              updatedBy: data.updatedBy,
              lastUpdated: data.lastUpdated || Date.now(),
            }
            
            // Create a stable comparison key (exclude lastUpdated and updatedBy which change frequently)
            const comparisonKey = JSON.stringify({
              durationMs: timerData.durationMs,
              status: timerData.status,
              startedAt: timerData.startedAt,
              pausedAt: timerData.pausedAt,
              pausedDuration: timerData.pausedDuration,
            })
            
            // Only update if the meaningful data has actually changed AND we're not currently updating
            // This prevents flickering from our own writes
            if (comparisonKey !== lastTimerDataRef.current && !isUpdatingRef.current) {
              lastTimerDataRef.current = comparisonKey
              setTimer(prevTimer => {
                // Double check with previous state to ensure we're not causing unnecessary updates
                if (prevTimer) {
                  const prevKey = JSON.stringify({
                    durationMs: prevTimer.durationMs,
                    status: prevTimer.status,
                    startedAt: prevTimer.startedAt,
                    pausedAt: prevTimer.pausedAt,
                    pausedDuration: prevTimer.pausedDuration,
                  })
                  if (prevKey === comparisonKey) {
                    return prevTimer // No change needed
                  }
                }
                return timerData
              })
            }
            
            setIsSynced(true)
            setError(null)
          } else {
            // No timer exists yet, create default
            const defaultTimer: SharedTimer = {
              timerId: 'default',
              durationMs: 0,
              startedAt: null,
              pausedAt: null,
              pausedDuration: 0,
              status: 'idle',
              lastUpdated: Date.now(),
            }
            setTimer(defaultTimer)
            setIsSynced(true)
          }
        },
        (error) => {
          console.error('Firebase listener error:', error)
          setError('Failed to sync with server')
          setIsSynced(false)
        }
      )

      return () => {
        unsubscribe()
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
      }
    } catch (err) {
      console.error('Firebase setup error:', err)
      setError('Failed to initialize Firebase connection')
    }
  }, [])

  // Calculate remaining time and update UI smoothly
  useEffect(() => {
    if (!timer) return

    const updateRemainingTime = () => {
      const now = Date.now()
      
      if (timer.status === 'running' && timer.startedAt) {
        // Calculate elapsed time accounting for pauses
        const elapsed = now - timer.startedAt - timer.pausedDuration
        const remaining = Math.max(0, timer.durationMs - elapsed)
        
        setRemainingTime(remaining)
        
        // Auto-complete when timer reaches zero
        if (remaining === 0 && timer.status === 'running') {
          updateTimer({ status: 'completed' })
        }
      } else if (timer.status === 'paused' && timer.startedAt && timer.pausedAt) {
        // Calculate remaining time when paused
        const elapsed = timer.pausedAt - timer.startedAt - timer.pausedDuration
        const remaining = Math.max(0, timer.durationMs - elapsed)
        setRemainingTime(remaining)
      } else if (timer.status === 'idle' || timer.status === 'completed') {
        setRemainingTime(timer.durationMs)
      }

      // Schedule next update
      animationFrameRef.current = requestAnimationFrame(() => {
        setTimeout(updateRemainingTime, ANIMATION_FRAME_INTERVAL)
      })
    }

    updateRemainingTime()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [timer])

  // Update timer in Firebase
  const updateTimer = useCallback(async (updates: TimerUpdate) => {
    if (!timerRef.current || !database || isUpdating) return false

    setIsUpdating(true)
    isUpdatingRef.current = true
    try {
      const currentTimer = timer || {
        timerId: 'default',
        durationMs: 0,
        startedAt: null,
        pausedAt: null,
        pausedDuration: 0,
        status: 'idle' as TimerStatus,
        lastUpdated: Date.now(),
      }

      const updateData: Partial<SharedTimer> = {
        ...currentTimer,
        ...updates,
        lastUpdated: updates.lastUpdated || Date.now(),
      }

      // Use server timestamp for startedAt if starting
      if (updates.status === 'running' && !currentTimer.startedAt) {
        // We'll use client timestamp, but Firebase will handle sync
        updateData.startedAt = Date.now()
        updateData.pausedAt = null
        updateData.pausedDuration = 0
      }

      // Handle pause
      if (updates.status === 'paused' && currentTimer.status === 'running' && currentTimer.startedAt) {
        const now = Date.now()
        const elapsed = now - currentTimer.startedAt - (currentTimer.pausedDuration || 0)
        updateData.pausedAt = now
        updateData.pausedDuration = (currentTimer.pausedDuration || 0) + elapsed
      }

      // Handle resume
      if (updates.status === 'running' && currentTimer.status === 'paused' && currentTimer.startedAt) {
        // Keep the original startedAt, but adjust pausedDuration
        updateData.pausedAt = null
        // pausedDuration stays the same (already accumulated)
      }

      // Remove undefined values (Firebase doesn't allow undefined)
      const cleanUpdateData: Partial<SharedTimer> = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== undefined)
      ) as Partial<SharedTimer>

      // Update the comparison key BEFORE writing to prevent listener from processing our own update
      const finalTimerData: SharedTimer = {
        ...currentTimer,
        ...cleanUpdateData,
        lastUpdated: cleanUpdateData.lastUpdated || Date.now(),
      } as SharedTimer
      
      const newComparisonKey = JSON.stringify({
        durationMs: finalTimerData.durationMs,
        status: finalTimerData.status,
        startedAt: finalTimerData.startedAt,
        pausedAt: finalTimerData.pausedAt,
        pausedDuration: finalTimerData.pausedDuration,
      })
      
      // Set the flag and comparison key before writing
      isUpdatingRef.current = true
      lastTimerDataRef.current = newComparisonKey
      
      // Optimistically update local state immediately
      setTimer(finalTimerData)
      
      // Write to Firebase
      await set(timerRef.current, cleanUpdateData)
      
      // Reset updating flag after Firebase has processed the update
      // Use a longer delay to ensure Firebase has fully processed our write
      setTimeout(() => {
        setIsUpdating(false)
        isUpdatingRef.current = false
      }, 300)
      
      return true
    } catch (err) {
      console.error('Failed to update timer:', err)
      setError('Failed to update timer')
      setIsUpdating(false)
      isUpdatingRef.current = false
      return false
    }
  }, [timer, isUpdating])

  // Set timer duration
  const setDuration = useCallback((durationMs: number) => {
    if (timer?.status === 'running') return false // Can't change duration while running
    return updateTimer({ durationMs, status: 'idle' })
  }, [timer, updateTimer])

  // Start timer
  const startTimer = useCallback(() => {
    if (!timer || timer.durationMs === 0) return false
    if (timer.status === 'running') return false // Already running
    
    return updateTimer({ 
      status: 'running',
      startedAt: Date.now(),
      pausedAt: null,
      pausedDuration: 0,
    })
  }, [timer, updateTimer])

  // Pause timer
  const pauseTimer = useCallback(() => {
    if (!timer || timer.status !== 'running') return false
    return updateTimer({ status: 'paused' })
  }, [timer, updateTimer])

  // Resume timer
  const resumeTimer = useCallback(() => {
    if (!timer || timer.status !== 'paused') return false
    return updateTimer({ status: 'running' })
  }, [timer, updateTimer])

  // Reset timer
  const resetTimer = useCallback(() => {
    if (!timer) return false
    return updateTimer({
      status: 'idle',
      startedAt: null,
      pausedAt: null,
      pausedDuration: 0,
    })
  }, [timer, updateTimer])

  // Stop timer (complete it)
  const stopTimer = useCallback(() => {
    if (!timer) return false
    return updateTimer({ status: 'completed' })
  }, [timer, updateTimer])

  return {
    timer,
    remainingTime,
    isSynced,
    error,
    isUpdating,
    setDuration,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    stopTimer,
    isFirebaseAvailable: isFirebaseConfigured(),
  }
}
