import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useReleaseNotes } from './useReleaseNotes'

describe('useReleaseNotes', () => {
  it('is loading first, then reports the releases', async () => {
    const body = [{ tag_name: 'v0.3.0', body: 'notes' }]
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(body) }))
    const { result } = renderHook(() => useReleaseNotes())
    expect(result.current).toEqual({ loading: true, releases: null })
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.releases?.[0].version).toBe('0.3.0')
  })

  it('reports no releases when the lookup fails', async () => {
    const { result } = renderHook(() => useReleaseNotes())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.releases).toBeNull()
  })

  it('ignores an answer that arrives after the component is gone', async () => {
    const { result, unmount } = renderHook(() => useReleaseNotes())
    unmount()
    await Promise.resolve()
    expect(result.current.loading).toBe(true)
  })
})
