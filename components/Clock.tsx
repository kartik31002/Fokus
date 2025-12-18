'use client'

import { useState, useEffect } from 'react'
import { formatTime12Hour } from '@/lib/utils'
import type { Task } from '@/types'

interface ClockProps {
  activeTask?: Task | null
  className?: string
}

export default function Clock({ activeTask, className = '' }: ClockProps) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const timeString = formatTime12Hour(time)
  const [hourMinute, period] = timeString.split(' ')

  return (
    <div className={`flex flex-col items-center justify-center min-h-[70vh] ${className}`}>
      {/* Active Task Banner */}
      {activeTask && (
        <div className="mb-8 w-full max-w-2xl">
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm opacity-90 mb-1">Current Task</p>
                <h2 className="text-2xl font-bold">{activeTask.title}</h2>
                {activeTask.description && (
                  <p className="text-sm opacity-80 mt-1">{activeTask.description}</p>
                )}
                <p className="text-sm opacity-75 mt-2">
                  {activeTask.startTime} - {activeTask.endTime}
                </p>
              </div>
              <div className="ml-4">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Big Clock - Much Larger */}
      <div className="relative flex-1 flex items-center justify-center w-full">
        <div className="text-center">
          <div className="text-[12rem] md:text-[16rem] lg:text-[20rem] font-bold tracking-tight dark:text-white text-gray-900 leading-none">
            {hourMinute}
          </div>
          <div className="text-5xl md:text-6xl lg:text-7xl font-medium text-gray-600 dark:text-gray-400 mt-4">
            {period}
          </div>
        </div>

        {/* Clock face decoration */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
          <div className="w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] rounded-full border-8 border-current"></div>
        </div>
      </div>

      {/* Date */}
      <div className="mt-8 text-2xl md:text-3xl text-gray-500 dark:text-gray-400">
        {time.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </div>
    </div>
  )
}
