import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import PageTransition from './components/PageTransition'
import Download from './pages/Download'
import Faqs from './pages/Faqs'
import Features from './pages/Features'
import Home from './pages/Home'
import Manual from './pages/Manual'
import NotFound from './pages/NotFound'
import ReleaseNotesPage from './pages/ReleaseNotes'
import UseCases from './pages/UseCases'

/**
 * Application routes. All pages share the {@link Layout} chrome and change with a smooth
 * {@link PageTransition}, which decides which location is on screen.
 */
export default function App() {
  return (
    <Layout>
      <PageTransition>
        {(location) => (
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/features" element={<Features />} />
            <Route path="/use-cases" element={<UseCases />} />
            <Route path="/use-cases/:slug" element={<UseCases />} />
            <Route path="/manual" element={<Manual />} />
            <Route path="/manual/:slug" element={<Manual />} />
            <Route path="/faqs" element={<Faqs />} />
            <Route path="/download" element={<Download />} />
            <Route path="/release-notes" element={<ReleaseNotesPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        )}
      </PageTransition>
    </Layout>
  )
}
