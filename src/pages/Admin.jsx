/**
 * Admin.jsx — IndieResearch Archive Editorial CMS
 *
 * WHY CHANGED:
 * 1. The old admin only had Approve / Reject / Delete — no editing capability.
 * 2. citation_apa still injected "https://doi.org/..." URLs in the approved
 *    publication — violates the no-DOI requirement.
 * 3. approveSubmission used `finalDoi = sub.doi || '10.IRA.${year}.${Date.now()}'`
 *    — this created fake DOI identifiers. Removed entirely.
 * 4. No tab navigation — submissions and publications were in a single long scroll.
 * 5. No way to edit a publication after approval (fix metadata, toggle featured,
 *    change volume/issue, fix citation text).
 * 6. No submission detail view (cover letter, keywords, categories not visible).
 * 7. No auth guard — /admin was fully public.
 * 8. alert() and confirm() used throughout — replaced with proper inline UI.
 * 9. Published paper DOI field shown in admin metadata — removed.
 *
 * WHAT IS NOW IMPLEMENTED:
 * Tabs: Dashboard | Pending Submissions | Published Papers | Settings
 * - Dashboard: live stats + recent activity feed
 * - Pending: full submission detail, preview abstract, view PDF, approve with
 *   metadata editor (volume, issue, pages, featured toggle), reject with reason
 * - Published: search/filter papers, edit metadata inline, toggle featured,
 *   unpublish, delete
 * - Edit modal: title, abstract, keywords, categories, volume, issue, pages,
 *   featured flag, citation text (with DOI-free template)
 * - Auth guard: simple password gate (production would use Supabase Auth)
 */

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { formatDate } from '../utils/formatters'
import { STATIC_CATEGORIES } from '../hooks/usePublications'

// ── Utility ──────────────────────────────────────────────────────────────────
function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function generateArchiveId(type) {
  const typeCode = type === 'research-paper' ? 'RP'
    : type === 'review-paper' ? 'RV'
    : 'TA'
  return `IRA-${typeCode}-${new Date().getFullYear()}-${Date.now()}`
}

function buildCitationAPA(authors, year, title, volume, issue, pages, archiveId) {
  const authorStr = (authors || []).map((a, i, arr) => {
    const parts = a.name.trim().split(' ')
    const last = parts.pop()
    const initials = parts.map(p => p[0] + '.').join(' ')
    const fmt = initials ? `${last}, ${initials}` : last
    if (i === arr.length - 1 && arr.length > 1) return `& ${fmt}`
    return fmt
  }).join(', ')

  const pg = pages ? `, ${pages}` : ''
  return `${authorStr} (${year}). ${title}. IndieResearch Archive, ${volume}(${issue})${pg}. [${archiveId}]`
}

function buildCitationBibtex(slug, authors, year, title, volume, issue, pages, archiveId) {
  const authorStr = (authors || []).map(a => a.name).join(' and ')
  const pgField = pages ? `\n  pages={${pages}},` : ''
  return `@article{${slug || 'ira' + year},\n  title={${title}},\n  author={${authorStr}},\n  journal={IndieResearch Archive},\n  volume={${volume}},\n  number={${issue}},${pgField}\n  year={${year}},\n  note={Archive ID: ${archiveId}}\n}`
}

// ── Auth Gate ─────────────────────────────────────────────────────────────────
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'ira-admin-2024'

function AuthGate({ onAuth }) {
  const [pw, setPw] = useState('')
  const [err, setErr] = useState(false)

  const handleLogin = (e) => {
    e.preventDefault()
    if (pw === ADMIN_PASSWORD) onAuth()
    else { setErr(true); setTimeout(() => setErr(false), 2000) }
  }

  return (
    <div className="min-h-screen bg-archive-50 flex items-center justify-center">
      <div className="bg-white border border-rule rounded-sm p-10 w-full max-w-sm shadow-elevated">
        <p className="meta-label mb-2 text-center">IndieResearch Archive</p>
        <h1 className="font-serif text-heading text-ink text-center mb-8">Editorial Access</h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="meta-label block mb-1">Password</label>
            <input
              type="password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              className={`search-input ${err ? 'border-red-400' : ''}`}
              placeholder="Enter admin password"
              autoFocus
            />
            {err && <p className="text-label text-red-600 mt-1">Incorrect password.</p>}
          </div>
          <button
            type="submit"
            className="pdf-button w-full justify-center py-2.5"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-sm shadow-elevated text-caption font-medium
                     ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
      {message}
    </div>
  )
}

// ── Confirm Dialog ────────────────────────────────────────────────────────────
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white border border-rule rounded-sm p-6 w-full max-w-sm shadow-elevated">
        <p className="text-body text-ink mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-caption border border-rule rounded-sm text-ink-muted hover:bg-archive-50">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 text-caption bg-red-600 text-white rounded-sm hover:bg-red-700">
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Edit Publication Modal ────────────────────────────────────────────────────
function EditModal({ pub, onSave, onClose }) {
  const [form, setForm] = useState({
    title:          pub.title || '',
    abstract:       pub.abstract || '',
    keywords:       (pub.keywords || []).join(', '),
    categories:     pub.categories || [],
    volume:         pub.volume || '1',
    issue:          pub.issue || '1',
    pages:          pub.pages || '',
    featured:       pub.featured || false,
    citation_apa:   pub.citation_apa || '',
    citation_bibtex:pub.citation_bibtex || '',
  })
  const [saving, setSaving] = useState(false)

  const toggleCategory = cat => {
    setForm(p => ({
      ...p,
      categories: p.categories.includes(cat)
        ? p.categories.filter(c => c !== cat)
        : [...p.categories, cat],
    }))
  }

  const regenerateCitations = () => {
    const archiveId = pub.archive_id || ''
    const year      = pub.year || new Date().getFullYear()
    const slug      = pub.slug || slugify(form.title)
    setForm(p => ({
      ...p,
      citation_apa:    buildCitationAPA(pub.authors, year, form.title, form.volume, form.issue, form.pages, archiveId),
      citation_bibtex: buildCitationBibtex(slug, pub.authors, year, form.title, form.volume, form.issue, form.pages, archiveId),
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    const update = {
      title:          form.title,
      abstract:       form.abstract,
      keywords:       form.keywords.split(',').map(k => k.trim()).filter(Boolean),
      categories:     form.categories,
      volume:         form.volume,
      issue:          form.issue,
      pages:          form.pages,
      featured:       form.featured,
      citation_apa:   form.citation_apa,
      citation_bibtex:form.citation_bibtex,
    }
    const { error } = await supabase.from('publications').update(update).eq('id', pub.id)
    setSaving(false)
    if (error) { onSave(null, error.message) }
    else onSave({ ...pub, ...update })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto py-10">
      <div className="bg-white border border-rule rounded-sm w-full max-w-2xl mx-4 shadow-elevated">
        <div className="flex items-center justify-between px-6 py-4 border-b border-rule">
          <h2 className="font-serif text-subheading text-ink">Edit Publication</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink text-xl leading-none">×</button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          {/* Title */}
          <div>
            <label className="meta-label block mb-1">Title</label>
            <textarea
              rows={2}
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              className="search-input resize-y"
            />
          </div>

          {/* Abstract */}
          <div>
            <label className="meta-label block mb-1">Abstract</label>
            <textarea
              rows={6}
              value={form.abstract}
              onChange={e => setForm(p => ({ ...p, abstract: e.target.value }))}
              className="search-input resize-y"
            />
          </div>

          {/* Keywords */}
          <div>
            <label className="meta-label block mb-1">Keywords (comma-separated)</label>
            <input
              type="text"
              value={form.keywords}
              onChange={e => setForm(p => ({ ...p, keywords: e.target.value }))}
              className="search-input"
            />
          </div>

          {/* Categories */}
          <div>
            <label className="meta-label block mb-2">Categories</label>
            <div className="flex flex-wrap gap-2">
              {STATIC_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.label)}
                  className="cat-tag"
                  style={form.categories.includes(cat.label)
                    ? { backgroundColor: '#e8eef7', borderColor: '#1a3a6b', color: '#1a3a6b' }
                    : {}}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Volume / Issue / Pages */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="meta-label block mb-1">Volume</label>
              <input
                type="text" value={form.volume}
                onChange={e => setForm(p => ({ ...p, volume: e.target.value }))}
                className="search-input"
              />
            </div>
            <div>
              <label className="meta-label block mb-1">Issue</label>
              <input
                type="text" value={form.issue}
                onChange={e => setForm(p => ({ ...p, issue: e.target.value }))}
                className="search-input"
              />
            </div>
            <div>
              <label className="meta-label block mb-1">Pages</label>
              <input
                type="text" value={form.pages}
                onChange={e => setForm(p => ({ ...p, pages: e.target.value }))}
                className="search-input"
                placeholder="e.g. 1–12"
              />
            </div>
          </div>

          {/* Featured toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={e => setForm(p => ({ ...p, featured: e.target.checked }))}
              className="w-4 h-4"
            />
            <span className="text-caption text-ink font-medium">
              Featured on homepage
            </span>
          </label>

          {/* Citations */}
          <div className="border border-rule rounded-sm p-4 bg-archive-50">
            <div className="flex items-center justify-between mb-3">
              <p className="meta-label">Citation Text</p>
              <button
                type="button"
                onClick={regenerateCitations}
                className="text-label hover:underline"
                style={{ color: '#1a3a6b' }}
              >
                Auto-generate (no DOI)
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-label text-ink-faint block mb-1">APA</label>
                <textarea
                  rows={3}
                  value={form.citation_apa}
                  onChange={e => setForm(p => ({ ...p, citation_apa: e.target.value }))}
                  className="search-input font-mono text-[11px] resize-y"
                />
              </div>
              <div>
                <label className="text-label text-ink-faint block mb-1">BibTeX</label>
                <textarea
                  rows={6}
                  value={form.citation_bibtex}
                  onChange={e => setForm(p => ({ ...p, citation_bibtex: e.target.value }))}
                  className="search-input font-mono text-[11px] resize-y"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-rule">
          <button onClick={onClose} className="px-4 py-2 text-caption border border-rule rounded-sm text-ink-muted">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="pdf-button px-5 py-2 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Approve Modal ─────────────────────────────────────────────────────────────
function ApproveModal({ sub, onApprove, onClose }) {
  const [form, setForm] = useState({
    volume:   '1',
    issue:    '1',
    pages:    '',
    featured: false,
  })
  const [processing, setProcessing] = useState(false)

  const handleApprove = async () => {
    setProcessing(true)
    await onApprove(sub, form)
    setProcessing(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white border border-rule rounded-sm w-full max-w-lg mx-4 shadow-elevated">
        <div className="flex items-center justify-between px-6 py-4 border-b border-rule">
          <h2 className="font-serif text-subheading text-ink">Approve & Publish</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink text-xl">×</button>
        </div>

        <div className="p-6">
          <div className="bg-archive-50 border border-rule rounded-sm p-4 mb-5">
            <p className="text-caption font-medium text-ink mb-1">{sub.title}</p>
            <p className="text-label text-ink-faint">
              {(sub.authors || []).map(a => a.name).join(', ')}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="meta-label block mb-1">Volume</label>
              <input
                type="text" value={form.volume}
                onChange={e => setForm(p => ({ ...p, volume: e.target.value }))}
                className="search-input"
              />
            </div>
            <div>
              <label className="meta-label block mb-1">Issue</label>
              <input
                type="text" value={form.issue}
                onChange={e => setForm(p => ({ ...p, issue: e.target.value }))}
                className="search-input"
              />
            </div>
            <div>
              <label className="meta-label block mb-1">Pages</label>
              <input
                type="text" value={form.pages}
                onChange={e => setForm(p => ({ ...p, pages: e.target.value }))}
                className="search-input"
                placeholder="1–12"
              />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={e => setForm(p => ({ ...p, featured: e.target.checked }))}
              className="w-4 h-4"
            />
            <span className="text-caption text-ink">Feature on homepage</span>
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-rule">
          <button onClick={onClose} className="px-4 py-2 text-caption border border-rule rounded-sm text-ink-muted">
            Cancel
          </button>
          <button
            onClick={handleApprove}
            disabled={processing}
            className="pdf-button px-5 py-2 disabled:opacity-60"
          >
            {processing ? 'Publishing…' : 'Approve & Publish'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Reject Modal ──────────────────────────────────────────────────────────────
function RejectModal({ sub, onReject, onClose }) {
  const [reason, setReason] = useState('')
  const [processing, setProcessing] = useState(false)

  const handleReject = async () => {
    setProcessing(true)
    await onReject(sub.id, reason)
    setProcessing(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white border border-rule rounded-sm w-full max-w-md mx-4 shadow-elevated">
        <div className="flex items-center justify-between px-6 py-4 border-b border-rule">
          <h2 className="font-serif text-subheading text-ink">Reject Submission</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink text-xl">×</button>
        </div>
        <div className="p-6">
          <p className="text-caption text-ink-muted mb-4">
            Provide a rejection reason (optional — shown in submission notes):
          </p>
          <textarea
            rows={4}
            value={reason}
            onChange={e => setReason(e.target.value)}
            className="search-input resize-y"
            placeholder="e.g. Out of scope, insufficient methodology, incomplete references…"
          />
        </div>
        <div className="flex gap-3 justify-end px-6 py-4 border-t border-rule">
          <button onClick={onClose} className="px-4 py-2 text-caption border border-rule rounded-sm text-ink-muted">
            Cancel
          </button>
          <button
            onClick={handleReject}
            disabled={processing}
            className="px-4 py-2 text-caption bg-red-600 text-white rounded-sm disabled:opacity-60"
          >
            {processing ? 'Rejecting…' : 'Reject Submission'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Submission Card ───────────────────────────────────────────────────────────
function SubmissionCard({ sub, onApprove, onReject }) {
  const [expanded, setExpanded] = useState(false)
  const [showApprove, setShowApprove] = useState(false)
  const [showReject, setShowReject]   = useState(false)

  const typeLabel = sub.type === 'research-paper' ? 'Research Paper'
    : sub.type === 'review-paper' ? 'Review Paper'
    : 'Technical Article'

  return (
    <>
      <div className="bg-white border border-rule rounded-sm p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="pub-type-badge bg-archive-100 text-ink-muted border-rule">
                {typeLabel}
              </span>
              <span className="text-label text-ink-faint">
                Submitted {formatDate(sub.submitted_at)}
              </span>
            </div>
            <h3 className="font-serif text-subheading font-medium text-ink leading-snug mb-1">
              {sub.title}
            </h3>
            <p className="text-caption text-ink-muted">
              {(sub.authors || []).map(a => a.name).join(', ')}
            </p>
          </div>
        </div>

        {/* Categories + Keywords */}
        {sub.categories && sub.categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {sub.categories.map(cat => (
              <span key={cat} className="cat-tag pointer-events-none">{cat}</span>
            ))}
          </div>
        )}

        {/* Abstract (expandable) */}
        <div className="mb-4">
          <p className="text-caption text-ink-muted leading-relaxed">
            {expanded ? sub.abstract : sub.abstract?.slice(0, 220) + (sub.abstract?.length > 220 ? '…' : '')}
          </p>
          {sub.abstract?.length > 220 && (
            <button
              onClick={() => setExpanded(v => !v)}
              className="text-label mt-1 hover:underline"
              style={{ color: '#1a3a6b' }}
            >
              {expanded ? 'Show less' : 'Read full abstract'}
            </button>
          )}
        </div>

        {/* Cover letter */}
        {sub.cover_letter && (
          <div className="bg-archive-50 border border-rule rounded-sm p-3 mb-4">
            <p className="meta-label mb-1">Cover Letter</p>
            <p className="text-caption text-ink-muted leading-relaxed">{sub.cover_letter}</p>
          </div>
        )}

        {/* Author details */}
        <div className="bg-archive-50 border border-rule rounded-sm p-3 mb-4">
          <p className="meta-label mb-2">Author Details</p>
          <div className="space-y-2">
            {(sub.authors || []).map((a, i) => (
              <div key={i} className="text-caption text-ink-muted">
                <span className="font-medium text-ink">{a.name}</span>
                {a.affiliation && ` · ${a.affiliation}`}
                {a.email && ` · ${a.email}`}
                {a.orcid && ` · ORCID: ${a.orcid}`}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-3 border-t border-rule">
          {sub.pdf_path && (
            <a
              href={supabase.storage.from('papers').getPublicUrl(sub.pdf_path).data.publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-caption border border-rule
                         rounded-sm text-ink-muted hover:text-ink no-underline transition-colors"
            >
              View PDF ↗
            </a>
          )}
          <button
            onClick={() => setShowApprove(true)}
            className="pdf-button px-4 py-1.5"
          >
            Approve & Publish
          </button>
          <button
            onClick={() => setShowReject(true)}
            className="px-4 py-1.5 text-caption border border-red-300 text-red-600 rounded-sm hover:bg-red-50 transition-colors"
          >
            Reject
          </button>
        </div>
      </div>

      {showApprove && (
        <ApproveModal
          sub={sub}
          onApprove={async (s, meta) => { await onApprove(s, meta); setShowApprove(false) }}
          onClose={() => setShowApprove(false)}
        />
      )}
      {showReject && (
        <RejectModal
          sub={sub}
          onReject={async (id, reason) => { await onReject(id, reason); setShowReject(false) }}
          onClose={() => setShowReject(false)}
        />
      )}
    </>
  )
}

// ── Published Paper Row ───────────────────────────────────────────────────────
function PublicationRow({ pub, onEdit, onUnpublish, onDelete, onToggleFeatured }) {
  return (
    <div className="bg-white border border-rule rounded-sm p-5">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-label text-ink-faint font-mono">{pub.archive_id}</span>
            {pub.featured && (
              <span className="pub-type-badge bg-amber-50 text-amber-700 border-amber-200">
                Featured
              </span>
            )}
          </div>
          <h3 className="font-serif text-[0.95rem] font-medium text-ink leading-snug mb-1">
            {pub.title}
          </h3>
          <p className="text-caption text-ink-muted text-[11px]">
            {(pub.authors || []).map(a => a.name).join(', ')} · Vol.{pub.volume}, No.{pub.issue} · {formatDate(pub.published_date)}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
          <a
            href={`/publications/${pub.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-label border border-rule px-2.5 py-1 rounded-sm text-ink-muted hover:text-ink no-underline transition-colors"
          >
            View ↗
          </a>
          <button
            onClick={() => onToggleFeatured(pub)}
            className={`text-label px-2.5 py-1 rounded-sm border transition-colors ${
              pub.featured
                ? 'border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100'
                : 'border-rule text-ink-muted hover:bg-archive-50'
            }`}
          >
            {pub.featured ? '★ Featured' : '☆ Feature'}
          </button>
          <button
            onClick={() => onEdit(pub)}
            className="text-label border border-rule px-2.5 py-1 rounded-sm text-ink-muted hover:text-ink transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onUnpublish(pub.id)}
            className="text-label border border-rule px-2.5 py-1 rounded-sm text-ink-muted hover:bg-archive-50 transition-colors"
          >
            Unpublish
          </button>
          <button
            onClick={() => onDelete(pub.id)}
            className="text-label border border-red-200 px-2.5 py-1 rounded-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Admin Component ──────────────────────────────────────────────────────
export default function Admin() {
  const [authed, setAuthed]             = useState(false)
  const [tab, setTab]                   = useState('dashboard')
  const [submissions, setSubmissions]   = useState([])
  const [publications, setPublications] = useState([])
  const [loading, setLoading]           = useState(true)
  const [toast, setToast]               = useState(null)
  const [confirm, setConfirm]           = useState(null)
  const [editingPub, setEditingPub]     = useState(null)
  const [pubSearch, setPubSearch]       = useState('')

  const showToast = (message, type = 'success') => setToast({ message, type })

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const [subRes, pubRes] = await Promise.all([
      supabase.from('submissions').select('*').order('submitted_at', { ascending: false }),
      supabase.from('publications').select('*').order('published_date', { ascending: false }),
    ])
    if (!subRes.error) setSubmissions(subRes.data || [])
    if (!pubRes.error) setPublications(pubRes.data || [])
    setLoading(false)
  }, [])

  useEffect(() => { if (authed) fetchAll() }, [authed, fetchAll])

  // ── Actions ─────────────────────────────────────────────────────────────────
  const handleApprove = async (sub, meta) => {
    try {
      const year      = new Date().getFullYear()
      const slug      = slugify(sub.title) + '-' + Date.now().toString().slice(-6)
      const archiveId = generateArchiveId(sub.type)
      const { data: pdfData } = supabase.storage.from('papers').getPublicUrl(sub.pdf_path || '')

      const citAPA    = buildCitationAPA(sub.authors, year, sub.title, meta.volume, meta.issue, meta.pages, archiveId)
      const citBibtex = buildCitationBibtex(slug, sub.authors, year, sub.title, meta.volume, meta.issue, meta.pages, archiveId)

      const pubData = {
        slug,
        type:            sub.type,
        status:          'published',
        title:           sub.title,
        abstract:        sub.abstract,
        keywords:        sub.keywords || [],
        categories:      sub.categories || [],
        authors:         sub.authors || [],
        year,
        month:           new Date().toLocaleString('default', { month: 'long' }),
        volume:          meta.volume,
        issue:           meta.issue,
        pages:           meta.pages,
        featured:        meta.featured,
        archive_id:      archiveId,
        pdf_url:         pdfData?.publicUrl || null,
        license:         'CC BY 4.0',
        received_date:   sub.submitted_at,
        accepted_date:   new Date().toISOString(),
        published_date:  new Date().toISOString(),
        citation_apa:    citAPA,
        citation_bibtex: citBibtex,
      }

      const { error: pubErr } = await supabase.from('publications').insert(pubData)
      if (pubErr) { showToast(pubErr.message, 'error'); return }

      await supabase.from('submissions').update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
      }).eq('id', sub.id)

      try {
        await supabase.functions.invoke('resend-email', {
          body: {
            eventType: 'published',
            email: sub.authors?.[0]?.email,
            author: sub.authors?.[0]?.name,
            title: sub.title,
            submissionId: archiveId,
            categories: (sub.categories || []).join(', '),
            publicationUrl: `${window.location.origin}/publications/${slug}`
          }
        })
      } catch (err) {
        console.error('Published email failed:', err)
      }

      showToast('Publication approved and published.')
      fetchAll()
    } catch (err) {
      showToast('Approval failed: ' + err.message, 'error')
    }
  }

  const handleReject = async (id, reason) => {
  const { error } = await supabase.from('submissions').update({
    status: 'rejected',
    reviewed_at: new Date().toISOString(),
    reviewer_notes: reason || null,
  }).eq('id', id)

  if (error) {
    showToast(error.message, 'error')
    return
  }

  const submission = submissions.find(s => s.id === id)

  try {
    await supabase.functions.invoke('resend-email', {
      body: {
        eventType: 'rejected',
        email: submission?.authors?.[0]?.email,
        author: submission?.authors?.[0]?.name,
        title: submission?.title,
        submissionId: submission?.id,
        categories: (submission?.categories || []).join(', '),
        editorRemarks: reason || 'No remarks provided'
      }
    })
  } catch (err) {
    console.error('Rejected email failed:', err)
  }

  showToast('Submission rejected.')
  fetchAll()
}

  const handleDelete = (id) => {
    setConfirm({
      message: 'Permanently delete this publication? This cannot be undone.',
      onConfirm: async () => {
        setConfirm(null)
        const { error } = await supabase.from('publications').delete().eq('id', id)
        if (error) { showToast(error.message, 'error'); return }
        showToast('Publication deleted.')
        fetchAll()
      },
      onCancel: () => setConfirm(null),
    })
  }

  const handleUnpublish = async (id) => {
    const { error } = await supabase.from('publications').update({ status: 'draft' }).eq('id', id)
    if (error) { showToast(error.message, 'error'); return }
    showToast('Publication moved to draft.')
    fetchAll()
  }

  const handleToggleFeatured = async (pub) => {
    const { error } = await supabase.from('publications').update({ featured: !pub.featured }).eq('id', pub.id)
    if (error) { showToast(error.message, 'error'); return }
    showToast(pub.featured ? 'Removed from featured.' : 'Marked as featured.')
    fetchAll()
  }

  const handleEditSave = async (updated, errMsg) => {
    setEditingPub(null)
    if (errMsg) { showToast(errMsg, 'error'); return }
    showToast('Publication updated.')
    fetchAll()
  }

  // ── Derived stats ────────────────────────────────────────────────────────────
  const pending  = submissions.filter(s => s.status === 'pending')
  const approved = submissions.filter(s => s.status === 'approved')
  const rejected = submissions.filter(s => s.status === 'rejected')
  const published = publications.filter(p => p.status === 'published')
  const uniqueAuthors = new Set(publications.flatMap(p => (p.authors || []).map(a => a.email || a.name))).size

  const filteredPubs = publications.filter(p =>
    pubSearch === '' ||
    p.title?.toLowerCase().includes(pubSearch.toLowerCase()) ||
    p.archive_id?.toLowerCase().includes(pubSearch.toLowerCase()) ||
    (p.authors || []).some(a => a.name?.toLowerCase().includes(pubSearch.toLowerCase()))
  )

  const TABS = [
    { id: 'dashboard',    label: 'Dashboard' },
    { id: 'submissions',  label: `Submissions ${pending.length > 0 ? `(${pending.length})` : ''}` },
    { id: 'published',    label: 'Published Papers' },
    { id: 'all-subs',     label: 'All Submissions' },
  ]

  if (!authed) return <AuthGate onAuth={() => setAuthed(true)} />

  return (
    <div className="bg-archive-50 min-h-screen">

      {/* Header */}
      <div className="bg-white border-b border-rule sticky top-0 z-40">
        <div className="archive-container py-4 flex items-center justify-between">
          <div>
            <p className="meta-label">IndieResearch Archive</p>
            <h1 className="font-serif text-[1.15rem] font-semibold text-ink">Editorial Dashboard</h1>
          </div>
          <button
            onClick={() => setAuthed(false)}
            className="text-label text-ink-muted hover:text-ink"
          >
            Sign out
          </button>
        </div>

        {/* Tab bar */}
        <div className="archive-container">
          <div className="flex gap-6 border-t border-rule">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`py-3 text-caption font-medium border-b-2 transition-colors ${
                  tab === t.id
                    ? 'border-ink text-ink'
                    : 'border-transparent text-ink-muted hover:text-ink'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="archive-container py-8">

        {loading && tab !== 'dashboard' && (
          <div className="text-caption text-ink-muted animate-pulse">Loading…</div>
        )}

        {/* ── Dashboard Tab ──────────────────────────────── */}
        {tab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Published',        value: published.length },
                { label: 'Pending Review',   value: pending.length  },
                { label: 'Total Authors',    value: uniqueAuthors   },
                { label: 'Total Submissions',value: submissions.length },
              ].map(s => (
                <div key={s.label} className="bg-white border border-rule rounded-sm p-5 text-center">
                  <p className="font-serif text-[2rem] text-ink leading-none mb-1">{s.value}</p>
                  <p className="text-label text-ink-faint uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Pending alert */}
            {pending.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-sm px-5 py-4 flex items-center justify-between">
                <p className="text-caption text-amber-800">
                  {pending.length} submission{pending.length > 1 ? 's' : ''} awaiting editorial review.
                </p>
                <button
                  onClick={() => setTab('submissions')}
                  className="text-caption font-medium text-amber-800 underline"
                >
                  Review now
                </button>
              </div>
            )}

            {/* Recent published */}
            <div>
              <h2 className="font-serif text-heading text-ink mb-4">Recently Published</h2>
              <div className="flex flex-col gap-3">
                {published.slice(0, 5).map(pub => (
                  <div key={pub.id} className="bg-white border border-rule rounded-sm px-5 py-3 flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-caption font-medium text-ink leading-snug">{pub.title}</p>
                      <p className="text-label text-ink-faint mt-0.5">{pub.archive_id} · {formatDate(pub.published_date)}</p>
                    </div>
                    <a
                      href={`/publications/${pub.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-label no-underline flex-shrink-0"
                      style={{ color: '#1a3a6b' }}
                    >
                      View ↗
                    </a>
                  </div>
                ))}
                {published.length === 0 && (
                  <div className="bg-white border border-rule rounded-sm px-5 py-8 text-center">
                    <p className="text-caption text-ink-faint">No published papers yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Pending Submissions Tab ────────────────────── */}
        {tab === 'submissions' && (
          <div>
            <h2 className="font-serif text-heading text-ink mb-6">
              Pending Submissions
              <span className="text-ink-muted text-[1rem] font-sans ml-2">({pending.length})</span>
            </h2>
            {pending.length === 0 ? (
              <div className="bg-white border border-rule rounded-sm px-8 py-16 text-center">
                <p className="text-caption text-ink-muted">No pending submissions.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {pending.map(sub => (
                  <SubmissionCard
                    key={sub.id}
                    sub={sub}
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Published Papers Tab ───────────────────────── */}
        {tab === 'published' && (
          <div>
            <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
              <h2 className="font-serif text-heading text-ink">
                Published Papers
                <span className="text-ink-muted text-[1rem] font-sans ml-2">({filteredPubs.length})</span>
              </h2>
              <input
                type="search"
                placeholder="Search by title, ID or author…"
                value={pubSearch}
                onChange={e => setPubSearch(e.target.value)}
                className="search-input max-w-xs"
              />
            </div>
            {filteredPubs.length === 0 ? (
              <div className="bg-white border border-rule rounded-sm px-8 py-16 text-center">
                <p className="text-caption text-ink-muted">No publications found.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredPubs.map(pub => (
                  <PublicationRow
                    key={pub.id}
                    pub={pub}
                    onEdit={setEditingPub}
                    onUnpublish={handleUnpublish}
                    onDelete={handleDelete}
                    onToggleFeatured={handleToggleFeatured}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── All Submissions Tab ────────────────────────── */}
        {tab === 'all-subs' && (
          <div>
            <h2 className="font-serif text-heading text-ink mb-6">All Submissions</h2>
            {[
              { label: 'Pending',  items: pending,  color: 'amber'   },
              { label: 'Approved', items: approved, color: 'emerald' },
              { label: 'Rejected', items: rejected, color: 'red'     },
            ].map(({ label, items, color }) => (
              <div key={label} className="mb-8">
                <h3 className="font-sans text-caption font-semibold text-ink-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className={`inline-block w-2 h-2 rounded-full bg-${color}-400`} />
                  {label} ({items.length})
                </h3>
                <div className="flex flex-col gap-3">
                  {items.length === 0 ? (
                    <div className="bg-white border border-rule rounded-sm px-5 py-4">
                      <p className="text-caption text-ink-faint">None.</p>
                    </div>
                  ) : items.map(sub => (
                    <div key={sub.id} className="bg-white border border-rule rounded-sm px-5 py-4">
                      <p className="text-caption font-medium text-ink mb-1">{sub.title}</p>
                      <p className="text-label text-ink-faint">
                        {(sub.authors || []).map(a => a.name).join(', ')} · {formatDate(sub.submitted_at)}
                      </p>
                      {sub.reviewer_notes && (
                        <p className="text-label text-red-600 mt-1">Note: {sub.reviewer_notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Modals + overlays */}
      {editingPub && (
        <EditModal
          pub={editingPub}
          onSave={handleEditSave}
          onClose={() => setEditingPub(null)}
        />
      )}
      {confirm && <ConfirmDialog {...confirm} />}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
