import { RELEASES_API_URL, RELEASES_DOWNLOAD_PREFIX, type Platform } from '../config/site'

/** One downloadable installer of a release. */
export interface ReleaseAsset {
  /** File name, for example `netlet_0.2.0_universal.dmg`. */
  name: string
  /** Direct download link (always under {@link RELEASES_DOWNLOAD_PREFIX}). */
  url: string
  /** File size in bytes. */
  size: number
  /** Link to the matching `.sha256` file, or `null` when the release has none. */
  checksumUrl: string | null
}

/** The newest published release, reduced to what the download page needs. */
export interface LatestRelease {
  /** Version without the leading `v`, for example `0.2.0`. */
  version: string
  /** The installer for each platform that has one. */
  assets: Partial<Record<Platform, ReleaseAsset>>
}

/** Accepts `v1.2.3` and `1.2.3`, with an optional pre-release or build suffix. */
const VERSION_PATTERN = /^v?(\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?)$/

/**
 * Narrows an unknown value to a plain object.
 *
 * @param value - anything, usually parsed JSON
 * @returns `true` when the value is a non-null, non-array object
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Extracts the version from a release tag.
 *
 * @param tag - a Git tag such as `v0.2.0` or `0.2.0`
 * @returns the version without the leading `v`, or `null` when the tag is not `x.y.z`
 */
export function versionFromTag(tag: string): string | null {
  return VERSION_PATTERN.exec(tag)?.[1] ?? null
}

/**
 * Picks the installer of one platform from the release's assets. When the release has several
 * candidates (for example separate Apple Silicon and Intel disk images) the universal build wins,
 * otherwise the first one listed.
 *
 * @param assets - the valid assets of the release
 * @param suffix - lowercase file name ending that identifies the platform's installer
 * @returns the chosen asset, or `undefined` when there is none
 */
function pickInstaller(assets: ReleaseAsset[], suffix: string): ReleaseAsset | undefined {
  const matches = assets.filter((asset) => asset.name.toLowerCase().endsWith(suffix))
  return matches.find((asset) => /universal/i.test(asset.name)) ?? matches[0]
}

/**
 * Turns the untrusted JSON of the GitHub "latest release" API into a {@link LatestRelease}.
 * Anything unexpected is dropped: a version that is not `x.y.z`, assets without a name, a size
 * or a download link inside this site's own releases, so the page never links to another place.
 *
 * @param data - parsed JSON from the API
 * @returns the release, or `null` when the data has no usable version
 */
export function parseLatestRelease(data: unknown): LatestRelease | null {
  if (!isRecord(data) || typeof data.tag_name !== 'string') return null
  const version = versionFromTag(data.tag_name)
  if (!version) return null

  const rawAssets = Array.isArray(data.assets) ? data.assets : []
  const valid: ReleaseAsset[] = []
  for (const raw of rawAssets) {
    if (!isRecord(raw)) continue
    const { name, browser_download_url: url, size } = raw
    if (typeof name !== 'string' || typeof url !== 'string' || typeof size !== 'number') continue
    if (!url.startsWith(RELEASES_DOWNLOAD_PREFIX)) continue
    valid.push({ name, url, size, checksumUrl: null })
  }

  const checksums = new Map(valid.filter((a) => a.name.endsWith('.sha256')).map((a) => [a.name, a.url]))
  const withChecksums = valid.map((asset) => ({ ...asset, checksumUrl: checksums.get(`${asset.name}.sha256`) ?? null }))

  const assets: LatestRelease['assets'] = {}
  const mac = pickInstaller(withChecksums, '.dmg')
  const windows = pickInstaller(withChecksums, '-setup.exe')
  if (mac) assets.mac = mac
  if (windows) assets.windows = windows
  return { version, assets }
}

/**
 * Asks GitHub for the newest published release. This is a request from the visitor's browser to
 * GitHub only; no cookies or referrer are sent.
 *
 * @param fetchImpl - the `fetch` function to use (injectable for tests)
 * @returns the release, or `null` when GitHub cannot be reached, answers with an error (no release
 *   yet, rate limit) or sends data that does not look like a release
 */
export async function fetchLatestRelease(fetchImpl: typeof fetch = fetch): Promise<LatestRelease | null> {
  try {
    const response = await fetchImpl(RELEASES_API_URL, {
      headers: { Accept: 'application/vnd.github+json' },
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
    })
    if (!response.ok) return null
    return parseLatestRelease(await response.json())
  } catch {
    return null
  }
}

/** The lookup shared by every component on the page, so GitHub is asked once per page load. */
let cached: Promise<LatestRelease | null> | null = null

/**
 * Returns the latest release, asking GitHub only the first time it is called.
 *
 * @returns a promise of the release, or `null` when the lookup failed
 */
export function loadLatestRelease(): Promise<LatestRelease | null> {
  cached ??= fetchLatestRelease()
  return cached
}

/** Forgets the shared lookup so the next {@link loadLatestRelease} asks GitHub again (for tests). */
export function resetLatestReleaseCache(): void {
  cached = null
}

/**
 * Formats a file size for display.
 *
 * @param bytes - size in bytes
 * @returns for example `850 KB` or `12.4 MB`
 */
export function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
