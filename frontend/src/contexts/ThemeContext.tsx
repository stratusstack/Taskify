import React, { createContext, useContext, useEffect, useState } from 'react'

export type Theme = 'neon' | 'readable' | 'monokai' | 'professional'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  themes: {
    name: string
    value: Theme
    description: string
    colors: {
      primary: string
      secondary: string
      accent: string
    }
  }[]
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const themes = [
  {
    name: 'Neon Cyber',
    value: 'neon' as Theme,
    description: 'Blue Violet, Dark Turquoise, Yellow',
    colors: {
      primary: '#8A2BE2',
      secondary: '#00CED1',
      accent: '#FFFF00'
    }
  },
  {
    name: 'Readable',
    value: 'readable' as Theme,
    description: 'High contrast, optimal readability',
    colors: {
      primary: '#1a365d',
      secondary: '#4a5568',
      accent: '#2b6cb0'
    }
  },
  {
    name: 'Monokai',
    value: 'monokai' as Theme,
    description: 'Dark theme with vibrant syntax highlighting colors',
    colors: {
      primary: '#A6E22E',
      secondary: '#FD971F',
      accent: '#F92672'
    }
  },
  {
    name: 'Professional',
    value: 'professional' as Theme,
    description: 'Clean enterprise theme inspired by modern project management tools',
    colors: {
      primary: '#0052CC',
      secondary: '#0065FF',
      accent: '#36B37E'
    }
  }
]

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('taskify-theme')
    // Handle backward compatibility for 'natural' -> 'monokai'
    if (stored === 'natural') return 'monokai'
    return (stored as Theme) || 'neon'
  })

  useEffect(() => {
    const root = document.documentElement
    
    // Remove all theme classes
    root.classList.remove('theme-neon', 'theme-readable', 'theme-natural', 'theme-professional')

    // Add current theme class (map monokai to natural for CSS compatibility)
    const cssTheme = theme === 'monokai' ? 'natural' : theme
    root.classList.add(`theme-${cssTheme}`)
    
    // Store theme
    localStorage.setItem('taskify-theme', theme)
  }, [theme])

  const value = {
    theme,
    setTheme,
    themes
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}