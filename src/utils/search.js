import { normalise } from './formatters'

/**
 * Search publications by query string.
 * Searches: title, abstract, keywords, author names, categories.
 */
export function searchPublications(publications, query) {
  if (!query || query.trim() === '') return publications

  const q = normalise(query)
  const tokens = q.split(/\s+/).filter(Boolean)

  return publications.filter(pub => {
    const haystack = [
      pub.title,
      pub.abstract,
      ...(pub.keywords || []),
      ...(pub.categories || []),
      ...(pub.authors || []).map(a => a.name),
      pub.type,
    ]
      .join(' ')
      .toLowerCase()

    return tokens.every(token => haystack.includes(token))
  })
}

/**
 * Filter publications by category label (case-insensitive).
 */
export function filterByCategory(publications, category) {
  if (!category || category === 'all') return publications
  const cat = category.toLowerCase()
  return publications.filter(pub =>
    (pub.categories || []).some(c => c.toLowerCase() === cat)
  )
}

/**
 * Filter publications by type.
 */
export function filterByType(publications, type) {
  if (!type || type === 'all') return publications
  return publications.filter(pub => pub.type === type)
}

/**
 * Sort publications by field.
 */
export function sortPublications(publications, sortBy = 'newest') {
  const sorted = [...publications]
  switch (sortBy) {
    case 'newest':
      return sorted.sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate))
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.publishedDate) - new Date(b.publishedDate))
    case 'title':
      return sorted.sort((a, b) => a.title.localeCompare(b.title))
    default:
      return sorted
  }
}

/**
 * Apply all filters and search together.
 */
export function applyFilters(publications, { query, category, type, sortBy }) {
  let result = publications
  result = searchPublications(result, query)
  result = filterByCategory(result, category)
  result = filterByType(result, type)
  result = sortPublications(result, sortBy)
  return result
}
