# GitHub Pages Deployment with Firebase

This guide explains how to deploy your Fokus app to GitHub Pages with Firebase credentials configured.

## Quick Setup Steps

### 1. Add Firebase Secrets to GitHub

1. Go to your GitHub repository
2. Click on **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **"New repository secret"** button
5. Add each of the following secrets (one at a time):

| Secret Name | Description | Example Value |
|------------|-------------|---------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API Key | `AIzaSyB...` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Auth Domain | `your-project.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_DATABASE_URL` | Realtime Database URL | `https://your-project-default-rtdb.firebaseio.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Project ID | `your-project-id` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Storage Bucket | `your-project.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Messaging Sender ID | `123456789012` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | App ID | `1:123456789012:web:abcdef123456` |

### 2. Where to Find These Values

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the gear icon ⚙️ → **Project settings**
4. Scroll down to **"Your apps"** section
5. Click on your web app (or create one if needed)
6. You'll see your Firebase configuration object with all the values

Example configuration object:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyB...",                    // ← NEXT_PUBLIC_FIREBASE_API_KEY
  authDomain: "myproject.firebaseapp.com", // ← NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  databaseURL: "https://myproject-default-rtdb.firebaseio.com", // ← NEXT_PUBLIC_FIREBASE_DATABASE_URL
  projectId: "myproject",                  // ← NEXT_PUBLIC_FIREBASE_PROJECT_ID
  storageBucket: "myproject.appspot.com",  // ← NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "123456789",          // ← NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123456789:web:abcdef"          // ← NEXT_PUBLIC_FIREBASE_APP_ID
};
```

### 3. Verify Workflow Configuration

The workflow file (`.github/workflows/deploy.yml`) is already configured to use these secrets. It looks like this:

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

### 4. Deploy

1. Commit and push your code:
   ```bash
   git add .
   git commit -m "Add Firebase configuration"
   git push
   ```

2. Go to **Actions** tab in your GitHub repository
3. Watch the workflow run
4. Once complete, your app will be deployed with Firebase configured

### 5. Verify Firebase Connection

1. Visit your deployed app
2. Navigate to the "Shared Timer" tab
3. You should see the timer interface (not the "Firebase not configured" message)
4. The "Synced" indicator should appear when connected

## Troubleshooting

### Firebase Not Working After Deployment

1. **Check Secrets are Set**:
   - Go to Settings → Secrets and variables → Actions
   - Verify all 7 Firebase secrets are present
   - Make sure the names match exactly (case-sensitive)

2. **Check Workflow Logs**:
   - Go to Actions tab
   - Click on the latest workflow run
   - Check the "Build" step logs for any errors

3. **Verify Values**:
   - Double-check that you copied the values correctly
   - Make sure there are no extra spaces or characters
   - The `databaseURL` should start with `https://` and end with `.firebaseio.com`

4. **Check Browser Console**:
   - Open your deployed app
   - Open browser DevTools (F12)
   - Check Console tab for Firebase errors
   - Look for messages like "Firebase not configured" or connection errors

### Common Issues

**Issue**: "Firebase not configured" message appears
- **Solution**: Secrets are not set or workflow didn't use them. Verify secrets are added correctly.

**Issue**: "Permission denied" errors
- **Solution**: Check Firebase Realtime Database rules allow read/write access (see FIREBASE_SETUP.md)

**Issue**: Timer doesn't sync
- **Solution**: Check that `NEXT_PUBLIC_FIREBASE_DATABASE_URL` is correct and database is enabled

## Security Notes

⚠️ **Important**: These are **public** environment variables (prefixed with `NEXT_PUBLIC_`), which means they will be visible in the built JavaScript bundle. This is expected and safe for Firebase client-side configuration.

However, make sure:
- Your Firebase security rules are properly configured
- You're using test mode or have proper authentication rules
- Never commit your `.env.local` file to git

## Updating Firebase Credentials

If you need to update Firebase credentials:

1. Go to Settings → Secrets and variables → Actions
2. Find the secret you want to update
3. Click the secret name
4. Click "Update" button
5. Enter the new value
6. Push a new commit to trigger a rebuild

The workflow will automatically use the updated secrets on the next deployment.
