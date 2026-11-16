import { useState, type ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { SITE_NAME } from '../config/site'
import { NAV_ITEMS } from '../config/nav'
import { useTheme, type Theme } from '../lib/useTheme'
import GlassIcon from './GlassIcon'
import MeshLogo from './MeshLogo'
import ThemeToggle from './ThemeToggle'

/** Props for {@link Header}. */
interface HeaderProps {
  /** Theme currently applied to the site. */
  theme: Theme
  /** Switches between the light and the dark theme. */
  onToggleTheme: () => void
}

/**
 * Site header with the animated canvas logo, a responsive navigation menu with glass icons
 * and the light/dark theme switch on the right.
 *
 * @param props.theme - theme currently applied
 * @param props.onToggleTheme - called when the visitor flips the theme switch
 */
function Header({ theme, onToggleTheme }: HeaderProps) {
  const [open, setOpen] = useState(false)

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link to="/" className="brand" aria-label={`${SITE_NAME} chat home`}>
          <MeshLogo size={44} />
          <span className="brand__name">
            {SITE_NAME}
            <span className="brand__sub"> chat</span>
          </span>
        </Link>
        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="primary-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          <span aria-hidden="true">{open ? '✕' : '☰'}</span>
        </button>
        <nav id="primary-nav" className={`nav${open ? ' nav--open' : ''}`} aria-label="Primary" onClick={() => setOpen(false)}>
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'active' : undefined)}>
              <GlassIcon name={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ))}
          <Link to="/download" className="button button--small">
            Download
          </Link>
        </nav>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
    </header>
  )
}

const YEAR = new Date().getFullYear()

/**
 * Site footer.
 */
function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <p>
          © {YEAR} {SITE_NAME} chat. Messages stay on your local network.
        </p>
      </div>
    </footer>
  )
}

/** Props for {@link Layout}. */
export interface LayoutProps {
  /** The routed page content, rendered inside `<main>`. */
  children: ReactNode
}

/**
 * Shared page chrome: header, routed content and footer. Owns the light/dark theme.
 *
 * @param props.children - page content
 */
export default function Layout({ children }: LayoutProps) {
  const { theme, toggleTheme } = useTheme()
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header theme={theme} onToggleTheme={toggleTheme} />
      <main id="main">
        {children}
      </main>
      <Footer />
    </>
  )
}
