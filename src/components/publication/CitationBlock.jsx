import { useState } from 'react'
import { ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline'

export default function CitationBlock({ citationAPA, citationBibtex }) {
  const [format, setFormat] = useState('apa')
  const [copied, setCopied] = useState(false)

  const text = format === 'apa' ? citationAPA : citationBibtex

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div>
      {/* Format tabs */}
      <div className="flex items-center gap-0 mb-3 border border-rule rounded-sm overflow-hidden w-fit">
        {['apa', 'bibtex'].map(fmt => (
          <button
            key={fmt}
            onClick={() => setFormat(fmt)}
            className={`px-3 py-1.5 text-label uppercase tracking-wider font-medium transition-colors ${
              format === fmt
                ? 'bg-accent-DEFAULT text-white'
                : 'bg-white text-ink-muted hover:bg-archive-50'
            }`}
          >
            {fmt === 'apa' ? 'APA' : 'BibTeX'}
          </button>
        ))}
      </div>

      {/* Citation text */}
      <div className="relative">
        <pre className="citation-block whitespace-pre-wrap leading-relaxed">{text}</pre>
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-1.5 rounded-sm bg-white border border-rule
                     text-ink-muted hover:text-ink transition-colors"
          title="Copy to clipboard"
        >
          {copied
            ? <CheckIcon style={{ width: '14px', height: '14px' }} className="text-emerald-600" />
            : <ClipboardDocumentIcon style={{ width: '14px', height: '14px' }} />
          }
        </button>
      </div>
    </div>
  )
}
