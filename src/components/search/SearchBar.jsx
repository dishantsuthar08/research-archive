import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'

export default function SearchBar({ value, onChange, placeholder = 'Search by title, keyword, or author…' }) {
  return (
    <div className="relative">
      <MagnifyingGlassIcon
        className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
        style={{ width: '16px', height: '16px' }}
      />
      <input
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="search-input pl-9 pr-9"
        aria-label="Search publications"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink transition-colors"
          aria-label="Clear search"
        >
          <XMarkIcon style={{ width: '15px', height: '15px' }} />
        </button>
      )}
    </div>
  )
}
