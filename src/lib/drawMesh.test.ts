import { describe, expect, it, vi } from 'vitest'
import { drawMesh } from './drawMesh'
import { createMeshState, seededRandom } from './mesh'

describe('drawMesh', () => {
  it('draws edges, nodes and packets', () => {
    const ctx = {
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
    }
    const state = createMeshState(5, 4, seededRandom(1))
    drawMesh(ctx as unknown as CanvasRenderingContext2D, state, 100, 100)
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 100, 100)
    expect(ctx.stroke).toHaveBeenCalledTimes(10)
    // 3 circles per node + 1 per packet
    expect(ctx.arc).toHaveBeenCalledTimes(5 * 3 + 4)
  })
})
