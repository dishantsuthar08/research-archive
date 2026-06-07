/**
 * Submit.jsx — Final production version
 *
 * Changes from the uploaded version:
 *
 * 1. Email payload field name mismatch fixed:
 *    Old: { eventType, email, author, title, categories }
 *    New Edge Function expects exactly these same fields — payload now matches exactly.
 *    The old version used 'eventType' correctly but Admin.jsx was using 'type' in some
 *    calls; this file now sets the canonical field names.
 *
 * 2. Added submissionId to the email payload so email_logs can join back to submissions.
 *    The submission insert now returns the created row's id and passes it to the email call.
 *
 * 3. Email error is caught silently and does NOT block the success screen.
 *    A console.error fires so it appears in Supabase Function Logs.
 *
 * 4. All existing form functionality (multi-author, ORCID, word count, PDF upload,
 *    category tags, cover letter) is preserved exactly.
 */

import { useState } from 'react'
import { supabase } from '../lib/supabase'

const CATEGORIES = [
  'Cybersecurity', 'Machine Learning', 'Internet of Things',
  'Financial Technology', 'Privacy & Security', 'Natural Language Processing',
  'Quantum Computing', 'Computer Architecture', 'Bioinformatics',
]

const TYPES = [
  { value: 'research-paper',    label: 'Research Paper'    },
  { value: 'review-paper',      label: 'Review Paper'      },
  { value: 'technical-article', label: 'Technical Article' },
]

function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length
}

// ── Send notification email — never throws, never blocks submission ───────────


export default function Submit() {
  const [form, setForm] = useState({
    title:       '',
    abstract:    '',
    type:        'research-paper',
    keywords:    '',
    coverLetter: '',
    authors: [{
      name: '', email: '', affiliation: '', orcid: '', corresponding: true,
    }],
  })
  const [pdfFile, setPdfFile]                       = useState(null)
  const [selectedCategories, setSelectedCategories] = useState([])
  const [status, setStatus]                         = useState('idle') // idle | uploading | success
  const [error, setError]                           = useState('')

  const toggleCategory = cat => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  const updateAuthor = (index, field, value) => {
    const updated = [...form.authors]
    updated[index] = { ...updated[index], [field]: value }
    setForm(p => ({ ...p, authors: updated }))
  }

  const addAuthor = () => {
    setForm(p => ({
      ...p,
      authors: [
        ...p.authors,
        { name: '', email: '', affiliation: '', orcid: '', corresponding: false },
      ],
    }))
  }

  const removeAuthor = index => {
    setForm(p => ({ ...p, authors: p.authors.filter((_, i) => i !== index) }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')

    // ── Client-side validation ───────────────────────────────────────────────
    if (!pdfFile) return setError('Please attach a PDF file.')
    if (pdfFile.size > 50 * 1024 * 1024) return setError('PDF must be under 50 MB.')
    if (selectedCategories.length === 0) return setError('Please select at least one subject category.')
    if (!form.authors[0].name.trim()) return setError('Please enter at least one author name.')
    if (!form.authors[0].email.trim()) return setError('Please enter the corresponding author email.')

    const wc = wordCount(form.abstract)
    if (wc < 50) return setError(`Abstract too short (${wc} words). Minimum 50 words recommended.`)

    setStatus('uploading')
    console.log('[Submit] Starting submission upload…')

    // ── Step 1: Upload PDF to Supabase Storage ───────────────────────────────
    const fileName = `${Date.now()}-${pdfFile.name.replace(/\s+/g, '-')}`
    console.log('[Submit] Uploading PDF:', fileName)

    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from('papers')
      .upload(fileName, pdfFile, { contentType: 'application/pdf' })

    if (uploadErr) {
      console.error('[Submit] PDF upload error:', uploadErr)
      setStatus('idle')
      return setError('PDF upload failed: ' + uploadErr.message)
    }

    console.log('[Submit] PDF uploaded to path:', uploadData.path)

    // ── Step 2: Insert submission record ─────────────────────────────────────
    const { data: subData, error: dbErr } = await supabase
      .from('submissions')
      .insert({
        title:        form.title,
        abstract:     form.abstract,
        type:         form.type,
        keywords:     form.keywords.split(',').map(k => k.trim()).filter(Boolean),
        categories:   selectedCategories,
        authors:      form.authors,
        pdf_path:     uploadData.path,
        cover_letter: form.coverLetter || null,
        status:       'pending',
      })
      .select('id')
      .single()

    if (dbErr) {
      console.error('[Submit] DB insert error:', dbErr)
      setStatus('idle')
      return setError('Submission failed: ' + dbErr.message)
    }

    console.log('[Submit] Submission saved — id:', subData?.id)

    // ── Step 3: Send notification email (non-blocking) ───────────────────────
    // Never awaited in a way that can block success screen.
    // Uses the exact payload shape expected by the new Edge Function.
    console.log("========== EMAIL START ==========");

    try {
      const { data, error } = await supabase.functions.invoke(
        "resend-email",
        {
          body: {
            eventType: "submission_received",
            email: form.authors[0].email,
            author: form.authors[0].name,
            title: form.title,
            categories: selectedCategories.join(", "),
            submissionId: subData.id,
          },
        }
      );

      console.log("EMAIL RESPONSE DATA:", data);
      console.log("EMAIL RESPONSE ERROR:", error);

      if (error) {
        console.error("EMAIL FUNCTION ERROR:", error);
      } else {
        console.log("EMAIL SENT SUCCESSFULLY");
      }
    } catch (err) {
      console.error("EMAIL EXCEPTION:", err);
    }

console.log("========== EMAIL END ==========");

    // ── Show success screen immediately ──────────────────────────────────────
    setStatus('success')
  }

  // ── Success screen ─────────────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <div className="archive-container py-20 text-center max-w-content mx-auto">
        <div className="bg-white border border-rule rounded-sm p-12">
          <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200
                          flex items-center justify-center mx-auto mb-5">
            <span className="text-emerald-600 text-xl">✓</span>
          </div>
          <h2 className="font-serif text-heading text-ink mb-3">Submission Received</h2>
          <p className="text-caption text-ink-muted max-w-prose mx-auto leading-relaxed">
            Thank you. Your manuscript has been received and will be reviewed by our
            editorial team. You will be contacted at the email address provided.
          </p>
          <p className="text-label text-ink-faint mt-4">
            Please allow 2–4 weeks for editorial review.
          </p>
        </div>
      </div>
    )
  }

  const abstractWords = wordCount(form.abstract)

  // ── Submission form ────────────────────────────────────────────────────────
  return (
    <div className="bg-archive-50">
      <div className="bg-white border-b border-rule">
        <div className="archive-container py-8">
          <p className="meta-label mb-1">Manuscript Submission</p>
          <h1 className="font-serif text-display text-ink mb-3">Submit a Paper</h1>
          <p className="text-caption text-ink-muted max-w-prose">
            Submit your research paper, review paper, or technical article.
            All submissions undergo editorial review before publication.
            No fees are charged at any stage.
          </p>
        </div>
      </div>

      <div className="archive-container py-10">
        <form onSubmit={handleSubmit} className="max-w-content">
          <div className="bg-white border border-rule rounded-sm p-8 flex flex-col gap-6">

            {/* Publication Type */}
            <div>
              <label className="meta-label block mb-2">Publication Type *</label>
              <select
                value={form.type}
                onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                className="search-input"
                required
              >
                {TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="meta-label block mb-2">Title *</label>
              <input
                type="text" required value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                className="search-input"
                placeholder="Full title of your manuscript"
              />
            </div>

            {/* Abstract */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="meta-label">Abstract *</label>
                <span className={`text-label ${
                  abstractWords < 50 ? 'text-red-500'
                  : abstractWords > 350 ? 'text-amber-600'
                  : 'text-ink-faint'
                }`}>
                  {abstractWords} words
                  {abstractWords < 50 ? ' (min 50)' : abstractWords > 350 ? ' (recommended ≤ 300)' : ''}
                </span>
              </div>
              <textarea
                required rows={8} value={form.abstract}
                onChange={e => setForm(p => ({ ...p, abstract: e.target.value }))}
                className="search-input resize-y"
                placeholder="Provide a complete abstract (150–300 words recommended)"
              />
            </div>

            {/* Keywords */}
            <div>
              <label className="meta-label block mb-2">Keywords</label>
              <input
                type="text" value={form.keywords}
                onChange={e => setForm(p => ({ ...p, keywords: e.target.value }))}
                className="search-input"
                placeholder="Comma-separated: Machine Learning, IoT Security, Edge Computing"
              />
            </div>

            {/* Categories */}
            <div>
              <label className="meta-label block mb-2">Subject Categories *</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat} type="button"
                    onClick={() => toggleCategory(cat)}
                    className="cat-tag"
                    style={selectedCategories.includes(cat)
                      ? { backgroundColor: '#e8eef7', borderColor: '#1a3a6b', color: '#1a3a6b' }
                      : {}}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Authors */}
            <fieldset className="border border-rule rounded-sm p-5">
              <legend className="meta-label px-2">Authors</legend>
              <div className="space-y-5 mt-3">
                {form.authors.map((author, index) => (
                  <div key={index} className="border border-rule rounded-sm p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-caption font-medium text-ink">
                        Author {index + 1}
                        {index === 0 && (
                          <span className="text-label text-ink-faint ml-1">(Corresponding)</span>
                        )}
                      </p>
                      {form.authors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeAuthor(index)}
                          className="text-label text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-label text-ink-faint block mb-1">Full Name *</label>
                        <input
                          type="text" required value={author.name}
                          onChange={e => updateAuthor(index, 'name', e.target.value)}
                          className="search-input" placeholder="Full Name"
                        />
                      </div>
                      <div>
                        <label className="text-label text-ink-faint block mb-1">
                          Email {index === 0 ? '*' : ''}
                        </label>
                        <input
                          type="email" required={index === 0} value={author.email}
                          onChange={e => updateAuthor(index, 'email', e.target.value)}
                          className="search-input" placeholder="author@email.com"
                        />
                      </div>
                      <div>
                        <label className="text-label text-ink-faint block mb-1">Affiliation</label>
                        <input
                          type="text" value={author.affiliation}
                          onChange={e => updateAuthor(index, 'affiliation', e.target.value)}
                          className="search-input"
                          placeholder="Institution or Independent Researcher"
                        />
                      </div>
                      <div>
                        <label className="text-label text-ink-faint block mb-1">ORCID</label>
                        <input
                          type="text" value={author.orcid}
                          onChange={e => updateAuthor(index, 'orcid', e.target.value)}
                          className="search-input" placeholder="0000-0000-0000-0000"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button" onClick={addAuthor}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-caption
                             border border-rule rounded-sm text-ink-muted
                             hover:bg-archive-50 transition-colors"
                >
                  + Add Co-Author
                </button>
              </div>
            </fieldset>

            {/* PDF Upload */}
            <div>
              <label className="meta-label block mb-2">Manuscript PDF *</label>
              <input
                type="file" accept=".pdf" required
                onChange={e => setPdfFile(e.target.files[0])}
                className="block w-full text-caption text-ink-muted
                           file:mr-3 file:py-1.5 file:px-3 file:rounded-sm
                           file:border file:border-rule file:text-caption
                           file:bg-archive-50 file:text-ink-muted
                           file:cursor-pointer hover:file:bg-archive-100"
              />
              {pdfFile && (
                <p className="text-label text-emerald-700 mt-1">
                  Selected: {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(1)} MB)
                </p>
              )}
              <p className="text-label text-ink-faint mt-1">PDF only · Max 50 MB</p>
            </div>

            {/* Cover Letter */}
            <div>
              <label className="meta-label block mb-2">Cover Letter (optional)</label>
              <textarea
                rows={4} value={form.coverLetter}
                onChange={e => setForm(p => ({ ...p, coverLetter: e.target.value }))}
                className="search-input resize-y"
                placeholder="Brief note to the editors about your manuscript"
              />
            </div>

            {error && (
              <div className="text-caption text-red-700 bg-red-50 border border-red-200
                              rounded-sm px-4 py-3">
                {error}
              </div>
            )}

            <div className="pt-3 border-t border-rule flex items-center justify-between
                            gap-4 flex-wrap">
              <p className="text-label text-ink-faint">
                By submitting you agree to publication under CC BY 4.0 · No author fees
              </p>
              <button
                type="submit"
                disabled={status === 'uploading'}
                className="pdf-button px-6 py-2.5 text-body disabled:opacity-50"
              >
                {status === 'uploading' ? 'Uploading…' : 'Submit Manuscript'}
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  )
};
