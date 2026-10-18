import DownloadButtons from '../components/DownloadButtons'
import { useDocumentTitle } from '../lib/useDocumentTitle'

/**
 * Download page with a button for each supported platform (Mac and Windows).
 */
export default function Download() {
  useDocumentTitle('Download')
  return (
    <div className="container container--narrow page center">
      <h1>Download NetLet</h1>
      <p className="lead">Pick your platform. NetLet is free and needs no account.</p>
      <DownloadButtons />
    </div>
  )
}
