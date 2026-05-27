import { Link } from 'react-router-dom'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-white border-t border-rule mt-auto">
      <div className="archive-container py-10">

        {/* Top row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-rule">

          {/* Identity */}
          <div>
            <p className="font-serif font-semibold text-subheading text-ink mb-2">
              IndieResearch Archive
            </p>
            <p className="text-caption text-ink-muted leading-relaxed">
              An open-access repository for independent research in computer science,
              engineering, and related disciplines.
            </p>
            <p className="text-label text-ink-faint mt-3 uppercase tracking-wider">
              ISSN: 0000-0001 (Online)
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="meta-label mb-3">Browse</p>
            <ul className="space-y-1.5">
              {[
                { to: '/',             label: 'Home'         },
                { to: '/publications', label: 'All Publications' },
                { to: '/categories',   label: 'Categories'   },
                { to: '/authors',      label: 'Authors'      },
                { to: '/about',        label: 'About'        },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-caption text-ink-muted hover:text-accent-DEFAULT no-underline"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <p className="meta-label mb-3">Policies</p>
            <ul className="space-y-1.5">
              {[
                'Open Access Policy',
                'Submission Guidelines',
                'Peer Review Process',
                'Author Rights',
                'Ethical Standards',
              ].map(label => (
                <li key={label}>
                  <span className="text-caption text-ink-muted cursor-default">
                    {label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="pt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-caption text-ink-faint">
            © {year} IndieResearch Archive. All content published under{' '}
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-muted underline hover:text-accent-DEFAULT"
            >
              CC BY 4.0
            </a>{' '}
            unless otherwise stated.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-caption text-ink-faint">
              Powered by independent scholarship
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
