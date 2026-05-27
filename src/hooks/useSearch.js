import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { applyFilters } from '../utils/search'

const INITIAL_FILTERS = {
  query: '',
  category: 'all',
  type: 'all',
  sortBy: 'newest',
}

export function useSearch(publications) {
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const timerRef = useRef(null)

  // Debounce query input by 250ms
  useEffect(() => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setDebouncedQuery(filters.query)
    }, 250)
    return () => clearTimeout(timerRef.current)
  }, [filters.query])

  const setQuery = useCallback((query) => {
    setFilters(prev => ({ ...prev, query }))
  }, [])

  const setCategory = useCallback((category) => {
    setFilters(prev => ({ ...prev, category }))
  }, [])

  const setType = useCallback((type) => {
    setFilters(prev => ({ ...prev, type }))
  }, [])

  const setSortBy = useCallback((sortBy) => {
    setFilters(prev => ({ ...prev, sortBy }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS)
  }, [])

  const results = useMemo(() => {
    return applyFilters(publications, {
      query: debouncedQuery,
      category: filters.category,
      type: filters.type,
      sortBy: filters.sortBy,
    })
  }, [publications, debouncedQuery, filters.category, filters.type, filters.sortBy])

  const hasActiveFilters =
    filters.query !== '' ||
    filters.category !== 'all' ||
    filters.type !== 'all' ||
    filters.sortBy !== 'newest'

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
