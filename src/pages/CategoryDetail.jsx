/**
 * CategoryDetail.jsx
 *
 * WHY CHANGED:
 * - Used usePublications() which returned static JSON data.
 *   Publications shown under a category were from the JSON files,
 *   not the live database — any submitted/approved paper was invisible here.
 * - Now fetches directly from Supabase filtered by category.
 * - Added loading states and empty state handling.
 */

import { useEffect, useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { supabase } from '../lib/supabase'
import { STATIC_CATEGORIES } from '../hooks/usePublications'
import PublicationCard from '../components/publication/PublicationCard'
import { categorySlug } from '../utils/formatters'

export default function CategoryDetail() {
  const { slug } = useParams()
  const [publications, setPublications] = useState([])
  const [loading, setLoading]           = useState(true)

  const category = STATIC_CATEGORIES.find(c => categorySlug(c.label) === slug)

  useEffect(() => {
    if (!category) return
    async function fetchByCategory() {
      setLoading(true)
      // Supabase: filter by categories array containing the label
      const { data, error } = await supabase
        .from('publications')
        .select('*')
        .eq('status', 'published')
        .contains('categories', [category.label])
        .order('published_date', { ascending: false })

      if (!error) setPublications(data || [])
      setLoading(false)
    }
    fetchByCategory()
  }, [slug])

  if (!category) return <Navigate to="/categories" replace />

  return (
    <div className="bg-archive-50">

      {/* Breadcrumb */}
      <div className="bg-white border-b border-rule">
        <div className="archive-container py-3">
          <Link
            to="/categories"
            className="inline-flex items-center gap-1.5 text-caption text-ink-muted hover:text-ink no-underline"
          >
            <ArrowLeftIcon style={{ width: '13px', height: '13px' }} />
            All Categories
          </Link>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white border-b border-rule">
        <div className="archive-container py-8">
          <p className="meta-label mb-1">Subject Area</p>
          <h1 className="font-serif text-display text-ink mb-2">{category.label}</h1>
          <p className="text-caption text-ink-muted mb-2">{category.description}</p>
          {!loading && (
            <p className="text-label text-ink-faint">
              {publications.length} publication{publications.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      <div className="archive-container py-8">
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="pub-card p-6 animate-pulse">
                <div className="h-3 bg-archive-200 rounded w-24 mb-3" />
                <div className="h-5 bg-archive-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-archive-200 rounded w-1/2 mb-4" />
                <div className="h-16 bg-archive-200 rounded" />
              </div>
            ))}
          </div>
        ) : publications.length === 0 ? (
          <div className="bg-white border border-rule rounded-sm px-8 py-16 text-center">
            <p className="font-serif text-subheading text-ink-muted mb-2">
              No publications yet in this category
            </p>
            <p className="text-caption text-ink-faint mb-4">
              Be the first to submit a paper under {category.label}.
            </p>
            <Link to="/submit" className="text-caption no-underline" style={{ color: '#1a3a6b' }}>
              Submit a manuscript →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {publications.map(pub => (
              <PublicationCard key={pub.id} publication={pub} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
