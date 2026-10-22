import { describe, expect, it, vi } from 'vitest'
import { buildSceneLayout, fibonacciSphere, lerpVec3, supportsWebGL } from './meshScene'

describe('fibonacciSphere', () => {
  it('returns points on the sphere surface', () => {
    for (const p of fibonacciSphere(12, 3)) {
      expect(Math.hypot(p.x, p.y, p.z)).toBeCloseTo(3)
    }
  })

  it('handles degenerate counts', () => {
    expect(fibonacciSphere(0, 1)).toEqual([])
    expect(fibonacciSphere(1, 2)).toEqual([{ x: 0, y: 2, z: 0 }])
  })
})

describe('buildSceneLayout', () => {
  it('links all nodes in a full mesh', () => {
    const layout = buildSceneLayout(6, 2)
    expect(layout.nodes).toHaveLength(6)
    expect(layout.edges).toHaveLength(15)
  })
})

describe('lerpVec3', () => {
  it('interpolates in 3D', () => {
    expect(lerpVec3({ x: 0, y: 0, z: 0 }, { x: 2, y: 4, z: 6 }, 0.5)).toEqual({ x: 1, y: 2, z: 3 })
  })
})

describe('supportsWebGL', () => {
  it('is false when no context can be created', () => {
    expect(supportsWebGL()).toBe(false)
  })

  it('is true when webgl2 is available', () => {
    const doc = { createElement: () => ({ getContext: (t: string) => (t === 'webgl2' ? {} : null) }) }
    expect(supportsWebGL(doc as unknown as Document)).toBe(true)
  })

  it('falls back to webgl', () => {
    const doc = { createElement: () => ({ getContext: (t: string) => (t === 'webgl' ? {} : null) }) }
    expect(supportsWebGL(doc as unknown as Document)).toBe(true)
  })

  it('is false when probing throws', () => {
    const doc = { createElement: vi.fn(() => { throw new Error('boom') }) }
    expect(supportsWebGL(doc as unknown as Document)).toBe(false)
  })
})
