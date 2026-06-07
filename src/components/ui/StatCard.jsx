/**
 * StatCard.jsx
 * PURPOSE: Displays a single statistic (value + label) in the homepage stats bar.
 * Handles null/undefined gracefully so stats never flash "undefined".
 */

export default function StatCard({ value, label, note }) {
  const display = value === null || value === undefined ? '—' : value
  return (
    <div className="stat-card">
      <p className="font-serif text-display text-ink leading-none">{display}</p>
      <p className="text-caption font-medium text-ink-muted mt-1 uppercase tracking-wider">{label}</p>
      {note && <p className="text-label text-ink-faint mt-0.5">{note}</p>}
    </div>
  )
}
