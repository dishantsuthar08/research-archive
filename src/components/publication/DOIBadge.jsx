import { LinkIcon } from '@heroicons/react/24/outline'

export default function DOIBadge({ doi, doiUrl }) {
  return (
    <a
      href={doiUrl || `https://doi.org/${doi}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border border-rule
                 bg-archive-50 hover:bg-accent-light hover:border-accent-DEFAULT
                 transition-colors duration-150 no-underline group"
      title={`DOI: ${doi}`}
    >
      <span className="font-mono text-label text-ink-faint group-hover:text-accent-DEFAULT uppercase tracking-wider">
        DOI
      </span>
      <LinkIcon
        className="text-ink-faint group-hover:text-accent-DEFAULT transition-colors"
        style={{ width: '12px', height: '12px' }}
      />
      <span className="font-mono text-label text-ink-muted group-hover:text-accent-DEFAULT max-w-[200px] truncate">
        {doi}
      </span>
    </a>
  )
}
