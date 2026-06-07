/**
 * formatters.js
 *
 * PURPOSE:
 * Pure utility functions for formatting display values throughout the app.
 * Updated to work with snake_case Supabase field names. Removed all DOI
 * helpers. Added archive ID and publication type helpers.
 */

// ── Publication type ──────────────────────────────────────────────────────────

export function formatPublicationType(type) {
  const map = {
    'research-paper':    'Research Paper',
    'review-paper':      'Review Paper',
    'technical-article': 'Technical Article',
  }
  return map[type] || type
}

export function formatPublicationTypeShort(type) {
  const map = {
    'research-paper':    'RP',
    'review-paper':      'RV',
    'technical-article': 'TA',
  }
  return map[type] || type?.toUpperCase().slice(0, 2) || '??'
}

/** Tailwind classes for the publication type badge */
export function publicationTypeBadgeClass(type) {
  const map = {
    'research-paper':    'bg-blue-50 text-blue-700 border-blue-200',
    'review-paper':      'bg-amber-50 text-amber-700 border-amber-200',
    'technical-article': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  }
  return map[type] || 'bg-archive-100 text-ink-muted border-rule'
}

// ── Text helpers ──────────────────────────────────────────────────────────────

export function truncateWords(text, maxWords = 40) {
  if (!text) return ''
  const words = text.trim().split(/\s+/)
  if (words.length <= maxWords) return text
  return words.slice(0, maxWords).join(' ') + '\u2026'
}

export function truncateChars(text, maxChars = 280) {
  if (!text) return ''
  if (text.length <= maxChars) return text
  return text.slice(0, maxChars).trimEnd() + '\u2026'
}

// ── Date helpers ──────────────────────────────────────────────────────────────

export function formatDate(isoString) {
  if (!isoString) return ''
  try {
    return new Date(isoString).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    })
  } catch {
    return isoString
  }
}

export function formatDateShort(isoString) {
  if (!isoString) return ''
  try {
    return new Date(isoString).toLocaleDateString('en-GB', {
      month: 'short', year: 'numeric',
    })
  } catch {
    return isoString
  }
}

// ── Author helpers ────────────────────────────────────────────────────────────

/**
 * Format author array → "A, B & C"
 */
export function formatAuthors(authors) {
  if (!authors || authors.length === 0) return ''
  const names = authors.map(a => a.name).filter(Boolean)
  if (names.length === 1) return names[0]
  if (names.length === 2) return names.join(' & ')
  return names.slice(0, -1).join(', ') + ' & ' + names[names.length - 1]
}

/**
 * Format author list for citation (Last, F., … et al.)
 */
export function formatAuthorsShort(authors, maxAuthors = 3) {
  if (!authors || authors.length === 0) return ''
  const formatted = authors.slice(0, maxAuthors).map(a => {
    const parts   = a.name.trim().split(' ')
    const last    = parts[parts.length - 1]
    const initials = parts.slice(0, -1).map(p => p[0] + '.').join(' ')
    return initials ? `${last}, ${initials}` : last
  })
  if (authors.length > maxAuthors) formatted.push('et al.')
  return formatted.join(', ')
}

// ── Slug / URL helpers ────────────────────────────────────────────────────────

export function normalise(str) {
  return str.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
}

export function categorySlug(label) {
  if (!label) return ''
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export function nameToSlug(name) {
  if (!name) return ''
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

// ── Archive ID helpers ────────────────────────────────────────────────────────

/**
 * Generate an Archive Identifier.
 * Format: IRA-{TYPE_CODE}-{YEAR}-{TIMESTAMP}
 * e.g.   IRA-RP-2026-1779949121019
 * Never redirects to doi.org — internal identifier only.
 */
export function generateArchiveId(type) {
  const code = formatPublicationTypeShort(type)
  return `IRA-${code}-${new Date().getFullYear()}-${Date.now()}`
}

/**
 * Build a DOI-free APA citation using archive_id as the locator.
 */
export function buildCitationAPA(authors, year, title, volume, issue, pages, archiveId) {
  const authorStr = (authors || []).map((a, i, arr) => {
    const parts    = a.name.trim().split(' ')
    const last     = parts.pop()
    const initials = parts.map(p => p[0] + '.').join(' ')
    const fmt      = initials ? `${last}, ${initials}` : last
    return i === arr.length - 1 && arr.length > 1 ? `& ${fmt}` : fmt
  }).join(', ')

  const pg = pages ? `, ${pages}` : ''
  return `${authorStr} (${year}). ${title}. IndieResearch Archive, ${volume}(${issue})${pg}. [${archiveId}]`
}

/**
 * Build a DOI-free BibTeX citation using archive_id in the note field.
 */
export function buildCitationBibtex(slug, authors, year, title, volume, issue, pages, archiveId) {
  const authorStr = (authors || []).map(a => a.name).join(' and ')
  const pgField   = pages ? `\n  pages        = {${pages}},` : ''
  const safeSlug  = slug || `ira${year}${Date.now().toString().slice(-4)}`
  return `@article{${safeSlug},
  title        = {${title}},
  author       = {${authorStr}},
  journal      = {IndieResearch Archive},
  volume       = {${volume}},
  number       = {${issue}},${pgField}
  year         = {${year}},
  note         = {Archive ID: ${archiveId}}
}`
}
