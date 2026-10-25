import Markdown from '../components/Markdown'
import { ALL_RELEASES_URL } from '../config/site'
import { formatReleaseDate } from '../lib/releaseNotes'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { useReleaseNotes } from '../lib/useReleaseNotes'

/**
 * Release notes page. It asks GitHub for the newest published releases and shows the notes of each
 * one, newest first. When GitHub cannot be reached it points to the releases page instead.
 */
export default function ReleaseNotesPage() {
  useDocumentTitle('Release notes')
  const { loading, releases } = useReleaseNotes()
  return (
    <div className="container container--narrow page">
      <h1>Release notes</h1>
      <p className="lead">What changed in each version of NetLet.</p>
      {loading && (
        <p className="download-note" role="status">
          Loading the release notes…
        </p>
      )}
      {!loading && !releases && (
        <p className="download-note" role="status">
          Could not load the release notes. You can read them on the{' '}
          <a href={ALL_RELEASES_URL} rel="noreferrer">
            releases page
          </a>
          .
        </p>
      )}
      {releases?.length === 0 && <p className="download-note">No version has been released yet.</p>}
      {releases?.map((release) => (
        <article key={release.version} className="release" aria-labelledby={`release-${release.version}`}>
          <h2 id={`release-${release.version}`}>Version {release.version}</h2>
          <p className="release__meta">
            {release.publishedAt && <>{formatReleaseDate(release.publishedAt)} · </>}
            <a href={release.url} rel="noreferrer">
              View on GitHub
            </a>
          </p>
          {release.body.trim() ? <Markdown source={release.body} /> : <p>No release notes were written for this version.</p>}
        </article>
      ))}
      <p className="release-more">
        <a href={ALL_RELEASES_URL} rel="noreferrer">
          Older releases
        </a>
      </p>
    </div>
  )
}
