'use client'

import { useState, useEffect, useRef } from 'react'
import { useSharedTimer } from '@/hooks/useSharedTimer'

export default function SharedTimer() {
  const {
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
    isFirebaseAvailable,
  } = useSharedTimer()

  const [durationInput, setDurationInput] = useState({ minutes: 0, seconds: 0 })
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false)
  const alarmAudioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize audio element
  useEffect(() => {
    if (typeof window !== 'undefined' && !alarmAudioRef.current) {
      alarmAudioRef.current = new Audio('/iphone_alarm.mp3')
      alarmAudioRef.current.loop = true // Loop the alarm sound
      alarmAudioRef.current.volume = 0.8
    }
  }, [])

  // Format time display
  const formatTime = (ms: number): string => {
    const totalSeconds = Math.ceil(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  // Handle duration input
  const handleSetDuration = () => {
    const totalMs = (durationInput.minutes * 60 + durationInput.seconds) * 1000
    if (totalMs > 0) {
      setDuration(totalMs)
      // Keep the input values for display
    }
  }

  // Update duration input when timer duration changes (from other users)
  useEffect(() => {
    if (timer?.durationMs) {
      const minutes = Math.floor(timer.durationMs / 60000)
      const seconds = Math.floor((timer.durationMs % 60000) / 1000)
      setDurationInput({ minutes, seconds })
    }
  }, [timer?.durationMs])

  // Handle alarm sound when timer completes
  useEffect(() => {
    if (!alarmAudioRef.current) return

    // Check if timer has completed (status is completed OR remaining time is 0 and status was running)
    const shouldPlayAlarm = timer?.status === 'completed'

    if (shouldPlayAlarm && !isAlarmPlaying) {
      // Play alarm sound
      const playAlarm = async () => {
        try {
          if (alarmAudioRef.current) {
            await alarmAudioRef.current.play()
            setIsAlarmPlaying(true)
          }
        } catch (error) {
          console.error('Failed to play alarm:', error)
          // Browser might block autoplay, that's okay
        }
      }
      playAlarm()
    } else if (!shouldPlayAlarm && isAlarmPlaying) {
      // Stop alarm if timer is reset or stopped
      if (alarmAudioRef.current) {
        alarmAudioRef.current.pause()
        alarmAudioRef.current.currentTime = 0
        setIsAlarmPlaying(false)
      }
    }
  }, [timer?.status, isAlarmPlaying])

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (alarmAudioRef.current) {
        alarmAudioRef.current.pause()
        alarmAudioRef.current.currentTime = 0
      }
    }
  }, [])

  // Stop alarm function
  const stopAlarm = () => {
    if (alarmAudioRef.current) {
      alarmAudioRef.current.pause()
      alarmAudioRef.current.currentTime = 0
      setIsAlarmPlaying(false)
    }
  }

  // Quick duration buttons
  const quickDurations = [
    { label: '30s', ms: 30 * 1000 },
    { label: '1m', ms: 60 * 1000 },
    { label: '5m', ms: 5 * 60 * 1000 },
    { label: '10m', ms: 10 * 60 * 1000 },
    { label: '15m', ms: 15 * 60 * 1000 },
    { label: '30m', ms: 30 * 60 * 1000 },
  ]

  if (!isFirebaseAvailable) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              ⏱️ Shared Timer
            </h2>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
              <p className="text-yellow-800 dark:text-yellow-200 font-medium mb-2">
                Firebase Not Configured
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Please configure Firebase to use the shared timer feature.
                <br />
                See FIREBASE_SETUP.md for instructions.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            ⏱️ Shared Timer
          </h2>
          <div className="flex items-center gap-3">
            {/* Sync Status */}
            <div className="flex items-center gap-2">
              {isSynced ? (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Synced</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-sm">Connecting...</span>
                </div>
              )}
            </div>
            {timer?.updatedBy && timer.status === 'running' && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Started by {timer.updatedBy}
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Alarm Playing Indicator */}
        {isAlarmPlaying && (
          <div className="mb-6 bg-red-500 text-white rounded-xl p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🔔</span>
                <div>
                  <p className="text-xl font-bold">Timer Complete!</p>
                  <p className="text-sm opacity-90">Alarm is ringing</p>
                </div>
              </div>
              <button
                onClick={stopAlarm}
                className="px-6 py-3 bg-white text-red-600 rounded-lg font-bold hover:bg-gray-100 transition-colors shadow-lg"
              >
                Stop Alarm
              </button>
            </div>
          </div>
        )}

        {/* Timer Display */}
        <div className="text-center mb-8">
          <div className="mb-6">
            <div className={`text-8xl md:text-9xl font-bold font-mono mb-4 transition-all ${
              timer?.status === 'running'
                ? 'text-primary-600 dark:text-primary-400'
                : timer?.status === 'completed'
                ? 'text-green-600 dark:text-green-400'
                : 'text-gray-900 dark:text-white'
            }`}>
              {formatTime(remainingTime)}
            </div>
            <div className="text-lg text-gray-600 dark:text-gray-400">
              {timer?.status === 'running' && '⏱️ Running'}
              {timer?.status === 'paused' && '⏸️ Paused'}
              {timer?.status === 'idle' && '⏹️ Ready'}
              {timer?.status === 'completed' && '✅ Complete'}
            </div>
          </div>

          {/* Progress Bar */}
          {timer && timer.durationMs > 0 && (
            <div className="mb-6">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    timer.status === 'running'
                      ? 'bg-primary-500'
                      : timer.status === 'completed'
                      ? 'bg-green-500'
                      : 'bg-gray-400'
                  }`}
                  style={{
                    width: `${Math.min(100, ((timer.durationMs - remainingTime) / timer.durationMs) * 100)}%`,
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {Math.round(((timer.durationMs - remainingTime) / timer.durationMs) * 100)}% Complete
              </p>
            </div>
          )}
        </div>


        {/* Duration Input - Always visible when idle */}
        {timer?.status === 'idle' && (
          <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              {/* Custom Time Input */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Set Custom Duration
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="999"
                      placeholder="M"
                      value={durationInput.minutes || ''}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0
                        setDurationInput({ ...durationInput, minutes: Math.min(999, Math.max(0, val)) })
                      }}
                      className="w-20 px-3 py-2 text-center text-lg font-bold rounded-lg bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none"
                    />
                    <span className="text-gray-500 dark:text-gray-400 font-medium">min</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-400">:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="59"
                      placeholder="S"
                      value={durationInput.seconds || ''}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0
                        setDurationInput({ ...durationInput, seconds: Math.min(59, Math.max(0, val)) })
                      }}
                      className="w-20 px-3 py-2 text-center text-lg font-bold rounded-lg bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none"
                    />
                    <span className="text-gray-500 dark:text-gray-400 font-medium">sec</span>
                  </div>
                  <button
                    onClick={handleSetDuration}
                    disabled={isUpdating || (durationInput.minutes === 0 && durationInput.seconds === 0)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Set
                  </button>
                </div>
              </div>

              {/* Quick Duration Buttons */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Quick Set
                </label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {quickDurations.map((quick) => (
                    <button
                      key={quick.label}
                      onClick={() => {
                        const mins = Math.floor(quick.ms / 60000)
                        const secs = Math.floor((quick.ms % 60000) / 1000)
                        setDurationInput({ minutes: mins, seconds: secs })
                        setDuration(quick.ms)
                      }}
                      className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium text-sm"
                    >
                      {quick.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col gap-3">
          {timer?.status === 'idle' && (
            <button
              onClick={startTimer}
              disabled={isUpdating || timer.durationMs === 0}
              className="px-8 py-4 bg-primary-600 text-white rounded-xl font-bold text-lg hover:bg-primary-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ▶️ Start Timer
            </button>
          )}

          {timer?.status === 'running' && (
            <div className="flex gap-3">
              <button
                onClick={pauseTimer}
                disabled={isUpdating}
                className="flex-1 px-6 py-4 bg-yellow-500 text-white rounded-xl font-bold hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ⏸️ Pause
              </button>
              <button
                onClick={stopTimer}
                disabled={isUpdating}
                className="flex-1 px-6 py-4 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ⏹️ Stop
              </button>
            </div>
          )}

          {timer?.status === 'paused' && (
            <div className="flex gap-3">
              <button
                onClick={resumeTimer}
                disabled={isUpdating}
                className="flex-1 px-6 py-4 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ▶️ Resume
              </button>
              <button
                onClick={resetTimer}
                disabled={isUpdating}
                className="flex-1 px-6 py-4 bg-gray-500 text-white rounded-xl font-bold hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🔄 Reset
              </button>
            </div>
          )}

          {timer?.status === 'completed' && (
            <div className="flex gap-3">
              {isAlarmPlaying && (
                <button
                  onClick={stopAlarm}
                  className="flex-1 px-6 py-4 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
                >
                  🔇 Stop Alarm
                </button>
              )}
              <button
                onClick={resetTimer}
                className={`px-8 py-4 bg-primary-600 text-white rounded-xl font-bold text-lg hover:bg-primary-700 transition-colors shadow-lg ${isAlarmPlaying ? 'flex-1' : ''}`}
              >
                🔄 Reset Timer
              </button>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <p className="text-sm text-blue-800 dark:text-blue-200 text-center">
            💡 This timer syncs in real-time across all open instances. Perfect for shared focus sessions!
          </p>
        </div>
      </div>
    </div>
  )
}
