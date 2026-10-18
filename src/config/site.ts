/**
 * Central site configuration. Update these values when real release assets exist.
 */

/** Product name shown across the site. */
export const SITE_NAME = 'NetLet'

/** One-line tagline. */
export const TAGLINE = 'When the Internet drops, NetLet still works.'

/** GitHub repository of this website. */
export const SITE_REPO_URL = 'https://github.com/snytkine/netlet-site'

/** Supported desktop platforms. */
export type Platform = 'mac' | 'windows'

/** Describes a downloadable build. */
export interface DownloadOption {
  platform: Platform
  label: string
  requirement: string
  url: string
}

/**
 * Download links. NOTE: placeholders until the first NetLet release is published —
 * point these at the real release assets.
 */
export const DOWNLOADS: readonly DownloadOption[] = [
  {
    platform: 'mac',
    label: 'Download for Mac',
    requirement: 'macOS 12 or later',
    url: 'https://github.com/snytkine/netlet/releases/latest',
  },
  {
    platform: 'windows',
    label: 'Download for Windows',
    requirement: 'Windows 10 or later',
    url: 'https://github.com/snytkine/netlet/releases/latest',
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
