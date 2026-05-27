import { Link } from 'react-router-dom'
import { usePublications } from '../hooks/usePublications'
import { categorySlug } from '../utils/formatters'

export default function Categories() {
  const { categories, all: publications } = usePublications()

  // Count publications per category
  const countByCategory = {}
  publications.forEach(pub => {
    (pub.categories || []).forEach(cat => {
      countByCategory[cat] = (countByCategory[cat] || 0) + 1
    })
  })

  return (
    <div className="bg-archive-50">

      {/* Header */}
      <div className="bg-white border-b border-rule">
        <div className="archive-container py-8">
          <p className="meta-label mb-1">Subject Classification</p>
          <h1 className="font-serif text-display text-ink mb-3">Categories</h1>
          <p className="text-caption text-ink-muted">
            Publications are indexed under the following subject categories.
          </p>
        </div>
      </div>

      <div className="archive-container py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(cat => {
            const count = countByCategory[cat.label] || 0
            return (
              <Link
                key={cat.id}
                to={`/categories/${categorySlug(cat.label)}`}
                className="pub-card p-5 block no-underline group"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h2 className="font-serif text-subheading font-medium text-ink group-hover:text-accent-DEFAULT transition-colors">
                    {cat.label}
                  </h2>
                  <span className="pub-type-badge bg-archive-100 text-ink-muted border-rule flex-shrink-0">
                    {count} {count === 1 ? 'paper' : 'papers'}
                  </span>
                </div>
                <p className="text-caption text-ink-muted leading-relaxed">
                  {cat.description}
                </p>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
