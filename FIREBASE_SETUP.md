# Firebase Setup Guide for Shared Timer

This guide will help you set up Firebase Realtime Database for the Shared Timer feature.

## Why Firebase Realtime Database?

We chose **Firebase Realtime Database** over Firestore for this feature because:
- **Lower latency**: Better for real-time updates (sub-100ms)
- **Simpler structure**: Perfect for simple key-value sync like a timer
- **Lower cost**: Free tier is more generous for small apps
- **Easier setup**: No complex queries needed, just listen to a single path

## Step-by-Step Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter a project name (e.g., "Fokus Timer" or "Fokus Productivity")
4. (Optional) Enable Google Analytics (not required for this feature)
5. Click **"Create project"**
6. Wait for the project to be created, then click **"Continue"**

### 2. Enable Realtime Database

1. In your Firebase project, click on **"Realtime Database"** in the left sidebar
2. Click **"Create Database"**
3. Choose a location (select the closest to your users)
4. Click **"Next"**
5. **Important**: For this demo, choose **"Start in test mode"**
   - This allows public read/write access
   - ⚠️ **Warning**: This is only for development/demo. For production, you should set up proper security rules.
6. Click **"Enable"**

### 3. Get Your Firebase Configuration

1. In Firebase Console, click the gear icon ⚙️ next to "Project Overview"
2. Select **"Project settings"**
3. Scroll down to **"Your apps"** section
4. Click the **Web icon** (`</>`) to add a web app
5. Register your app with a nickname (e.g., "Fokus Web App")
6. (Optional) Check "Also set up Firebase Hosting" - you can skip this
7. Click **"Register app"**
8. You'll see your Firebase configuration object. It looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

### 4. Set Up Environment Variables

Create a `.env.local` file in your project root (if it doesn't exist):

```bash
# .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

**Important Notes:**
- Replace all values with your actual Firebase config values
- The `NEXT_PUBLIC_` prefix is required for Next.js to expose these to the browser
- Never commit `.env.local` to git (it's already in `.gitignore`)

### 5. Configure Security Rules (Recommended for Production)

1. In Firebase Console, go to **Realtime Database** → **Rules** tab
2. For development/demo, you can use:

```json
{
  "rules": {
    "sharedTimer": {
      ".read": true,
      ".write": true
    }
  }
}
```

3. For production, you should implement proper authentication and rules:

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

4. Click **"Publish"** to save the rules

### 6. Test Locally

1. Make sure your `.env.local` file is set up correctly
2. Restart your development server:
   ```bash
   npm run dev
   ```
3. Navigate to the "Shared Timer" tab in your app
4. You should see the timer interface with a "Synced" indicator
5. Open the app in multiple browser tabs/windows
6. Start a timer in one tab - it should sync to all other tabs instantly!

### 7. Deploy to GitHub Pages

For GitHub Pages deployment, you need to add the environment variables to your GitHub repository:

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"** for each environment variable:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_DATABASE_URL`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`

4. Update `.github/workflows/deploy.yml` to use these secrets:

```yaml
- name: Build
  run: npm run build
  env:
    NODE_ENV: production
    NEXT_PUBLIC_BASE_PATH: /Fokus
    NEXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.NEXT_PUBLIC_FIREBASE_API_KEY }}
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: ${{ secrets.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN }}
    NEXT_PUBLIC_FIREBASE_DATABASE_URL: ${{ secrets.NEXT_PUBLIC_FIREBASE_DATABASE_URL }}
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_PROJECT_ID }}
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: ${{ secrets.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET }}
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID }}
    NEXT_PUBLIC_FIREBASE_APP_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_APP_ID }}
```

## How It Works

### Data Model

The timer data is stored at the path `/sharedTimer` in Firebase:

```json
{
  "timerId": "default",
  "durationMs": 300000,
  "startedAt": 1703123456789,
  "pausedAt": null,
  "pausedDuration": 0,
  "status": "running",
  "lastUpdated": 1703123456789
}
```

### Sync Strategy

1. **Real-time Listener**: The app uses Firebase's `onValue` listener to watch for changes
2. **Timestamp-based Calculation**: Remaining time is calculated from `(startedAt + durationMs) - currentTime`, not from local intervals
3. **Smooth Updates**: Uses `requestAnimationFrame` for smooth countdown display
4. **Race Condition Handling**: Only one timer can be active at a time (enforced by status checks)

### Features

- ✅ **Real-time sync**: Changes appear instantly across all clients
- ✅ **Late-joiner support**: New users see the correct remaining time
- ✅ **Page refresh safe**: Timer state persists in Firebase
- ✅ **Accurate timing**: Based on server timestamps, not local intervals
- ✅ **Visual feedback**: Shows sync status and who started the timer

## Troubleshooting

### Timer Not Syncing

1. Check that Firebase environment variables are set correctly
2. Verify Firebase Realtime Database is enabled
3. Check browser console for errors
4. Ensure security rules allow read/write access

### "Firebase not configured" Error

- Make sure all `NEXT_PUBLIC_FIREBASE_*` environment variables are set
- Restart your development server after adding environment variables
- For production, ensure GitHub secrets are set correctly

### Timer Drifting

- The timer uses timestamp-based calculation, so it should not drift
- If you see drift, check that `startedAt` is being set correctly
- Ensure all clients have synchronized clocks (they should, but check system time)

## Security Considerations

⚠️ **Important**: The current setup uses public read/write access for simplicity. For production:

1. Implement Firebase Authentication
2. Update security rules to require authentication
3. Consider adding rate limiting
4. Add validation for timer updates
5. Consider adding user permissions/roles

## Future Enhancements

- **Multiple Timers**: Support for different timer rooms/channels
- **User Authentication**: Track who started/modified timers
- **Timer History**: Log of past timer sessions
- **Custom Timer Names**: Named timers for different purposes
- **Private Timers**: User-specific timers that don't sync

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify Firebase Console shows the database is active
3. Test with Firebase Console's data viewer to see if data is being written
4. Check network tab to see if Firebase requests are being made
