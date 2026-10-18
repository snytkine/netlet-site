import * as THREE from 'three'
import { describe, expect, it, vi } from 'vitest'
import { BUBBLE_SIZE, BUBBLE_VARIANTS, createHeroAssets, LAPTOP_WIDTH } from './heroModels'

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

  it('creates bubble sprites in several colour variants, wrapping the index', () => {
    const assets = createHeroAssets()
    const materials = Array.from({ length: BUBBLE_VARIANTS }, (_, i) => assets.createBubble(i).material)
    expect(new Set(materials).size).toBe(BUBBLE_VARIANTS)
    expect(assets.createBubble(BUBBLE_VARIANTS).material).toBe(materials[0])
    expect(assets.createBubble(-1).material).toBe(materials[BUBBLE_VARIANTS - 1])
    expect(assets.createBubble(0).scale.x).toBe(BUBBLE_SIZE)
    assets.dispose()
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
