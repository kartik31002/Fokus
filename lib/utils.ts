// Utility functions

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export function formatTime12Hour(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function parseTimeString(timeStr: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return { hours, minutes }
}

export function timeStringToMinutes(timeStr: string): number {
  const { hours, minutes } = parseTimeString(timeStr)
  return hours * 60 + minutes
}

export function minutesToTimeString(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

export function getCurrentTimeString(): string {
  const now = new Date()
  return formatTime(now)
}

export function isTimeBetween(startTime: string, endTime: string, currentTime?: string): boolean {
  const current = currentTime || getCurrentTimeString()
  const start = timeStringToMinutes(startTime)
  const end = timeStringToMinutes(endTime)
  const now = timeStringToMinutes(current)
  
  // Handle overnight tasks (e.g., 22:00 to 02:00)
  if (end < start) {
    return now >= start || now <= end
  }
  
  return now >= start && now <= end
}

export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0]
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function calculateDuration(startTime: string, endTime: string): number {
  const start = timeStringToMinutes(startTime)
  const end = timeStringToMinutes(endTime)
  
  // Handle overnight tasks
  if (end < start) {
    return (24 * 60 - start) + end
  }
  
  return end - start
}
