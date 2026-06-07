/**
 * Authors.jsx
 *
 * WHY CHANGED:
 * - The old version imported usePublications (which read static JSON)
 *   AND had its own Supabase fetch — creating a confusing hybrid that
 *   showed different data depending on which ran first.
 * - Author cards had no unique ID anchors, so linking /authors#name-slug
 *   from PublicationDetail didn't work.
 * - researchAreas and bio fields came from the static JSON authors.json
 *   file, not from any Supabase data — always blank for real submissions.
 * - No author publication count shown in header.
 * - No alphabet index for navigation on large author lists.
 *
 * WHAT IS NOW IMPLEMENTED:
 * - Single clean Supabase fetch from publications table, authors aggregated
 *   from JSONB (matching usePublications hook logic).
 * - Each author card has id={nameToSlug(name)} anchor for deep-linking.
 * - Publication list with links per author card.
 * - Alphabet jump index.
 * - Graceful empty/loading states.
 */

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function nameToSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function AuthorCard({ author }) {
  const slug = nameToSlug(author.name)
  const initial = author.name.trim()[0].toUpperCase()

  return (
    <article
      id={slug}
      className="pub-card p-6 scroll-mt-24"
    >
      {/* Name row */}
      <div className="flex items-start gap-4 mb-3">
        {/* Avatar — initial circle */}
        <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center
                        font-serif font-semibold text-white text-subheading"
          style={{ backgroundColor: '#1a3a6b' }}
        >
          {initial}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <h2 className="font-serif text-subheading font-semibold text-ink leading-snug">
              {author.name}
            </h2>
            {author.orcid && (
              <a
                href={`https://orcid.org/${author.orcid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-label flex-shrink-0 no-underline
                           px-2 py-0.5 border border-rule rounded-sm bg-archive-50 hover:bg-archive-100 transition-colors"
                style={{ color: '#1a3a6b' }}
              >
                ORCID ↗
              </a>
            )}
          </div>
          {author.affiliation && (
            <p className="text-label text-ink-faint mt-0.5">{author.affiliation}</p>
          )}
          {author.email && (
            <a
              href={`mailto:${author.email}`}
              className="text-label text-ink-faint hover:text-ink no-underline block mt-0.5"
            >
              {author.email}
            </a>
          )}
        </div>
      </div>

      {/* Publication list */}
      {author.publications.length > 0 && (
        <div className="mt-4 pt-3 border-t border-rule">
          <p className="meta-label mb-2">
            Publications ({author.publications.length})
          </p>
          <ul className="space-y-2">
            {author.publications.map(pub => (
              <li key={pub.id} className="flex items-start gap-2">
                <span className="text-label text-ink-faint flex-shrink-0 mt-0.5">
                  {pub.year || new Date(pub.published_date).getFullYear()}
                </span>
                <Link
                  to={`/publications/${pub.slug}`}
                  className="text-caption leading-snug no-underline"
                  style={{ color: '#1a3a6b' }}
                >
                  {pub.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  )
}

export default function Authors() {
  const [authors, setAuthors]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [jumpLetter, setJumpLetter] = useState(null)

  useEffect(() => {
    async function fetchAuthors() {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('publications')
        .select('id, title, slug, year, published_date, authors')
        .eq('status', 'published')

      if (err) { setError(err.message); setLoading(false); return }

      // Aggregate authors from JSONB
      const authorMap = {}
      ;(data || []).forEach(pub => {
        ;(pub.authors || []).forEach(a => {
          const key = a.email || a.name
          if (!authorMap[key]) {
            authorMap[key] = { ...a, publications: [] }
          }
          authorMap[key].publications.push(pub)
        })
      })

      // Sort alphabetically by last name
      const sorted = Object.values(authorMap).sort((a, b) => {
        const aLast = a.name.trim().split(' ').pop().toLowerCase()
        const bLast = b.name.trim().split(' ').pop().toLowerCase()
        return aLast.localeCompare(bLast)
      })

      setAuthors(sorted)
      setLoading(false)
    }
    fetchAuthors()
  }, [])

  // Unique initials for jump index
  const initials = [...new Set(authors.map(a => a.name.trim()[0].toUpperCase()))].sort()

  const visibleAuthors = jumpLetter
    ? authors.filter(a => a.name.trim()[0].toUpperCase() === jumpLetter)
    : authors

  return (
    <div className="bg-archive-50">

      {/* Header */}
      <div className="bg-white border-b border-rule">
        <div className="archive-container py-8">
          <p className="meta-label mb-1">Contributor Index</p>
          <h1 className="font-serif text-display text-ink mb-3">Authors</h1>
          <p className="text-caption text-ink-muted">
            Independent researchers who have contributed to the IndieResearch Archive.
            {!loading && ` ${authors.length} author${authors.length !== 1 ? 's' : ''} listed.`}
          </p>
        </div>
      </div>

      <div className="archive-container py-8">

        {/* Alphabet index */}
        {!loading && initials.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6 pb-5 border-b border-rule">
            <button
              onClick={() => setJumpLetter(null)}
              className={`px-2.5 py-1 text-label font-medium rounded-sm border transition-colors ${
                !jumpLetter
                  ? 'text-white border-transparent'
                  : 'border-rule bg-white text-ink-muted hover:bg-archive-50'
              }`}
              style={!jumpLetter ? { backgroundColor: '#1a3a6b' } : {}}
            >
              All
            </button>
            {initials.map(letter => (
              <button
                key={letter}
                onClick={() => setJumpLetter(letter === jumpLetter ? null : letter)}
                className={`px-2.5 py-1 text-label font-medium rounded-sm border transition-colors ${
                  jumpLetter === letter
                    ? 'text-white border-transparent'
                    : 'border-rule bg-white text-ink-muted hover:bg-archive-50'
                }`}
                style={jumpLetter === letter ? { backgroundColor: '#1a3a6b' } : {}}
              >
                {letter}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="pub-card p-6 animate-pulse">
                <div className="flex gap-4 mb-3">
                  <div className="w-10 h-10 rounded-full bg-archive-200 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-archive-200 rounded w-2/3" />
                    <div className="h-3 bg-archive-200 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-16 bg-archive-200 rounded" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-sm px-5 py-4">
            <p className="text-caption text-red-700">Failed to load authors: {error}</p>
          </div>
        ) : visibleAuthors.length === 0 ? (
          <div className="bg-white border border-rule rounded-sm px-8 py-16 text-center">
            <p className="font-serif text-subheading text-ink-muted mb-2">No authors found</p>
            <p className="text-caption text-ink-faint">
              Authors will appear here once papers are published.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visibleAuthors.map(author => (
              <AuthorCard key={author.email || author.name} author={author} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
