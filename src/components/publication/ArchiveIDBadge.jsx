/**
 * ArchiveIDBadge.jsx
 *
 * WHY CREATED:
 * DOIBadge.jsx still exists and still href-s to doi.org — this is explicitly
 * forbidden in the project requirements. All cards and detail pages must use
 * the archive_id field (e.g. IRA-RP-2026-1779949121019) as the internal
 * identifier only. No external link. No doi.org redirect.
 *
 * WHAT IT DOES:
 * - Displays the archive_id in a monospace badge
 * - Clicking copies the ID to clipboard
 * - Never navigates externally
 */

import { useState } from 'react'
import { ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline'

export default function ArchiveIDBadge({ archiveId }) {
  const [copied, setCopied] = useState(false)

  if (!archiveId) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(archiveId).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      onClick={handleCopy}
      title="Click to copy Archive ID"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border border-rule
                 bg-archive-50 hover:bg-archive-100 transition-colors duration-150 cursor-pointer
                 font-mono group"
    >
      <span className="text-label text-ink-faint uppercase tracking-wider">
        IRA
      </span>
      <span className="text-label text-ink-muted max-w-[180px] truncate">
        {archiveId}
      </span>
      {copied
        ? <CheckIcon style={{ width: '11px', height: '11px' }} className="text-emerald-600 flex-shrink-0" />
        : <ClipboardDocumentIcon style={{ width: '11px', height: '11px' }} className="text-ink-faint group-hover:text-ink-muted flex-shrink-0 transition-colors" />
      }
    </button>
  )
}
