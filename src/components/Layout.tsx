import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { SITE_NAME } from '../config/site'
import { NAV_ITEMS } from '../config/nav'
import MeshLogo from './MeshLogo'

/**
 * Scrolls to the top of the page whenever the route path changes.
 */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

/**
 * Site header with the animated canvas logo and a responsive navigation menu.
 */
function Header() {
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
              {item.label}
            </NavLink>
          ))}
          <Link to="/download" className="button button--small">
            Download
          </Link>
        </nav>
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

/**
 * Shared page chrome: header, routed content and footer.
 */
export default function Layout() {
  return (
    <>
      <ScrollToTop />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
