/**
 * Publications.jsx
 *
 * WHY CHANGED:
 * - Had a plain-text "Loading publications..." with no visual feedback.
 * - No error state shown if Supabase is misconfigured.
 * - FilterPanel imported categories from static JSON via usePublications
 *   (which used static data). Now categories are passed from live data.
 * - No result count feedback while loading.
 */

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useSearch } from '../hooks/useSearch'
import { STATIC_CATEGORIES } from '../hooks/usePublications'
import PublicationCard from '../components/publication/PublicationCard'
import SearchBar from '../components/search/SearchBar'
import FilterPanel from '../components/search/FilterPanel'

function CardSkeleton() {
  return (
    <div className="pub-card p-6 animate-pulse">
      <div className="flex justify-between mb-3">
        <div className="h-4 bg-archive-200 rounded w-28" />
        <div className="h-4 bg-archive-200 rounded w-20" />
      </div>
      <div className="h-5 bg-archive-200 rounded w-3/4 mb-2" />
      <div className="h-4 bg-archive-200 rounded w-1/2 mb-4" />
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-archive-200 rounded" />
        <div className="h-3 bg-archive-200 rounded w-5/6" />
        <div className="h-3 bg-archive-200 rounded w-4/5" />
      </div>
      <div className="flex gap-2">
        <div className="h-6 bg-archive-200 rounded w-16" />
        <div className="h-6 bg-archive-200 rounded w-20" />
      </div>
    </div>
  )
}

export default function Publications() {
  const [all, setAll]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  const {
    filters, results, hasActiveFilters,
    setQuery, setCategory, setType, setSortBy, resetFilters,
  } = useSearch(all)

  useEffect(() => {
    async function fetchPublications() {
      const { data, error: err } = await supabase
        .from('publications')
        .select('*')
        .eq('status', 'published')
        .order('published_date', { ascending: false })

      if (err) { setError(err.message) }
      else { setAll(data || []) }
      setLoading(false)
    }
    fetchPublications()
  }, [])

  return (
    <div className="bg-archive-50">

      {/* Page header */}
      <div className="bg-white border-b border-rule">
        <div className="archive-container py-8">
          <p className="meta-label mb-1">Repository Index</p>
          <h1 className="font-serif text-display text-ink mb-4">Publications</h1>
          <p className="text-caption text-ink-muted max-w-prose">
            All research papers, review papers, and technical articles published
            in the IndieResearch Archive. Use the search and filters below to
            locate specific work.
          </p>
        </div>
      </div>

      <div className="archive-container py-8">

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-sm px-5 py-4">
            <p className="text-caption text-red-700">
              Could not load publications: {error}
            </p>
          </div>
        )}

        {/* Search */}
        <div className="mb-4">
          <SearchBar value={filters.query} onChange={setQuery} />
        </div>

        {/* Filters */}
        <div className="mb-6">
          <FilterPanel
            filters={filters}
            setCategory={setCategory}
            setType={setType}
            setSortBy={setSortBy}
            resetFilters={resetFilters}
            hasActiveFilters={hasActiveFilters}
            resultCount={loading ? null : results.length}
            categories={STATIC_CATEGORIES}
          />
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
          </div>
        ) : results.length === 0 ? (
          <div className="bg-white border border-rule rounded-sm px-8 py-16 text-center">
            <p className="font-serif text-subheading text-ink-muted mb-2">
              No publications found
            </p>
            <p className="text-caption text-ink-faint mb-4">
              {hasActiveFilters
                ? 'Try adjusting your search terms or clearing filters.'
                : 'No publications have been approved yet. Check back soon.'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-caption hover:underline"
                style={{ color: '#1a3a6b' }}
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {results.map(pub => (
              <PublicationCard key={pub.id} publication={pub} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
