/**
 * Pure helpers for building and animating peer-to-peer mesh topologies.
 * Everything here is free of DOM access so it can be unit tested directly.
 */

/** A 2D point. */
export interface Point {
  x: number
  y: number
}

/** An undirected connection between two node indexes. */
export type Edge = readonly [number, number]

/** A message "dot" travelling along an edge. */
export interface Packet {
  /** Index into the edge list. */
  edge: number
  /** Progress along the edge, 0..1. */
  t: number
  /** True when travelling from edge[1] to edge[0]. */
  reverse: boolean
  /** Progress units per second. */
  speed: number
}

/** Mutable state of a running mesh animation. */
export interface MeshState {
  nodes: Point[]
  edges: Edge[]
  packets: Packet[]
  /** Per-node pulse intensity 0..1, raised when a packet arrives. */
  pulses: number[]
  /** Seconds elapsed. */
  time: number
}

/**
 * Builds the edge list of a full mesh: every node connected to every other node.
 *
 * @param count - number of nodes
 * @returns `count * (count - 1) / 2` unique edges
 */
export function meshEdges(count: number): Edge[] {
  const edges: Edge[] = []
  for (let a = 0; a < count; a += 1) {
    for (let b = a + 1; b < count; b += 1) {
      edges.push([a, b])
    }
  }
  return edges
}

/**
 * Places nodes evenly on a circle (or ellipse).
 *
 * @param count - number of nodes
 * @param cx - centre x
 * @param cy - centre y
 * @param rx - horizontal radius
 * @param ry - vertical radius (defaults to `rx`)
 * @param startAngle - angle of the first node in radians (default: straight up)
 */
export function circleLayout(
  count: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number = rx,
  startAngle: number = -Math.PI / 2,
): Point[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = startAngle + (i / count) * Math.PI * 2
    return { x: cx + Math.cos(angle) * rx, y: cy + Math.sin(angle) * ry }
  })
}

/**
 * Deterministic pseudo random number generator (mulberry32).
 *
 * @param seed - integer seed
 * @returns a function returning floats in [0, 1)
 */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Linear interpolation between two points.
 *
 * @param a - start point
 * @param b - end point
 * @param t - 0..1
 */
export function lerpPoint(a: Point, b: Point, t: number): Point {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
}

/**
 * Creates the initial animation state for a full mesh of `nodeCount` nodes
 * laid out on a circle in normalised (-1..1) coordinates.
 *
 * @param nodeCount - number of chat nodes
 * @param packetCount - number of simultaneously travelling messages
 * @param random - random source, injectable for tests
 */
export function createMeshState(
  nodeCount: number,
  packetCount: number,
  random: () => number = Math.random,
): MeshState {
  const nodes = circleLayout(nodeCount, 0, 0, 1)
  const edges = meshEdges(nodeCount)
  const packets = Array.from({ length: edges.length > 0 ? packetCount : 0 }, () => spawnPacket(edges.length, random, random()))
  return { nodes, edges, packets, pulses: nodes.map(() => 0), time: 0 }
}

/**
 * Creates a packet on a random edge.
 *
 * @param edgeCount - number of edges available
 * @param random - random source
 * @param t - initial progress
 */
export function spawnPacket(edgeCount: number, random: () => number, t = 0): Packet {
  return {
    edge: Math.floor(random() * edgeCount),
    t,
    reverse: random() < 0.5,
    speed: 0.35 + random() * 0.4,
  }
}

/**
 * Advances the animation by `dt` seconds. Packets that reach the end of an edge
 * pulse the destination node and are re-spawned on a new random edge.
 *
 * @param state - state to mutate
 * @param dt - elapsed seconds (clamped to 100 ms to survive tab switches)
 * @param random - random source
 */
export function stepMesh(state: MeshState, dt: number, random: () => number = Math.random): void {
  const step = Math.min(Math.max(dt, 0), 0.1)
  state.time += step
  state.pulses = state.pulses.map((p) => Math.max(0, p - step * 2.5))
  if (state.edges.length === 0) return
  state.packets = state.packets.map((packet) => {
    const t = packet.t + packet.speed * step
    if (t < 1) return { ...packet, t }
    const [from, to] = state.edges[packet.edge]
    const arrived = packet.reverse ? from : to
    state.pulses[arrived] = 1
    return spawnPacket(state.edges.length, random)
  })
}

/**
 * Returns the current position of a packet in the same coordinate space as the nodes.
 *
 * @param state - mesh state
 * @param packet - packet to locate
 */
export function packetPosition(state: MeshState, packet: Packet): Point {
  const [a, b] = state.edges[packet.edge]
  const start = packet.reverse ? state.nodes[b] : state.nodes[a]
  const end = packet.reverse ? state.nodes[a] : state.nodes[b]
  return lerpPoint(start, end, packet.t)
}
