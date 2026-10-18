import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { buildSceneLayout, lerpVec3, supportsWebGL } from '../lib/meshScene'
import { useReducedMotion } from '../lib/useReducedMotion'

/** Number of nodes in the 3D mesh. */
const NODE_COUNT = 14
/** Number of messages flying between nodes. */
const PACKET_COUNT = 10

/** A message sphere animated along one edge. */
interface FlyingPacket {
  mesh: THREE.Mesh
  edge: number
  t: number
  speed: number
  reverse: boolean
}

/**
 * Renders the hero 3D animation: a rotating peer-to-peer mesh of glowing nodes with
 * message spheres flying between them. Falls back to a static illustration when WebGL
 * is unavailable and renders a single frame when the user prefers reduced motion.
 */
export default function HeroScene() {
  const hostRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const [webgl] = useState(() => supportsWebGL())

  useEffect(() => {
    const host = hostRef.current
    if (!host || !webgl) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
    camera.position.set(0, 0, 9)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    host.appendChild(renderer.domElement)
    renderer.domElement.style.display = 'block'

    const group = new THREE.Group()
    scene.add(group)
    scene.add(new THREE.AmbientLight(0xffffff, 1.2))
    const key = new THREE.DirectionalLight(0xffffff, 2.2)
    key.position.set(4, 6, 8)
    scene.add(key)

    const layout = buildSceneLayout(NODE_COUNT, 3)
    const disposables: { dispose: () => void }[] = []

    const nodeGeo = new THREE.SphereGeometry(0.2, 24, 24)
    const nodeMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.35, metalness: 0.1 })
    const haloGeo = new THREE.SphereGeometry(0.34, 24, 24)
    const haloMat = new THREE.MeshBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.18 })
    disposables.push(nodeGeo, nodeMat, haloGeo, haloMat)
    for (const n of layout.nodes) {
      const node = new THREE.Mesh(nodeGeo, nodeMat)
      node.position.set(n.x, n.y, n.z)
      const halo = new THREE.Mesh(haloGeo, haloMat)
      node.add(halo)
      group.add(node)
    }

    const points: THREE.Vector3[] = []
    for (const [a, b] of layout.edges) {
      const na = layout.nodes[a]
      const nb = layout.nodes[b]
      points.push(new THREE.Vector3(na.x, na.y, na.z), new THREE.Vector3(nb.x, nb.y, nb.z))
    }
    const lineGeo = new THREE.BufferGeometry().setFromPoints(points)
    const lineMat = new THREE.LineBasicMaterial({ color: 0x2563eb, transparent: true, opacity: 0.14 })
    disposables.push(lineGeo, lineMat)
    group.add(new THREE.LineSegments(lineGeo, lineMat))

    const packetGeo = new THREE.SphereGeometry(0.1, 16, 16)
    const packetMat = new THREE.MeshBasicMaterial({ color: 0xf97316 })
    disposables.push(packetGeo, packetMat)
    const packets: FlyingPacket[] = Array.from({ length: PACKET_COUNT }, () => {
      const mesh = new THREE.Mesh(packetGeo, packetMat)
      group.add(mesh)
      return {
        mesh,
        edge: Math.floor(Math.random() * layout.edges.length),
        t: Math.random(),
        speed: 0.3 + Math.random() * 0.4,
        reverse: Math.random() < 0.5,
      }
    })

    /** Moves every packet to its position for the current progress. */
    const placePackets = () => {
      for (const p of packets) {
        const [a, b] = layout.edges[p.edge]
        const from = layout.nodes[p.reverse ? b : a]
        const to = layout.nodes[p.reverse ? a : b]
        const pos = lerpVec3(from, to, p.t)
        p.mesh.position.set(pos.x, pos.y, pos.z)
      }
    }

    /** Resizes the renderer to the host element. */
    const resize = () => {
      const width = host.clientWidth || 1
      const height = host.clientHeight || 1
      renderer.setSize(width, height, false)
      renderer.domElement.style.width = '100%'
      renderer.domElement.style.height = '100%'
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }
    resize()
    const resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(resize) : null
    resizeObserver?.observe(host)

    const pointer = { x: 0, y: 0 }
    /** Tracks the pointer so the mesh tilts slightly toward it. */
    const onPointerMove = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect()
      pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2
      pointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2
    }
    host.addEventListener('pointermove', onPointerMove)

    placePackets()
    group.rotation.set(0.25, 0.6, 0)
    renderer.render(scene, camera)

    let frame = 0
    let visible = true
    let last = performance.now()
    /** Advances the animation and renders one frame. */
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now
      if (visible) {
        group.rotation.y += dt * 0.15
        group.rotation.x += (0.25 + pointer.y * 0.25 - group.rotation.x) * 0.04
        group.position.x += (pointer.x * 0.3 - group.position.x) * 0.04
        for (const p of packets) {
          p.t += p.speed * dt
          if (p.t >= 1) {
            p.t = 0
            p.edge = Math.floor(Math.random() * layout.edges.length)
            p.reverse = Math.random() < 0.5
          }
        }
        placePackets()
        renderer.render(scene, camera)
      }
      frame = requestAnimationFrame(tick)
    }

    const intersection =
      typeof IntersectionObserver === 'function'
        ? new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting
          })
        : null
    intersection?.observe(host)

    if (!reducedMotion) frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver?.disconnect()
      intersection?.disconnect()
      host.removeEventListener('pointermove', onPointerMove)
      disposables.forEach((d) => d.dispose())
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [webgl, reducedMotion])

  return (
    <div
      ref={hostRef}
      className="hero-scene"
      role="img"
      aria-label="3D animation of chat devices connected in a mesh, exchanging messages directly"
    >
      {!webgl && <StaticMesh />}
    </div>
  )
}

/** Static SVG fallback shown when WebGL is not available. */
function StaticMesh() {
  const nodes = [
    [200, 60], [320, 130], [300, 260], [160, 300], [70, 190], [110, 90],
  ]
  return (
    <svg viewBox="0 0 400 360" className="hero-scene__fallback" aria-hidden="true">
      {nodes.flatMap((a, i) =>
        nodes.slice(i + 1).map((b, j) => (
          <line key={`${i}-${j}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#2563eb" strokeOpacity="0.2" />
        )),
      )}
      {nodes.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="14" fill="#2563eb" />
      ))}
    </svg>
  )
}
