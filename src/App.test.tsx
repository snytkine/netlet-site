import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import App from './App'
import { MANUAL, USE_CASES } from './data/content'

/** Renders the app at the given path. */
function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

describe('routing', () => {
  it('renders the home page with hero, features and use cases', async () => {
    renderAt('/')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Skip the Internet/)
    expect(screen.getByRole('heading', { name: /Why NetLet/ })).toBeInTheDocument()
    expect(screen.getByText(/When the Internet drops, NetLet still works/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Get NetLet/ })).toBeInTheDocument()
    expect(await screen.findAllByRole('link', { name: /Learn more/ })).toHaveLength(3)
  })

  it('renders the features page', () => {
    renderAt('/features')
    expect(screen.getByRole('heading', { level: 1, name: 'Features' })).toBeInTheDocument()
    expect(screen.getByText('Works without the Internet')).toBeInTheDocument()
  })

  it('redirects /use-cases to the first use case', () => {
    renderAt('/use-cases')
    expect(screen.getByRole('heading', { level: 2, name: USE_CASES[0].title })).toBeInTheDocument()
  })

  it.each(USE_CASES)('renders the $slug use-case view', (useCase) => {
    renderAt(`/use-cases/${useCase.slug}`)
    expect(screen.getByRole('heading', { level: 2, name: useCase.title })).toBeInTheDocument()
    expect(within(screen.getByRole('main')).getByRole('img')).toBeInTheDocument()
    expect(document.title).toContain(useCase.title)
  })

  it('shows 404 for an unknown use case or manual section', () => {
    renderAt('/use-cases/nope')
    expect(screen.getByRole('heading', { name: /404/ })).toBeInTheDocument()
  })

  it('redirects /manual to the first section', () => {
    renderAt('/manual')
    expect(screen.getByRole('heading', { level: 2, name: MANUAL[0].title })).toBeInTheDocument()
  })

  it.each(MANUAL)('renders the manual section "$title" with a screenshot per step', (section) => {
    renderAt(`/manual/${section.slug}`)
    expect(screen.getByRole('heading', { level: 2, name: section.title })).toBeInTheDocument()
    const steps = screen.getAllByRole('listitem').filter((li) => li.classList.contains('step'))
    expect(steps).toHaveLength(section.steps.length)
    for (const step of steps) expect(within(step).getByRole('img')).toBeInTheDocument()
  })

  it('lists all seven manual sub-sections', () => {
    renderAt('/manual/hosting-chats')
    const nav = screen.getByRole('navigation', { name: 'Manual sections' })
    expect(within(nav).getAllByRole('link').map((a) => a.textContent)).toEqual([
      'Hosting chats',
      'Joining chat',
      'Chat topology',
      'Chat history',
      'Chat settings',
      'Chat security',
      'Chat privacy',
    ])
  })

  it('uses a real screenshot image when one is configured', () => {
    const original = MANUAL[0].steps[0].screenshot
    MANUAL[0].steps[0].screenshot = '/screenshots/host.png'
    renderAt('/manual/hosting-chats')
    expect(screen.getByAltText(MANUAL[0].steps[0].alt)).toHaveAttribute('src', '/screenshots/host.png')
    MANUAL[0].steps[0].screenshot = original
  })

  it('renders the empty FAQs page', () => {
    renderAt('/faqs')
    expect(screen.getByRole('heading', { level: 1, name: 'FAQs' })).toBeInTheDocument()
  })

  it('renders the download page with Mac and Windows buttons', () => {
    renderAt('/download')
    expect(screen.getByRole('link', { name: 'Download for Mac' })).toHaveAttribute('href')
    expect(screen.getByRole('link', { name: 'Download for Windows' })).toHaveAttribute('href')
  })

  it('lists the visitor’s detected platform first', () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')
    renderAt('/download')
    const links = screen.getAllByRole('link', { name: /Download for/ })
    expect(links[0]).toHaveTextContent('Windows')
    vi.restoreAllMocks()
  })

  it('renders 404 for unknown routes', () => {
    renderAt('/does-not-exist')
    expect(screen.getByRole('heading', { name: /404/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to home' })).toBeInTheDocument()
  })
})

describe('navigation', () => {
  it('has the required sections in the header', () => {
    renderAt('/')
    const nav = screen.getByRole('navigation', { name: 'Primary' })
    const labels = within(nav).getAllByRole('link').map((a) => a.textContent)
    expect(labels).toEqual(['Features', 'Use Cases', 'User Manual', 'FAQs', 'Download'])
  })

  it('navigates between pages and scrolls to top', async () => {
    const user = userEvent.setup()
    renderAt('/')
    await user.click(within(screen.getByRole('navigation', { name: 'Primary' })).getByText('FAQs'))
    expect(screen.getByRole('heading', { level: 1, name: 'FAQs' })).toBeInTheDocument()
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0)
  })

  it('toggles the mobile menu and closes it after navigating', async () => {
    const user = userEvent.setup()
    renderAt('/')
    const toggle = screen.getByRole('button', { name: /open menu/i })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await user.click(toggle)
    expect(screen.getByRole('button', { name: /close menu/i })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('navigation', { name: 'Primary' })).toHaveClass('nav--open')
    await user.click(within(screen.getByRole('navigation', { name: 'Primary' })).getByText('Features'))
    expect(screen.getByRole('navigation', { name: 'Primary' })).not.toHaveClass('nav--open')
  })

  it('includes a skip link and a footer', () => {
    renderAt('/')
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute('href', '#main')
    expect(screen.getByRole('contentinfo')).toHaveTextContent(/NetLet chat/)
  })
})
