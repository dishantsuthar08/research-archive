export default function StatCard({ value, label, note }) {
  return (
    <div className="stat-card">
      <p className="font-serif text-display text-ink leading-none">{value}</p>
      <p className="text-caption font-medium text-ink-muted mt-1 uppercase tracking-wider">{label}</p>
      {note && <p className="text-label text-ink-faint mt-0.5">{note}</p>}
    </div>
  )
}
