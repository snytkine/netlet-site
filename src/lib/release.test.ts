import { describe, expect, it, vi } from 'vitest'
import { RELEASES_API_URL, RELEASES_DOWNLOAD_PREFIX } from '../config/site'
import {
  fetchLatestRelease,
  formatSize,
  loadLatestRelease,
  parseLatestRelease,
  resetLatestReleaseCache,
} from './release'

/** Builds an API asset entry under this site's release downloads. */
function asset(name: string, size = 1024) {
  return { name, size, browser_download_url: `${RELEASES_DOWNLOAD_PREFIX}v0.2.0/${name}` }
}

/** A complete release as the GitHub API would send it. */
const FULL = {
  tag_name: 'v0.2.0',
  assets: [
    asset('netlet_0.2.0_universal.dmg', 20 * 1024 * 1024),
    asset('netlet_0.2.0_universal.dmg.sha256'),
    asset('netlet_0.2.0_x64-setup.exe', 5 * 1024 * 1024),
    asset('netlet_0.2.0_x64-setup.exe.sha256'),
  ],
}

describe('parseLatestRelease', () => {
  it('finds the Mac and Windows installers with their checksums', () => {
    const release = parseLatestRelease(FULL)
    expect(release?.version).toBe('0.2.0')
    expect(release?.assets.mac).toMatchObject({
      name: 'netlet_0.2.0_universal.dmg',
      url: `${RELEASES_DOWNLOAD_PREFIX}v0.2.0/netlet_0.2.0_universal.dmg`,
      checksumUrl: `${RELEASES_DOWNLOAD_PREFIX}v0.2.0/netlet_0.2.0_universal.dmg.sha256`,
    })
    expect(release?.assets.windows?.name).toBe('netlet_0.2.0_x64-setup.exe')
  })

  it('accepts a tag without the leading v and a pre-release suffix', () => {
    expect(parseLatestRelease({ tag_name: '1.0.0-rc.1', assets: [] })?.version).toBe('1.0.0-rc.1')
  })

  it('prefers the universal disk image over single-architecture ones', () => {
    const release = parseLatestRelease({
      tag_name: 'v0.2.0',
      assets: [asset('netlet_0.2.0_aarch64.dmg'), asset('netlet_0.2.0_universal.dmg')],
    })
    expect(release?.assets.mac?.name).toBe('netlet_0.2.0_universal.dmg')
  })

  it('falls back to the first disk image when there is no universal one', () => {
    const release = parseLatestRelease({
      tag_name: 'v0.2.0',
      assets: [asset('netlet_0.2.0_aarch64.dmg'), asset('netlet_0.2.0_x64.dmg')],
    })
    expect(release?.assets.mac?.name).toBe('netlet_0.2.0_aarch64.dmg')
  })

  it('leaves out a platform with no installer and gives no checksum link when there is none', () => {
    const release = parseLatestRelease({ tag_name: 'v0.2.0', assets: [asset('netlet_0.2.0_universal.dmg')] })
    expect(release?.assets.windows).toBeUndefined()
    expect(release?.assets.mac?.checksumUrl).toBeNull()
  })

  it('returns a release without assets when the assets field is missing', () => {
    expect(parseLatestRelease({ tag_name: 'v0.2.0' })).toEqual({ version: '0.2.0', assets: {} })
  })

  it('ignores assets with missing fields, wrong types or links to other places', () => {
    const release = parseLatestRelease({
      tag_name: 'v0.2.0',
      assets: [
        null,
        'text',
        { name: 'a.dmg' },
        { name: 'b.dmg', size: 'big', browser_download_url: `${RELEASES_DOWNLOAD_PREFIX}v0.2.0/b.dmg` },
        { name: 'evil.dmg', size: 1, browser_download_url: 'https://example.com/evil.dmg' },
        { name: 'sneaky-setup.exe', size: 1, browser_download_url: 'https://github.com/other/repo/releases/download/x/sneaky-setup.exe' },
      ],
    })
    expect(release?.assets).toEqual({})
  })

  it('rejects data that is not a release with a clean x.y.z version', () => {
    expect(parseLatestRelease(null)).toBeNull()
    expect(parseLatestRelease([])).toBeNull()
    expect(parseLatestRelease('v0.2.0')).toBeNull()
    expect(parseLatestRelease({ assets: [] })).toBeNull()
    expect(parseLatestRelease({ tag_name: 2 })).toBeNull()
    expect(parseLatestRelease({ tag_name: 'latest' })).toBeNull()
    expect(parseLatestRelease({ tag_name: 'v1.2.3<script>' })).toBeNull()
  })
})

describe('fetchLatestRelease', () => {
  it('asks the GitHub API without credentials or referrer and parses the answer', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(FULL) })
    const release = await fetchLatestRelease(fetchMock as unknown as typeof fetch)
    expect(release?.version).toBe('0.2.0')
    expect(fetchMock).toHaveBeenCalledWith(
      RELEASES_API_URL,
      expect.objectContaining({ credentials: 'omit', referrerPolicy: 'no-referrer' }),
    )
  })

  it('returns null when GitHub answers with an error status', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, json: () => Promise.resolve({}) })
    expect(await fetchLatestRelease(fetchMock as unknown as typeof fetch)).toBeNull()
  })

  it('returns null when the request fails or the body is not JSON', async () => {
    expect(await fetchLatestRelease(vi.fn().mockRejectedValue(new Error('offline')) as unknown as typeof fetch)).toBeNull()
    const badBody = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.reject(new SyntaxError('bad')) })
    expect(await fetchLatestRelease(badBody as unknown as typeof fetch)).toBeNull()
  })
})

describe('loadLatestRelease', () => {
  it('asks GitHub once and shares the answer until the cache is reset', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(FULL) })
    vi.stubGlobal('fetch', fetchMock)
    const [first, second] = await Promise.all([loadLatestRelease(), loadLatestRelease()])
    expect(first).toBe(second)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    resetLatestReleaseCache()
    await loadLatestRelease()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})

describe('formatSize', () => {
  it('formats kilobytes and megabytes', () => {
    expect(formatSize(0)).toBe('1 KB')
    expect(formatSize(850 * 1024)).toBe('850 KB')
    expect(formatSize(12.44 * 1024 * 1024)).toBe('12.4 MB')
  })
})
