import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

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

/** Restores a `matchMedia` that reports no preference (tests may override it to prefer reduced motion). */
function resetMatchMedia() {
  vi.mocked(window.matchMedia).mockImplementation(
    (query: string) =>
      ({
        matches: false,
        media: query,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      }) as unknown as MediaQueryList,
  )
}

describe('HeroScene with WebGL', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetMatchMedia()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
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

/**
 * Replaces the animation clock and frame scheduler with deterministic fakes.
 *
 * @returns helpers to step one animation frame and to ask whether another frame is queued.
 */
function fakeFrames() {
  let clock = 1000
  let pending: FrameRequestCallback | null = null
  vi.spyOn(performance, 'now').mockImplementation(() => clock)
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
    pending = cb
    return 1
  })
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {
    pending = null
  })
  return {
    isScheduled: () => pending !== null,
    /** Runs the queued frame as if `ms` milliseconds had passed (the scene caps a step at 100 ms). */
    step: (ms = 100) =>
      act(() => {
        const cb = pending
        pending = null
        clock += ms
        cb?.(clock)
      }),
  }
}

describe('HeroScene playback control', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetMatchMedia()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('stops by itself once the configured duration has played', () => {
    const frames = fakeFrames()
    render(<HeroScene durationSeconds={0.25} />)
    const button = screen.getByRole('button')
    expect(button).toHaveAccessibleName(/3D animation.*Click to pause/)

    frames.step()
    frames.step()
    expect(frames.isScheduled()).toBe(true)

    frames.step()
    expect(frames.isScheduled()).toBe(false)
    expect(button).toHaveAccessibleName(/Click to play/)
    expect(button).toHaveAttribute('data-playing', 'false')
    expect(button.querySelector('.hero-scene__play')).toBeInTheDocument()
  })

  it('stops on click and restarts on the next click', () => {
    const frames = fakeFrames()
    render(<HeroScene durationSeconds={5} />)
    const button = screen.getByRole('button')

    fireEvent.click(button)
    expect(frames.isScheduled()).toBe(false)
    expect(button).toHaveAccessibleName(/Click to play/)

    fireEvent.click(button)
    expect(frames.isScheduled()).toBe(true)
    expect(button).toHaveAccessibleName(/Click to pause/)
    expect(button).toHaveAttribute('data-playing', 'true')
    expect(button.querySelector('.hero-scene__play')).not.toBeInTheDocument()
  })

  it('gives every restart a full duration', () => {
    const frames = fakeFrames()
    render(<HeroScene durationSeconds={0.15} />)
    frames.step()
    frames.step()
    expect(frames.isScheduled()).toBe(false)

    fireEvent.click(screen.getByRole('button'))
    frames.step()
    expect(frames.isScheduled()).toBe(true)
    frames.step()
    expect(frames.isScheduled()).toBe(false)
  })

  it('toggles with Enter and Space and ignores other keys', () => {
    const frames = fakeFrames()
    render(<HeroScene durationSeconds={5} />)
    const button = screen.getByRole('button')

    fireEvent.keyDown(button, { key: 'Tab' })
    expect(frames.isScheduled()).toBe(true)
    fireEvent.keyDown(button, { key: 'Enter' })
    expect(frames.isScheduled()).toBe(false)
    fireEvent.keyDown(button, { key: ' ' })
    expect(frames.isScheduled()).toBe(true)
  })

  it('never stops by itself when the duration is 0', () => {
    const frames = fakeFrames()
    render(<HeroScene durationSeconds={0} />)
    for (let i = 0; i < 60; i++) frames.step()
    expect(frames.isScheduled()).toBe(true)
  })

  it('does not count time while the animation is off screen', () => {
    const frames = fakeFrames()
    let onIntersect: IntersectionObserverCallback = () => undefined
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(cb: IntersectionObserverCallback) {
          onIntersect = cb
        }
        observe() {}
        disconnect() {}
      },
    )
    render(<HeroScene durationSeconds={0.25} />)
    act(() => onIntersect([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver))
    for (let i = 0; i < 10; i++) frames.step()
    expect(frames.isScheduled()).toBe(true)

    act(() => onIntersect([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver))
    frames.step()
    frames.step()
    frames.step()
    expect(frames.isScheduled()).toBe(false)
  })

  it('redraws on resize only while stopped, because resizing clears the canvas', () => {
    fakeFrames()
    let onResize: () => void = () => undefined
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(cb: () => void) {
          onResize = cb
        }
        observe() {}
        disconnect() {}
      },
    )
    render(<HeroScene durationSeconds={5} />)
    const initial = mocks.render.mock.calls.length

    act(() => onResize())
    expect(mocks.render).toHaveBeenCalledTimes(initial)

    fireEvent.click(screen.getByRole('button'))
    act(() => onResize())
    expect(mocks.render).toHaveBeenCalledTimes(initial + 1)
  })

  it('is not clickable when the user prefers reduced motion', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: true,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    } as unknown as MediaQueryList)
    render(<HeroScene />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.getByRole('img')).toHaveAccessibleName(/3D animation/)
  })
})
