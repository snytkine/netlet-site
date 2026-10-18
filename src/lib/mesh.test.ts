import { describe, expect, it } from 'vitest'
import {
  circleLayout,
  createMeshState,
  lerpPoint,
  meshEdges,
  packetPosition,
  seededRandom,
  spawnPacket,
  stepMesh,
} from './mesh'

describe('meshEdges', () => {
  it('connects every node to every other exactly once', () => {
    expect(meshEdges(4)).toHaveLength(6)
    expect(meshEdges(7)).toHaveLength(21)
    const keys = new Set(meshEdges(5).map(([a, b]) => `${a}-${b}`))
    expect(keys.size).toBe(10)
  })

  it('returns no edges for fewer than two nodes', () => {
    expect(meshEdges(0)).toEqual([])
    expect(meshEdges(1)).toEqual([])
  })
})

describe('circleLayout', () => {
  it('places the first node straight up by default', () => {
    const [first] = circleLayout(4, 10, 20, 5)
    expect(first.x).toBeCloseTo(10)
    expect(first.y).toBeCloseTo(15)
  })

  it('supports ellipses', () => {
    const pts = circleLayout(4, 0, 0, 10, 2, 0)
    expect(pts[0]).toEqual({ x: 10, y: 0 })
    expect(pts[1].x).toBeCloseTo(0)
    expect(pts[1].y).toBeCloseTo(2)
  })
})

describe('seededRandom', () => {
  it('is deterministic and within [0, 1)', () => {
    const a = seededRandom(42)
    const b = seededRandom(42)
    for (let i = 0; i < 20; i += 1) {
      const v = a()
      expect(v).toBe(b())
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
})

describe('lerpPoint', () => {
  it('interpolates linearly', () => {
    expect(lerpPoint({ x: 0, y: 0 }, { x: 10, y: 20 }, 0.5)).toEqual({ x: 5, y: 10 })
  })
})

describe('mesh animation', () => {
  it('creates state with nodes, edges and packets', () => {
    const state = createMeshState(5, 3, seededRandom(1))
    expect(state.nodes).toHaveLength(5)
    expect(state.edges).toHaveLength(10)
    expect(state.packets).toHaveLength(3)
    expect(state.pulses).toEqual([0, 0, 0, 0, 0])
  })

  it('creates no packets when there are no edges', () => {
    expect(createMeshState(1, 3).packets).toEqual([])
  })

  it('spawns packets on a valid edge', () => {
    const p = spawnPacket(10, seededRandom(7))
    expect(p.edge).toBeGreaterThanOrEqual(0)
    expect(p.edge).toBeLessThan(10)
    expect(p.speed).toBeGreaterThan(0)
  })

  it('advances packets and clamps large time steps', () => {
    const state = createMeshState(4, 2, seededRandom(3))
    state.packets = state.packets.map((p) => ({ ...p, t: 0, speed: 1 }))
    stepMesh(state, 5)
    expect(state.time).toBeCloseTo(0.1)
    expect(state.packets[0].t).toBeCloseTo(0.1)
  })

  it('ignores negative time steps', () => {
    const state = createMeshState(4, 1, seededRandom(3))
    stepMesh(state, -1)
    expect(state.time).toBe(0)
  })

  it('pulses the destination node and respawns a packet that arrives', () => {
    const state = createMeshState(3, 1, seededRandom(3))
    state.packets = [{ edge: 0, t: 0.99, reverse: false, speed: 1 }]
    const [, to] = state.edges[0]
    stepMesh(state, 0.05, seededRandom(9))
    expect(state.pulses[to]).toBe(1)
    expect(state.packets[0].t).toBe(0)
  })

  it('pulses the origin node when travelling in reverse', () => {
    const state = createMeshState(3, 1, seededRandom(3))
    state.packets = [{ edge: 0, t: 0.99, reverse: true, speed: 1 }]
    const [from] = state.edges[0]
    stepMesh(state, 0.05, seededRandom(9))
    expect(state.pulses[from]).toBe(1)
  })

  it('decays pulses over time', () => {
    const state = createMeshState(3, 0)
    state.pulses = [1, 1, 1]
    stepMesh(state, 0.1)
    expect(state.pulses[0]).toBeCloseTo(0.75)
  })

  it('is safe when the mesh has no edges', () => {
    const state = createMeshState(1, 2)
    expect(() => stepMesh(state, 0.05)).not.toThrow()
  })

  it('locates packets along their edge in either direction', () => {
    const state = createMeshState(2, 0)
    const [a, b] = [state.nodes[0], state.nodes[1]]
    expect(packetPosition(state, { edge: 0, t: 0, reverse: false, speed: 1 })).toEqual(a)
    expect(packetPosition(state, { edge: 0, t: 0, reverse: true, speed: 1 })).toEqual(b)
  })
})
