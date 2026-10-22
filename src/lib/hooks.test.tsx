import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useDocumentTitle } from './useDocumentTitle'
import { useReducedMotion } from './useReducedMotion'

describe('useDocumentTitle', () => {
  it('sets a page title with the site name', () => {
    renderHook(() => useDocumentTitle('Features'))
    expect(document.title).toBe('Features · NetLet chat')
  })

  it('uses the default title without an argument', () => {
    renderHook(() => useDocumentTitle())
    expect(document.title).toContain('local network messaging')
  })
})

describe('useReducedMotion', () => {
  const original = window.matchMedia
  afterEach(() => {
    window.matchMedia = original
  })

  /** Installs a controllable matchMedia mock. */
  function mockMedia(matches: boolean) {
    let listener: ((e: MediaQueryListEvent) => void) | undefined
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches,
      addEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => {
        listener = cb
      },
      removeEventListener: vi.fn(),
    })) as unknown as typeof window.matchMedia
    return (value: boolean) => listener?.({ matches: value } as MediaQueryListEvent)
  }

  it('reflects the initial preference', () => {
    mockMedia(true)
    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(true)
  })

  it('updates when the preference changes', () => {
    const emit = mockMedia(false)
    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(false)
    act(() => emit(true))
    expect(result.current).toBe(true)
  })

  it('defaults to false when matchMedia is unavailable', () => {
    // @ts-expect-error simulate an old browser
    window.matchMedia = undefined
    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(false)
  })
})
