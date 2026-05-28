import { useParams, Link, Navigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import PublicationBadge from "../components/publication/PublicationBadge";
import DOIBadge from "../components/publication/DOIBadge";
import CategoryTag from "../components/publication/CategoryTag";
import CitationBlock from "../components/publication/CitationBlock";
import Divider from "../components/ui/Divider";
import { formatDate, formatAuthors } from "../utils/formatters";

function MetaRow({ label, value }) {
  return (
    <div className="flex gap-4 py-2 border-b border-rule last:border-0">
      <span className="meta-label w-32 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-caption text-ink flex-1">{value}</span>
    </div>
  );
}

export default function PublicationDetail() {
  const { slug } = useParams();
  const [pub, setPub] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublication();
  }, [slug]);

  async function fetchPublication() {
    const { data, error } = await supabase
      .from("publications")
      .select("*")
      .eq("slug", slug)
      .single();

    if (!error) {
      setPub(data);
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="archive-container py-20">Loading publication...</div>
    );
  }

  if (!pub) {
    return <Navigate to="/publications" replace />;
  }

  const {
    type,
    title,
    abstract,
    keywords,
    authors,
    year,
    month,
    doi,
    doi_url,
    pdf_url,
    categories,
    published_date,
    received_date,
    accepted_date,
    pages,
    volume,
    issue,
    license,
    references,
    citation_apa,
    citation_bibtex,
  } = pub;
    
  const citationAPA = citation_apa || "";
  const citationBibtex = citation_bibtex || "";

  
  return (
    <div className="bg-archive-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-rule">
        <div className="archive-container py-3">
          <Link
            to="/publications"
            className="inline-flex items-center gap-1.5 text-caption text-ink-muted hover:text-ink no-underline"
          >
            <ArrowLeftIcon style={{ width: "13px", height: "13px" }} />
            Back to Publications
          </Link>
        </div>
      </div>

      <div className="archive-container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 items-start">
          {/* ── Main content column ───────────────────────── */}
          <div>
            {/* Type + Volume info */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <PublicationBadge type={type} />
              <span className="text-label text-ink-faint">
                Volume {volume}, Issue {issue} · {month} {year}
              </span>
            </div>
            {/* Title */}
            <h1 className="font-serif text-[1.75rem] font-semibold text-ink leading-tight tracking-tight mb-4">
              {title}
            </h1>
            {/* Authors */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mb-5">
              {authors.map((author, i) => (
                <span key={author.id} className="text-caption text-ink-muted">
                  <Link
                    to={`/authors`}
                    className="font-medium text-accent-DEFAULT hover:underline no-underline"
                  >
                    {author.name}
                  </Link>
                  {author.corresponding && (
                    <span
                      title="Corresponding author"
                      className="ml-0.5 text-ink-faint"
                    >
                      *
                    </span>
                  )}
                  {author.affiliation && (
                    <span className="text-ink-faint">
                      {" "}
                      · {author.affiliation}
                    </span>
                  )}
                </span>
              ))}
            </div>
            {/* DOI + PDF actions */}
            <div className="flex items-center gap-3 flex-wrap mb-6">
              <DOIBadge doi={doi} doi_url={doi_url} />
              {pdf_url && (
                <a
                  href={pdf_url}
                  className="pdf-button"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ArrowDownTrayIcon
                    style={{ width: "14px", height: "14px" }}
                  />
                  Download PDF
                </a>
              )}
            </div>
            <div className="mt-8 flex gap-3">
              <a
                href={pub.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="pdf-button px-4 py-2 no-underline"
              >
                View Paper
              </a>

              <a
                href={pub.pdf_url}
                download
                className="border border-rule px-4 py-2 rounded-sm no-underline"
              >
                Download PDF
              </a>
            </div>
            <div className="mt-8">
              <iframe
                src={pub.pdf_url}
                width="100%"
                height="900px"
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
            </div>
            {/* Category tags */}
            <div className="flex flex-wrap gap-1.5 mb-8">
              {categories.map((cat) => (
                <CategoryTag key={cat} label={cat} />
              ))}
            </div>
            <Divider />
            {/* Abstract */}
            <section className="mb-8" aria-labelledby="abstract-heading">
              <h2
                id="abstract-heading"
                className="font-serif text-heading text-ink mb-4"
              >
                Abstract
              </h2>
              <p className="abstract-text text-ink leading-relaxed">
                {abstract}
              </p>
            </section>
            {/* Keywords */}
            {keywords && keywords.length > 0 && (
              <div className="mb-8">
                <p className="meta-label mb-2">Keywords</p>
                <div className="flex flex-wrap gap-2">
                  {keywords.map((kw) => (
                    <span key={kw} className="keyword-pill">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <Divider />

            
            {/* Citation */}
            <section className="mb-8" aria-labelledby="citation-heading">
              <h2
                id="citation-heading"
                className="font-serif text-heading text-ink mb-4"
              >
                How to Cite
              </h2>

              <CitationBlock
                citationAPA={citationAPA}
                citationBibtex={citationBibtex}
              />
            </section>
            <Divider />
            {/* References */}
            {references && references.length > 0 && (
              <section aria-labelledby="references-heading">
                <h2
                  id="references-heading"
                  className="font-serif text-heading text-ink mb-4"
                >
                  References
                </h2>
                <ol className="space-y-3 list-decimal list-inside">
                  {references.map((ref, i) => (
                    <li
                      key={i}
                      className="text-caption text-ink-muted leading-relaxed"
                    >
                      {ref}
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </div>

          {/* ── Sidebar metadata ──────────────────────────── */}
          <aside className="lg:sticky lg:top-20 flex flex-col gap-4">
            {/* Publication metadata card */}
            <div className="bg-white border border-rule rounded-sm p-5">
              <p className="meta-label mb-3">Publication Metadata</p>
              <MetaRow label="Published" value={formatDate(published_date)} />
              <MetaRow label="Received" value={formatDate(received_date)} />
              <MetaRow label="Accepted" value={formatDate(accepted_date)} />
              <MetaRow label="Pages" value={pages} />
              <MetaRow label="Volume" value={volume} />
              <MetaRow label="Issue" value={issue} />
              <MetaRow label="Licence" value={license} />
            </div>

            {/* Author ORCID section */}
            <div className="bg-white border border-rule rounded-sm p-5">
              <p className="meta-label mb-3">Authors</p>
              <div className="space-y-3">
                {authors.map((author) => (
                  <div key={author.id}>
                    <p className="text-caption font-medium text-ink">
                      {author.name}
                    </p>
                    {author.affiliation && (
                      <p className="text-label text-ink-faint">
                        {author.affiliation}
                      </p>
                    )}
                    {author.orcid && (
                      <a
                        href={`https://orcid.org/${author.orcid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-label text-accent-DEFAULT hover:underline no-underline mt-0.5"
                      >
                        <LinkIcon style={{ width: "11px", height: "11px" }} />
                        ORCID: {author.orcid}
                      </a>
                    )}
                    {author.corresponding && (
                      <p className="text-label text-ink-faint">
                        * Corresponding author
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* DOI card */}
            <div className="bg-white border border-rule rounded-sm p-5">
              <p className="meta-label mb-2">Persistent Identifier</p>
              <a
                href={doi_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-label text-ink-muted hover:text-accent-DEFAULT break-all no-underline block"
              >
                {doi}
              </a>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
