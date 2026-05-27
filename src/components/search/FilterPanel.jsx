import categories from '../../data/categories.json'

const TYPE_OPTIONS = [
  { value: 'all',              label: 'All Types' },
  { value: 'research-paper',   label: 'Research Papers' },
  { value: 'review-paper',     label: 'Review Papers' },
  { value: 'technical-article',label: 'Technical Articles' },
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'title',  label: 'Title A–Z' },
]

function Select({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="meta-label">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="px-3 py-2 bg-white border border-rule rounded-sm text-caption text-ink
                   focus:outline-none focus:border-accent-DEFAULT focus:ring-1 focus:ring-accent-light
                   transition-colors"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}

export default function FilterPanel({
  filters,
  setCategory,
  setType,
  setSortBy,
  resetFilters,
  hasActiveFilters,
  resultCount,
}) {
  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...categories.map(c => ({ value: c.label, label: c.label })),
  ]

  return (
    <div className="bg-white border border-rule rounded-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <span className="meta-label">Filter &amp; Sort</span>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-label text-accent-DEFAULT hover:underline"
          >
            Reset filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Select
          label="Category"
          value={filters.category}
          onChange={setCategory}
          options={categoryOptions}
        />
        <Select
          label="Type"
          value={filters.type}
          onChange={setType}
          options={TYPE_OPTIONS}
        />
        <Select
          label="Sort by"
          value={filters.sortBy}
          onChange={setSortBy}
          options={SORT_OPTIONS}
        />
      </div>

      {/* Result count */}
      <p className="text-label text-ink-faint mt-3">
        Showing {resultCount} publication{resultCount !== 1 ? 's' : ''}
        {hasActiveFilters ? ' matching current filters' : ''}
      </p>
    </div>
  )
}
