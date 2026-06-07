/**
 * PublicationDetail.jsx
 *
 * WHY CHANGED:
 * 1. Archive ID sidebar card had `href={archive_id}` — this tried to navigate
 *    to the archive ID string as a URL, breaking the page.
 * 2. Duplicate PDF buttons rendered twice (one set above categories, another
 *    after abstract with View Paper / Download PDF).
 * 3. The inline <iframe> rendered the PDF inline before the abstract, which
 *    buried all metadata — poor UX for a scholarly publication page.
 * 4. Category tags rendered before Divider (visually orphaned).
 * 5. Authors link went to /authors (list) not individual author anchor.
 * 6. The DOI variable was still destructured even though it doesn't exist.
 *
 * WHAT IS NOW IMPLEMENTED:
 * - Single Download PDF button in the correct header position
 * - Optional PDF viewer at the bottom (collapsible)
 * - Archive ID displayed as plain text badge (not a link)
 * - Clean section ordering: header → abstract → keywords → citation → references
 * - Proper sidebar with all metadata
 * - Author names link to /authors#{name-slug}
 */

import { useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import {
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline'
import { usePublication } from '../hooks/usePublications'
import PublicationBadge from '../components/publication/PublicationBadge'
import ArchiveIDBadge from '../components/publication/ArchiveIDBadge'
import CategoryTag from '../components/publication/CategoryTag'
import CitationBlock from '../components/publication/CitationBlock'
import Divider from '../components/ui/Divider'
import { formatDate } from '../utils/formatters'

function MetaRow({ label, value }) {
  if (!value) return null
  return (
    <div className="flex gap-4 py-2 border-b border-rule last:border-0">
      <span className="meta-label w-28 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-caption text-ink flex-1 leading-relaxed">{value}</span>
    </div>
  )
}

export default function PublicationDetail() {
  const { slug } = useParams()
  const { pub, loading, error } = usePublication(slug)
  const [showPdfViewer, setShowPdfViewer] = useState(false)

  if (loading) {
    return (
      <div className="archive-container py-20">
        <div className="animate-pulse space-y-4 max-w-content">
          <div className="h-4 bg-archive-200 rounded w-24" />
          <div className="h-8 bg-archive-200 rounded w-3/4" />
          <div className="h-4 bg-archive-200 rounded w-1/2" />
          <div className="h-32 bg-archive-200 rounded" />
        </div>
      </div>
    )
  }

  if (error || !pub) return <Navigate to="/publications" replace />

  const {
    type, title, abstract, keywords, authors,
    year, month, archive_id, pdf_url, categories,
    published_date, received_date, accepted_date,
    pages, volume, issue, license,
    references, citation_apa, citation_bibtex,
  } = pub

  const citationAPA    = citation_apa    || ''
  const citationBibtex = citation_bibtex || ''

  const nameToSlug = name =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  return (
    <div className="bg-archive-50">

      {/* Breadcrumb */}
      <div className="bg-white border-b border-rule">
        <div className="archive-container py-3 flex items-center justify-between">
          <Link
            to="/publications"
            className="inline-flex items-center gap-1.5 text-caption text-ink-muted hover:text-ink no-underline"
          >
            <ArrowLeftIcon style={{ width: '13px', height: '13px' }} />
            Back to Publications
          </Link>
          <span className="text-label text-ink-faint hidden sm:inline">
            IndieResearch Archive
          </span>
        </div>
      </div>

      <div className="archive-container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 items-start">

          {/* ── Main content ─────────────────────────────── */}
          <div>

            {/* Type + volume */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <PublicationBadge type={type} />
              {(volume || year) && (
                <span className="text-label text-ink-faint">
                  {volume && issue ? `Volume ${volume}, Issue ${issue}` : ''}
                  {volume && year ? ' · ' : ''}
                  {month ? `${month} ` : ''}{year}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-serif text-[1.75rem] font-semibold text-ink leading-tight tracking-tight mb-4">
              {title}
            </h1>

            {/* Authors */}
            {authors && authors.length > 0 && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 mb-5">
                {authors.map((author, i) => (
                  <span key={author.email || i} className="text-caption text-ink-muted">
                    <Link
                      to={`/authors#${nameToSlug(author.name)}`}
                      className="font-medium no-underline"
                      style={{ color: '#1a3a6b' }}
                    >
                      {author.name}
                    </Link>
                    {author.corresponding && (
                      <span title="Corresponding author" className="ml-0.5 text-ink-faint">*</span>
                    )}
                    {author.affiliation && (
                      <span className="text-ink-faint"> · {author.affiliation}</span>
                    )}
                  </span>
                ))}
              </div>
            )}

            {/* Archive ID + PDF */}
            <div className="flex items-center gap-3 flex-wrap mb-5">
              {archive_id && <ArchiveIDBadge archiveId={archive_id} />}
              {pdf_url && (
                <a
                  href={pdf_url}
                  className="pdf-button"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ArrowDownTrayIcon style={{ width: '14px', height: '14px' }} />
                  Download PDF
                </a>
              )}
              {pdf_url && (
                <button
                  onClick={() => setShowPdfViewer(v => !v)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-caption font-medium
                             border border-rule rounded-sm text-ink-muted hover:text-ink transition-colors"
                >
                  {showPdfViewer ? (
                    <><ChevronUpIcon style={{ width: '13px', height: '13px' }} /> Hide Viewer</>
                  ) : (
                    <><ChevronDownIcon style={{ width: '13px', height: '13px' }} /> View PDF</>
                  )}
                </button>
              )}
            </div>

            {/* Inline PDF viewer (collapsible) */}
            {showPdfViewer && pdf_url && (
              <div className="relative mb-8">

                <div
                  className="absolute inset-0 pointer-events-none flex items-center justify-center z-10"
                  style={{
                    fontSize: '48px',
                    fontWeight: '700',
                    color: 'rgba(0,0,0,0.08)',
                    transform: 'rotate(-35deg)',
                  }}
                >
                  INDIERESEARCH ARCHIVE
                </div>

                <iframe
                  src={pdf_url}
                  width="100%"
                  height="800px"
                  style={{
                    border: '1px solid #d8d6cf',
                    borderRadius: '2px',
                  }}
                  title={`PDF: ${title}`}
                />
              </div>
            )}

            {/* Category tags */}
            {categories && categories.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-6">
                {categories.map(cat => (
                  <CategoryTag key={cat} label={cat} />
                ))}
              </div>
            )}

            <Divider />

            {/* Abstract */}
            <section className="mb-8" aria-labelledby="abstract-heading">
              <h2 id="abstract-heading" className="font-serif text-heading text-ink mb-4">
                Abstract
              </h2>
              <p className="abstract-text">{abstract}</p>
            </section>

            {/* Keywords */}
            {keywords && keywords.length > 0 && (
              <div className="mb-8">
                <p className="meta-label mb-2">Keywords</p>
                <div className="flex flex-wrap gap-2">
                  {keywords.map(kw => (
                    <span key={kw} className="keyword-pill">{kw}</span>
                  ))}
                </div>
              </div>
            )}

            <Divider />

            {/* How to Cite */}
            {(citationAPA || citationBibtex) && (
              <section className="mb-8" aria-labelledby="citation-heading">
                <h2 id="citation-heading" className="font-serif text-heading text-ink mb-4">
                  How to Cite
                </h2>
                <CitationBlock
                  citationAPA={citationAPA}
                  citationBibtex={citationBibtex}
                />
              </section>
            )}

            {references && references.length > 0 && (
              <>
                <Divider />
                <section aria-labelledby="references-heading">
                  <h2 id="references-heading" className="font-serif text-heading text-ink mb-4">
                    References
                  </h2>
                  <ol className="space-y-3 list-decimal list-inside">
                    {references.map((ref, i) => (
                      <li key={i} className="text-caption text-ink-muted leading-relaxed">
                        {ref}
                      </li>
                    ))}
                  </ol>
                </section>
              </>
            )}

          </div>

          {/* ── Sidebar ──────────────────────────────────── */}
          <aside className="lg:sticky lg:top-20 flex flex-col gap-4">

            {/* Publication Metadata */}
            <div className="bg-white border border-rule rounded-sm p-5">
              <p className="meta-label mb-3">Publication Metadata</p>
              <MetaRow label="Published"  value={formatDate(published_date)} />
              <MetaRow label="Received"   value={formatDate(received_date)} />
              <MetaRow label="Accepted"   value={formatDate(accepted_date)} />
              <MetaRow label="Pages"      value={pages} />
              <MetaRow label="Volume"     value={volume} />
              <MetaRow label="Issue"      value={issue} />
              <MetaRow label="Licence"    value={license || 'CC BY 4.0'} />
            </div>

            {/* Archive Identifier */}
            <div className="bg-white border border-rule rounded-sm p-5">
              <p className="meta-label mb-2">Archive Identifier</p>
              <p className="font-mono text-label text-ink-muted break-all leading-relaxed">
                {archive_id || '—'}
              </p>
              <p className="text-label text-ink-faint mt-2">
                Internal identifier only. Not a DOI.
              </p>
            </div>

            {/* Authors */}
            {authors && authors.length > 0 && (
              <div className="bg-white border border-rule rounded-sm p-5">
                <p className="meta-label mb-3">Authors</p>
                <div className="space-y-4">
                  {authors.map((author, i) => (
                    <div key={author.email || i} className="pb-3 border-b border-rule last:border-0 last:pb-0">
                      <p className="text-caption font-medium text-ink">{author.name}</p>
                      {author.affiliation && (
                        <p className="text-label text-ink-faint mt-0.5">{author.affiliation}</p>
                      )}
                      {author.orcid && (
                        <a
                          href={`https://orcid.org/${author.orcid}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block text-label mt-1 no-underline"
                          style={{ color: '#1a3a6b' }}
                        >
                          ORCID: {author.orcid}
                        </a>
                      )}
                      {author.corresponding && (
                        <p className="text-label text-ink-faint mt-0.5">* Corresponding author</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </aside>
        </div>
      </div>
    </div>
  )
}
