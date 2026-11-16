import { useCallback, useEffect, useState } from 'react'

/** Colour theme of the site. */
export type Theme = 'light' | 'dark'

/** `localStorage` key that remembers the visitor's choice. The script in `index.html` reads it too. */
export const THEME_STORAGE_KEY = 'netlet-theme'

/** Browser toolbar colour (`<meta name="theme-color">`) for each theme; matches `--bg` in `index.css`. */
export const THEME_COLORS: Record<Theme, string> = { light: '#ffffff', dark: '#0b1220' }

/**
 * Reads the theme that the inline script in `index.html` applied before first paint
 * (the saved choice, or else the system setting).
 *
 * @returns the theme currently set on the document, `light` when none is set
 */
function initialTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

/**
 * Holds the site theme, applies it to the document (`data-theme` on `<html>` and the
 * `theme-color` meta tag) and remembers the visitor's choice in `localStorage`.
 *
 * @returns the current theme and a function that switches to the other one
 */
export function useTheme(): { theme: Theme; toggleTheme: () => void } {
  const [theme, setTheme] = useState<Theme>(initialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[theme])
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === 'light' ? 'dark' : 'light'
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next)
      } catch {
        // Storage can be unavailable (private mode); the toggle still works for this visit.
      }
      return next
    })
  }, [])

  return { theme, toggleTheme }
}
