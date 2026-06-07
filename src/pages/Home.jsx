/**
 * Home.jsx
 *
 * WHY CHANGED:
 * - usePublications previously used static JSON → stats always 0 when
 *   real data was in Supabase. Now uses live hook with loading state.
 * - Added skeleton loader so stats don't flash "0" on load.
 * - CategoryDetail and Categories pages still read from local JSON for
 *   counts → now driven by live publications from the hook.
 * - Removed text-accent-DEFAULT (Tailwind @apply issue), replaced with
 *   inline style or proper class names.
 */

import { Link } from 'react-router-dom'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { usePublications } from '../hooks/usePublications'
import PublicationCard from '../components/publication/PublicationCard'
import StatCard from '../components/ui/StatCard'
import SectionHeader from '../components/ui/SectionHeader'
import CategoryTag from '../components/publication/CategoryTag'

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="stat-card animate-pulse">
          <div className="h-8 bg-archive-200 rounded mb-2 mx-auto w-12" />
          <div className="h-3 bg-archive-200 rounded w-20 mx-auto" />
        </div>
      ))}
    </div>
  )
}

function CardSkeleton() {
  return (
    <div className="pub-card p-6 animate-pulse">
      <div className="h-3 bg-archive-200 rounded w-24 mb-3" />
      <div className="h-5 bg-archive-200 rounded w-3/4 mb-2" />
      <div className="h-3 bg-archive-200 rounded w-1/2 mb-4" />
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-archive-200 rounded" />
        <div className="h-3 bg-archive-200 rounded w-5/6" />
      </div>
    </div>
  )
}

export default function Home() {
  const { featured, recent, stats, categories, loading, error } = usePublications()

  return (
    <div className="bg-archive-50">

      {/* ── Hero Banner ─────────────────────────────────── */}
      <div className="bg-white border-b border-rule">
        <div className="archive-container py-12 lg:py-16">
          <div className="max-w-content">
            <p className="meta-label mb-3">Open Access Research Repository</p>
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
                className="inline-flex items-center gap-2 px-4 py-2 text-white
                           text-caption font-medium rounded-sm transition-colors no-underline"
                style={{ backgroundColor: '#1a3a6b' }}
              >
                Browse Publications
                <ArrowRightIcon style={{ width: '14px', height: '14px' }} />
              </Link>
              <Link
                to="/submit"
                className="inline-flex items-center gap-2 px-4 py-2 border border-rule bg-white
                           text-caption font-medium text-ink-muted rounded-sm hover:border-ink-muted
                           transition-colors no-underline"
              >
                Submit a Paper
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
          {loading
            ? <StatsSkeleton />
            : (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <StatCard value={stats.total}             label="Publications" />
                <StatCard value={stats.researchPapers}    label="Research Papers" />
                <StatCard value={stats.reviewPapers}      label="Review Papers" />
                <StatCard value={stats.technicalArticles} label="Technical Articles" />
                <StatCard value={stats.authors}           label="Authors" />
              </div>
            )
          }
        </div>
      </div>

      <div className="archive-container py-10 lg:py-14">

        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-sm px-5 py-4">
            <p className="text-caption text-red-700">
              Could not load publications: {error}. Check your Supabase connection.
            </p>
          </div>
        )}

        {/* ── Featured Publications ────────────────────────── */}
        <section className="mb-12">
          <SectionHeader
            label="Highlighted"
            title="Featured Publications"
            action={
              <Link
                to="/publications"
                className="text-caption hover:underline no-underline flex items-center gap-1"
                style={{ color: '#1a3a6b' }}
              >
                All publications
                <ArrowRightIcon style={{ width: '13px', height: '13px' }} />
              </Link>
            }
          />
          {loading
            ? <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><CardSkeleton /><CardSkeleton /></div>
            : featured.length > 0
              ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {featured.map(pub => (
                    <PublicationCard key={pub.id} publication={pub} variant="featured" />
                  ))}
                </div>
              )
              : (
                <div className="bg-white border border-rule rounded-sm p-8 text-center">
                  <p className="text-caption text-ink-faint">No featured publications yet.</p>
                </div>
              )
          }
        </section>

        {/* ── Recent Publications ──────────────────────────── */}
        <section className="mb-12">
          <SectionHeader
            label="Latest"
            title="Recent Publications"
            action={
              <Link
                to="/publications"
                className="text-caption hover:underline no-underline flex items-center gap-1"
                style={{ color: '#1a3a6b' }}
              >
                View all
                <ArrowRightIcon style={{ width: '13px', height: '13px' }} />
              </Link>
            }
          />
          {loading
            ? <div className="flex flex-col gap-4"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
            : recent.length > 0
              ? (
                <div className="flex flex-col gap-4">
                  {recent.slice(0, 5).map(pub => (
                    <PublicationCard key={pub.id} publication={pub} />
                  ))}
                </div>
              )
              : (
                <div className="bg-white border border-rule rounded-sm p-8 text-center">
                  <p className="text-caption text-ink-faint">No publications yet. Be the first to submit.</p>
                </div>
              )
          }
        </section>

        {/* ── Browse by Category ───────────────────────────── */}
        <section>
          <SectionHeader
            label="Index"
            title="Subject Categories"
            action={
              <Link
                to="/categories"
                className="text-caption hover:underline no-underline flex items-center gap-1"
                style={{ color: '#1a3a6b' }}
              >
                All categories
                <ArrowRightIcon style={{ width: '13px', height: '13px' }} />
              </Link>
            }
          />
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <CategoryTag key={cat.id} label={cat.label} count={cat.count} />
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
