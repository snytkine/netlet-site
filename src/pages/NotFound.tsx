import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../lib/useDocumentTitle'

/**
 * Shown for any route that does not exist.
 */
export default function NotFound() {
  useDocumentTitle('Page not found')
  return (
    <div className="container container--narrow page center">
      <h1>404 – Page not found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link to="/" className="button">
        Back to home
      </Link>
    </div>
  )
}
