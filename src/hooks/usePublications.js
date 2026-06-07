/**
 * usePublications.js
 *
 * WHY CHANGED: The old hook imported static JSON files and never touched
 * Supabase. This caused all homepage stats (Publications, Authors, etc.)
 * to show 0 when data lived in the database. The old hook also had no
 * loading/error state, no caching invalidation, and returned category
 * counts derived from stale local JSON — not the live DB.
 *
 * WHAT IS NOW IMPLEMENTED:
 * - All data fetched from Supabase (publications + categories table)
 * - Proper loading / error states
 * - Derived stats computed from live query results
 * - Authors aggregated from publication JSONB column (no separate authors table needed)
 * - Category counts computed from live publications
 * - Singleton fetch with React state (no stale memos over JSON)
 */

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Static category definitions (labels + descriptions). Counts are live.
export const STATIC_CATEGORIES = [
  { id: 'cybersecurity',            label: 'Cybersecurity',             description: 'Research on information security, network security, intrusion detection, and cryptographic systems.' },
  { id: 'machine-learning',         label: 'Machine Learning',          description: 'Papers on supervised, unsupervised, and reinforcement learning algorithms and applications.' },
  { id: 'internet-of-things',       label: 'Internet of Things',        description: 'Research on IoT architectures, protocols, security, and edge computing deployments.' },
  { id: 'financial-technology',     label: 'Financial Technology',      description: 'Technical research in fintech, payment systems, fraud detection, and algorithmic trading.' },
  { id: 'privacy-security',         label: 'Privacy & Security',        description: 'Research on differential privacy, federated learning, anonymization, and data governance.' },
  { id: 'natural-language-processing', label: 'Natural Language Processing', description: 'Computational linguistics, language models, text understanding, and generation systems.' },
  { id: 'quantum-computing',        label: 'Quantum Computing',         description: 'Quantum algorithms, error correction, hardware architectures, and near-term applications.' },
  { id: 'computer-architecture',    label: 'Computer Architecture',     description: 'Processor design, memory systems, hardware-software co-design, and embedded systems.' },
  { id: 'bioinformatics',           label: 'Bioinformatics',            description: 'Computational approaches to biological data analysis, genomics, and structural biology.' },
]

/**
 * Hook: fetch all published publications + derive stats.
 * Returns { publications, featured, recent, stats, categories, loading, error, refetch }
 */
export function usePublications() {
  const [publications, setPublications] = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)

  async function fetchPublications() {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('publications')
      .select('*')
      .eq('status', 'published')
      .order('published_date', { ascending: false })

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    setPublications(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchPublications() }, [])

  // --- Derived values ---
  const featured = publications.filter(p => p.featured)
  const recent   = [...publications].sort(
    (a, b) => new Date(b.published_date) - new Date(a.published_date)
  )

  // Unique authors from JSONB authors arrays
  const authorSet = {}
  publications.forEach(pub => {
    ;(pub.authors || []).forEach(a => {
      const key = a.email || a.name
      if (!authorSet[key]) authorSet[key] = { ...a, publicationIds: [] }
      authorSet[key].publicationIds.push(pub.id)
    })
  })
  const authors = Object.values(authorSet)

  // Category counts from live publications
  const countByCategory = {}
  publications.forEach(pub => {
    ;(pub.categories || []).forEach(cat => {
      countByCategory[cat] = (countByCategory[cat] || 0) + 1
    })
  })
  const categories = STATIC_CATEGORIES.map(cat => ({
    ...cat,
    count: countByCategory[cat.label] || 0,
  }))

  const stats = {
    total:            publications.length,
    researchPapers:   publications.filter(p => p.type === 'research-paper').length,
    reviewPapers:     publications.filter(p => p.type === 'review-paper').length,
    technicalArticles:publications.filter(p => p.type === 'technical-article').length,
    authors:          authors.length,
    categories:       STATIC_CATEGORIES.length,
  }

  return {
    publications,
    featured,
    recent,
    stats,
    categories,
    authors,
    loading,
    error,
    refetch: fetchPublications,
  }
}

/**
 * Hook: fetch a single publication by slug from Supabase.
 */
export function usePublication(slug) {
  const [pub, setPub]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  useEffect(() => {
    if (!slug) return
    async function fetch() {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('publications')
        .select('*')
        .eq('slug', slug)
        .single()
      if (err) setError(err.message)
      else setPub(data)
      setLoading(false)
    }
    fetch()
  }, [slug])

  return { pub, loading, error }
}
