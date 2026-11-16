import type { ReactNode } from 'react'
import type { IconName } from '../config/nav'

/** White line glyphs drawn on a 24×24 grid, one per navigation icon. */
const GLYPHS: Record<IconName, ReactNode> = {
  features: (
    <>
      <path d="M10 4.500l1.700 4.300 4.300 1.700-4.300 1.700L10 16.500l-1.700-4.300L4 10.500l4.300-1.700Z" />
      <path d="M17.500 14.500l.8 2.200 2.200.8-2.200.8-.8 2.200-.8-2.200-2.200-.8 2.200-.8Z" />
    </>
  ),
  'use-cases': (
    <>
      <circle cx="12" cy="12" r="2.600" />
      <circle cx="5.500" cy="6" r="1.700" />
      <circle cx="18.500" cy="6" r="1.700" />
      <circle cx="5.500" cy="18" r="1.700" />
      <circle cx="18.500" cy="18" r="1.700" />
      <path d="M10 10.200 6.800 7.200M14 10.200l3.200-3M10 13.800l-3.200 3M14 13.800l3.200 3" />
    </>
  ),
  manual: (
    <>
      <path d="M12 6.500C10.300 5.300 7.800 5 5 5.200v12.600c2.800-.2 5.300.1 7 1.300 1.700-1.200 4.200-1.500 7-1.300V5.200c-2.800-.2-5.300.1-7 1.300Z" />
      <path d="M12 6.500V19" />
    </>
  ),
  faqs: (
    <>
      <path d="M8.700 9.200a3.300 3.300 0 1 1 5.200 2.700c-1.100.8-1.900 1.400-1.900 2.800" />
      <path d="M12 18.400v.1" />
    </>
  ),
}

/** Props for {@link GlassIcon}. */
export interface GlassIconProps {
  /** Which glyph to draw. */
  name: IconName
}

/**
 * A glossy "glass" tile with a white glyph. It tilts in 3D and a sheen sweeps across it when
 * the navigation link around it is hovered or focused (see `.glass-icon` in `index.css`).
 * Purely decorative, so it is hidden from assistive technology.
 *
 * @param props.name - glyph to draw
 */
export default function GlassIcon({ name }: GlassIconProps) {
  return (
    <span className={`glass-icon glass-icon--${name}`} aria-hidden="true">
      <svg viewBox="0 0 24 24">{GLYPHS[name]}</svg>
    </span>
  )
}
