import type { Theme } from '../lib/useTheme'

/** Props for {@link ThemeToggle}. */
export interface ThemeToggleProps {
  /** Theme currently applied to the site. */
  theme: Theme
  /** Called when the visitor flips the switch. */
  onToggle: () => void
}

/**
 * Light/dark theme switch: a macOS-style toggle between a sun and a moon icon.
 * The switch is "on" in dark mode.
 *
 * @param props.theme - theme currently applied
 * @param props.onToggle - called when the switch is clicked
 */
export default function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const dark = theme === 'dark'
  return (
    <div className="theme-toggle">
      <svg className="theme-toggle__icon" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="4.2" />
        <path d="M12 2.5v2.6M12 18.900v2.6M2.5 12h2.6M18.900 12h2.6M5.300 5.300l1.800 1.800M16.900 16.900l1.800 1.800M5.300 18.700l1.800-1.800M16.900 7.100l1.800-1.800" />
      </svg>
      <button
        type="button"
        className="switch"
        role="switch"
        aria-checked={dark}
        aria-label="Dark mode"
        title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        onClick={onToggle}
      >
        <span className="switch__knob" />
      </button>
      <svg className="theme-toggle__icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 14.200A8.200 8.200 0 0 1 9.800 4a8.200 8.200 0 1 0 10.200 10.200Z" />
      </svg>
    </div>
  )
}
