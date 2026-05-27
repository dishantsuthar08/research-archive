import { useParams, Link, Navigate } from 'react-router-dom'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { usePublications } from '../hooks/usePublications'
import PublicationCard from '../components/publication/PublicationCard'
import { categorySlug } from '../utils/formatters'

export default function CategoryDetail() {
  const { slug } = useParams()
  const { categories, all: publications } = usePublications()

  const category = categories.find(c => categorySlug(c.label) === slug)
  if (!category) return <Navigate to="/categories" replace />

  const pubs = publications.filter(pub =>
    (pub.categories || []).some(c => categorySlug(c) === slug)
  )

  return (
    <div className="bg-archive-50">
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

      <div className="bg-white border-b border-rule">
        <div className="archive-container py-8">
          <p className="meta-label mb-1">Subject Area</p>
          <h1 className="font-serif text-display text-ink mb-2">{category.label}</h1>
          <p className="text-caption text-ink-muted mb-1">{category.description}</p>
          <p className="text-label text-ink-faint">
            {pubs.length} publication{pubs.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="archive-container py-8">
        {pubs.length === 0 ? (
          <p className="text-caption text-ink-muted text-center py-12">
            No publications in this category yet.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {pubs.map(pub => (
              <PublicationCard key={pub.id} publication={pub} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
