/** Which stylised NetLet window to draw. */
export type MockKind = 'host' | 'join' | 'topology' | 'history' | 'settings' | 'security' | 'privacy'

/** Props for {@link AppMock}. */
export interface AppMockProps {
  kind: MockKind
  /** Accessible description of the screenshot. */
  alt: string
}

/**
 * Stylised stand-in for a NetLet screenshot. Used until real screenshots are added
 * to `public/screenshots/` and referenced from the manual data.
 */
export default function AppMock({ kind, alt }: AppMockProps) {
  return (
    <svg viewBox="0 0 480 300" role="img" aria-label={alt} className="app-mock">
      <rect x="1" y="1" width="478" height="298" rx="12" fill="#fff" stroke="#cbd5e1" strokeWidth="2" />
      <path d="M1 13a12 12 0 0 1 12-12h454a12 12 0 0 1 12 12v22H1z" fill="#f1f5f9" />
      <circle cx="20" cy="18" r="5" fill="#fca5a5" />
      <circle cx="38" cy="18" r="5" fill="#fcd34d" />
      <circle cx="56" cy="18" r="5" fill="#86efac" />
      <text x="240" y="22" textAnchor="middle" fontSize="12" fill="#64748b">
        NetLet chat
      </text>
      {kind === 'topology' ? <Topology /> : kind === 'settings' || kind === 'security' || kind === 'privacy' ? <Panel kind={kind} /> : kind === 'host' || kind === 'join' ? <Dialog kind={kind} /> : <Chat history={kind === 'history'} />}
    </svg>
  )
}

/** Chat window with a sidebar and message bubbles. */
function Chat({ history }: { history: boolean }) {
  return (
    <g>
      <rect x="1" y="35" width="130" height="264" fill="#f8fafc" />
      {['Team', 'Home', 'Party'].map((name, i) => (
        <g key={name}>
          <rect x="12" y={50 + i * 40} width="108" height="30" rx="6" fill={i === 0 ? '#dbeafe' : '#fff'} />
          <text x="24" y={70 + i * 40} fontSize="12" fill="#1e3a8a">
            {name}
          </text>
        </g>
      ))}
      {history && (
        <g>
          <rect x="150" y="48" width="310" height="24" rx="12" fill="#f1f5f9" />
          <text x="164" y="64" fontSize="11" fill="#64748b">
            Search history…
          </text>
        </g>
      )}
      {[
        [150, 90, 150, '#f1f5f9', '#334155'],
        [300, 130, 160, '#2563eb', '#fff'],
        [150, 170, 190, '#f1f5f9', '#334155'],
        [330, 210, 130, '#2563eb', '#fff'],
      ].map(([x, y, w, fill, text], i) => (
        <g key={i}>
          <rect x={x as number} y={y as number} width={w as number} height="28" rx="14" fill={fill as string} />
          <rect x={(x as number) + 14} y={(y as number) + 11} width={(w as number) - 28} height="6" rx="3" fill={text as string} opacity="0.5" />
        </g>
      ))}
      <rect x="150" y="262" width="250" height="26" rx="13" fill="#f1f5f9" />
      <rect x="410" y="262" width="50" height="26" rx="13" fill="#2563eb" />
    </g>
  )
}

/** Host / join dialog. */
function Dialog({ kind }: { kind: 'host' | 'join' }) {
  return (
    <g>
      <rect x="110" y="60" width="260" height="190" rx="12" fill="#f8fafc" stroke="#cbd5e1" />
      <text x="240" y="92" textAnchor="middle" fontSize="15" fontWeight="600" fill="#1e3a8a">
        {kind === 'host' ? 'Host a chat' : 'Join a chat'}
      </text>
      <rect x="132" y="112" width="216" height="30" rx="6" fill="#fff" stroke="#cbd5e1" />
      <text x="144" y="132" fontSize="12" fill="#94a3b8">
        {kind === 'host' ? 'Chat name' : 'Chat code or name'}
      </text>
      <rect x="132" y="154" width="216" height="30" rx="6" fill="#fff" stroke="#cbd5e1" />
      <text x="144" y="174" fontSize="12" fill="#94a3b8">
        Your display name
      </text>
      <rect x="132" y="204" width="216" height="32" rx="16" fill="#2563eb" />
      <text x="240" y="225" textAnchor="middle" fontSize="13" fontWeight="600" fill="#fff">
        {kind === 'host' ? 'Start chat' : 'Join'}
      </text>
    </g>
  )
}

/** Topology map of connected peers. */
function Topology() {
  const pts = [
    [240, 90],
    [350, 150],
    [310, 245],
    [170, 245],
    [130, 150],
  ]
  return (
    <g>
      {pts.flatMap((a, i) => pts.slice(i + 1).map((b, j) => <line key={`${i}-${j}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#2563eb" strokeOpacity="0.35" strokeWidth="2" />))}
      {pts.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="18" fill="#2563eb" />
          <circle cx={x} cy={y} r="7" fill="#fff" />
        </g>
      ))}
    </g>
  )
}

/** Settings-style panel with toggles. */
function Panel({ kind }: { kind: 'settings' | 'security' | 'privacy' }) {
  const title = kind === 'settings' ? 'Chat settings' : kind === 'security' ? 'Security' : 'Privacy'
  return (
    <g>
      <text x="40" y="72" fontSize="16" fontWeight="600" fill="#1e3a8a">
        {title}
      </text>
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x="40" y={92 + i * 48} width="200" height="8" rx="4" fill="#cbd5e1" />
          <rect x="40" y={108 + i * 48} width="140" height="6" rx="3" fill="#e2e8f0" />
          <rect x="390" y={94 + i * 48} width="44" height="24" rx="12" fill={i % 2 === 0 ? '#2563eb' : '#cbd5e1'} />
          <circle cx={i % 2 === 0 ? 422 : 402} cy={106 + i * 48} r="9" fill="#fff" />
        </g>
      ))}
    </g>
  )
}
