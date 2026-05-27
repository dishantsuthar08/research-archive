import { Link } from 'react-router-dom'
import { ArrowDownTrayIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import PublicationBadge from './PublicationBadge'
import DOIBadge from './DOIBadge'
import CategoryTag from './CategoryTag'
import { formatAuthors, truncateChars, formatDate } from '../../utils/formatters'

export default function PublicationCard({ publication, variant = 'default' }) {
  const {
    slug, type, title, abstract, authors,
    year, doi, doiUrl, pdfUrl, categories,
    publishedDate, pages, volume, issue,
  } = publication

  const isFeatured = variant === 'featured'

  return (
    <article className={`pub-card p-6 ${isFeatured ? 'border-l-4 border-l-accent-DEFAULT' : ''}`}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <PublicationBadge type={type} />
        <span className="text-label text-ink-faint flex-shrink-0">
          Vol.&thinsp;{volume}, No.&thinsp;{issue} ({year})
        </span>
      </div>

      {/* Title */}
      <Link to={`/publications/${slug}`} className="no-underline group">
        <h3 className={`font-serif text-ink group-hover:text-accent-DEFAULT transition-colors leading-snug mb-2 ${
          isFeatured ? 'text-[1.15rem] font-semibold' : 'text-subheading font-medium'
        }`}>
          {title}
        </h3>
      </Link>

      {/* Authors */}
      <p className="text-caption text-ink-muted mb-3 font-medium">
        {formatAuthors(authors)}
      </p>

      {/* Abstract preview */}
      <p className="text-caption text-ink-muted leading-relaxed mb-4">
        {truncateChars(abstract, isFeatured ? 320 : 200)}
      </p>

      {/* Category tags */}
      {categories && categories.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {categories.map(cat => (
            <CategoryTag key={cat} label={cat} />
          ))}
        </div>
      )}

      {/* Footer row — metadata + actions */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-rule flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <DOIBadge doi={doi} doiUrl={doiUrl} />
          {pages && (
            <span className="text-label text-ink-faint">pp. {pages}</span>
          )}
          <span className="text-label text-ink-faint">
            {formatDate(publishedDate)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {pdfUrl && (
            <a
              href={pdfUrl}
              className="pdf-button"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ArrowDownTrayIcon style={{ width: '13px', height: '13px' }} />
              PDF
            </a>
          )}
          <Link
            to={`/publications/${slug}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-caption font-medium
                       border border-rule rounded-sm text-ink-muted
                       hover:text-ink hover:border-ink-muted transition-colors no-underline"
          >
            View
            <ArrowRightIcon style={{ width: '12px', height: '12px' }} />
          </Link>
        </div>
      </div>
    </article>
  )
}
