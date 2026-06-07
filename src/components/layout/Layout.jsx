/**
 * Layout.jsx
 * PURPOSE: Root page wrapper. Hides the public footer on /admin since
 * the admin panel has its own full-screen layout.
 */

import { useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout({ children }) {
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith('/admin')

  return (
    <div className="min-h-screen flex flex-col bg-archive-50">
      {!isAdmin && <Navbar />}
      <main className="flex-1">
        {children}
      </main>
      {!isAdmin && <Footer />}
    </div>
  )
}
