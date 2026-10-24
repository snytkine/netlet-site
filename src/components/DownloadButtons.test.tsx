import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { RELEASES_DOWNLOAD_PREFIX, RELEASES_PAGE_URL } from '../config/site'
import DownloadButtons from './DownloadButtons'

/** Makes the release lookup succeed with the given assets. */
function stubRelease(assets: { name: string; size: number }[]) {
  const body = {
    tag_name: 'v0.2.0',
    assets: assets.map((a) => ({ ...a, browser_download_url: `${RELEASES_DOWNLOAD_PREFIX}v0.2.0/${a.name}` })),
  }
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(body) }))
}

describe('DownloadButtons', () => {
  it('links to the installers of the latest release with version, size and checksum', async () => {
    stubRelease([
      { name: 'netlet_0.2.0_universal.dmg', size: 20 * 1024 * 1024 },
      { name: 'netlet_0.2.0_universal.dmg.sha256', size: 90 },
      { name: 'netlet_0.2.0_x64-setup.exe', size: 5 * 1024 * 1024 },
    ])
    render(<DownloadButtons />)
    expect(screen.getByRole('link', { name: 'Download for Mac' })).toHaveAttribute('href', RELEASES_PAGE_URL)
    await vi.waitFor(() =>
      expect(screen.getByRole('link', { name: 'Download for Mac' })).toHaveAttribute(
        'href',
        `${RELEASES_DOWNLOAD_PREFIX}v0.2.0/netlet_0.2.0_universal.dmg`,
      ),
    )
    expect(screen.getByRole('link', { name: 'Download for Windows' })).toHaveAttribute(
      'href',
      `${RELEASES_DOWNLOAD_PREFIX}v0.2.0/netlet_0.2.0_x64-setup.exe`,
    )
    expect(screen.getByText(/Version 0\.2\.0 · 20\.0 MB/)).toBeInTheDocument()
    expect(screen.getByText(/Version 0\.2\.0 · 5\.0 MB/)).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'SHA-256' })).toHaveLength(1)
  })

  it('keeps the releases page link for a platform that has no installer yet', async () => {
    stubRelease([{ name: 'netlet_0.2.0_x64-setup.exe', size: 1024 }])
    render(<DownloadButtons />)
    await screen.findByText(/Version 0\.2\.0/)
    expect(screen.getByRole('link', { name: 'Download for Mac' })).toHaveAttribute('href', RELEASES_PAGE_URL)
  })

  it('falls back to the releases page and explains it when the lookup fails', async () => {
    render(<DownloadButtons showStatus />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(await screen.findByRole('status')).toHaveTextContent(/Could not check for the latest version/)
    expect(screen.getByRole('link', { name: 'Download for Windows' })).toHaveAttribute('href', RELEASES_PAGE_URL)
  })

  it('stays quiet about a failed lookup unless asked to show it', async () => {
    render(<DownloadButtons />)
    await vi.waitFor(() => expect(fetch).toHaveBeenCalled())
    await Promise.resolve()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
