/**
 * Navbar.jsx
 *
 * PURPOSE:
 * Primary navigation. Updated to:
 * - Add "Submit" link to the public nav (authors need to find it easily)
 * - Remove /admin from the visible nav (accessed directly, not advertised)
 * - Fix all colour references to use inline style instead of text-accent-DEFAULT
 *   (Tailwind @apply doesn't support DEFAULT suffix in className strings)
 * - Sticky top header with mobile hamburger
 */

import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Bars3Icon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

const NAV_LINKS = [
  { to: '/',             label: 'Home',         end: true  },
  { to: '/publications', label: 'Publications',  end: false },
  { to: '/categories',   label: 'Categories',   end: false },
  { to: '/authors',      label: 'Authors',      end: false },
  { to: '/submit',       label: 'Submit',       end: false },
  { to: '/about',        label: 'About',        end: false },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="bg-white border-b border-rule sticky top-0 z-50">

      {/* Identity strip */}
      <div style={{ backgroundColor: '#1a3a6b' }}>
        <div className="archive-container flex items-center justify-between py-1.5">
          <span className="text-label uppercase tracking-widest" style={{ color: '#93afd4' }}>
            IndieResearch Archive
          </span>
          <span className="text-label" style={{ color: '#93afd4' }}>
            Open Access · CC BY 4.0
          </span>
        </div>
      </div>

      {/* Main nav row */}
      <div className="archive-container">
        <div className="flex items-center justify-between h-14 gap-8">

          {/* Wordmark */}
          <Link to="/" className="flex items-baseline gap-2 no-underline group">
            <span className="font-serif font-semibold text-[1.15rem] text-ink leading-none tracking-tight">
              IRA
            </span>
            <span className="text-rule font-light text-lg leading-none hidden sm:inline">|</span>
            <span className="font-sans text-caption font-medium text-ink-muted hidden sm:inline leading-none">
              IndieResearch Archive
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Primary navigation">
            {NAV_LINKS.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `nav-link text-[11px] ${isActive ? 'nav-link-active' : ''}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/publications"
              aria-label="Search publications"
              className="p-1.5 text-ink-muted hover:text-ink transition-colors"
            >
              <MagnifyingGlassIcon style={{ width: '18px', height: '18px' }} />
            </Link>
            <button
              className="md:hidden p-1.5 text-ink-muted hover:text-ink transition-colors"
              onClick={() => setMobileOpen(v => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen
                ? <XMarkIcon style={{ width: '20px', height: '20px' }} />
                : <Bars3Icon  style={{ width: '20px', height: '20px' }} />
              }
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-rule">
          <nav className="archive-container py-4 flex flex-col gap-1" aria-label="Mobile navigation">
            {NAV_LINKS.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block py-2.5 px-3 rounded-sm text-body font-medium transition-colors ${
                    isActive
                      ? 'text-white'
                      : 'text-ink-muted hover:text-ink hover:bg-archive-50'
                  }`
                }
                style={({ isActive }) => isActive ? { backgroundColor: '#1a3a6b' } : {}}
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
