import { describe, expect, it } from 'vitest'
import type { Rollup } from 'vite'
import { isAppChunk, minifyHtml, minifyIndexHtml, obfuscateAppChunks } from './plugins.ts'

/**
 * Builds a minimal Rollup chunk for tests.
 *
 * @param code - Chunk source.
 * @param moduleIds - Ids of the modules the chunk contains.
 * @returns A chunk-shaped object (only the fields the plugin reads are meaningful).
 */
function makeChunk(code: string, moduleIds: string[]): Rollup.OutputChunk {
  return { type: 'chunk', code, moduleIds } as unknown as Rollup.OutputChunk
}

/** Source long enough with string literals so obfuscation visibly rewrites it. */
const SOURCE = 'function greet(userName){const greeting="Hello, ";return greeting+userName+"!"}globalThis.result=greet("NetLet");'

describe('isAppChunk', () => {
  it('accepts a chunk that contains application modules', () => {
    expect(isAppChunk(makeChunk('', ['/proj/src/App.tsx', '/proj/node_modules/react/index.js']))).toBe(true)
  })

  it('rejects a pure vendor chunk', () => {
    expect(isAppChunk(makeChunk('', ['/proj/node_modules/three/build/three.module.js']))).toBe(false)
  })

  it('rejects a chunk made only of virtual helper modules', () => {
    expect(isAppChunk(makeChunk('', ['\0vite/preload-helper.js']))).toBe(false)
  })

  it('rejects non-chunk assets', () => {
    expect(isAppChunk({ type: 'asset' } as unknown as Rollup.OutputAsset)).toBe(false)
  })
})

describe('obfuscateAppChunks', () => {
  /**
   * Runs the plugin's generateBundle hook against a fake bundle.
   *
   * @param bundle - Fake output bundle, mutated in place by the plugin.
   */
  function run(bundle: Rollup.OutputBundle): void {
    const plugin = obfuscateAppChunks()
    const hook = plugin.generateBundle as (this: unknown, options: unknown, b: Rollup.OutputBundle) => void
    hook.call({}, {}, bundle)
  }

  it('only applies to production builds, after other plugins', () => {
    const plugin = obfuscateAppChunks()
    expect(plugin.apply).toBe('build')
    expect(plugin.enforce).toBe('post')
  })

  it('obfuscates application chunks and leaves vendor chunks untouched', () => {
    const app = makeChunk(SOURCE, ['/proj/src/main.tsx'])
    const vendor = makeChunk(SOURCE, ['/proj/node_modules/react/index.js'])
    run({ 'app.js': app, 'vendor.js': vendor } as unknown as Rollup.OutputBundle)

    expect(app.code).not.toBe(SOURCE)
    expect(app.code).toContain('_0x')
    expect(app.code).not.toContain('greeting')
    expect(vendor.code).toBe(SOURCE)
  })

  it('produces code that behaves exactly like the original', () => {
    const app = makeChunk(SOURCE, ['/proj/src/main.tsx'])
    run({ 'app.js': app } as unknown as Rollup.OutputBundle)

    const scope: Record<string, unknown> = {}
    new Function('globalThis', app.code)(scope)
    expect(scope.result).toBe('Hello, NetLet!')
  })

  it('skips non-chunk assets without throwing', () => {
    const asset = { type: 'asset', source: 'body{}' } as unknown as Rollup.OutputAsset
    expect(() => run({ 'a.css': asset } as unknown as Rollup.OutputBundle)).not.toThrow()
  })
})

describe('HTML minification', () => {
  const html = '<!doctype html>\n<html>\n  <!-- note -->\n  <body>\n    <div   id="root">  </div>\n  </body>\n</html>\n'

  it('removes comments and collapses whitespace', async () => {
    const out = await minifyHtml(html)
    expect(out).not.toContain('<!--')
    expect(out).not.toContain('\n')
    expect(out).toContain('<div id="root"></div>')
  })

  it('exposes a build-only plugin whose post transform minifies', async () => {
    const plugin = minifyIndexHtml()
    expect(plugin.apply).toBe('build')
    const transform = plugin.transformIndexHtml as { order: string; handler: (h: string) => Promise<string> }
    expect(transform.order).toBe('post')
    expect(await transform.handler(html)).toBe(await minifyHtml(html))
  })
})
