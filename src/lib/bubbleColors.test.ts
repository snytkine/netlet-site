import { afterEach, describe, expect, it, vi } from 'vitest'
import { FALLBACK_BUBBLE_COLOR, resolveBubbleColors } from './bubbleColors'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('resolveBubbleColors', () => {
  it('keeps colours and their order', () => {
    expect(resolveBubbleColors(['#f97316', 'teal'])).toEqual(['#f97316', 'teal'])
  })

  it('accepts a single colour and seven colours', () => {
    expect(resolveBubbleColors(['red'])).toEqual(['red'])
    const seven = ['#111', '#222', '#333', '#444', '#555', '#666', '#777']
    expect(resolveBubbleColors(seven)).toEqual(seven)
  })

  it('ignores colours beyond the maximum', () => {
    const nine = ['#111', '#222', '#333', '#444', '#555', '#666', '#777', '#888', '#999']
    expect(resolveBubbleColors(nine)).toEqual(nine.slice(0, 7))
    expect(resolveBubbleColors(nine, 2)).toEqual(['#111', '#222'])
  })

  it('trims entries and drops empty or non-string values', () => {
    const messy = ['  #3b82f6 ', '', '   ', 42 as unknown as string]
    expect(resolveBubbleColors(messy)).toEqual(['#3b82f6'])
  })

  it('drops values the browser does not recognise as colours', () => {
    vi.stubGlobal('CSS', { supports: (_property: string, value: string) => value !== 'not-a-colour' })
    expect(resolveBubbleColors(['#f97316', 'not-a-colour', 'blue'])).toEqual(['#f97316', 'blue'])
  })

  it('accepts any non-empty value when CSS.supports is unavailable', () => {
    vi.stubGlobal('CSS', {})
    expect(resolveBubbleColors(['whatever'])).toEqual(['whatever'])
  })

  it('falls back to the brand blue when nothing usable is left', () => {
    expect(resolveBubbleColors([])).toEqual([FALLBACK_BUBBLE_COLOR])
    expect(resolveBubbleColors(['', '  '])).toEqual([FALLBACK_BUBBLE_COLOR])
  })
})
