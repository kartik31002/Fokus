# GitHub Pages Deployment Guide

This guide will help you deploy Fokus to GitHub Pages.

## Prerequisites

1. A GitHub account
2. A GitHub repository (create one if you haven't already)

## Setup Steps

### 1. Create GitHub Repository

1. Go to GitHub and create a new repository (e.g., `Fokus` or `fokus-productivity-app`)
2. **Do NOT** initialize it with a README, .gitignore, or license (we already have these)

### 2. Initialize Git (if not already done)

```bash
cd /Users/kartikey.gupta/Desktop/Work/Fokus
git init
git add .
git commit -m "Initial commit - Fokus productivity app"
```

### 3. Connect to GitHub Repository

```bash
# Replace YOUR_USERNAME and YOUR_REPO_NAME with your actual values
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### 4. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **Settings** tab
3. Scroll down to **Pages** in the left sidebar
4. Under **Source**, select **GitHub Actions**
5. Save the settings

### 5. Deploy

The GitHub Actions workflow will automatically:
- Build your Next.js app
- Export it as static files
- Deploy to GitHub Pages

After pushing your code, go to **Actions** tab in your repository to see the deployment progress.

### 6. Access Your App

Once deployed, your app will be available at:
- `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

## Deploying to a Subdirectory

If your repository name is different and you want to deploy to a subdirectory (e.g., `/Fokus/`):

1. Edit `.github/workflows/deploy.yml`
2. Change the `NEXT_PUBLIC_BASE_PATH` environment variable:
   ```yaml
   NEXT_PUBLIC_BASE_PATH: /YOUR_REPO_NAME
   ```
3. Commit and push the changes

## Manual Deployment

If you want to test the static export locally:

```bash
npm run build
```

The static files will be in the `out/` directory. You can test by serving them with:

```bash
npx serve out
```

## Troubleshooting

### Build Fails
- Check the **Actions** tab for error messages
- Ensure all dependencies are in `package.json`
- Make sure Node.js version is 18 or higher

### 404 Errors on Refresh
- This is expected for GitHub Pages with client-side routing
- Consider using HashRouter or ensuring all routes work correctly

### Assets Not Loading
- Verify `basePath` is set correctly if deploying to a subdirectory
- Check browser console for 404 errors

## Updating Your Deployment

Simply push changes to the `main` branch:

```bash
git add .
git commit -m "Update app"
git push
```

The GitHub Actions workflow will automatically rebuild and redeploy.
