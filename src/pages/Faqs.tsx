import { useDocumentTitle } from '../lib/useDocumentTitle'

/**
 * FAQs page. Intentionally empty for now — questions will be added later.
 */
export default function Faqs() {
  useDocumentTitle('FAQs')
  return (
    <div className="container page">
      <h1>FAQs</h1>
      <p className="lead">Frequently asked questions will appear here soon.</p>
    </div>
  )
}
