import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { HERO_BUBBLE_COLORS } from '../config/site'
import { resolveBubbleColors } from '../lib/bubbleColors'

/** Width of a laptop model in scene units (the model is centred on the origin). */
export const LAPTOP_WIDTH = 0.62

/** Base sprite size of a chat bubble in scene units. */
export const BUBBLE_SIZE = 0.46

/** Shared, disposable resources for the hero scene's laptop and bubble models. */
export interface HeroAssets {
  /** Builds a new laptop that shares geometry and materials; its front (+z) faces the viewer. */
  createLaptop: () => THREE.Group
  /** Number of distinct bubble colours (one variant per configured colour). */
  bubbleVariants: number
  /** Builds a chat bubble sprite; `variant` picks a colour and wraps around `bubbleVariants`. */
  createBubble: (variant: number) => THREE.Sprite
  /** Releases every geometry, material and texture created by these assets. */
  dispose: () => void
}

/**
 * Draws a rounded rectangle path on a 2D canvas context.
 *
 * @param ctx - canvas context
 * @param x - left
 * @param y - top
 * @param w - width
 * @param h - height
 * @param r - corner radius
 */
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/**
 * Creates a canvas-backed texture.
 *
 * @param width - canvas width in pixels
 * @param height - canvas height in pixels
 * @param paint - callback that draws onto the canvas
 */
function canvasTexture(
  width: number,
  height: number,
  paint: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (ctx) paint(ctx, width, height)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

/**
 * Paints the laptop screen: a blue desktop with a small chat window of message bubbles.
 *
 * @param ctx - canvas context
 * @param w - canvas width
 * @param h - canvas height
 */
function paintScreen(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const bg = ctx.createLinearGradient(0, 0, w, h)
  bg.addColorStop(0, '#60a5fa')
  bg.addColorStop(1, '#1d4ed8')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, w, h)

  ctx.fillStyle = 'rgba(255,255,255,0.97)'
  roundRect(ctx, w * 0.1, h * 0.14, w * 0.8, h * 0.72, 14)
  ctx.fill()
  ctx.fillStyle = '#e2e8f0'
  roundRect(ctx, w * 0.1, h * 0.14, w * 0.8, h * 0.13, 14)
  ctx.fill()
  ;['#fca5a5', '#fcd34d', '#86efac'].forEach((c, i) => {
    ctx.fillStyle = c
    ctx.beginPath()
    ctx.arc(w * 0.15 + i * 16, h * 0.205, 5, 0, Math.PI * 2)
    ctx.fill()
  })

  const rows: [number, number, number, string][] = [
    [0.15, 0.34, 0.38, '#e2e8f0'],
    [0.47, 0.5, 0.38, '#3b82f6'],
    [0.15, 0.66, 0.3, '#e2e8f0'],
  ]
  for (const [x, y, width, color] of rows) {
    ctx.fillStyle = color
    roundRect(ctx, w * x, h * y, w * width, h * 0.1, h * 0.05)
    ctx.fill()
  }
}

/**
 * Paints the laptop's top surface: silver deck, dark keyboard well with keys and a trackpad.
 * The top of the canvas maps to the back of the laptop (the hinge side).
 *
 * @param ctx - canvas context
 * @param w - canvas width
 * @param h - canvas height
 */
function paintDeck(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.fillStyle = '#dfe5ee'
  ctx.fillRect(0, 0, w, h)

  const wellX = w * 0.07
  const wellY = h * 0.07
  const wellW = w * 0.86
  const wellH = h * 0.5
  ctx.fillStyle = '#1e293b'
  roundRect(ctx, wellX, wellY, wellW, wellH, 10)
  ctx.fill()

  const cols = 13
  const rows = 4
  const pad = 8
  const gap = 4
  const keyW = (wellW - pad * 2 - gap * (cols - 1)) / cols
  const keyH = (wellH - pad * 2 - gap * (rows - 1)) / rows
  ctx.fillStyle = '#64748b'
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      roundRect(ctx, wellX + pad + c * (keyW + gap), wellY + pad + r * (keyH + gap), keyW, keyH, 3)
      ctx.fill()
    }
  }

  ctx.fillStyle = '#eef2f7'
  ctx.strokeStyle = '#b6c0cf'
  ctx.lineWidth = 2
  roundRect(ctx, w * 0.36, h * 0.66, w * 0.28, h * 0.24, 8)
  ctx.fill()
  ctx.stroke()
}

/**
 * Paints a chat bubble icon: rounded body with a tail and three typing dots.
 *
 * @param ctx - canvas context
 * @param w - canvas width
 * @param h - canvas height
 * @param color - bubble fill colour
 */
function paintBubble(ctx: CanvasRenderingContext2D, w: number, h: number, color: string): void {
  const bx = w * 0.1
  const by = h * 0.14
  const bw = w * 0.8
  const bh = h * 0.56

  ctx.shadowColor = 'rgba(15, 23, 42, 0.3)'
  ctx.shadowBlur = 10
  ctx.shadowOffsetY = 4
  ctx.fillStyle = color
  roundRect(ctx, bx, by, bw, bh, bh * 0.4)
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(w * 0.24, by + bh - 4)
  ctx.lineTo(w * 0.2, h * 0.9)
  ctx.lineTo(w * 0.46, by + bh - 4)
  ctx.closePath()
  ctx.fill()

  ctx.shadowColor = 'transparent'
  ctx.fillStyle = '#ffffff'
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath()
    ctx.arc(w * (0.34 + i * 0.16), by + bh / 2, w * 0.058, 0, Math.PI * 2)
    ctx.fill()
  }
}

/**
 * Creates the shared laptop and chat bubble assets for the hero scene.
 *
 * The laptop is assembled from rounded boxes: a silver base with a keyboard texture, a lid
 * tilted back on a hinge, a glowing chat-app screen and a small logo on the lid's back.
 * Bubbles get one variant per colour; the colour list is sanitised by `resolveBubbleColors`.
 *
 * @param bubbleColors - CSS colours for the bubbles, defaults to `HERO_BUBBLE_COLORS`
 */
export function createHeroAssets(bubbleColors: readonly string[] = HERO_BUBBLE_COLORS): HeroAssets {
  const disposables: { dispose: () => void }[] = []
  const track = <T extends { dispose: () => void }>(item: T): T => {
    disposables.push(item)
    return item
  }

  const body = track(new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.45, metalness: 0.15 }))
  const deck = track(
    new THREE.MeshStandardMaterial({ map: track(canvasTexture(512, 358, paintDeck)), roughness: 0.6, metalness: 0.1 }),
  )
  const screen = track(new THREE.MeshBasicMaterial({ map: track(canvasTexture(320, 210, paintScreen)) }))
  const logo = track(new THREE.MeshBasicMaterial({ color: 0x2563eb, side: THREE.DoubleSide }))

  const baseGeo = track(new RoundedBoxGeometry(1, 0.06, 0.7, 3, 0.025))
  const lidGeo = track(new RoundedBoxGeometry(1, 0.68, 0.045, 3, 0.02))
  const deckGeo = track(new THREE.PlaneGeometry(0.94, 0.64))
  const screenGeo = track(new THREE.PlaneGeometry(0.92, 0.6))
  const logoGeo = track(new THREE.CircleGeometry(0.06, 24))

  const colors = resolveBubbleColors(bubbleColors)
  const bubbleMaterials = colors.map((color) =>
    track(
      new THREE.SpriteMaterial({
        map: track(canvasTexture(128, 128, (ctx, w, h) => paintBubble(ctx, w, h, color))),
        transparent: true,
        depthWrite: false,
      }),
    ),
  )

  return {
    createLaptop: () => {
      const laptop = new THREE.Group()
      const model = new THREE.Group()
      model.position.set(0, -0.3, 0)
      model.scale.setScalar(LAPTOP_WIDTH)
      laptop.add(model)

      const base = new THREE.Mesh(baseGeo, body)
      base.position.y = 0.03
      model.add(base)

      const top = new THREE.Mesh(deckGeo, deck)
      top.rotation.x = -Math.PI / 2
      top.position.y = 0.0615
      model.add(top)

      const hinge = new THREE.Group()
      hinge.position.set(0, 0.055, -0.33)
      hinge.rotation.x = -0.22
      model.add(hinge)

      const lid = new THREE.Mesh(lidGeo, body)
      lid.position.y = 0.34
      hinge.add(lid)

      const display = new THREE.Mesh(screenGeo, screen)
      display.position.set(0, 0.34, 0.0235)
      hinge.add(display)

      const mark = new THREE.Mesh(logoGeo, logo)
      mark.position.set(0, 0.34, -0.0235)
      mark.rotation.y = Math.PI
      hinge.add(mark)

      return laptop
    },
    bubbleVariants: colors.length,
    createBubble: (variant) => {
      const count = bubbleMaterials.length
      const sprite = new THREE.Sprite(bubbleMaterials[((variant % count) + count) % count])
      sprite.scale.setScalar(BUBBLE_SIZE)
      return sprite
    },
    dispose: () => disposables.forEach((d) => d.dispose()),
  }
}
