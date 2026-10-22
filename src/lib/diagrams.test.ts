import { describe, expect, it } from 'vitest'
import { homeLayout, officeLayout } from './diagrams'

describe('homeLayout', () => {
  it('has four rooms, each with one computer, fully meshed', () => {
    const layout = homeLayout()
    expect(layout.computers.map((c) => c.label)).toEqual(['Living room', 'Kitchen', 'Bedroom', 'Study'])
    expect(layout.edges).toHaveLength(6)
  })

  it('places the router in the middle of the house', () => {
    const layout = homeLayout()
    expect(layout.router.x).toBe(240)
  })
})

describe('officeLayout', () => {
  it('has seven fully meshed computers', () => {
    const layout = officeLayout()
    expect(layout.computers).toHaveLength(7)
    expect(layout.edges).toHaveLength(21)
  })

  it('keeps all computers inside the diagram', () => {
    const layout = officeLayout()
    for (const c of layout.computers) {
      expect(c.x).toBeGreaterThan(0)
      expect(c.x).toBeLessThan(layout.width)
      expect(c.y).toBeGreaterThan(0)
      expect(c.y).toBeLessThan(layout.height)
    }
  })
})
