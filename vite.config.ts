import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

/**
 * Vite + Vitest configuration.
 *
 * `base` must match the GitHub Pages project path (https://snytkine.github.io/netlet-site/).
 */
export default defineConfig({
  base: '/netlet-site/',
  build: { chunkSizeWarningLimit: 700 }, // three.js is lazy loaded and inherently large
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/main.tsx', 'src/test/**', 'src/**/*.test.{ts,tsx}', 'src/vite-env.d.ts'],
      reporter: ['text', 'html'],
    },
  },
})
