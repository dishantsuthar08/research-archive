/**
 * useSearch.js
 *
 * PURPOSE:
 * Client-side search + filter + sort over an array of publication objects
 * fetched from Supabase. Updated to use snake_case field names that match
 * the actual database schema (published_date, pdf_url, archive_id) instead
 * of the camelCase names from the original static JSON files.
 */

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { applyFilters } from '../utils/search'

const INITIAL_FILTERS = {
  query:    '',
  category: 'all',
  type:     'all',
  sortBy:   'newest',
}

export function useSearch(publications) {
  const [filters, setFilters]           = useState(INITIAL_FILTERS)
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const timerRef = useRef(null)

  // Debounce the text query by 250 ms so we don't re-filter on every keystroke
  useEffect(() => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setDebouncedQuery(filters.query)
    }, 250)
    return () => clearTimeout(timerRef.current)
  }, [filters.query])

  const setQuery    = useCallback(q  => setFilters(p => ({ ...p, query: q   })), [])
  const setCategory = useCallback(c  => setFilters(p => ({ ...p, category: c })), [])
  const setType     = useCallback(t  => setFilters(p => ({ ...p, type: t    })), [])
  const setSortBy   = useCallback(s  => setFilters(p => ({ ...p, sortBy: s  })), [])
  const resetFilters = useCallback(() => setFilters(INITIAL_FILTERS), [])

  const results = useMemo(() => {
    return applyFilters(publications, {
      query:    debouncedQuery,
      category: filters.category,
      type:     filters.type,
      sortBy:   filters.sortBy,
    })
  }, [publications, debouncedQuery, filters.category, filters.type, filters.sortBy])

  const hasActiveFilters =
    filters.query    !== ''      ||
    filters.category !== 'all'   ||
    filters.type     !== 'all'   ||
    filters.sortBy   !== 'newest'

  return {
    filters,
    results,
    hasActiveFilters,
    setQuery,
    setCategory,
    setType,
    setSortBy,
    resetFilters,
  }
}
