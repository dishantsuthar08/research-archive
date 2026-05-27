import Divider from '../components/ui/Divider'

export default function About() {
  return (
    <div className="bg-archive-50">

      {/* Header */}
      <div className="bg-white border-b border-rule">
        <div className="archive-container py-8">
          <p className="meta-label mb-1">Archive Information</p>
          <h1 className="font-serif text-display text-ink">About</h1>
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
                retain full copyright of their work and grant the archive a non-exclusive
                licence to distribute under Creative Commons terms.
              </p>
            </section>

            <Divider />

            <section className="mb-8">
              <h2 className="font-serif text-heading text-ink mb-4">Scope</h2>
              <p className="text-body text-ink-muted leading-relaxed mb-4">
                This archive accepts the following publication types:
              </p>
              <ul className="space-y-3 mb-4">
                {[
                  ['Research Papers', 'Original research presenting novel findings, methodologies, or systems. Must include an empirical evaluation or formal analysis.'],
                  ['Review Papers', 'Systematic or narrative reviews of existing literature. Must provide a structured synthesis and identify research gaps.'],
                  ['Technical Articles', 'In-depth technical analyses, implementation reports, or position papers. Must be grounded in technical evidence.'],
                ].map(([type, desc]) => (
                  <li key={type} className="flex gap-3">
                    <span className="font-medium text-ink text-caption flex-shrink-0 w-36">{type}</span>
                    <span className="text-caption text-ink-muted leading-relaxed">{desc}</span>
                  </li>
                ))}
              </ul>
              <p className="text-caption text-ink-muted">
                This archive does not publish books, conference proceedings management,
                course materials, or commercial product documentation.
              </p>
            </section>

            <Divider />

            <section className="mb-8">
              <h2 className="font-serif text-heading text-ink mb-4">Peer Review Policy</h2>
              <p className="text-body text-ink-muted leading-relaxed mb-3">
                All submissions undergo editorial screening for scope and quality standards.
                Submissions meeting minimum standards are published with clear attribution
                of independent (non-peer-reviewed) status. Authors may voluntarily submit
                to open peer review, in which case reviewer commentary is published
                alongside the paper.
              </p>
              <p className="text-caption text-ink-muted">
                We are committed to transparency. All editorial decisions and review
                histories are archived and made available upon request.
              </p>
            </section>

            <Divider />

            <section>
              <h2 className="font-serif text-heading text-ink mb-4">Open Access &amp; Licensing</h2>
              <p className="text-body text-ink-muted leading-relaxed mb-3">
                All publications in the IndieResearch Archive are published under Creative
                Commons Attribution 4.0 International (CC BY 4.0) unless the author
                specifies an alternative CC licence at submission. This allows anyone to
                share and adapt the work provided appropriate credit is given.
              </p>
              <p className="text-caption text-ink-muted">
                DOIs are assigned to all accepted publications through Zenodo, ensuring
                long-term accessibility and citability.
              </p>
            </section>

          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-20 flex flex-col gap-4">
            <div className="bg-white border border-rule rounded-sm p-5">
              <p className="meta-label mb-3">Archive Details</p>
              <div className="space-y-2">
                {[
                  ['Founded',       '2024'],
                  ['ISSN (Online)', '0000-0001'],
                  ['Publisher',     'IndieResearch Archive'],
                  ['Frequency',     'Continuous publication'],
                  ['Access',        'Open Access'],
                  ['Licence',       'CC BY 4.0'],
                  ['DOI Registrar', 'Zenodo / DataCite'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-2 py-1.5 border-b border-rule last:border-0">
                    <span className="text-label text-ink-faint">{label}</span>
                    <span className="text-label text-ink font-medium text-right">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-rule rounded-sm p-5">
              <p className="meta-label mb-3">Contact</p>
              <p className="text-caption text-ink-muted mb-2">
                For submission enquiries or editorial correspondence:
              </p>
              <a
                href="mailto:editors@indieresearch.io"
                className="text-caption text-accent-DEFAULT hover:underline no-underline"
              >
                editors@indieresearch.io
              </a>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
