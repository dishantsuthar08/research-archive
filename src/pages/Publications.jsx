import { usePublications } from '../hooks/usePublications'
import { useSearch } from '../hooks/useSearch'
import PublicationCard from '../components/publication/PublicationCard'
import SearchBar from '../components/search/SearchBar'
import FilterPanel from '../components/search/FilterPanel'
import SectionHeader from '../components/ui/SectionHeader'

export default function Publications() {
  const { all } = usePublications()
  const {
    filters, results, hasActiveFilters,
    setQuery, setCategory, setType, setSortBy, resetFilters,
  } = useSearch(all)

  return (
    <div className="bg-archive-50">

      {/* Page header */}
      <div className="bg-white border-b border-rule">
        <div className="archive-container py-8">
          <p className="meta-label mb-1">Repository Index</p>
          <h1 className="font-serif text-display text-ink mb-4">Publications</h1>
          <p className="text-caption text-ink-muted max-w-prose">
            All research papers, review papers, and technical articles published in the
            IndieResearch Archive. Use the search and filters below to locate specific work.
          </p>
        </div>
      </div>

      <div className="archive-container py-8">

        {/* Search bar */}
        <div className="mb-4">
          <SearchBar value={filters.query} onChange={setQuery} />
        </div>

        {/* Filter panel */}
        <div className="mb-6">
          <FilterPanel
            filters={filters}
            setCategory={setCategory}
            setType={setType}
            setSortBy={setSortBy}
            resetFilters={resetFilters}
            hasActiveFilters={hasActiveFilters}
            resultCount={results.length}
          />
        </div>

        {/* Results */}
        {results.length === 0 ? (
          <div className="bg-white border border-rule rounded-sm px-8 py-16 text-center">
            <p className="font-serif text-subheading text-ink-muted mb-2">
              No publications found
            </p>
            <p className="text-caption text-ink-faint mb-4">
              Try adjusting your search terms or clearing filters.
            </p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-caption text-accent-DEFAULT hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {results.map(pub => (
              <PublicationCard key={pub.id} publication={pub} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
