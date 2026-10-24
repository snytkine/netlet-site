import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { RELEASES_DOWNLOAD_PREFIX } from '../config/site'
import { useLatestRelease } from './useLatestRelease'

describe('useLatestRelease', () => {
  it('is loading first, then reports the release', async () => {
    const body = { tag_name: 'v0.3.0', assets: [] }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(body) }))
    const { result } = renderHook(() => useLatestRelease())
    expect(result.current).toEqual({ loading: true, release: null })
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.release?.version).toBe('0.3.0')
    expect(RELEASES_DOWNLOAD_PREFIX).toContain('/releases/download/')
  })

  it('reports no release when the lookup fails', async () => {
    const { result } = renderHook(() => useLatestRelease())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.release).toBeNull()
  })

  it('ignores an answer that arrives after the component is gone', async () => {
    const { result, unmount } = renderHook(() => useLatestRelease())
    unmount()
    await Promise.resolve()
    expect(result.current.loading).toBe(true)
  })
})
