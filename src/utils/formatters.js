/**
 * Format a publication type slug to a display label.
 */
export function formatPublicationType(type) {
  const map = {
    'research-paper':   'Research Paper',
    'review-paper':     'Review Paper',
    'technical-article':'Technical Article',
  }
  return map[type] || type
}

/**
 * Return Tailwind classes for publication type badge styling.
 */
export function publicationTypeBadgeClass(type) {
  const map = {
    'research-paper':    'bg-accent-light text-accent-DEFAULT border-blue-200',
    'review-paper':      'bg-amber-50 text-amber-700 border-amber-200',
    'technical-article': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  }
  return map[type] || 'bg-archive-100 text-ink-muted border-rule'
}

/**
 * Truncate text to a maximum number of words.
 */
export function truncateWords(text, maxWords = 40) {
  const words = text.trim().split(/\s+/)
  if (words.length <= maxWords) return text
  return words.slice(0, maxWords).join(' ') + '\u2026'
}

/**
 * Truncate text to a maximum number of characters.
 */
export function truncateChars(text, maxChars = 280) {
  if (text.length <= maxChars) return text
  return text.slice(0, maxChars).trimEnd() + '\u2026'
}

/**
 * Format an ISO date string to a human-readable date.
 */
export function formatDate(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Format a list of author names into a readable string.
 * e.g. ["A", "B", "C"] → "A, B & C"
 */
export function formatAuthors(authors) {
  if (!authors || authors.length === 0) return ''
  const names = authors.map(a => a.name)
  if (names.length === 1) return names[0]
  if (names.length === 2) return names.join(' & ')
  return names.slice(0, -1).join(', ') + ' & ' + names[names.length - 1]
}

/**
 * Format author list for citation style (Last, F., …)
 */
export function formatAuthorsShort(authors, maxAuthors = 3) {
  if (!authors || authors.length === 0) return ''
  const formatted = authors.slice(0, maxAuthors).map(a => {
    const parts = a.name.trim().split(' ')
    const last = parts[parts.length - 1]
    const initials = parts.slice(0, -1).map(p => p[0] + '.').join(' ')
    return initials ? `${last}, ${initials}` : last
  })
  if (authors.length > maxAuthors) formatted.push('et al.')
  return formatted.join(', ')
}

/**
 * Normalise a string for search comparison.
 */
export function normalise(str) {
  return str.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
}

/**
 * Convert a category label to a URL-safe slug.
 */
export function categorySlug(label) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}
