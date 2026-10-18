import { useEffect, useState } from 'react'

/**
 * Reports whether the user prefers reduced motion. Animated components use this to
 * render a single static frame instead of looping.
 *
 * @returns `true` when `prefers-reduced-motion: reduce` matches
 */
export function useReducedMotion(): boolean {
  const query = '(prefers-reduced-motion: reduce)'
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia(query).matches
      : false,
  )

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const mql = window.matchMedia(query)
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches)
    mql.addEventListener?.('change', onChange)
    return () => mql.removeEventListener?.('change', onChange)
  }, [])

  return reduced
}
