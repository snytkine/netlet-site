/**
 * Marketing and documentation copy for the site. Kept as data so pages stay thin and
 * the content can be reviewed and updated without touching components.
 */
import type { MockKind } from '../components/AppMock'

/** A headline feature. */
export interface Feature {
  id: string
  title: string
  summary: string
  details: string[]
}

/** The main product features shown on the home and features pages. */
export const FEATURES: readonly Feature[] = [
  {
    id: 'local-chat',
    title: 'Text messaging for local networks',
    summary: 'Chat with everyone on the same Wi-Fi or LAN — no account, no cloud.',
    details: [
      'Messages travel directly between devices on your network.',
      'Nothing to sign up for and nothing to pay for.',
    ],
  },
  {
    id: 'anywhere',
    title: 'Ideal wherever people share a network',
    summary: 'Homes, small and medium offices, conferences, events, parties.',
    details: [
      'Works anywhere a group of people are connected to the same local network.',
      'Start a chat in seconds and let everyone nearby join.',
    ],
  },
  {
    id: 'offline',
    title: 'Works without the Internet',
    summary: 'Keep chatting even when the Internet drops.',
    details: [
      'All you need is a local network, even a simple Wi-Fi router.',
      'Great for festivals and remote retreats where the Internet may not exist at all.',
    ],
  },
  {
    id: 'no-servers',
    title: 'No servers involved',
    summary: 'Your messages never leave your local network.',
    details: [
      'No hosting to pay for and no third-party server storing or intercepting your messages.',
      'Devices connect to each other in a peer-to-peer mesh.',
    ],
  },
]

/** The "why NetLet" pitch shown on the home page. */
export const WHY_NETLET = {
  question:
    'Have you ever used a chat app to talk to other people in the same house or office and wondered why your messages have to travel to the Internet and back when everyone is already connected to the same local network?',
  answer:
    'NetLet is the solution for you. With NetLet your messages never leave your local network. There are no servers involved, no need to pay for hosting and no need to worry about your messages being intercepted or saved on some server. Even when the Internet is not available you can still chat. This is great for festivals or remote retreats where the Internet may not even be available and all you need is a local network like a simple Wi-Fi router.',
  tagline: 'When the Internet drops, NetLet still works.',
} as const

/** Slugs of the three use-case views. */
export type UseCaseSlug = 'home' | 'office' | 'events'

/** A use case with its own view. */
export interface UseCase {
  slug: UseCaseSlug
  title: string
  summary: string
  paragraphs: string[]
  bullets: string[]
}

/** Home, office and remote event use cases. */
export const USE_CASES: readonly UseCase[] = [
  {
    slug: 'home',
    title: 'At home',
    summary: 'Four rooms, four computers, one direct mesh. No Internet required.',
    paragraphs: [
      'Ask kids to come to the table without shouting up the stairs. Every computer in the house connects directly to every other one, with your router acting as the hub.',
      'Even if your Internet connection is down, the family chat keeps working.',
    ],
    bullets: ['Every room connected directly', 'Works during Internet outages', 'Nothing stored outside your home'],
  },
  {
    slug: 'office',
    title: 'In the office',
    summary: 'Multiple computers, one mesh. Chats never leave the local network.',
    paragraphs: [
      'Keep team conversation inside the walls of your office. Computers connect directly to each other and the router simply provides the network.',
      'Your router may be connected to the Internet, but your chats never leave the local network — so there is no third-party service to trust or pay for.',
    ],
    bullets: ['Direct mesh between all computers', 'No per-seat subscription', 'Messages are not stored on external servers'],
  },
  {
    slug: 'events',
    title: 'Remote events',
    summary: 'Festivals, retreats and conferences — even with no Internet at all.',
    paragraphs: [
      'Out in the mountains, at a festival or at a retreat, mobile coverage can be poor or missing. A simple Wi-Fi router is all it takes for a group to chat.',
      'Internet is not available, but chats are still possible.',
    ],
    bullets: ['Only a Wi-Fi router needed', 'Perfect for conferences, parties and meetups', 'Nothing to set up in the cloud'],
  },
]

/** One step in a manual section. */
export interface ManualStep {
  title: string
  text: string
  /** Optional real screenshot under `public/`; a stylised mock is shown when omitted. */
  screenshot?: string
  mock: MockKind
  alt: string
}

/** A manual sub-section. */
export interface ManualSection {
  slug: string
  title: string
  intro: string
  steps: ManualStep[]
}

/**
 * User manual content. The text is a first draft — verify each step against the shipping
 * app and replace the mock screenshots with real ones (set `screenshot`).
 */
export const MANUAL: readonly ManualSection[] = [
  {
    slug: 'hosting-chats',
    title: 'Hosting chats',
    intro: 'Hosting a chat makes it discoverable to everyone connected to your local network.',
    steps: [
      { title: 'Open NetLet', text: 'Launch NetLet and make sure your computer is connected to the Wi-Fi or wired network you want to chat on.', mock: 'host', alt: 'NetLet start window' },
      { title: 'Choose “Host a chat”', text: 'Pick a name for the chat and enter the display name others will see.', mock: 'host', alt: 'Host a chat dialog with chat name and display name fields' },
      { title: 'Start the chat', text: 'Select Start chat. People on the same network can now find and join it.', mock: 'history', alt: 'Newly started chat window' },
    ],
  },
  {
    slug: 'joining-chat',
    title: 'Joining chat',
    intro: 'Joining takes a few seconds once someone on your network is hosting.',
    steps: [
      { title: 'Open NetLet', text: 'Make sure you are on the same local network as the host.', mock: 'join', alt: 'NetLet start window' },
      { title: 'Choose “Join a chat”', text: 'Select the chat from the list or enter its name, then add your display name.', mock: 'join', alt: 'Join a chat dialog' },
      { title: 'Start talking', text: 'Select Join. You are connected directly to the other participants.', mock: 'history', alt: 'Chat window after joining' },
    ],
  },
  {
    slug: 'chat-topology',
    title: 'Chat topology',
    intro: 'NetLet connects participants in a peer-to-peer mesh: every device talks directly to every other device.',
    steps: [
      { title: 'Direct connections', text: 'Each participant connects straight to the others, so no central server relays your messages.', mock: 'topology', alt: 'Diagram of five participants connected in a mesh' },
      { title: 'Why a mesh', text: 'If one device leaves, the rest of the chat keeps working because there is no single point of failure.', mock: 'topology', alt: 'Mesh topology with all peers linked' },
    ],
  },
  {
    slug: 'chat-history',
    title: 'Chat history',
    intro: 'Review earlier conversations stored on your own device.',
    steps: [
      { title: 'Scroll back', text: 'Scroll up in a chat to read earlier messages.', mock: 'history', alt: 'Chat window showing older messages' },
      { title: 'Search', text: 'Use the search box to find a message in the history.', mock: 'history', alt: 'Chat history search field' },
    ],
  },
  {
    slug: 'chat-settings',
    title: 'Chat settings',
    intro: 'Adjust how NetLet looks and behaves.',
    steps: [
      { title: 'Open settings', text: 'Open the settings panel from the chat window.', mock: 'settings', alt: 'Settings panel with toggles' },
      { title: 'Change options', text: 'Toggle options such as notifications and your display name.', mock: 'settings', alt: 'Settings toggles' },
    ],
  },
  {
    slug: 'chat-security',
    title: 'Chat security',
    intro: 'Your messages stay on your local network and are never sent to a cloud server.',
    steps: [
      { title: 'Local only', text: 'Because there are no servers involved, there is no server that can be breached or that can store your messages.', mock: 'security', alt: 'Security panel' },
      { title: 'Control who joins', text: 'Only devices on your local network can reach a hosted chat.', mock: 'security', alt: 'Security options for a chat' },
    ],
  },
  {
    slug: 'chat-privacy',
    title: 'Chat privacy',
    intro: 'NetLet is built so that your conversations stay between you and the people you chat with.',
    steps: [
      { title: 'No accounts', text: 'There is nothing to sign up for, so there is no account profile to collect.', mock: 'privacy', alt: 'Privacy panel' },
      { title: 'Your data stays yours', text: 'Messages are exchanged only between devices on your network.', mock: 'privacy', alt: 'Privacy options' },
    ],
  },
]
