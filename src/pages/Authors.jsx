import { Link } from 'react-router-dom'
import { LinkIcon } from '@heroicons/react/24/outline'
import { usePublications } from '../hooks/usePublications'

export default function Authors() {
  const { authors, byId } = usePublications()

  return (
    <div className="bg-archive-50">

      {/* Header */}
      <div className="bg-white border-b border-rule">
        <div className="archive-container py-8">
          <p className="meta-label mb-1">Contributor Index</p>
          <h1 className="font-serif text-display text-ink mb-3">Authors</h1>
          <p className="text-caption text-ink-muted">
            Independent researchers contributing to the IndieResearch Archive.
          </p>
        </div>
      </div>

      <div className="archive-container py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {authors.map(author => {
            const pubs = (author.publicationIds || [])
              .map(id => byId?.[id])
              .filter(Boolean)

            return (
              <article key={author.id} className="pub-card p-6">

                {/* Name + ORCID */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h2 className="font-serif text-subheading font-medium text-ink">
                    {author.name}
                  </h2>
                  {author.orcid && (
                    <a
                      href={`https://orcid.org/${author.orcid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-label text-accent-DEFAULT
                                 hover:underline no-underline flex-shrink-0"
                    >
                      <LinkIcon style={{ width: '11px', height: '11px' }} />
                      ORCID
                    </a>
                  )}
                </div>

                <p className="text-label text-ink-faint mb-3">{author.affiliation}</p>

                {/* Bio */}
                {author.bio && (
                  <p className="text-caption text-ink-muted leading-relaxed mb-4">
                    {author.bio}
                  </p>
                )}

                {/* Research areas */}
                {author.researchAreas && author.researchAreas.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {author.researchAreas.map(area => (
                      <span key={area} className="keyword-pill">{area}</span>
                    ))}
                  </div>
                )}

                {/* Publications */}
                {pubs.length > 0 && (
                  <div className="pt-3 border-t border-rule">
                    <p className="meta-label mb-2">
                      Publications ({pubs.length})
                    </p>
                    <ul className="space-y-1">
                      {pubs.map(pub => (
                        <li key={pub.id}>
                          <Link
                            to={`/publications/${pub.slug}`}
                            className="text-caption text-accent-DEFAULT hover:underline no-underline leading-snug block"
                          >
                            {pub.shortTitle || pub.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}
