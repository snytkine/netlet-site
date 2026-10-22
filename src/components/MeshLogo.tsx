import { useEffect, useRef } from 'react'
import { drawMesh } from '../lib/drawMesh'
import { createMeshState, stepMesh } from '../lib/mesh'
import { useReducedMotion } from '../lib/useReducedMotion'

/** Props for {@link MeshLogo}. */
export interface MeshLogoProps {
  /** Width and height in CSS pixels. */
  size?: number
  /** Number of chat nodes in the mesh. */
  nodes?: number
  /** Number of messages travelling at once. */
  packets?: number
  className?: string
}

/**
 * The NetLet logo: a small peer-to-peer mesh animated on an HTML canvas. Messages
 * (orange dots) travel between nodes. With reduced motion a static frame is drawn.
 */
export default function MeshLogo({ size = 44, nodes = 5, packets = 4, className }: MeshLogoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.round(size * dpr)
    canvas.height = Math.round(size * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const state = createMeshState(nodes, packets)
    drawMesh(ctx, state, size, size)
    if (reducedMotion) return

    let frame = 0
    let last = performance.now()
    const tick = (now: number) => {
      stepMesh(state, (now - last) / 1000)
      last = now
      drawMesh(ctx, state, size, size)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [size, nodes, packets, reducedMotion])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: size, height: size }}
      role="img"
      aria-label="NetLet logo: chat nodes in a peer-to-peer mesh exchanging messages"
    />
  )
}
