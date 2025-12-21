// Types for shared timer feature

export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed'

export interface SharedTimer {
  timerId: string
  durationMs: number // Duration in milliseconds
  startedAt: number | null // Server timestamp when timer started (null if not started)
  pausedAt: number | null // Server timestamp when timer was paused (null if not paused)
  pausedDuration: number // Total paused duration in milliseconds
  status: TimerStatus
  updatedBy?: string // Optional user identifier
  lastUpdated: number // Server timestamp of last update
}

export interface TimerUpdate {
  durationMs?: number
  startedAt?: number | null
  pausedAt?: number | null
  pausedDuration?: number
  status?: TimerStatus
  updatedBy?: string
  lastUpdated?: number // Set automatically in updateTimer function
}
