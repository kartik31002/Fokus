'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { focusSessionStorage, settingsStorage } from '@/lib/storage'
import { generateId } from '@/lib/utils'
import type { FocusSession } from '@/types'

export function useFocusMode() {
  const [isActive, setIsActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [remainingTime, setRemainingTime] = useState(0) // in seconds - countdown
  const [targetDuration, setTargetDuration] = useState(0) // in seconds - the set duration
  const [pointsEarned, setPointsEarned] = useState(0)
  const [tabSwitches, setTabSwitches] = useState(0)
  const [isTabVisible, setIsTabVisible] = useState(true)
  const [isComplete, setIsComplete] = useState(false)
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const sessionRef = useRef<FocusSession | null>(null)
  const startTimeRef = useRef<number>(0)
  const pausedTimeRef = useRef<number>(0)
  const lastTabSwitchRef = useRef<number>(0)
  const onCompleteCallbackRef = useRef<(() => void) | null>(null)

  const settings = settingsStorage.get()

  // Tab visibility detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = !document.hidden
      
      if (!visible && isActive && !isPaused) {
        // Tab switched away - apply penalty
        const now = Date.now()
        // Only penalize if more than 2 seconds have passed (avoid rapid firing)
        if (now - lastTabSwitchRef.current > 2000) {
          setTabSwitches(prev => {
            const newCount = prev + 1
            const penalty = settings.tabSwitchPenalty
            setPointsEarned(prevPoints => Math.max(0, prevPoints - penalty))
            lastTabSwitchRef.current = now
            return newCount
          })
        }
      }
      
      setIsTabVisible(visible)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [isActive, isPaused, settings.tabSwitchPenalty])

  // Countdown timer effect
  useEffect(() => {
    if (isActive && !isPaused && isTabVisible && !isComplete) {
      intervalRef.current = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            // Timer completed!
            const elapsedSeconds = targetDuration
            const minutes = Math.floor(elapsedSeconds / 60)
            const points = minutes * settings.rewardPointsPerMinute
            setPointsEarned(points)
            setIsComplete(true)
            return 0
          }
          
          // Calculate points based on elapsed time
          const elapsedSeconds = targetDuration - (prev - 1)
          const minutes = Math.floor(elapsedSeconds / 60)
          const points = minutes * settings.rewardPointsPerMinute
          setPointsEarned(points)
          
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, isPaused, isTabVisible, isComplete, targetDuration, settings.rewardPointsPerMinute])

  // Handle completion callback when timer completes
  useEffect(() => {
    if (isComplete && onCompleteCallbackRef.current) {
      onCompleteCallbackRef.current()
      onCompleteCallbackRef.current = null
    }
  }, [isComplete])

  const startFocus = useCallback((taskId?: string, durationMinutes: number = 25, onComplete?: () => void) => {
    const durationSeconds = durationMinutes * 60
    setIsActive(true)
    setIsPaused(false)
    setIsComplete(false)
    setRemainingTime(durationSeconds)
    setTargetDuration(durationSeconds)
    setPointsEarned(0)
    setTabSwitches(0)
    startTimeRef.current = Date.now()
    pausedTimeRef.current = 0
    onCompleteCallbackRef.current = onComplete || null
    
    const session: FocusSession = {
      id: generateId(),
      taskId,
      startTime: new Date().toISOString(),
      duration: 0,
      completed: false,
      pomodoroMode: false,
      pointsEarned: 0,
      tabSwitches: 0,
    }
    
    sessionRef.current = session
  }, [])

  const pauseFocus = useCallback(() => {
    if (isActive && !isPaused && !isComplete) {
      setIsPaused(true)
    }
  }, [isActive, isPaused, isComplete])

  const resumeFocus = useCallback(() => {
    if (isActive && isPaused && !isComplete) {
      setIsPaused(false)
    }
  }, [isActive, isPaused, isComplete])

  const stopFocus = useCallback(() => {
    if (sessionRef.current) {
      const elapsedSeconds = targetDuration - remainingTime
      const minutes = Math.floor(elapsedSeconds / 60)
      sessionRef.current.duration = minutes
      sessionRef.current.completed = isComplete
      sessionRef.current.endTime = new Date().toISOString()
      sessionRef.current.pointsEarned = pointsEarned
      sessionRef.current.tabSwitches = tabSwitches
      
      focusSessionStorage.save(sessionRef.current)
    }
    
    setIsActive(false)
    setIsPaused(false)
    setIsComplete(false)
    setRemainingTime(0)
    setTargetDuration(0)
    setPointsEarned(0)
    setTabSwitches(0)
    onCompleteCallbackRef.current = null
  }, [remainingTime, targetDuration, pointsEarned, tabSwitches, isComplete])

  const resetFocus = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    setIsActive(false)
    setIsPaused(false)
    setIsComplete(false)
    setRemainingTime(0)
    setTargetDuration(0)
    setPointsEarned(0)
    setTabSwitches(0)
    sessionRef.current = null
    onCompleteCallbackRef.current = null
  }, [])

  return {
    isActive,
    isPaused,
    remainingTime,
    targetDuration,
    pointsEarned,
    tabSwitches,
    isTabVisible,
    isComplete,
    startFocus,
    pauseFocus,
    resumeFocus,
    stopFocus,
    resetFocus,
  }
}
