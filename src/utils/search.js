/**
 * search.js
 *
 * PURPOSE:
 * Pure functions for client-side search, filter, and sort over publication
 * arrays returned from Supabase. Updated to use snake_case field names.
 */

import { normalise } from './formatters'

/**
 * Full-text search across title, abstract, keywords, categories, author names, type.
 */
export function searchPublications(publications, query) {
  if (!query || query.trim() === '') return publications
  const tokens = normalise(query).split(/\s+/).filter(Boolean)

  return publications.filter(pub => {
    const haystack = [
      pub.title        || '',
      pub.abstract     || '',
      ...(pub.keywords   || []),
      ...(pub.categories || []),
      ...(pub.authors    || []).map(a => a.name || ''),
      pub.type         || '',
      pub.archive_id   || '',
    ].join(' ').toLowerCase()

    return tokens.every(token => haystack.includes(token))
  })
}

/**
 * Filter by category label (case-insensitive match against categories array).
 */
export function filterByCategory(publications, category) {
  if (!category || category === 'all') return publications
  const cat = category.toLowerCase()
  return publications.filter(pub =>
    (pub.categories || []).some(c => c.toLowerCase() === cat)
  )
}

/**
 * Filter by publication type.
 */
export function filterByType(publications, type) {
  if (!type || type === 'all') return publications
  return publications.filter(pub => pub.type === type)
}

/**
 * Sort publications. Uses snake_case published_date from Supabase.
 */
export function sortPublications(publications, sortBy = 'newest') {
  const sorted = [...publications]
  switch (sortBy) {
    case 'newest':
      return sorted.sort((a, b) =>
        new Date(b.published_date || 0) - new Date(a.published_date || 0)
      )
    case 'oldest':
      return sorted.sort((a, b) =>
        new Date(a.published_date || 0) - new Date(b.published_date || 0)
      )
    case 'title':
      return sorted.sort((a, b) =>
        (a.title || '').localeCompare(b.title || '')
      )
    default:
      return sorted
  }
}

/**
 * Apply all filters together.
 */
export function applyFilters(publications, { query, category, type, sortBy }) {
  let result = publications
  result = searchPublications(result, query)
  result = filterByCategory(result, category)
  result = filterByType(result, type)
  result = sortPublications(result, sortBy)
  return result
}
