import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  render: vi.fn(),
  dispose: vi.fn(),
  setSize: vi.fn(),
  disposeAssets: vi.fn(),
}))

vi.mock('../lib/meshScene', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/meshScene')>()),
  supportsWebGL: () => true,
}))

vi.mock('./heroModels', () => {
  const object = () => ({
    position: { set: vi.fn() },
    rotation: { y: 0 },
    scale: { setScalar: vi.fn() },
  })
  return {
    BUBBLE_SIZE: 0.46,
    BUBBLE_VARIANTS: 3,
    createHeroAssets: () => ({
      createLaptop: object,
      createBubble: object,
      dispose: mocks.disposeAssets,
    }),
  }
})

vi.mock('three', () => {
  class Obj {
    position = { set: vi.fn(), x: 0 }
    rotation = { set: vi.fn(), x: 0, y: 0 }
    children: unknown[] = []
    add(child: unknown) {
      this.children.push(child)
    }
  }
  class Disposable {
    dispose = vi.fn()
  }
  return {
    Scene: Obj,
    Group: Obj,
    Mesh: Obj,
    LineSegments: Obj,
    AmbientLight: Obj,
    DirectionalLight: Obj,
    PerspectiveCamera: class extends Obj {
      aspect = 1
      updateProjectionMatrix = vi.fn()
    },
    Vector3: class {},
    SphereGeometry: Disposable,
    MeshStandardMaterial: Disposable,
    MeshBasicMaterial: Disposable,
    LineBasicMaterial: Disposable,
    BufferGeometry: class extends Disposable {
      setFromPoints() {
        return this
      }
    },
    WebGLRenderer: class {
      domElement = document.createElement('canvas')
      setPixelRatio = vi.fn()
      setSize = mocks.setSize
      render = mocks.render
      dispose = mocks.dispose
    },
  }
})

import HeroScene from './HeroScene'

describe('HeroScene with WebGL', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('mounts a renderer canvas, animates and cleans up', () => {
    const callbacks: FrameRequestCallback[] = []
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      callbacks.push(cb)
      return callbacks.length
    })
    const cancel = vi.spyOn(window, 'cancelAnimationFrame')

    const { container, unmount } = render(<HeroScene />)
    const host = container.querySelector('.hero-scene') as HTMLElement
    expect(host.querySelector('canvas')).toBeInTheDocument()
    expect(container.querySelector('.hero-scene__fallback')).not.toBeInTheDocument()
    expect(mocks.render).toHaveBeenCalledTimes(1)

    host.dispatchEvent(new Event('pointermove'))
    callbacks[0](performance.now() + 16)
    expect(mocks.render).toHaveBeenCalledTimes(2)

    unmount()
    expect(cancel).toHaveBeenCalled()
    expect(mocks.dispose).toHaveBeenCalled()
    expect(mocks.disposeAssets).toHaveBeenCalled()
  })

  it('renders only a single frame when reduced motion is preferred', () => {
    const raf = vi.spyOn(window, 'requestAnimationFrame')
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: true,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    } as unknown as MediaQueryList)
    render(<HeroScene />)
    expect(raf).not.toHaveBeenCalled()
    expect(mocks.render).toHaveBeenCalledTimes(1)
  })
})
