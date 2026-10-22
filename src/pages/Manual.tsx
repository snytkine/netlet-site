import { Navigate, NavLink, useParams } from 'react-router-dom'
import AppMock from '../components/AppMock'
import { MANUAL } from '../data/content'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import NotFound from './NotFound'

/**
 * User manual. A side navigation lists the sub-sections; the selected one (`:slug`)
 * shows step-by-step instructions with a screenshot for each step.
 * `/manual` redirects to the first sub-section.
 */
export default function Manual() {
  const { slug } = useParams()
  const section = MANUAL.find((s) => s.slug === slug)
  useDocumentTitle(section ? `User manual – ${section.title}` : 'User manual')

  if (!slug) return <Navigate to={`/manual/${MANUAL[0].slug}`} replace />
  if (!section) return <NotFound />

  return (
    <div className="container page manual">
      <aside className="manual__nav">
        <h1>User manual</h1>
        <nav aria-label="Manual sections">
          {MANUAL.map((s) => (
            <NavLink key={s.slug} to={`/manual/${s.slug}`} className={({ isActive }) => (isActive ? 'active' : undefined)}>
              {s.title}
            </NavLink>
          ))}
        </nav>
      </aside>
      <article className="manual__body">
        <h2>{section.title}</h2>
        <p className="lead">{section.intro}</p>
        <ol className="steps">
          {section.steps.map((step) => (
            <li key={step.title} className="step">
              <h3>{step.title}</h3>
              <p>{step.text}</p>
              <figure>
                {step.screenshot ? (
                  <img src={step.screenshot} alt={step.alt} loading="lazy" />
                ) : (
                  <AppMock kind={step.mock} alt={step.alt} />
                )}
              </figure>
            </li>
          ))}
        </ol>
      </article>
    </div>
  )
}
