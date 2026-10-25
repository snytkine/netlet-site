import { useEffect, useState } from 'react'
import { loadReleaseNotes, type ReleaseNotes } from './releaseNotes'

/** What {@link useReleaseNotes} reports. */
export interface ReleaseNotesState {
  /** `true` until GitHub has answered (or failed to). */
  loading: boolean
  /** The newest releases, an empty list when none is published, or `null` while loading or when the lookup failed. */
  releases: ReleaseNotes[] | null
}

/**
 * Looks up the release notes once the component is shown. Components that render before the
 * answer arrives should show a loading note; they re-render when it does.
 *
 * @returns the loading flag and the releases, if any
 */
export function useReleaseNotes(): ReleaseNotesState {
  const [state, setState] = useState<ReleaseNotesState>({ loading: true, releases: null })

  useEffect(() => {
    let active = true
    void loadReleaseNotes().then((releases) => {
      if (active) setState({ loading: false, releases })
    })
    return () => {
      active = false
    }
  }, [])

  return state
}
