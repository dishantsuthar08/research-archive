import { Link } from 'react-router-dom'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { usePublications } from '../hooks/usePublications'
import PublicationCard from '../components/publication/PublicationCard'
import StatCard from '../components/ui/StatCard'
import SectionHeader from '../components/ui/SectionHeader'
import CategoryTag from '../components/publication/CategoryTag'

export default function Home() {
  const { featured, recent, stats, categories } = usePublications()

  return (
    <div className="bg-archive-50">

      {/* ── Hero Banner ─────────────────────────────────── */}
      <div className="bg-white border-b border-rule">
        <div className="archive-container py-12 lg:py-16">
          <div className="max-w-content">
            <p className="meta-label mb-3">
              Open Access Research Repository
            </p>
            <h1 className="font-serif text-[2.1rem] lg:text-[2.6rem] font-semibold text-ink leading-tight tracking-tight mb-5">
              IndieResearch Archive
            </h1>
            <p className="text-body text-ink-muted leading-relaxed mb-6 max-w-prose">
              An open-access repository for independent research papers, review papers,
              and technical articles in computer science and related disciplines.
              All publications are freely available under Creative Commons licences.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/publications"
                className="inline-flex items-center gap-2 px-4 py-2 bg-accent-DEFAULT text-white
                           text-caption font-medium rounded-sm hover:bg-accent-hover transition-colors no-underline"
              >
                Browse Publications
                <ArrowRightIcon style={{ width: '14px', height: '14px' }} />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-4 py-2 border border-rule bg-white
                           text-caption font-medium text-ink-muted rounded-sm hover:border-ink-muted
                           transition-colors no-underline"
              >
                About this Archive
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Archive Statistics ───────────────────────────── */}
      <div className="bg-archive-100 border-b border-rule">
        <div className="archive-container py-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <StatCard value={stats.total}           label="Publications" />
            <StatCard value={stats.researchPapers}  label="Research Papers" />
            <StatCard value={stats.reviewPapers}    label="Review Papers" />
            <StatCard value={stats.technicalArticles} label="Technical Articles" />
            <StatCard value={stats.authors}         label="Authors" />
          </div>
        </div>
      </div>

      <div className="archive-container py-10 lg:py-14">

        {/* ── Featured Publications ────────────────────────── */}
        {featured.length > 0 && (
          <section className="mb-12">
            <SectionHeader
              label="Highlighted"
              title="Featured Publications"
              action={
                <Link
                  to="/publications"
                  className="text-caption text-accent-DEFAULT hover:underline no-underline flex items-center gap-1"
                >
                  All publications
                  <ArrowRightIcon style={{ width: '13px', height: '13px' }} />
                </Link>
              }
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {featured.map(pub => (
                <PublicationCard key={pub.id} publication={pub} variant="featured" />
              ))}
            </div>
          </section>
        )}

        {/* ── Recent Publications ──────────────────────────── */}
        <section className="mb-12">
          <SectionHeader
            label="Latest"
            title="Recent Publications"
            action={
              <Link
                to="/publications"
                className="text-caption text-accent-DEFAULT hover:underline no-underline flex items-center gap-1"
              >
                View all
                <ArrowRightIcon style={{ width: '13px', height: '13px' }} />
              </Link>
            }
          />
          <div className="flex flex-col gap-4">
            {recent.slice(0, 4).map(pub => (
              <PublicationCard key={pub.id} publication={pub} />
            ))}
          </div>
        </section>

        {/* ── Browse by Category ───────────────────────────── */}
        <section>
          <SectionHeader
            label="Index"
            title="Subject Categories"
            action={
              <Link
                to="/categories"
                className="text-caption text-accent-DEFAULT hover:underline no-underline flex items-center gap-1"
              >
                All categories
                <ArrowRightIcon style={{ width: '13px', height: '13px' }} />
              </Link>
            }
          />
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <CategoryTag key={cat.id} label={cat.label} />
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
