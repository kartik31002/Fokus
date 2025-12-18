'use client'

import { useState, useEffect } from 'react'
import { settingsStorage } from '@/lib/storage'

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const settings = settingsStorage.get()
    setTheme(settings.theme)
  }, [])

  useEffect(() => {
    const updateTheme = () => {
      const root = window.document.documentElement

      if (theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        setResolvedTheme(prefersDark ? 'dark' : 'light')
      } else {
        setResolvedTheme(theme)
      }

      root.classList.remove('light', 'dark')
      root.classList.add(resolvedTheme)
    }

    updateTheme()

    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', updateTheme)
      return () => mediaQuery.removeEventListener('change', updateTheme)
    }
  }, [theme, resolvedTheme])

  const setThemeWithSave = (newTheme: 'light' | 'dark' | 'auto') => {
    setTheme(newTheme)
    const settings = settingsStorage.get()
    settings.theme = newTheme
    settingsStorage.save(settings)
  }

  return {
    theme,
    resolvedTheme,
    setTheme: setThemeWithSave,
  }
}
