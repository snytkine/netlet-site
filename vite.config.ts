import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { minifyIndexHtml, obfuscateAppChunks } from './build/plugins.ts'

/**
 * Vite + Vitest configuration.
 *
 * Production builds are minified (JS/CSS by Vite, HTML by `minifyIndexHtml`) and our own code is
 * obfuscated (`obfuscateAppChunks`). Source maps stay off so nothing un-does the obfuscation, and
 * `console.*` calls are stripped. Vendor code lives in separate chunks (`vendor`, `three`) so the
 * obfuscator can leave it alone.
 *
 * `base` must match the GitHub Pages project path (https://snytkine.github.io/netlet-site/).
 */
export default defineConfig({
  base: '/netlet-site/',
  build: {
    chunkSizeWarningLimit: 700, // three.js is lazy loaded and inherently large
    sourcemap: false,
    rolldownOptions: {
      output: {
        minify: { compress: { dropConsole: true }, mangle: true },
        codeSplitting: {
          groups: [
            { name: 'three', test: /node_modules[\\/]three[\\/]/, priority: 20 },
            { name: 'vendor', test: /node_modules/, priority: 10 },
          ],
        },
      },
    },
  },
  plugins: [react(), minifyIndexHtml(), obfuscateAppChunks()],
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}', 'build/**/*.ts'],
      exclude: ['src/main.tsx', 'src/test/**', 'src/**/*.test.{ts,tsx}', 'build/**/*.test.ts', 'src/vite-env.d.ts'],
      reporter: ['text', 'html'],
    },
  },
})
