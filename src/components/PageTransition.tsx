import { useState, type AnimationEvent, type ReactNode } from 'react'
import { useLocation, useNavigationType, type Location } from 'react-router-dom'

/** Props for {@link PageTransition}. */
export interface PageTransitionProps {
  /** Renders the routes for the location currently on screen. */
  children: (location: Location) => ReactNode
}

/**
 * Smooth page transition: animates the old page out, then swaps in the new page, scrolls to
 * the top and animates the new page in.
 *
 * The router location runs ahead of the page on screen while the old page is leaving. Redirects
 * (`REPLACE` navigations such as `/manual` to its first section) are swapped in at once, so a
 * redirect does not play a second, empty transition.
 *
 * @param props.children - render function that receives the location to display
 */
export default function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation()
  const navigationType = useNavigationType()
  const [displayed, setDisplayed] = useState(location)

  let shown = displayed
  if (navigationType === 'REPLACE' && location.pathname !== displayed.pathname) {
    // A redirect: follow it immediately (React re-renders with the new state before painting).
    shown = location
    setDisplayed(location)
  }

  // While the router is ahead of what is on screen, the old page is leaving.
  const stage = location.pathname === shown.pathname ? 'enter' : 'exit'

  /**
   * Swaps in the new page once the exit animation of the wrapper itself has finished.
   *
   * @param event - `animationend` event, which also bubbles up from animations inside the page
   */
  const handleAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || stage !== 'exit') return
    setDisplayed(location)
    window.scrollTo(0, 0)
  }

  return (
    <div className={`page-transition page-transition--${stage}`} onAnimationEnd={handleAnimationEnd}>
      {children(stage === 'enter' ? location : shown)}
    </div>
  )
}
