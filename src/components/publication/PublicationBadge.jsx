import { formatPublicationType, publicationTypeBadgeClass } from '../../utils/formatters'

export default function PublicationBadge({ type, size = 'sm' }) {
  const label = formatPublicationType(type)
  const classes = publicationTypeBadgeClass(type)
  return (
    <span className={`pub-type-badge ${classes} ${size === 'xs' ? 'text-[10px] px-1.5 py-0.5' : ''}`}>
      {label}
    </span>
  )
}
