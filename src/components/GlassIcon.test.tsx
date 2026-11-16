import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { NAV_ITEMS, type IconName } from '../config/nav'
import GlassIcon from './GlassIcon'

const names: IconName[] = ['features', 'use-cases', 'manual', 'faqs']

describe('GlassIcon', () => {
  it.each(names)('renders a decorative "%s" icon', (name) => {
    const { container } = render(<GlassIcon name={name} />)
    const icon = container.firstElementChild
    expect(icon).toHaveClass('glass-icon', `glass-icon--${name}`)
    expect(icon).toHaveAttribute('aria-hidden', 'true')
    expect(icon?.querySelector('svg')?.childElementCount).toBeGreaterThan(0)
  })

  it('has a glyph for every navigation entry', () => {
    expect(NAV_ITEMS.map((item) => item.icon).sort()).toEqual([...names].sort())
  })
})
