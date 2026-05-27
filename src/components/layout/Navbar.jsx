import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Bars3Icon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

const NAV_LINKS = [
  { to: '/',             label: 'Home',          end: true  },
  { to: '/publications', label: 'Publications',  end: false },
  { to: '/categories',   label: 'Categories',    end: false },
  { to: '/authors',      label: 'Authors',       end: false },
  { to: '/submit',       label: 'Submit Paper',  end: false },
  { to: '/about',        label: 'About',         end: false },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  return (
    <header className="bg-white border-b border-rule sticky top-0 z-50">
      {/* Top strip — archive identity */}
      <div className="bg-accent-DEFAULT text-white">
        <div className="archive-container flex items-center justify-between py-1.5">
          <span className="text-label uppercase tracking-widest text-blue-200">
            IndieResearch Archive
          </span>
          <span className="text-label text-blue-200">
            Open Access · CC BY 4.0
          </span>
        </div>
      </div>

      {/* Main navigation row */}
      <div className="archive-container">
        <div className="flex items-center justify-between h-14 gap-8">

          {/* Wordmark */}
          <Link
            to="/"
            className="flex items-baseline gap-2 no-underline hover:no-underline group"
          >
            <span className="font-serif font-semibold text-[1.15rem] text-ink leading-none tracking-tight group-hover:text-accent-DEFAULT transition-colors">
              IRA
            </span>
            <span className="text-rule font-sans font-light text-lg leading-none hidden sm:inline">|</span>
            <span className="font-sans text-caption font-medium text-ink-muted hidden sm:inline leading-none">
              IndieResearch Archive
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7" aria-label="Primary">
            {NAV_LINKS.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'nav-link-active text-ink' : ''}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Search icon (routes to publications with focus) */}
          <div className="flex items-center gap-3">
            <Link
              to="/publications"
              aria-label="Search publications"
              className="p-1.5 text-ink-muted hover:text-ink transition-colors"
            >
              <MagnifyingGlassIcon className="w-4.5 h-4.5" style={{ width: '18px', height: '18px' }} />
            </Link>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-1.5 text-ink-muted hover:text-ink transition-colors"
              onClick={() => setMobileOpen(v => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen
                ? <XMarkIcon style={{ width: '20px', height: '20px' }} />
                : <Bars3Icon style={{ width: '20px', height: '20px' }} />
              }
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-rule">
          <nav className="archive-container py-4 flex flex-col gap-1" aria-label="Mobile">
            {NAV_LINKS.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block py-2 px-3 rounded-sm text-body font-medium transition-colors ${
                    isActive
                      ? 'bg-accent-light text-accent-DEFAULT'
                      : 'text-ink-muted hover:text-ink hover:bg-archive-50'
                  }`
                }
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
