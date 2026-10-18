import { describe, expect, it } from 'vitest'
import { DOWNLOADS, detectPlatform } from './site'

describe('detectPlatform', () => {
  it('detects macOS', () => {
    expect(detectPlatform('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605')).toBe('mac')
  })
  it('detects Windows', () => {
    expect(detectPlatform('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120')).toBe('windows')
  })
  it('returns null for mobile and unknown systems', () => {
    expect(detectPlatform('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)')).toBeNull()
    expect(detectPlatform('Mozilla/5.0 (Linux; Android 14)')).toBeNull()
    expect(detectPlatform('Mozilla/5.0 (X11; Linux x86_64)')).toBeNull()
  })
})

describe('DOWNLOADS', () => {
  it('offers Mac and Windows builds', () => {
    expect(DOWNLOADS.map((d) => d.platform)).toEqual(['mac', 'windows'])
  })
})
