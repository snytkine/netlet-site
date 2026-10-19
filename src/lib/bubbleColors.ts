import { HERO_BUBBLE_COLORS_MAX } from '../config/site'

/** Colour used when none of the configured bubble colours is usable (the brand blue). */
export const FALLBACK_BUBBLE_COLOR = '#3b82f6'

/**
 * Tells whether the browser accepts a value as a CSS colour. Where `CSS.supports` is not
 * available (for example under jsdom) any non-empty string is accepted.
 *
 * @param value - candidate CSS colour
 * @returns `true` when the value can be used as a colour
 */
function isCssColor(value: string): boolean {
  if (value === '') return false
  return typeof CSS === 'undefined' || typeof CSS.supports !== 'function' ? true : CSS.supports('color', value)
}

/**
 * Cleans the configured list of bubble colours: trims entries, drops values that are not CSS
 * colours, and keeps at most `max` of them. An empty result falls back to a single brand blue
 * so the animation always has a colour to draw with.
 *
 * @param colors - colours from the site configuration
 * @param max - largest number of colours to keep, defaults to `HERO_BUBBLE_COLORS_MAX`
 * @returns between 1 and `max` usable CSS colours, in their original order
 */
export function resolveBubbleColors(colors: readonly string[], max: number = HERO_BUBBLE_COLORS_MAX): string[] {
  const usable = colors
    .filter((color): color is string => typeof color === 'string')
    .map((color) => color.trim())
    .filter(isCssColor)
    .slice(0, max)
  return usable.length > 0 ? usable : [FALLBACK_BUBBLE_COLOR]
}
