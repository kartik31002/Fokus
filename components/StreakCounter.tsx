'use client'

import { useState, useEffect } from 'react'
import { dailyStatsStorage } from '@/lib/storage'
import { getTodayDateString } from '@/lib/utils'

export default function StreakCounter() {
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    const today = getTodayDateString()
    const stats = dailyStatsStorage.get(today)
    setStreak(stats?.streak || 0)
  }, [])

  return (
    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white/90 mb-1">Current Streak</p>
          <p className="text-3xl font-bold text-white">{streak} 🔥</p>
        </div>
        <div className="text-4xl">🔥</div>
      </div>
      {streak > 0 && (
        <p className="text-xs text-white/80 mt-2">
          Keep it up! You&apos;re doing great!
        </p>
      )}
    </div>
  )
}
