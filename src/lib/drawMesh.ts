import { packetPosition, type MeshState } from './mesh'

/** Colours used when painting the mesh. */
export interface MeshPalette {
  edge: string
  node: string
  nodeCore: string
  packet: string
  glow: string
}

/** Default brand palette (light background). */
export const LOGO_PALETTE: MeshPalette = {
  edge: 'rgba(37, 99, 235, 0.28)',
  node: '#2563eb',
  nodeCore: '#ffffff',
  packet: '#f97316',
  glow: 'rgba(37, 99, 235, 0.18)',
}

/**
 * Paints one frame of the mesh onto a 2D context.
 *
 * @param ctx - canvas rendering context
 * @param state - current mesh state (normalised -1..1 coordinates)
 * @param width - CSS pixel width of the canvas
 * @param height - CSS pixel height of the canvas
 * @param palette - colours to use
 */
export function drawMesh(
  ctx: CanvasRenderingContext2D,
  state: MeshState,
  width: number,
  height: number,
  palette: MeshPalette = LOGO_PALETTE,
): void {
  const scale = Math.min(width, height) * 0.36
  const cx = width / 2
  const cy = height / 2
  const toScreen = (p: { x: number; y: number }) => ({ x: cx + p.x * scale, y: cy + p.y * scale })

  ctx.clearRect(0, 0, width, height)

  ctx.lineWidth = Math.max(1, width / 90)
  ctx.strokeStyle = palette.edge
  for (const [a, b] of state.edges) {
    const pa = toScreen(state.nodes[a])
    const pb = toScreen(state.nodes[b])
    ctx.beginPath()
    ctx.moveTo(pa.x, pa.y)
    ctx.lineTo(pb.x, pb.y)
    ctx.stroke()
  }

  const nodeRadius = Math.max(3, width * 0.075)
  state.nodes.forEach((node, i) => {
    const p = toScreen(node)
    const pulse = state.pulses[i] ?? 0
    ctx.fillStyle = palette.glow
    ctx.beginPath()
    ctx.arc(p.x, p.y, nodeRadius * (1.5 + pulse * 0.8), 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = palette.node
    ctx.beginPath()
    ctx.arc(p.x, p.y, nodeRadius, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = palette.nodeCore
    ctx.beginPath()
    ctx.arc(p.x, p.y, nodeRadius * 0.42, 0, Math.PI * 2)
    ctx.fill()
  })

  ctx.fillStyle = palette.packet
  for (const packet of state.packets) {
    const p = toScreen(packetPosition(state, packet))
    ctx.beginPath()
    ctx.arc(p.x, p.y, Math.max(2, width * 0.035), 0, Math.PI * 2)
    ctx.fill()
  }
}
