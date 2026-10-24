import { useEffect, useState } from 'react'
import { loadLatestRelease, type LatestRelease } from './release'

/** What {@link useLatestRelease} reports. */
export interface LatestReleaseState {
  /** `true` until GitHub has answered (or failed to). */
  loading: boolean
  /** The latest release, or `null` while loading or when the lookup failed. */
  release: LatestRelease | null
}

/**
 * Looks up the latest release once the component is shown. Components that render before the
 * answer arrives should show the fallback links; they re-render when it does.
 *
 * @returns the loading flag and the release, if any
 */
export function useLatestRelease(): LatestReleaseState {
  const [state, setState] = useState<LatestReleaseState>({ loading: true, release: null })

  useEffect(() => {
    let active = true
    void loadLatestRelease().then((release) => {
      if (active) setState({ loading: false, release })
    })
    return () => {
      active = false
    }
  }, [])

  return state
}
