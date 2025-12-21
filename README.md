# 🎯 Fokus - Daily Productivity Dashboard

A beautiful, distraction-resistant daily productivity web app with focus mode, task scheduling, and relationship-themed rewards.

## ✨ Features

### 🕐 Big Clock Display
- Prominent, easy-to-read clock as the main UI element
- Shows the current active task prominently
- Real-time updates

### 📅 Daily Schedule
- Time-based task scheduling with start and end times
- Visual timeline showing active, upcoming, and completed tasks
- Full CRUD operations (Create, Read, Update, Delete)
- Automatic detection of active tasks based on current time
- Color-coded task states (active, upcoming, completed)

### 🎯 Focus Mode
- Immersive full-screen focus sessions
- Tab visibility detection with penalties for switching away
- Loss-aversion mechanics - points deducted when leaving the tab
- Progress bar that resets on tab switches
- Pomodoro timer integration
- Pause/Resume functionality
- Real-time points calculation

### 💝 Relationship-Themed Rewards
- Earn points by completing focus sessions
- Unlock rewards like "Hug from my partner", "Cuddle time", "Kiss", etc.
- Beautiful reward cards with progress indicators
- Customizable reward system (ready for expansion)

### 🔔 Smart Notifications
- Browser notification support
- Task reminders
- Focus session completion alerts
- Notification bell with unread count

### 📊 Streak Tracking
- Daily streak counter
- Visual streak indicator with fire emoji 🔥
- Automatic streak calculation

### 🌙 Themes
- Dark/Light mode support
- Auto theme detection based on system preferences
- Smooth theme transitions

### ⏱️ Shared Timer
- Real-time synchronized countdown timer
- Works across multiple devices/browsers simultaneously
- Firebase-powered instant sync
- Timestamp-based calculation for accuracy
- Late-joiner support (correct time on page load)
- Page refresh safe

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
```

The static export will be in the `out/` directory.

### Deploy to GitHub Pages

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

### Setup Shared Timer (Firebase)

See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for Firebase configuration instructions.

Quick steps:
1. Push your code to a GitHub repository
2. Enable GitHub Pages in repository Settings → Pages → Source: GitHub Actions
3. The workflow will automatically build and deploy on every push to `main`

## 🏗️ Architecture

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Storage**: localStorage (extensible to IndexedDB/Backend)

### Project Structure

```
/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main dashboard page
│   └── globals.css         # Global styles
├── components/
│   ├── Clock.tsx           # Big clock component
│   ├── TaskSchedule.tsx    # Task timeline component
│   ├── FocusMode.tsx       # Focus session component
│   ├── Rewards.tsx         # Rewards display component
│   ├── StreakCounter.tsx   # Streak tracking component
│   └── Notifications.tsx   # Notification system
├── hooks/
│   ├── useTasks.ts         # Task management hook
│   ├── useFocusMode.ts     # Focus mode logic hook
│   ├── useRewards.ts       # Rewards system hook
│   └── useTheme.ts         # Theme management hook
├── lib/
│   ├── storage.ts          # Data persistence layer
│   └── utils.ts            # Utility functions
└── types/
    └── index.ts            # TypeScript type definitions
```

### Data Models

- **Task**: Tasks with time slots
- **Reward**: Relationship-themed rewards
- **FocusSession**: Focus mode sessions with stats
- **DailyStats**: Daily productivity statistics
- **UserSettings**: User preferences and settings

## 🎨 Key Features Explained

### Focus Mode Penalties
When you switch away from the tab during an active focus session:
- Points are deducted based on `tabSwitchPenalty` setting
- Tab switch count is tracked
- Visual warning is displayed
- Progress can be reset if configured

### Reward System
- Points are earned per minute of focused work
- Each reward has a `pointsRequired` threshold
- Once unlocked, rewards can be claimed
- System is designed for easy customization

### Task Active Detection
Tasks are automatically marked as "active" when:
- Current time is between task's start and end time
- Task is not completed
- System checks every minute for accuracy

## 🔮 Future Enhancements

- [ ] Backend sync support (architecture ready)
- [ ] IndexedDB migration for larger datasets
- [ ] Custom reward creation UI
- [ ] Drag-and-drop task reordering
- [ ] Daily reflection prompts
- [ ] AI scheduling suggestions
- [ ] Browser extension for website blocking
- [ ] Export/import data
- [ ] Multi-day calendar view
- [ ] Task templates
- [ ] Sound effects and haptic feedback
- [ ] PWA support for mobile

## 📝 License

ISC

## 🙏 Acknowledgments

Inspired by the Forest app's focus timer and reward mechanics, adapted for web with a relationship-focused reward system.
