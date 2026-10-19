import * as THREE from 'three'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BUBBLE_SIZE, createHeroAssets, LAPTOP_WIDTH } from './heroModels'
import { HERO_BUBBLE_COLORS, HERO_BUBBLE_COLORS_MAX } from '../config/site'

describe('createHeroAssets', () => {
  it('builds a laptop with base, keyboard deck, hinged lid, screen and logo', () => {
    const assets = createHeroAssets()
    const laptop = assets.createLaptop()
    const meshes: THREE.Mesh[] = []
    laptop.traverse((o) => {
      if (o instanceof THREE.Mesh) meshes.push(o)
    })
    expect(meshes).toHaveLength(5)

    const box = new THREE.Box3().setFromObject(laptop)
    const size = box.getSize(new THREE.Vector3())
    expect(size.x).toBeCloseTo(LAPTOP_WIDTH, 1)
    expect(size.y).toBeGreaterThan(0.2)
    assets.dispose()
  })

  it('shares geometry and materials between laptops', () => {
    const assets = createHeroAssets()
    const a = assets.createLaptop()
    const b = assets.createLaptop()
    const firstMesh = (g: THREE.Group) => g.getObjectByProperty('isMesh', true) as THREE.Mesh
    expect(firstMesh(a).geometry).toBe(firstMesh(b).geometry)
    expect(firstMesh(a).material).toBe(firstMesh(b).material)
    assets.dispose()
  })

  it('creates one bubble variant per configured colour, wrapping the index', () => {
    const assets = createHeroAssets()
    const variants = assets.bubbleVariants
    expect(variants).toBe(HERO_BUBBLE_COLORS.length)
    const materials = Array.from({ length: variants }, (_, i) => assets.createBubble(i).material)
    expect(new Set(materials).size).toBe(variants)
    expect(assets.createBubble(variants).material).toBe(materials[0])
    expect(assets.createBubble(-1).material).toBe(materials[variants - 1])
    expect(assets.createBubble(0).scale.x).toBe(BUBBLE_SIZE)
    assets.dispose()
  })

  describe('configurable bubble colours', () => {
    /** Fill colours painted onto each 128px bubble texture, in creation order. */
    let bubbleFills: string[][]

    beforeEach(() => {
      bubbleFills = []
      vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (this: HTMLCanvasElement) {
        const fills: string[] = []
        if (this.width === 128) bubbleFills.push(fills)
        return new Proxy(
          {},
          {
            get: (_t, prop) =>
              prop === 'createLinearGradient' ? () => ({ addColorStop: () => undefined }) : () => undefined,
            set: (_t, prop, value) => {
              if (prop === 'fillStyle') fills.push(String(value))
              return true
            },
          },
        )
      } as unknown as typeof HTMLCanvasElement.prototype.getContext)
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it.each([1, 2, 3, 5, HERO_BUBBLE_COLORS_MAX])('supports %i colours', (count) => {
      const colors = ['#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6', '#ec4899', '#64748b'].slice(0, count)
      const assets = createHeroAssets(colors)
      expect(assets.bubbleVariants).toBe(count)
      expect(bubbleFills.map((f) => f[0])).toEqual(colors)
      expect(new Set(Array.from({ length: count }, (_, i) => assets.createBubble(i).material)).size).toBe(count)
      assets.dispose()
    })

    it('uses the configured colours by default', () => {
      createHeroAssets().dispose()
      expect(bubbleFills.map((f) => f[0])).toEqual([...HERO_BUBBLE_COLORS])
    })

    it('caps the colours at the maximum', () => {
      const assets = createHeroAssets(Array.from({ length: 10 }, (_, i) => `#00000${i}`))
      expect(assets.bubbleVariants).toBe(HERO_BUBBLE_COLORS_MAX)
      assets.dispose()
    })

    it('still produces a bubble when the list is empty', () => {
      const assets = createHeroAssets([])
      expect(assets.bubbleVariants).toBe(1)
      expect(assets.createBubble(5).material).toBe(assets.createBubble(0).material)
      assets.dispose()
    })
  })

  it('disposes every tracked resource', () => {
    const spy = vi.spyOn(THREE.BufferGeometry.prototype, 'dispose')
    const assets = createHeroAssets()
    assets.dispose()
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })

  it('still builds models when a 2d canvas context is unavailable', () => {
    const spy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
    const assets = createHeroAssets()
    expect(assets.createLaptop().children.length).toBeGreaterThan(0)
    assets.dispose()
    spy.mockRestore()
  })
})
