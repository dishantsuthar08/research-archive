/**
 * App.jsx
 *
 * PURPOSE:
 * Root application component with React Router v6 routing.
 *
 * Route structure:
 *   /                     → Home
 *   /publications          → Publication list
 *   /publications/:slug    → Publication detail
 *   /authors               → Author index
 *   /categories            → Category index
 *   /categories/:slug      → Category filtered list
 *   /submit                → Manuscript submission form
 *   /about                 → About page
 *   /admin                 → Editorial CMS (auth-gated, no public nav/footer)
 *   *                      → 404
 *
 * Admin is rendered INSIDE Layout so it can use the same CSS context,
 * but Layout.jsx hides Navbar + Footer when pathname starts with /admin.
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout           from './components/layout/Layout'
import Home             from './pages/Home'
import Publications     from './pages/Publications'
import PublicationDetail from './pages/PublicationDetail'
import Authors          from './pages/Authors'
import Categories       from './pages/Categories'
import CategoryDetail   from './pages/CategoryDetail'
import Submit           from './pages/Submit'
import About            from './pages/About'
import Admin            from './pages/Admin'

function NotFound() {
  return (
    <div className="archive-container py-28 text-center">
      <p className="font-serif text-[3rem] text-archive-300 leading-none mb-3">404</p>
      <p className="font-serif text-subheading text-ink-muted mb-6">Page not found</p>
      <a href="/" className="text-caption no-underline" style={{ color: '#1a3a6b' }}>
        ← Return to homepage
      </a>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/"                       element={<Home />}             />
          <Route path="/publications"           element={<Publications />}     />
          <Route path="/publications/:slug"     element={<PublicationDetail />} />
          <Route path="/authors"                element={<Authors />}          />
          <Route path="/categories"             element={<Categories />}       />
          <Route path="/categories/:slug"       element={<CategoryDetail />}   />
          <Route path="/submit"                 element={<Submit />}           />
          <Route path="/about"                  element={<About />}            />
          <Route path="/admin"                  element={<Admin />}            />
          <Route path="*"                       element={<NotFound />}         />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
