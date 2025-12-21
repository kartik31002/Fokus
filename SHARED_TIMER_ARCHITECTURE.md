# Shared Timer Architecture & Implementation

## Overview

The Shared Timer feature provides real-time synchronized countdown timers across multiple users/devices using Firebase Realtime Database. This document explains the architecture, sync strategy, and implementation details.

## Architecture

### Technology Choice: Firebase Realtime Database

**Why Realtime Database over Firestore?**
- **Lower latency**: Sub-100ms updates vs 200-500ms for Firestore
- **Simpler structure**: Perfect for simple key-value sync (single timer object)
- **Better for real-time**: Optimized for frequent, small updates
- **Lower cost**: More generous free tier for this use case
- **No complex queries needed**: Just listen to one path

### Data Model

```typescript
interface SharedTimer {
  timerId: string              // Unique identifier (currently "default")
  durationMs: number          // Total duration in milliseconds
  startedAt: number | null    // Timestamp when timer started
  pausedAt: number | null     // Timestamp when paused
  pausedDuration: number      // Accumulated paused time
  status: 'idle' | 'running' | 'paused' | 'completed'
  updatedBy?: string         // Optional user identifier
  lastUpdated: number        // Last modification timestamp
}
```

**Firebase Path**: `/sharedTimer`

## Sync Strategy

### 1. Real-Time Listener

```typescript
onValue(ref(database, 'sharedTimer'), (snapshot) => {
  // React to changes instantly
  setTimer(snapshot.val())
})
```

- Listens for all changes to the timer
- Updates local state immediately when any client modifies the timer
- Handles connection issues gracefully

### 2. Timestamp-Based Calculation

**Key Principle**: Remaining time is calculated from timestamps, NOT from local intervals.

```typescript
const now = Date.now()
const elapsed = now - timer.startedAt - timer.pausedDuration
const remaining = Math.max(0, timer.durationMs - elapsed)
```

**Why this approach?**
- ✅ **No drift**: Even if updates are delayed, calculation is always accurate
- ✅ **Late-joiner support**: New users see correct remaining time immediately
- ✅ **Refresh-safe**: Page refresh doesn't lose timer state
- ✅ **Multi-device accurate**: All devices show the same time

### 3. Smooth UI Updates

Uses `requestAnimationFrame` with controlled intervals:

```typescript
const updateRemainingTime = () => {
  // Calculate from timestamps
  const remaining = calculateRemaining(timer, Date.now())
  setRemainingTime(remaining)
  
  // Schedule next update
  requestAnimationFrame(() => {
    setTimeout(updateRemainingTime, 100) // Update every 100ms
  })
}
```

This provides:
- Smooth countdown animation
- Accurate timing
- Efficient rendering

## Race Condition Handling

### Problem
Multiple users might try to start/pause/reset simultaneously.

### Solution

1. **Status Checks**: All operations check current status before executing
   ```typescript
   if (timer.status === 'running') return false // Can't start if already running
   ```

2. **Atomic Updates**: Firebase handles concurrent writes (last write wins)
   - Acceptable for this use case (timer control)
   - Could add optimistic locking for production

3. **State Machine**: Enforces valid transitions
   - `idle` → `running` → `paused` → `running` → `completed`
   - Invalid transitions are rejected

## Flow Diagrams

### Timer Start Flow

```
User A clicks "Start"
    ↓
Check: status === 'idle' && durationMs > 0
    ↓
Update Firebase: { status: 'running', startedAt: now }
    ↓
Firebase broadcasts to all listeners
    ↓
All clients (A, B, C...) receive update
    ↓
All clients calculate: remaining = durationMs - (now - startedAt)
    ↓
All clients display synchronized countdown
```

### Late-Joiner Flow

```
User D opens app (timer already running)
    ↓
Firebase listener connects
    ↓
Receives current timer state: { startedAt: T1, durationMs: 300000, status: 'running' }
    ↓
Calculates: remaining = 300000 - (now - T1)
    ↓
Displays correct remaining time immediately
    ↓
No need to "catch up" - calculation is always accurate
```

### Pause/Resume Flow

```
User A clicks "Pause"
    ↓
Calculate elapsed time: elapsed = pausedAt - startedAt - pausedDuration
    ↓
Update: { status: 'paused', pausedAt: now, pausedDuration: accumulated }
    ↓
All clients see paused state
    ↓
User B clicks "Resume"
    ↓
Update: { status: 'running', pausedAt: null }
    ↓
Calculation continues: remaining = durationMs - (now - startedAt - pausedDuration)
```

## Implementation Files

### Core Files

1. **`lib/firebase.ts`**
   - Firebase initialization
   - Configuration from environment variables
   - Database instance export

2. **`types/timer.ts`**
   - TypeScript type definitions
   - Timer status enum
   - Data model interfaces

3. **`hooks/useSharedTimer.ts`**
   - Main hook for timer logic
   - Firebase listener setup
   - Timer operations (start, pause, reset, etc.)
   - Remaining time calculation

4. **`components/SharedTimer.tsx`**
   - UI component
   - User interactions
   - Visual feedback (sync status, progress bar)

### Integration

- Added to main app navigation
- Accessible via "Shared Timer" tab
- Works in both desktop and mobile views

## Key Features

### ✅ Real-Time Sync
- Changes appear instantly across all clients
- Uses Firebase's real-time listeners

### ✅ Accurate Timing
- Timestamp-based calculation prevents drift
- Works even with network delays

### ✅ Late-Joiner Support
- New users see correct remaining time
- No need to "catch up"

### ✅ Page Refresh Safe
- Timer state persists in Firebase
- Refresh doesn't reset the timer

### ✅ Visual Feedback
- Sync status indicator
- Shows who started the timer
- Progress bar visualization

### ✅ Smooth Animation
- 100ms update interval
- requestAnimationFrame for smooth rendering

## Security Considerations

### Current Setup (Development)
- Public read/write access
- Suitable for demo/personal use
- No authentication required

### Production Recommendations

1. **Add Authentication**
   ```json
   {
     "rules": {
       "sharedTimer": {
         ".read": true,
         ".write": "auth != null"
       }
     }
   }
   ```

2. **Rate Limiting**
   - Limit write frequency
   - Prevent abuse

3. **Validation**
   - Validate timer updates
   - Check for reasonable values

4. **User Permissions**
   - Track who can modify
   - Add role-based access

## Future Enhancements

### Multiple Timers
- Support for different timer "rooms"
- Path: `/timers/{roomId}`

### User Authentication
- Track who started/modified timers
- User-specific preferences

### Timer History
- Log past timer sessions
- Analytics and insights

### Custom Timer Names
- Named timers for different purposes
- "Focus Session", "Break Time", etc.

### Private Timers
- User-specific timers that don't sync
- Personal countdowns

## Testing

### Local Testing
1. Open app in multiple browser tabs
2. Start timer in one tab
3. Verify all tabs show synchronized countdown
4. Test pause/resume from different tabs
5. Refresh one tab - should see correct remaining time

### Multi-Device Testing
1. Open app on different devices
2. Start timer on one device
3. Verify all devices sync correctly
4. Test network interruption recovery

## Troubleshooting

### Timer Not Syncing
- Check Firebase configuration
- Verify database rules allow read/write
- Check browser console for errors

### Timer Drifting
- Should not happen with timestamp-based calculation
- Verify `startedAt` is set correctly
- Check system clock synchronization

### Connection Issues
- Firebase handles reconnection automatically
- Timer state persists in database
- Reconnection restores correct state

## Performance

- **Update Frequency**: 100ms (10 updates/second)
- **Network Traffic**: Minimal (only state changes)
- **Firebase Quota**: Well within free tier limits
- **Client Performance**: Efficient with requestAnimationFrame

## Conclusion

The Shared Timer feature provides a robust, real-time synchronized countdown timer that works reliably across multiple devices and browsers. The timestamp-based calculation ensures accuracy, while Firebase Realtime Database provides instant synchronization with minimal complexity.
