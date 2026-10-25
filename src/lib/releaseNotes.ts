import { ALL_RELEASES_URL, RELEASES_LIST_API_URL } from '../config/site'
import { isRecord, versionFromTag } from './release'

/** Longest release body kept, so a huge or malicious reply cannot flood the page. */
const MAX_BODY_LENGTH = 20000

/** One published release with the notes written for it. */
export interface ReleaseNotes {
  /** Version without the leading `v`, for example `0.2.0`. */
  version: string
  /** When the release was published, as an ISO 8601 date string, or `null` when unknown. */
  publishedAt: string | null
  /** Link to the release on GitHub (always under {@link ALL_RELEASES_URL}). */
  url: string
  /** The release notes as Markdown. Empty when nobody wrote any. */
  body: string
}

/**
 * Turns one entry of the untrusted GitHub "list releases" reply into a {@link ReleaseNotes}.
 *
 * @param raw - one element of the parsed JSON array
 * @returns the release, or `null` for a draft, a pre-release, or an entry without a clean `x.y.z` tag
 */
function parseOne(raw: unknown): ReleaseNotes | null {
  if (!isRecord(raw) || typeof raw.tag_name !== 'string') return null
  if (raw.draft === true || raw.prerelease === true) return null
  const version = versionFromTag(raw.tag_name)
  if (!version) return null

  const published = typeof raw.published_at === 'string' && !Number.isNaN(Date.parse(raw.published_at))
  const url =
    typeof raw.html_url === 'string' && raw.html_url.startsWith(`${ALL_RELEASES_URL}/`) ? raw.html_url : ALL_RELEASES_URL
  const body = typeof raw.body === 'string' ? raw.body.replace(/\r\n?/g, '\n').slice(0, MAX_BODY_LENGTH) : ''
  return { version, publishedAt: published ? (raw.published_at as string) : null, url, body }
}

/**
 * Turns the untrusted JSON of the GitHub "list releases" API into release notes. Anything
 * unexpected is dropped, and links outside this site's own releases are replaced by the
 * releases page, so the page never links to another place.
 *
 * @param data - parsed JSON from the API
 * @returns the usable releases in the order GitHub sent them (newest first), or `null` when the
 *   data is not a list
 */
export function parseReleaseNotes(data: unknown): ReleaseNotes[] | null {
  if (!Array.isArray(data)) return null
  return data.map(parseOne).filter((release): release is ReleaseNotes => release !== null)
}

/**
 * Asks GitHub for the newest published releases. This is a request from the visitor's browser to
 * GitHub only; no cookies or referrer are sent.
 *
 * @param fetchImpl - the `fetch` function to use (injectable for tests)
 * @returns the releases (an empty list when nothing is published yet), or `null` when GitHub
 *   cannot be reached, answers with an error (for example the rate limit) or sends data that is
 *   not a list of releases
 */
export async function fetchReleaseNotes(fetchImpl: typeof fetch = fetch): Promise<ReleaseNotes[] | null> {
  try {
    const response = await fetchImpl(RELEASES_LIST_API_URL, {
      headers: { Accept: 'application/vnd.github+json' },
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
    })
    if (!response.ok) return null
    return parseReleaseNotes(await response.json())
  } catch {
    return null
  }
}

/** The lookup shared by every component on the page, so GitHub is asked once per page load. */
let cached: Promise<ReleaseNotes[] | null> | null = null

/**
 * Returns the release notes, asking GitHub only the first time it is called.
 *
 * @returns a promise of the releases, or `null` when the lookup failed
 */
export function loadReleaseNotes(): Promise<ReleaseNotes[] | null> {
  cached ??= fetchReleaseNotes()
  return cached
}

/** Forgets the shared lookup so the next {@link loadReleaseNotes} asks GitHub again (for tests). */
export function resetReleaseNotesCache(): void {
  cached = null
}

/**
 * Formats a publish date for display.
 *
 * @param iso - an ISO 8601 date string
 * @returns for example `October 25, 2026`, always in UTC so every visitor sees the same day
 */
export function formatReleaseDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })
}
