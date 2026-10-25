import { Link } from 'react-router-dom'
import DownloadButtons from '../components/DownloadButtons'
import { ALL_RELEASES_URL } from '../config/site'
import { useDocumentTitle } from '../lib/useDocumentTitle'

/**
 * Download page with a button for each supported platform (Mac and Windows), notes for first
 * launch on each system, and a privacy statement. Small links under the buttons lead to the release
 * notes page and to the older releases on GitHub.
 */
export default function Download() {
  useDocumentTitle('Download')
  return (
    <div className="container container--narrow page center">
      <h1>Download NetLet</h1>
      <p className="lead">Pick your platform. NetLet is free and needs no account.</p>
      <DownloadButtons showStatus />
      <p className="download-more">
        <Link to="/release-notes">Release notes</Link>
        <span aria-hidden="true"> · </span>
        <a href={ALL_RELEASES_URL} rel="noreferrer">
          Older releases
        </a>
      </p>
      <section className="download-notes" aria-labelledby="download-notes-heading">
        <h2 id="download-notes-heading">Before you install</h2>
        <ul>
          <li>
            <strong>Mac:</strong> open the downloaded <code>.dmg</code> and drag NetLet to Applications. The app is signed
            and notarized by Apple. The first time you start it, macOS asks to allow access to your local network:
            choose Allow, or NetLet cannot find other people on your network.
          </li>
          <li>
            <strong>Windows:</strong> run the downloaded <code>-setup.exe</code>. The installer is not code-signed yet, so
            Windows SmartScreen may say it protected your PC. Choose <em>More info</em>, then <em>Run anyway</em>. Allow
            NetLet through the firewall on private networks when Windows asks.
          </li>
          <li>
            <strong>Check your download:</strong> each file has a SHA-256 checksum next to it. Compare it with{' '}
            <code>shasum -a 256 &lt;file&gt;</code> on a Mac, or <code>Get-FileHash &lt;file&gt;</code> in PowerShell on
            Windows.
          </li>
        </ul>
        <h2>Privacy</h2>
        <p>
          NetLet only talks to computers on your own local network. It makes no connections to the Internet and collects
          no data. The app does not check for updates: to update, download the new version from this page. This page
          asks GitHub for the latest version number when it opens, and the release notes page asks GitHub for the notes.
        </p>
      </section>
    </div>
  )
}
