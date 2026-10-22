/**
 * Layout data for the use-case network diagrams (all coordinates are SVG user units).
 */
import { circleLayout, meshEdges, type Edge, type Point } from './mesh'

/** A labelled computer in a diagram. */
export interface Computer extends Point {
  label: string
}

/** Complete layout for a diagram. */
export interface DiagramLayout {
  width: number
  height: number
  router: Point
  computers: Computer[]
  edges: Edge[]
}

/** Width/height of the home diagram's viewBox. */
export const HOME_SIZE = { width: 580, height: 320 } as const

/** Width/height of the office diagram's viewBox. */
export const OFFICE_SIZE = { width: 480, height: 320 } as const

/** Room names in the home diagram, ordered top-left, top-right, bottom-left, bottom-right. */
export const HOME_ROOMS = ['Living room', 'Kitchen', 'Bedroom', 'Study'] as const

/**
 * Layout of the home diagram: four rooms in a 2x2 grid, one computer per room,
 * router in the centre and every computer linked directly to every other.
 */
export function homeLayout(): DiagramLayout {
  const { width, height } = HOME_SIZE
  const centres: Point[] = [
    { x: 140, y: 100 },
    { x: 340, y: 100 },
    { x: 140, y: 210 },
    { x: 340, y: 210 },
  ]
  return {
    width,
    height,
    router: { x: 240, y: 155 },
    computers: centres.map((p, i) => ({ ...p, label: HOME_ROOMS[i] })),
    edges: meshEdges(centres.length),
  }
}

/**
 * Layout of the office diagram: seven computers around a router, fully meshed.
 */
export function officeLayout(): DiagramLayout {
  const { width, height } = OFFICE_SIZE
  const centre = { x: width / 2, y: 165 }
  const computers = circleLayout(7, centre.x, centre.y, 170, 95).map((p, i) => ({
    ...p,
    label: `PC ${i + 1}`,
  }))
  return { width, height, router: centre, computers, edges: meshEdges(computers.length) }
}
