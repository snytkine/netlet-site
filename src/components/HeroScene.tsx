import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import * as THREE from 'three'
import { buildSceneLayout, lerpVec3, supportsWebGL } from '../lib/meshScene'
import { BUBBLE_SIZE, BUBBLE_VARIANTS, createHeroAssets } from './heroModels'
import { useReducedMotion } from '../lib/useReducedMotion'
import { HERO_ANIMATION_SECONDS } from '../config/site'

/** Accessible description of the animation, shared by every state of the component. */
const SCENE_LABEL = '3D animation of chat devices connected in a mesh, exchanging messages directly'

/** Number of nodes in the 3D mesh. */
const NODE_COUNT = 14
/** Number of messages flying between nodes. */
const PACKET_COUNT = 10

/** A chat bubble animated along one edge. */
interface FlyingPacket {
  mesh: THREE.Sprite
  edge: number
  t: number
  speed: number
  reverse: boolean
}

/** Lets the component's event handlers drive the animation loop owned by the effect. */
interface PlaybackControl {
  /** Stops a running animation, or starts a stopped one for a fresh `durationSeconds`. */
  toggle: () => void
}

/** Props of {@link HeroScene}. */
interface HeroSceneProps {
  /**
   * Seconds of animation before it stops by itself; `0` disables the automatic stop.
   * Defaults to `HERO_ANIMATION_SECONDS` from the site configuration.
   */
  durationSeconds?: number
}

/**
 * Renders the hero 3D animation: a rotating peer-to-peer mesh of laptops with
 * chat bubbles flying between them. The animation stops by itself after
 * `durationSeconds`, and a click (or Enter/Space) stops it earlier or starts it again.
 * Falls back to a static illustration when WebGL is unavailable and renders a single
 * non-interactive frame when the user prefers reduced motion.
 *
 * @param props - Component props.
 */
export default function HeroScene({ durationSeconds = HERO_ANIMATION_SECONDS }: HeroSceneProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const controlRef = useRef<PlaybackControl | null>(null)
  const reducedMotion = useReducedMotion()
  const [webgl] = useState(() => supportsWebGL())
  const [playing, setPlaying] = useState(true)
  const interactive = webgl && !reducedMotion

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

    const assets = createHeroAssets()
    disposables.push(assets)
    for (const n of layout.nodes) {
      const laptop = assets.createLaptop()
      laptop.position.set(n.x, n.y, n.z)
      // Keep laptops upright and turn their screens away from the centre of the mesh.
      laptop.rotation.y = Math.atan2(n.x, n.z)
      group.add(laptop)
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

    const packets: FlyingPacket[] = Array.from({ length: PACKET_COUNT }, (_, i) => {
      const mesh = assets.createBubble(i % BUBBLE_VARIANTS)
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
        // Bubbles pop in as they leave a laptop and shrink away as they arrive.
        const pop = Math.min(1, p.t * 6, (1 - p.t) * 6)
        p.mesh.scale.setScalar(BUBBLE_SIZE * (0.4 + 0.6 * pop) * (1 + 0.08 * Math.sin(p.t * Math.PI * 6)))
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
    /** True while the animation loop is scheduled; false when stopped or never started. */
    let running = false
    /** Resizes and, if the loop is not running, redraws because resizing clears the canvas. */
    const onResize = () => {
      resize()
      if (!running) renderer.render(scene, camera)
    }
    const resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(onResize) : null
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
    /** Seconds of animation played since the last start; only on-screen time counts. */
    let elapsed = 0
    const autoStop = durationSeconds > 0

    /** Stops the loop, keeping the last rendered frame on the canvas. */
    const stop = () => {
      if (!running) return
      running = false
      cancelAnimationFrame(frame)
      setPlaying(false)
    }

    /** Advances the animation and renders one frame; stops once the duration is used up. */
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now
      if (visible) {
        elapsed += dt
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
      if (autoStop && elapsed >= durationSeconds) {
        stop()
        return
      }
      frame = requestAnimationFrame(tick)
    }

    /** Starts the loop with a fresh time budget. */
    const start = () => {
      if (running) return
      running = true
      elapsed = 0
      last = performance.now()
      setPlaying(true)
      frame = requestAnimationFrame(tick)
    }

    controlRef.current = { toggle: () => (running ? stop() : start()) }

    const intersection =
      typeof IntersectionObserver === 'function'
        ? new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting
          })
        : null
    intersection?.observe(host)

    if (!reducedMotion) start()

    return () => {
      controlRef.current = null
      running = false
      cancelAnimationFrame(frame)
      resizeObserver?.disconnect()
      intersection?.disconnect()
      host.removeEventListener('pointermove', onPointerMove)
      disposables.forEach((d) => d.dispose())
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [webgl, reducedMotion, durationSeconds])

  /** Toggles playback when Enter or Space is pressed on the focused animation. */
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    controlRef.current?.toggle()
  }

  if (!interactive) {
    return (
      <div ref={hostRef} className="hero-scene" role="img" aria-label={SCENE_LABEL}>
        {!webgl && <StaticMesh />}
      </div>
    )
  }

  return (
    <div
      ref={hostRef}
      className="hero-scene hero-scene--interactive"
      data-playing={playing}
      role="button"
      tabIndex={0}
      aria-label={`${SCENE_LABEL}. ${playing ? 'Click to pause.' : 'Click to play.'}`}
      onClick={() => controlRef.current?.toggle()}
      onKeyDown={onKeyDown}
    >
      {!playing && (
        <span className="hero-scene__play" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="28" height="28">
            <path d="M8 5v14l11-7z" fill="currentColor" />
          </svg>
        </span>
      )}
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
