import { Navigate, NavLink, useParams } from 'react-router-dom'
import UseCaseDiagram from '../components/UseCaseDiagram'
import { USE_CASES } from '../data/content'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import NotFound from './NotFound'

/**
 * Use cases page. Each use case (home, office, remote events) is its own view,
 * selected by the `:slug` route parameter. `/use-cases` redirects to the first one.
 */
export default function UseCases() {
  const { slug } = useParams()
  const useCase = USE_CASES.find((u) => u.slug === slug)
  useDocumentTitle(useCase ? `Use cases – ${useCase.title}` : 'Use cases')

  if (!slug) return <Navigate to={`/use-cases/${USE_CASES[0].slug}`} replace />
  if (!useCase) return <NotFound />

  return (
    <div className="container page">
      <h1>Use cases</h1>
      <nav className="tabs" aria-label="Use cases">
        {USE_CASES.map((u) => (
          <NavLink key={u.slug} to={`/use-cases/${u.slug}`} className={({ isActive }) => (isActive ? 'active' : undefined)}>
            {u.title}
          </NavLink>
        ))}
      </nav>
      <section className="split" aria-labelledby="usecase-title">
        <div>
          <h2 id="usecase-title">{useCase.title}</h2>
          <p className="lead">{useCase.summary}</p>
          {useCase.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <ul className="checklist">
            {useCase.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
        <figure className="split__figure">
          <UseCaseDiagram slug={useCase.slug} />
        </figure>
      </section>
    </div>
  )
}
