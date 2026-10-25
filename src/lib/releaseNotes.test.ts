import { describe, expect, it, vi } from 'vitest'
import { ALL_RELEASES_URL, RELEASES_LIST_API_URL } from '../config/site'
import {
  fetchReleaseNotes,
  formatReleaseDate,
  loadReleaseNotes,
  parseReleaseNotes,
  resetReleaseNotesCache,
} from './releaseNotes'

/** A release as the GitHub API would send it. */
function release(overrides: Record<string, unknown> = {}) {
  return {
    tag_name: 'v0.2.0',
    draft: false,
    prerelease: false,
    published_at: '2026-10-25T15:30:00Z',
    html_url: `${ALL_RELEASES_URL}/tag/v0.2.0`,
    body: '### Features\r\n\r\n* one',
    ...overrides,
  }
}

describe('parseReleaseNotes', () => {
  it('keeps the version, date, link and body, with Unix line endings', () => {
    expect(parseReleaseNotes([release()])).toEqual([
      {
        version: '0.2.0',
        publishedAt: '2026-10-25T15:30:00Z',
        url: `${ALL_RELEASES_URL}/tag/v0.2.0`,
        body: '### Features\n\n* one',
      },
    ])
  })

  it('keeps the order GitHub sent (newest first)', () => {
    const list = parseReleaseNotes([release({ tag_name: 'v0.3.0' }), release()])
    expect(list?.map((r) => r.version)).toEqual(['0.3.0', '0.2.0'])
  })

  it('skips drafts, pre-releases, entries without a clean version and non-objects', () => {
    const list = parseReleaseNotes([
      release({ draft: true }),
      release({ prerelease: true }),
      release({ tag_name: 'nightly' }),
      release({ tag_name: 5 }),
      null,
      'text',
      release({ tag_name: 'v0.1.0' }),
    ])
    expect(list?.map((r) => r.version)).toEqual(['0.1.0'])
  })

  it('uses the releases page when the link points elsewhere or is missing', () => {
    const list = parseReleaseNotes([
      release({ html_url: 'https://example.com/evil' }),
      release({ html_url: undefined, tag_name: 'v0.1.0' }),
    ])
    expect(list?.map((r) => r.url)).toEqual([ALL_RELEASES_URL, ALL_RELEASES_URL])
  })

  it('has no date for a missing or invalid one, and an empty body when there is none', () => {
    const list = parseReleaseNotes([release({ published_at: 'not a date', body: null }), release({ published_at: undefined })])
    expect(list?.map((r) => r.publishedAt)).toEqual([null, null])
    expect(list?.[0].body).toBe('')
  })

  it('cuts an enormous body', () => {
    const list = parseReleaseNotes([release({ body: 'x'.repeat(50000) })])
    expect(list?.[0].body).toHaveLength(20000)
  })

  it('returns an empty list for an empty array and null for anything that is not a list', () => {
    expect(parseReleaseNotes([])).toEqual([])
    expect(parseReleaseNotes({})).toBeNull()
    expect(parseReleaseNotes(null)).toBeNull()
  })
})

describe('fetchReleaseNotes', () => {
  it('asks the GitHub API without credentials or referrer and parses the answer', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve([release()]) })
    const list = await fetchReleaseNotes(fetchMock as unknown as typeof fetch)
    expect(list?.[0].version).toBe('0.2.0')
    expect(fetchMock).toHaveBeenCalledWith(
      RELEASES_LIST_API_URL,
      expect.objectContaining({ credentials: 'omit', referrerPolicy: 'no-referrer' }),
    )
  })

  it('returns null on an error status, a failed request or a body that is not JSON', async () => {
    const bad = vi.fn().mockResolvedValue({ ok: false, json: () => Promise.resolve([]) })
    expect(await fetchReleaseNotes(bad as unknown as typeof fetch)).toBeNull()
    expect(await fetchReleaseNotes(vi.fn().mockRejectedValue(new Error('offline')) as unknown as typeof fetch)).toBeNull()
    const notJson = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.reject(new SyntaxError('bad')) })
    expect(await fetchReleaseNotes(notJson as unknown as typeof fetch)).toBeNull()
  })
})

describe('loadReleaseNotes', () => {
  it('asks GitHub once and shares the answer until the cache is reset', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve([release()]) })
    vi.stubGlobal('fetch', fetchMock)
    const [first, second] = await Promise.all([loadReleaseNotes(), loadReleaseNotes()])
    expect(first).toBe(second)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    resetReleaseNotesCache()
    await loadReleaseNotes()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})

describe('formatReleaseDate', () => {
  it('formats the date in UTC', () => {
    expect(formatReleaseDate('2026-10-25T23:59:00Z')).toBe('October 25, 2026')
  })
})
