import { homeLayout, officeLayout, type Computer, type DiagramLayout } from '../lib/diagrams'
import type { Point } from '../lib/mesh'

/**
 * Draws a small desktop computer centred on `at`.
 *
 * @param props.at - centre point
 * @param props.label - caption under the computer
 */
function ComputerIcon({ at, label }: { at: Point; label?: string }) {
  return (
    <g transform={`translate(${at.x - 14} ${at.y - 12})`}>
      <rect width="28" height="19" rx="3" fill="#fff" stroke="#1e3a8a" strokeWidth="2" />
      <rect x="3" y="3" width="22" height="13" rx="1.5" fill="#dbeafe" />
      <path d="M9 24h10M14 19v5" stroke="#1e3a8a" strokeWidth="2" strokeLinecap="round" />
      {label && (
        <text x="14" y="40" textAnchor="middle" fontSize="11" fill="#475569">
          {label}
        </text>
      )}
    </g>
  )
}

/**
 * Draws a Wi-Fi router icon centred on `at`.
 *
 * @param props.at - centre point
 */
function RouterIcon({ at }: { at: Point }) {
  return (
    <g transform={`translate(${at.x} ${at.y})`}>
      <circle r="21" fill="#fff" stroke="#2563eb" strokeWidth="2.5" />
      <path d="M-10 -2a14 14 0 0 1 20 0M-6 3a8 8 0 0 1 12 0" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
      <circle cy="8" r="2.5" fill="#2563eb" />
      <text y="38" textAnchor="middle" fontSize="11" fill="#475569">
        Router
      </text>
    </g>
  )
}

/**
 * Draws the cloud used for "the Internet".
 *
 * @param props.at - centre point
 */
function CloudIcon({ at }: { at: Point }) {
  return (
    <g transform={`translate(${at.x - 28} ${at.y - 18})`}>
      <path
        d="M14 34h30a11 11 0 0 0 1-22 15 15 0 0 0-28-3 12 12 0 0 0-3 25z"
        fill="#f1f5f9"
        stroke="#94a3b8"
        strokeWidth="2"
      />
    </g>
  )
}

/** Props shared by the mesh edge renderer. */
interface EdgesProps {
  layout: DiagramLayout
}

/**
 * Renders all computer-to-computer mesh links of a diagram.
 *
 * @param props.layout - diagram layout
 */
function MeshEdges({ layout }: EdgesProps) {
  return (
    <g stroke="#2563eb" strokeOpacity="0.45" strokeWidth="1.6" strokeDasharray="5 4">
      {layout.edges.map(([a, b]) => (
        <line
          key={`${a}-${b}`}
          x1={layout.computers[a].x}
          y1={layout.computers[a].y}
          x2={layout.computers[b].x}
          y2={layout.computers[b].y}
        />
      ))}
    </g>
  )
}

/**
 * Home network diagram: a small house with four rooms, a computer in each, every
 * computer linked to the others. The Internet connection is crossed out in red.
 */
export function HomeDiagram() {
  const layout = homeLayout()
  const internet = { x: 500, y: 100 }
  return (
    <svg
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      role="img"
      aria-labelledby="home-diagram-title"
      className="diagram"
    >
      <title id="home-diagram-title">
        Home network: four computers in four rooms connected directly to each other. Internet not required.
      </title>
      {/* roof and walls */}
      <path d="M60 62 240 12l180 50" fill="#eff6ff" stroke="#1e3a8a" strokeWidth="3" strokeLinejoin="round" />
      <rect x="70" y="62" width="340" height="215" fill="#fff" stroke="#1e3a8a" strokeWidth="3" />
      <path d="M240 62v215M70 170h340" stroke="#cbd5e1" strokeWidth="2" />
      <MeshEdges layout={layout} />
      {layout.computers.map((c: Computer) => (
        <ComputerIcon key={c.label} at={c} label={c.label} />
      ))}
      <RouterIcon at={layout.router} />
      {/* crossed-out Internet link */}
      <path d="M262 150 468 108" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" fill="none" />
      <CloudIcon at={internet} />
      <path d="M486 86l28 28M514 86l-28 28" stroke="#dc2626" strokeWidth="5" strokeLinecap="round" />
      <text textAnchor="middle" fontSize="12" fontWeight="600" fill="#dc2626">
        <tspan x="500" y="136">Internet</tspan>
        <tspan x="500" y="152">not required</tspan>
      </text>
    </svg>
  )
}

/**
 * Office diagram: seven computers in one room, fully meshed, with a router that is
 * connected to the Internet — yet chats never leave the local network.
 */
export function OfficeDiagram() {
  const layout = officeLayout()
  return (
    <svg
      viewBox={`0 0 ${layout.width} ${layout.height + 40}`}
      role="img"
      aria-labelledby="office-diagram-title"
      className="diagram"
    >
      <title id="office-diagram-title">
        Office network: seven computers connected directly to each other. The router has Internet access but chats never leave the local network.
      </title>
      <rect x="20" y="30" width="440" height="270" rx="14" fill="#fff" stroke="#1e3a8a" strokeWidth="3" />
      <text x="34" y="52" fontSize="12" fontWeight="600" fill="#1e3a8a">
        Office
      </text>
      <MeshEdges layout={layout} />
      {layout.computers.map((c) => (
        <ComputerIcon key={c.label} at={c} />
      ))}
      <RouterIcon at={layout.router} />
      {/* Internet uplink */}
      <path d="M240 120V80" stroke="#2563eb" strokeWidth="2.5" />
      <path d="M240 30V12" stroke="#2563eb" strokeWidth="2.5" />
      <CloudIcon at={{ x: 240, y: 20 }} />
      <text x="240" y="332" textAnchor="middle" fontSize="13" fontWeight="600" fill="#1e3a8a">
        Chats never leave the local network
      </text>
    </svg>
  )
}

/**
 * Remote event illustration: mountains, a small group of people with phones and laptops
 * and the caption explaining that no Internet is needed.
 */
export function EventDiagram() {
  const people = [110, 175, 240, 305, 370]
  return (
    <svg
      viewBox="0 0 480 320"
      role="img"
      aria-labelledby="event-diagram-title"
      className="diagram"
    >
      <title id="event-diagram-title">
        Outdoor event with mountains in the background and a group of people chatting on their devices. Internet is not available, but chats are still possible.
      </title>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bfdbfe" />
          <stop offset="1" stopColor="#f0f9ff" />
        </linearGradient>
      </defs>
      <rect width="480" height="320" rx="14" fill="url(#sky)" />
      <circle cx="400" cy="60" r="24" fill="#fde68a" />
      <path d="M0 220 90 100l60 70 70-110 110 160 50-60 100 90v70H0z" fill="#94a3b8" />
      <path d="m90 100 24 28-18 8-14-12-16 10zM220 60l28 40-18 6-10-14-14 12z" fill="#fff" />
      <path d="M0 240c80-30 160-30 240-10s160 20 240-10v100H0z" fill="#86efac" />
      {people.map((x, i) => (
        <g key={x} transform={`translate(${x} ${i % 2 ? 236 : 246})`}>
          <circle cy="-30" r="9" fill="#fcd9b6" />
          <path d="M-12 22v-34a12 12 0 0 1 24 0v34z" fill={['#2563eb', '#f97316', '#0d9488', '#7c3aed', '#e11d48'][i]} />
          <rect x="-9" y="-6" width="18" height="12" rx="2" fill="#fff" stroke="#1e3a8a" strokeWidth="1.5" />
        </g>
      ))}
      {/* chat bubbles between people */}
      <g fill="#fff" stroke="#2563eb" strokeWidth="1.5">
        <rect x="128" y="170" width="34" height="20" rx="8" />
        <rect x="258" y="178" width="34" height="20" rx="8" />
        <rect x="330" y="166" width="34" height="20" rx="8" />
      </g>
      <g fill="#2563eb">
        <circle cx="139" cy="180" r="2" />
        <circle cx="145" cy="180" r="2" />
        <circle cx="151" cy="180" r="2" />
        <circle cx="269" cy="188" r="2" />
        <circle cx="275" cy="188" r="2" />
        <circle cx="281" cy="188" r="2" />
      </g>
      {/* no signal badge */}
      <g transform="translate(40 40)">
        <path d="M-14 4a20 20 0 0 1 28 0M-8 10a11 11 0 0 1 16 0" fill="none" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
        <circle cy="16" r="2.5" fill="#475569" />
        <path d="M-20 -14 20 26" stroke="#dc2626" strokeWidth="4" strokeLinecap="round" />
      </g>
      <text x="240" y="305" textAnchor="middle" fontSize="13" fontWeight="600" fill="#1e3a8a">
        Internet is not available, but chats are still possible
      </text>
    </svg>
  )
}
