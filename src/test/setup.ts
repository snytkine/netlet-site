import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(() => {
  cleanup()
})

/** Minimal 2D context stub so canvas-based components can run under jsdom. */
export const createContextStub = () =>
  new Proxy(
    {},
    {
      get: (target: Record<string, unknown>, prop: string) => {
        if (prop in target) return target[prop]
        if (prop === 'createLinearGradient' || prop === 'createRadialGradient') {
          return () => ({ addColorStop: () => undefined })
        }
        return () => undefined
      },
      set: (target: Record<string, unknown>, prop: string, value: unknown) => {
        target[prop] = value
        return true
      },
    },
  )

HTMLCanvasElement.prototype.getContext = vi.fn(function (type: string) {
  return type === '2d' ? createContextStub() : null
}) as unknown as typeof HTMLCanvasElement.prototype.getContext

window.scrollTo = vi.fn() as unknown as typeof window.scrollTo

if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
}
