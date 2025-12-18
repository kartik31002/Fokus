'use client'

import { useState, useEffect } from 'react'
import { useFocusMode } from '@/hooks/useFocusMode'
import { useRewards } from '@/hooks/useRewards'
import { useTasks } from '@/hooks/useTasks'
import Clock from '@/components/Clock'
import { settingsStorage } from '@/lib/storage'

interface FocusModeProps {
  taskId?: string
  onComplete?: () => void
}

export default function FocusMode({ taskId, onComplete }: FocusModeProps) {
  const {
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
  } = useFocusMode()

  const { addPoints } = useRewards()
  const { tasks } = useTasks()
  const [hours, setHours] = useState<number>(0)
  const [minutes, setMinutes] = useState<number>(30)
  const [showWarning, setShowWarning] = useState(false)

  const task = taskId ? tasks.find(t => t.id === taskId) : null
  const settings = settingsStorage.get()

  useEffect(() => {
    if (!isTabVisible && isActive && !isPaused) {
      setShowWarning(true)
      const timer = setTimeout(() => setShowWarning(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [isTabVisible, isActive, isPaused])

  useEffect(() => {
    if (isComplete) {
      // Timer completed - award points and call completion callback
      if (pointsEarned > 0) {
        addPoints(Math.floor(pointsEarned))
      }
      onComplete?.()
    }
  }, [isComplete, pointsEarned, addPoints, onComplete])

  const handleStart = () => {
    const totalMinutes = hours * 60 + minutes
    if (totalMinutes > 0 && totalMinutes <= 999) {
      startFocus(taskId, totalMinutes)
    }
  }

  const handleStop = () => {
    // Award points for time spent (even if not completed)
    if (pointsEarned > 0) {
      addPoints(Math.floor(pointsEarned))
    }
    stopFocus()
    onComplete?.()
  }

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progressPercentage = targetDuration > 0 
    ? ((targetDuration - remainingTime) / targetDuration) * 100 
    : 0

  const totalMinutes = hours * 60 + minutes
  const isValidDuration = totalMinutes > 0 && totalMinutes <= 999

  return (
    <div className="w-full space-y-6">
      {/* Clock - Always visible in focus mode, taking most of the screen */}
      <Clock activeTask={task || undefined} className="mb-4" />

      {/* Focus Session Card - Compact at bottom */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl shadow-2xl p-6 md:p-8 text-white max-w-4xl mx-auto">
        {/* Completion Message */}
        {isComplete && (
          <div className="mb-6 bg-green-500 text-white p-6 rounded-xl text-center">
            <p className="text-2xl font-bold mb-2">🎉 Focus Session Complete!</p>
            <p className="text-lg">You earned {Math.floor(pointsEarned)} points!</p>
          </div>
        )}

        {/* Warning Banner */}
        {showWarning && !isTabVisible && (
          <div className="mb-4 bg-red-500 text-white p-4 rounded-xl">
            <p className="font-bold">⚠️ Tab Switch Detected!</p>
            <p className="text-sm">Points deducted. Stay focused!</p>
          </div>
        )}

        {/* Countdown Timer - Compact display */}
        {isActive && (
          <div className="mb-6">
            <div className="text-center mb-4">
              <p className="text-sm opacity-90 mb-2">Time Remaining</p>
              <div className="text-4xl md:text-5xl font-bold font-mono mb-2">
                {formatTime(remainingTime)}
              </div>
              {isPaused && (
                <p className="text-lg opacity-75">⏸️ Paused</p>
              )}
              {isComplete && (
                <p className="text-lg font-bold">✓ Complete!</p>
              )}
              {!isTabVisible && isActive && !isPaused && !isComplete && (
                <p className="text-sm opacity-75 mt-2">👁️ Tab Hidden - Points Being Lost</p>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-1000"
                  style={{
                    width: `${Math.min(100, progressPercentage)}%`,
                  }}
                />
              </div>
              <p className="text-xs text-center mt-2 opacity-75">
                {Math.round(progressPercentage)}% Complete
              </p>
            </div>
          </div>
        )}

        {/* Stats */}
        {isActive && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <p className="text-sm opacity-75 mb-1">Points Earned</p>
              <p className="text-2xl font-bold">{Math.floor(pointsEarned)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <p className="text-sm opacity-75 mb-1">Tab Switches</p>
              <p className="text-2xl font-bold text-red-300">{tabSwitches}</p>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col gap-3">
          {!isActive ? (
            <>
              {/* Custom Duration Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-3 opacity-90">
                  Set Focus Duration (up to 999 minutes)
                </label>
                <div className="flex items-center gap-4 justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <label className="text-xs opacity-75">Hours</label>
                    <input
                      type="number"
                      min="0"
                      max="16"
                      value={hours}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0
                        const maxHours = Math.floor(999 / 60)
                        setHours(Math.min(val, maxHours))
                        // Auto-adjust minutes if total exceeds 999
                        if (val * 60 + minutes > 999) {
                          setMinutes(999 - val * 60)
                        }
                      }}
                      className="w-20 px-4 py-3 text-center text-2xl font-bold rounded-xl bg-white/20 text-white border-2 border-white/30 focus:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white"
                    />
                  </div>
                  <span className="text-3xl font-bold mt-6">:</span>
                  <div className="flex flex-col items-center gap-2">
                    <label className="text-xs opacity-75">Minutes</label>
                    <input
                      type="number"
                      min="0"
                      max="999"
                      value={minutes}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0
                        const maxMins = 999 - hours * 60
                        setMinutes(Math.min(val, Math.min(59, maxMins)))
                      }}
                      className="w-20 px-4 py-3 text-center text-2xl font-bold rounded-xl bg-white/20 text-white border-2 border-white/30 focus:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white"
                    />
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <p className="text-sm opacity-75">
                    Total: {totalMinutes} minute{totalMinutes !== 1 ? 's' : ''} 
                    {totalMinutes > 999 && (
                      <span className="text-red-300 ml-2">(Maximum 999 minutes)</span>
                    )}
                  </p>
                </div>
              </div>

              <button
                onClick={handleStart}
                disabled={!isValidDuration}
                className={`
                  px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg
                  ${isValidDuration
                    ? 'bg-white text-primary-600 hover:bg-gray-100'
                    : 'bg-white/30 text-white/50 cursor-not-allowed'
                  }
                `}
              >
                🎯 Start Focus Session ({totalMinutes} min)
              </button>
            </>
          ) : (
            <>
              <div className="flex gap-3">
                {!isComplete && (
                  <>
                    {isPaused ? (
                      <button
                        onClick={resumeFocus}
                        className="flex-1 px-6 py-4 bg-white text-primary-600 rounded-xl font-bold hover:bg-gray-100 transition-colors"
                      >
                        ▶️ Resume
                      </button>
                    ) : (
                      <button
                        onClick={pauseFocus}
                        className="flex-1 px-6 py-4 bg-white/20 text-white rounded-xl font-bold hover:bg-white/30 transition-colors backdrop-blur-sm border-2 border-white/30"
                      >
                        ⏸️ Pause
                      </button>
                    )}
                  </>
                )}
                <button
                  onClick={handleStop}
                  className="flex-1 px-6 py-4 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
                >
                  {isComplete ? 'Done' : 'Stop'}
                </button>
              </div>
              {!isComplete && (
                <button
                  onClick={resetFocus}
                  className="px-6 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors text-sm"
                >
                  Reset Session
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
