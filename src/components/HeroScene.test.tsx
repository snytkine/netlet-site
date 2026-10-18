import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import HeroScene from './HeroScene'

describe('HeroScene without WebGL', () => {
  it('renders the accessible static fallback', () => {
    const { getByRole, container } = render(<HeroScene />)
    expect(getByRole('img')).toHaveAccessibleName(/3D animation/)
    expect(container.querySelector('.hero-scene__fallback')).toBeInTheDocument()
  })
})
