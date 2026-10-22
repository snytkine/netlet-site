import { render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import MeshLogo from './MeshLogo'

describe('MeshLogo', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders an accessible canvas of the requested size', () => {
    const { getByRole } = render(<MeshLogo size={60} />)
    const canvas = getByRole('img') as HTMLCanvasElement
    expect(canvas.tagName).toBe('CANVAS')
    expect(canvas).toHaveAccessibleName(/mesh/i)
    expect(canvas.style.width).toBe('60px')
  })

  it('animates with requestAnimationFrame and cancels on unmount', () => {
    const raf = vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(7)
    const cancel = vi.spyOn(window, 'cancelAnimationFrame')
    const { unmount } = render(<MeshLogo />)
    expect(raf).toHaveBeenCalled()
    unmount()
    expect(cancel).toHaveBeenCalledWith(7)
  })

  it('runs animation frames', () => {
    let tick: FrameRequestCallback = () => undefined
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      tick = cb
      return 1
    })
    render(<MeshLogo />)
    expect(() => tick(performance.now() + 16)).not.toThrow()
  })

  it('draws a single static frame when reduced motion is preferred', () => {
    const raf = vi.spyOn(window, 'requestAnimationFrame')
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: true,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    } as unknown as MediaQueryList)
    render(<MeshLogo />)
    expect(raf).not.toHaveBeenCalled()
  })

  it('does nothing when a 2d context is unavailable', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
    const raf = vi.spyOn(window, 'requestAnimationFrame')
    render(<MeshLogo />)
    expect(raf).not.toHaveBeenCalled()
  })
})
