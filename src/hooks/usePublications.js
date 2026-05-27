import { useMemo } from 'react'
import publications from '../data/publications.json'
import authors from '../data/authors.json'
import categories from '../data/categories.json'

export function usePublications() {
  return useMemo(() => ({
    all: publications,
    featured: publications.filter(p => p.featured),
    recent: [...publications].sort(
      (a, b) => new Date(b.publishedDate) - new Date(a.publishedDate)
    ),
    bySlug: Object.fromEntries(publications.map(p => [p.slug, p])),
    byId: Object.fromEntries(publications.map(p => [p.id, p])),
    stats: {
      total: publications.length,
      researchPapers: publications.filter(p => p.type === 'research-paper').length,
      reviewPapers: publications.filter(p => p.type === 'review-paper').length,
      technicalArticles: publications.filter(p => p.type === 'technical-article').length,
      authors: authors.length,
      categories: categories.length,
    },
    authors,
    categories,
  }), [])
}

export function usePublication(slug) {
  return useMemo(
    () => publications.find(p => p.slug === slug) || null,
    [slug]
  )
}
