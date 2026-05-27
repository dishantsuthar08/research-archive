import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Publications from './pages/Publications'
import PublicationDetail from './pages/PublicationDetail'
import Authors from './pages/Authors'
import Categories from './pages/Categories'
import CategoryDetail from './pages/CategoryDetail'
import About from './pages/About'
import Submit from './pages/Submit'
import Admin from './pages/Admin'

function NotFound() {
  return (
    <div className="archive-container py-24 text-center">
      <p className="font-serif text-display text-ink-muted mb-2">404</p>
      <p className="text-body text-ink-muted">Page not found.</p>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/"                          element={<Home />} />
          <Route path="/publications"              element={<Publications />} />
          <Route path="/publications/:slug"        element={<PublicationDetail />} />
          <Route path="/authors"                   element={<Authors />} />
          <Route path="/categories"                element={<Categories />} />
          <Route path="/categories/:slug"          element={<CategoryDetail />} />
          <Route path="/about"                     element={<About />} />
          <Route path="/submit" element={<Submit />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*"                          element={<NotFound />} />
          
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
