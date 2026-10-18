import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import DownloadButtons from '../components/DownloadButtons'
import UseCaseDiagram from '../components/UseCaseDiagram'
import { FEATURES, USE_CASES, WHY_NETLET } from '../data/content'
import { useDocumentTitle } from '../lib/useDocumentTitle'

/** The three.js scene is loaded lazily so the page text renders immediately. */
const HeroScene = lazy(() => import('../components/HeroScene'))

/**
 * Landing page: hero with 3D mesh, the main features, the reasons to use NetLet,
 * use-case previews and a download call to action.
 */
export default function Home() {
  useDocumentTitle()
  return (
    <>
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__text">
            <p className="eyebrow">Local network messaging</p>
            <h1>Chat with the people around you. Skip the Internet.</h1>
            <p className="lead">
              NetLet chat is a messaging app for everyone on the same local network. Your messages go straight from
              device to device — no servers, no accounts, no cloud.
            </p>
            <div className="hero__actions">
              <Link to="/download" className="button">
                Download NetLet
              </Link>
              <Link to="/manual" className="button button--secondary">
                Read the manual
              </Link>
            </div>
          </div>
          <div className="hero__visual">
            <Suspense fallback={<div className="hero-scene" aria-hidden="true" />}>
              <HeroScene />
            </Suspense>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="features-heading">
        <div className="container">
          <h2 id="features-heading">Everything you need, right on your network</h2>
          <div className="grid grid--4">
            {FEATURES.map((feature) => (
              <article key={feature.id} className="card">
                <h3>{feature.title}</h3>
                <p>{feature.summary}</p>
              </article>
            ))}
          </div>
          <p className="section__more">
            <Link to="/features">See all features →</Link>
          </p>
        </div>
      </section>

      <section className="section section--tint" aria-labelledby="why-heading">
        <div className="container container--narrow">
          <h2 id="why-heading">Why NetLet?</h2>
          <p className="lead">{WHY_NETLET.question}</p>
          <p>{WHY_NETLET.answer}</p>
          <p className="pullquote">{WHY_NETLET.tagline}</p>
        </div>
      </section>

      <section className="section" aria-labelledby="usecases-heading">
        <div className="container">
          <h2 id="usecases-heading">Made for wherever people gather</h2>
          <div className="grid grid--3">
            {USE_CASES.map((useCase) => (
              <article key={useCase.slug} className="card card--diagram">
                <UseCaseDiagram slug={useCase.slug} />
                <h3>{useCase.title}</h3>
                <p>{useCase.summary}</p>
                <Link to={`/use-cases/${useCase.slug}`}>Learn more →</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--cta" aria-labelledby="download-heading">
        <div className="container container--narrow center">
          <h2 id="download-heading">Get NetLet</h2>
          <p>Free for Mac and Windows.</p>
          <DownloadButtons />
        </div>
      </section>
    </>
  )
}
