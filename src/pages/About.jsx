/**
 * About.jsx
 * PURPOSE: Archive information page — mission, scope, peer review policy, open access, contact.
 * Updated to remove all DOI references; uses Archive Identifier system instead.
 */

import { Link } from 'react-router-dom'
import Divider from '../components/ui/Divider'

function MetaDetail({ label, value }) {
  return (
    <div className="flex justify-between gap-2 py-1.5 border-b border-rule last:border-0">
      <span className="text-label text-ink-faint">{label}</span>
      <span className="text-label text-ink font-medium text-right">{value}</span>
    </div>
  )
}

export default function About() {
  return (
    <div className="bg-archive-50">

      {/* Header */}
      <div className="bg-white border-b border-rule">
        <div className="archive-container py-8">
          <p className="meta-label mb-1">Archive Information</p>
          <h1 className="font-serif text-display text-ink">About the Archive</h1>
        </div>
      </div>

      <div className="archive-container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-10 items-start">

          {/* Main content */}
          <div className="bg-white border border-rule rounded-sm p-8">

            <section className="mb-8">
              <h2 className="font-serif text-heading text-ink mb-4">Mission</h2>
              <p className="text-body text-ink-muted leading-relaxed mb-3">
                The IndieResearch Archive is an open-access repository for independent
                researchers to publish and disseminate their work in computer science,
                engineering, and related disciplines. We believe that rigorous research
                should not be gated behind institutional affiliations or journal paywalls.
              </p>
              <p className="text-body text-ink-muted leading-relaxed">
                All publications are freely available to read, download, and cite. Authors
                retain full copyright and grant the archive a non-exclusive licence to
                distribute under Creative Commons terms.
              </p>
            </section>

            <Divider />

            <section className="mb-8">
              <h2 className="font-serif text-heading text-ink mb-4">Scope</h2>
              <p className="text-body text-ink-muted leading-relaxed mb-4">
                This archive accepts the following publication types:
              </p>
              <div className="space-y-3">
                {[
                  ['Research Papers',    'Original research presenting novel findings, methodologies, or systems. Must include an empirical evaluation or formal analysis.'],
                  ['Review Papers',      'Systematic or narrative reviews of existing literature. Must provide structured synthesis and identify research gaps.'],
                  ['Technical Articles', 'In-depth technical analyses, implementation reports, or position papers grounded in technical evidence.'],
                ].map(([type, desc]) => (
                  <div key={type} className="flex gap-4 py-3 border-b border-rule last:border-0">
                    <span className="text-caption font-medium text-ink w-36 flex-shrink-0">{type}</span>
                    <span className="text-caption text-ink-muted leading-relaxed">{desc}</span>
                  </div>
                ))}
              </div>
              <p className="text-caption text-ink-muted mt-4">
                This archive does not publish books, conference proceedings, course
                materials, or commercial product documentation.
              </p>
            </section>

            <Divider />

            <section className="mb-8">
              <h2 className="font-serif text-heading text-ink mb-4">Archive Identifier System</h2>
              <p className="text-body text-ink-muted leading-relaxed mb-3">
                Each accepted publication receives a unique <strong>Archive Identifier</strong>
                (e.g. <code className="font-mono text-sm bg-archive-100 px-1.5 py-0.5 rounded">IRA-RP-2026-1779949121019</code>).
                This is an internal identifier used for citation and record-keeping within
                this archive. It is not a DOI and does not resolve through any external
                registry.
              </p>
              <p className="text-caption text-ink-muted">
                Authors who wish to register a DOI independently may do so through
                services such as Zenodo after publication here.
              </p>
            </section>

            <Divider />

            <section className="mb-8">
              <h2 className="font-serif text-heading text-ink mb-4">Peer Review Policy</h2>
              <p className="text-body text-ink-muted leading-relaxed mb-3">
                All submissions undergo editorial screening for scope and minimum quality
                standards. Submissions meeting those standards are published with clear
                attribution of independent (editorial-reviewed) status. Authors may
                voluntarily request open peer review; reviewer commentary is published
                alongside the paper in that case.
              </p>
              <p className="text-caption text-ink-muted">
                All editorial decisions are archived. Rejection reasons are communicated
                to corresponding authors by email.
              </p>
            </section>

            <Divider />

            <section className="mb-8">
              <h2 className="font-serif text-heading text-ink mb-4">Open Access &amp; Licensing</h2>
              <p className="text-body text-ink-muted leading-relaxed mb-3">
                All publications are distributed under Creative Commons Attribution 4.0
                International (CC BY 4.0) unless the author specifies an alternative CC
                licence at submission. No author publication fees are charged at any stage.
              </p>
            </section>

            <Divider />

            <section>
              <h2 className="font-serif text-heading text-ink mb-4">Submit Your Work</h2>
              <p className="text-body text-ink-muted leading-relaxed mb-5">
                Independent researchers are welcome to submit original research papers,
                review papers, and technical articles. Submissions are accepted on a
                rolling basis with no deadlines.
              </p>
              <Link
                to="/submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-white text-caption
                           font-medium rounded-sm transition-colors no-underline"
                style={{ backgroundColor: '#1a3a6b' }}
              >
                Submit a Manuscript →
              </Link>
            </section>

          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-20 flex flex-col gap-4">

            <div className="bg-white border border-rule rounded-sm p-5">
              <p className="meta-label mb-3">Archive Details</p>
              <MetaDetail label="Founded"        value="2024"                    />
              <MetaDetail label="ISSN (Online)"  value="0000-0001"               />
              <MetaDetail label="Publisher"      value="IndieResearch Archive"   />
              <MetaDetail label="Frequency"      value="Continuous publication"  />
              <MetaDetail label="Access"         value="Open Access"             />
              <MetaDetail label="Licence"        value="CC BY 4.0"               />
              <MetaDetail label="Author Fees"    value="None"                    />
            </div>

            <div className="bg-white border border-rule rounded-sm p-5">
              <p className="meta-label mb-3">Editorial Contact</p>
              <p className="text-caption text-ink-muted mb-2">
                For submission enquiries or editorial correspondence:
              </p>
              <a
                href="mailto:editors@indieresearch.io"
                className="text-caption no-underline hover:underline"
                style={{ color: '#1a3a6b' }}
              >
                editors@indieresearch.io
              </a>
            </div>

            <div className="bg-white border border-rule rounded-sm p-5">
              <p className="meta-label mb-3">Subjects Covered</p>
              <ul className="space-y-1">
                {[
                  'Cybersecurity', 'Machine Learning', 'Internet of Things',
                  'Financial Technology', 'Privacy & Security',
                  'Natural Language Processing', 'Quantum Computing',
                  'Computer Architecture', 'Bioinformatics',
                ].map(s => (
                  <li key={s} className="text-caption text-ink-muted">{s}</li>
                ))}
              </ul>
            </div>

          </aside>
      </div>
      </div>
      </div>
  )
}
