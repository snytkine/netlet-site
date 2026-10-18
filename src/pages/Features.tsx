import { Link } from 'react-router-dom'
import { FEATURES } from '../data/content'
import { useDocumentTitle } from '../lib/useDocumentTitle'

/**
 * Features page: documents each headline capability of NetLet chat.
 */
export default function Features() {
  useDocumentTitle('Features')
  return (
    <div className="container page">
      <h1>Features</h1>
      <p className="lead">Everything NetLet chat does — and what it deliberately doesn’t need.</p>
      <div className="stack">
        {FEATURES.map((feature) => (
          <section key={feature.id} id={feature.id} className="feature-row">
            <h2>{feature.title}</h2>
            <p className="lead">{feature.summary}</p>
            <ul>
              {feature.details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <p>
        Ready to try it? <Link to="/download">Download NetLet</Link>.
      </p>
    </div>
  )
}
