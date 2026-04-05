import React from 'react'

type ThemeMode = 'light' | 'dark' | 'system'
type ResolvedTheme = 'light' | 'dark'

type ThemeContextValue = {
  themeMode: ThemeMode
  resolvedTheme: ResolvedTheme
  setThemeMode: (mode: ThemeMode) => void
}

const THEME_STORAGE_KEY = 'veren-theme'

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined)

const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === 'undefined') {
    return 'dark'
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const getInitialThemeMode = (): ThemeMode => {
  if (typeof window === 'undefined') {
    return 'system'
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)

  if (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system') {
    return storedTheme
  }

  return 'system'
}

export const ThemeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [themeMode, setThemeModeState] = React.useState<ThemeMode>(getInitialThemeMode)
  const [systemTheme, setSystemTheme] = React.useState<ResolvedTheme>(getSystemTheme)

  const resolvedTheme: ResolvedTheme = themeMode === 'system' ? systemTheme : themeMode

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  React.useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, themeMode)
  }, [themeMode])

  React.useEffect(() => {
    const html = document.documentElement
    html.classList.toggle('dark', resolvedTheme === 'dark')
    html.classList.toggle('light', resolvedTheme === 'light')
    html.dataset.theme = resolvedTheme
  }, [resolvedTheme])

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode)
  }

  const value = React.useMemo<ThemeContextValue>(() => ({
    themeMode,
    resolvedTheme,
    setThemeMode,
  }), [themeMode, resolvedTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = (): ThemeContextValue => {
  const context = React.useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  return context
}

export type { ThemeMode, ResolvedTheme }
