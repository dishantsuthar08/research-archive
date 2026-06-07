/**
 * Categories.jsx
 *
 * WHY CHANGED:
 * - Previously used usePublications() which imported static JSON files.
 *   Category counts were computed from that static data → always showed
 *   counts that didn't match the live database.
 * - Now uses the updated usePublications hook that fetches from Supabase,
 *   so category counts are always accurate.
 * - Added loading skeleton so counts don't flash 0 before data loads.
 */

import { Link } from 'react-router-dom'
import { usePublications } from '../hooks/usePublications'
import { categorySlug } from '../utils/formatters'

function CategorySkeleton() {
  return (
    <div className="pub-card p-5 animate-pulse">
      <div className="flex justify-between mb-2">
        <div className="h-5 bg-archive-200 rounded w-32" />
        <div className="h-4 bg-archive-200 rounded w-16" />
      </div>
      <div className="h-3 bg-archive-200 rounded w-full mb-1" />
      <div className="h-3 bg-archive-200 rounded w-4/5" />
    </div>
  )
}

export default function Categories() {
  const { categories, loading } = usePublications()

  return (
    <div className="bg-archive-50">

      {/* Header */}
      <div className="bg-white border-b border-rule">
        <div className="archive-container py-8">
          <p className="meta-label mb-1">Subject Classification</p>
          <h1 className="font-serif text-display text-ink mb-3">Categories</h1>
          <p className="text-caption text-ink-muted">
            Publications are indexed under the following subject categories.
            Counts reflect published papers in the live archive.
          </p>
        </div>
      </div>

      <div className="archive-container py-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => <CategorySkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(cat => (
              <Link
                key={cat.id}
                to={`/categories/${categorySlug(cat.label)}`}
                className="pub-card p-5 block no-underline group"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h2 className="font-serif text-subheading font-medium text-ink transition-colors group-hover:underline"
                    style={{}}
                    onMouseEnter={e => e.currentTarget.closest('a').style.setProperty('--hover', '1')}
                  >
                    {cat.label}
                  </h2>
                  <span className="pub-type-badge bg-archive-100 text-ink-muted border-rule flex-shrink-0 whitespace-nowrap">
                    {cat.count} {cat.count === 1 ? 'paper' : 'papers'}
                  </span>
                </div>
                <p className="text-caption text-ink-muted leading-relaxed">
                  {cat.description}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
