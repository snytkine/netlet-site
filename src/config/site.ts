/**
 * Central site configuration. Update these values when real release assets exist.
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
export const HERO_ANIMATION_SECONDS = 20

/** Largest number of bubble colours the home page animation supports. */
export const HERO_BUBBLE_COLORS_MAX = 7

/**
 * Fill colours of the message bubbles flying through the home page animation, as CSS colours
 * (hex, `rgb()`, `hsl()` or a colour name). Use between 1 and `HERO_BUBBLE_COLORS_MAX` (7)
 * colours: bubbles are spread evenly across the list. Extra colours beyond the maximum and
 * values the browser does not recognise are ignored. Initial values: orange, blue and teal.
 */
export const HERO_BUBBLE_COLORS: readonly string[] = ['#f97316', '#3b82f6', '#14b8a6']

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
