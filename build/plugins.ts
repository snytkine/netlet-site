import JavaScriptObfuscator from 'javascript-obfuscator'
import type { ObfuscatorOptions } from 'javascript-obfuscator'
import { minify as minifyHtmlString } from 'html-minifier-terser'
import type { Plugin, Rollup } from 'vite'

/**
 * Obfuscator settings for application code.
 *
 * Deliberately light: identifier renaming plus an encoded string table. The heavy transforms
 * (control-flow flattening, dead-code injection, self-defending, debug protection) are left off
 * because they slow the page down, grow the bundle several times over and can misbehave in some
 * mobile browsers. Property renaming is off because it breaks code that touches DOM/three.js APIs.
 * The fixed seed keeps builds reproducible, so an unchanged chunk keeps an unchanged output.
 */
export const OBFUSCATOR_OPTIONS: ObfuscatorOptions = {
  compact: true,
  simplify: true,
  target: 'browser',
  seed: 1,
  sourceMap: false,
  identifierNamesGenerator: 'hexadecimal',
  renameGlobals: false,
  renameProperties: false,
  stringArray: true,
  stringArrayEncoding: ['base64'],
  stringArrayThreshold: 0.75,
  stringArrayRotate: true,
  stringArrayShuffle: true,
  controlFlowFlattening: false,
  deadCodeInjection: false,
  selfDefending: false,
  debugProtection: false,
  disableConsoleOutput: false,
  transformObjectKeys: false,
}

/**
 * Settings for html-minifier-terser. Scripts and styles are skipped because Vite has already
 * minified the bundled JS/CSS referenced from the page.
 */
export const HTML_MINIFY_OPTIONS = {
  collapseWhitespace: true,
  removeComments: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  minifyJS: false,
  minifyCSS: false,
}

/**
 * Tells whether a module id is third-party code (anything resolved from `node_modules`).
 *
 * @param id - Rollup module id, which may be a virtual id starting with a NUL character.
 * @returns `true` for vendor modules.
 */
function isVendorModule(id: string): boolean {
  return id.includes('node_modules')
}

/**
 * Decides whether an output file is an application chunk that should be obfuscated.
 *
 * A chunk qualifies when it contains at least one module of our own (neither vendor code nor a
 * virtual helper module such as Vite's preload helper). Pure vendor chunks (react, three.js) are
 * skipped: that code is public anyway and obfuscating it would bloat it and slow rendering.
 *
 * @param file - Entry from the Rollup output bundle.
 * @returns `true` when the file is a JS chunk containing application source.
 */
export function isAppChunk(file: Rollup.OutputChunk | Rollup.OutputAsset): file is Rollup.OutputChunk {
  if (file.type !== 'chunk') return false
  return file.moduleIds.some((id) => !isVendorModule(id) && !id.startsWith('\0'))
}

/**
 * Vite plugin that obfuscates application chunks of the production bundle.
 *
 * It runs in `generateBundle`, i.e. after Vite's minifier, so the obfuscator receives final code.
 * It only applies to `vite build`; the dev server and the test runner are untouched.
 *
 * @param options - Obfuscator settings, defaults to {@link OBFUSCATOR_OPTIONS}.
 * @returns The Vite plugin.
 */
export function obfuscateAppChunks(options: ObfuscatorOptions = OBFUSCATOR_OPTIONS): Plugin {
  return {
    name: 'netlet:obfuscate-app-chunks',
    apply: 'build',
    enforce: 'post',
    generateBundle(_outputOptions, bundle) {
      for (const file of Object.values(bundle)) {
        if (!isAppChunk(file)) continue
        file.code = JavaScriptObfuscator.obfuscate(file.code, options).getObfuscatedCode()
      }
    },
  }
}

/**
 * Minifies an HTML document.
 *
 * @param html - The HTML source.
 * @returns The minified HTML.
 */
export function minifyHtml(html: string): Promise<string> {
  return minifyHtmlString(html, HTML_MINIFY_OPTIONS)
}

/**
 * Vite plugin that minifies the generated `index.html` (whitespace, comments, redundant
 * attributes). Runs last so it sees the final asset tags Vite injected.
 *
 * @returns The Vite plugin.
 */
export function minifyIndexHtml(): Plugin {
  return {
    name: 'netlet:minify-html',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler: minifyHtml,
    },
  }
}
