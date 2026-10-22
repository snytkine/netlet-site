/**
 * Geometry helpers for the 3D hero scene. Kept free of three.js imports so they can
 * be tested without WebGL.
 */
import { meshEdges, type Edge } from './mesh'

/** A 3D point. */
export interface Vec3 {
  x: number
  y: number
  z: number
}

/**
 * Distributes points approximately evenly over a sphere (Fibonacci lattice).
 *
 * @param count - number of points
 * @param radius - sphere radius
 */
export function fibonacciSphere(count: number, radius: number): Vec3[] {
  if (count <= 0) return []
  if (count === 1) return [{ x: 0, y: radius, z: 0 }]
  const golden = Math.PI * (3 - Math.sqrt(5))
  return Array.from({ length: count }, (_, i) => {
    const y = 1 - (i / (count - 1)) * 2
    const r = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = golden * i
    return { x: Math.cos(theta) * r * radius, y: y * radius, z: Math.sin(theta) * r * radius }
  })
}

/** Describes the nodes and links of the hero mesh. */
export interface SceneLayout {
  nodes: Vec3[]
  edges: Edge[]
}

/**
 * Builds the layout of the hero scene: nodes on a sphere, all linked to each other.
 *
 * @param nodeCount - number of chat nodes
 * @param radius - sphere radius
 */
export function buildSceneLayout(nodeCount: number, radius: number): SceneLayout {
  return { nodes: fibonacciSphere(nodeCount, radius), edges: meshEdges(nodeCount) }
}

/**
 * Linear interpolation between two 3D points.
 *
 * @param a - start
 * @param b - end
 * @param t - 0..1
 */
export function lerpVec3(a: Vec3, b: Vec3, t: number): Vec3 {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t }
}

/**
 * Detects whether the browser can create a WebGL context.
 *
 * @param doc - document used to create the probe canvas
 */
export function supportsWebGL(doc: Document = document): boolean {
  try {
    const canvas = doc.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
  } catch {
    return false
  }
}
