import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { ALL_RELEASES_URL } from '../config/site'
import ReleaseNotesPage from './ReleaseNotes'

/** Makes the GitHub lookup answer with the given JSON. */
function answerWith(body: unknown) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(body) }))
}

/** Renders the page. */
function renderPage() {
  return render(
    <MemoryRouter>
      <ReleaseNotesPage />
    </MemoryRouter>,
  )
}

describe('ReleaseNotesPage', () => {
  it('shows a loading note first', () => {
    answerWith([])
    renderPage()
    expect(screen.getByText(/Loading the release notes/)).toBeInTheDocument()
  })

  it('shows each release with its date, notes and a link to GitHub, newest first', async () => {
    answerWith([
      {
        tag_name: 'v0.3.0',
        published_at: '2026-11-02T10:00:00Z',
        html_url: `${ALL_RELEASES_URL}/tag/v0.3.0`,
        body: '### Features\n\n* a **new** thing',
      },
      { tag_name: 'v0.2.0', published_at: '2026-10-25T10:00:00Z', body: '' },
    ])
    renderPage()
    const headings = await screen.findAllByRole('heading', { level: 2 })
    expect(headings.map((h) => h.textContent)).toEqual(['Version 0.3.0', 'Version 0.2.0'])
    expect(screen.getByText(/November 2, 2026/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Features' })).toBeInTheDocument()
    expect(screen.getByText('new').tagName).toBe('STRONG')
    expect(screen.getAllByRole('link', { name: 'View on GitHub' })[0]).toHaveAttribute('href', `${ALL_RELEASES_URL}/tag/v0.3.0`)
    expect(screen.getByText('No release notes were written for this version.')).toBeInTheDocument()
  })

  it('leaves out the date when the release has none', async () => {
    answerWith([{ tag_name: 'v0.2.0', body: 'text' }])
    renderPage()
    expect(await screen.findByRole('link', { name: 'View on GitHub' })).toBeInTheDocument()
    expect(screen.queryByText(/ · /)).toBeNull()
  })

  it('says so when nothing is released yet', async () => {
    answerWith([])
    renderPage()
    expect(await screen.findByText('No version has been released yet.')).toBeInTheDocument()
  })

  it('points to the releases page when GitHub cannot be reached', async () => {
    renderPage()
    expect(await screen.findByText(/Could not load the release notes/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'releases page' })).toHaveAttribute('href', ALL_RELEASES_URL)
  })

  it('always links to the older releases on GitHub', async () => {
    answerWith([])
    renderPage()
    expect(await screen.findByRole('link', { name: 'Older releases' })).toHaveAttribute('href', ALL_RELEASES_URL)
  })
})
