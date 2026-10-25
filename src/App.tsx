import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Download from './pages/Download'
import Faqs from './pages/Faqs'
import Features from './pages/Features'
import Home from './pages/Home'
import Manual from './pages/Manual'
import NotFound from './pages/NotFound'
import ReleaseNotesPage from './pages/ReleaseNotes'
import UseCases from './pages/UseCases'

/**
 * Application routes. All pages share the {@link Layout} chrome.
 */
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
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
      </Route>
    </Routes>
  )
}
