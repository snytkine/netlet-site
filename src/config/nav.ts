/** Names of the glass icons shown next to the navigation entries. */
export type IconName = 'features' | 'use-cases' | 'manual' | 'faqs'

/** One entry of the primary navigation. */
export interface NavItem {
  /** Route the entry links to. */
  readonly to: string
  /** Visible link text. */
  readonly label: string
  /** Glass icon shown before the label. */
  readonly icon: IconName
}

/** Primary navigation entries shown in the site header. */
export const NAV_ITEMS: readonly NavItem[] = [
  { to: '/features', label: 'Features', icon: 'features' },
  { to: '/use-cases', label: 'Use Cases', icon: 'use-cases' },
  { to: '/manual', label: 'User Manual', icon: 'manual' },
  { to: '/faqs', label: 'FAQs', icon: 'faqs' },
]
