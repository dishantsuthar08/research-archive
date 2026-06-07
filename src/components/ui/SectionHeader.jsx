/**
 * SectionHeader.jsx
 * PURPOSE: Consistent section header used across Home, Publications, Admin pages.
 */

export default function SectionHeader({ label, title, subtitle, action }) {
  return (
    <div className="flex items-end justify-between mb-6 pb-4 border-b border-rule">
      <div>
        {label && <p className="meta-label mb-1">{label}</p>}
        {title && <h2 className="font-serif text-heading text-ink">{title}</h2>}
        {subtitle && <p className="text-caption text-ink-muted mt-1">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0 ml-4">{action}</div>}
    </div>
  )
}
