/**
 * Central site configuration.
 */

/** Product name shown across the site. */
export const SITE_NAME = 'NetLet'

/** One-line tagline. */
export const TAGLINE = 'When the Internet drops, NetLet still works.'

/** GitHub repository of this website. */
export const SITE_REPO_URL = 'https://github.com/snytkine/netlet-site'

/**
 * How many seconds the home page 3D animation plays before it stops by itself.
 * Visitors can click the animation to stop it earlier or to start it again; every start
 * plays for this long. Set to `0` to let the animation run until the visitor stops it.
 */
export const HERO_ANIMATION_SECONDS = 10

/** Largest number of bubble colours the home page animation supports. */
export const HERO_BUBBLE_COLORS_MAX = 7

/**
 * Fill colours of the message bubbles flying through the home page animation, as CSS colours
 * (hex, `rgb()`, `hsl()` or a colour name). Use between 1 and `HERO_BUBBLE_COLORS_MAX` (7)
 * colours: bubbles are spread evenly across the list. Extra colours beyond the maximum and
 * values the browser does not recognise are ignored. Initial values: orange, blue and teal.
 */
export const HERO_BUBBLE_COLORS: readonly string[] = ['#3b82f6', '#14b8a6']

/** Supported desktop platforms. */
export type Platform = 'mac' | 'windows'

/** Describes a downloadable build. */
export interface DownloadOption {
  platform: Platform
  label: string
  requirement: string
  url: string
}

/** GitHub repository that holds the installer downloads (public, unlike the app's source repository). */
export const RELEASES_REPO = 'snytkine/netlet-site'

/** Page listing the newest release. Used as the download link when the release lookup fails. */
export const RELEASES_PAGE_URL = `https://github.com/${RELEASES_REPO}/releases/latest`

/** GitHub API endpoint that describes the newest published release (no drafts or pre-releases). */
export const RELEASES_API_URL = `https://api.github.com/repos/${RELEASES_REPO}/releases/latest`

/** Page that lists every release of the app, newest first, including the older ones. */
export const ALL_RELEASES_URL = `https://github.com/${RELEASES_REPO}/releases`

/** How many of the newest releases the release notes page shows. */
export const RELEASE_NOTES_COUNT = 10

/** GitHub API endpoint that lists the newest published releases (no drafts), with their notes. */
export const RELEASES_LIST_API_URL = `https://api.github.com/repos/${RELEASES_REPO}/releases?per_page=${RELEASE_NOTES_COUNT}`

/** Every installer link must start with this, so a malformed API reply can never point elsewhere. */
export const RELEASES_DOWNLOAD_PREFIX = `https://github.com/${RELEASES_REPO}/releases/download/`

/**
 * Download links. The URL is the fallback: the download buttons replace it with the direct link
 * to the installer of the latest release (see `src/lib/release.ts`) once GitHub has answered.
 */
export const DOWNLOADS: readonly DownloadOption[] = [
  {
    platform: 'mac',
    label: 'Download for Mac',
    requirement: 'macOS 12 or later',
    url: RELEASES_PAGE_URL,
  },
  {
    platform: 'windows',
    label: 'Download for Windows',
    requirement: 'Windows 10 or later',
    url: RELEASES_PAGE_URL,
  },
]

/**
 * Guesses the visitor's desktop platform from the user agent string.
 *
 * @param userAgent - navigator.userAgent value
 * @returns the detected platform, or `null` for mobile / unknown systems
 */
export function detectPlatform(userAgent: string): Platform | null {
  if (/android|iphone|ipad|ipod/i.test(userAgent)) return null
  if (/windows/i.test(userAgent)) return 'windows'
  if (/macintosh|mac os x/i.test(userAgent)) return 'mac'
  return null
}
