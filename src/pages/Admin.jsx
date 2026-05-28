import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Admin() {
  const [submissions, setSubmissions] = useState([]);
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
    fetchPublications();
  }, []);

  async function fetchSubmissions() {
    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .eq("status", "pending")
      .order("submitted_at", { ascending: false });

    if (!error) {
      setSubmissions(data);
    }

    setLoading(false);
  }

  async function fetchPublications() {
    const { data, error } = await supabase
      .from("publications")
      .select("*")
      .order("published_date", {
        ascending: false,
      });

    if (!error) {
      setPublications(data);
    }
  }

  async function approveSubmission(sub) {
    const { data: publicUrl } = supabase.storage
      .from("papers")
      .getPublicUrl(sub.pdf_path);

    const slug = sub.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const authors = sub.authors.map((a) => a.name).join(", ");

    const currentYear = new Date().getFullYear();

    const publicationData = {
      slug,

      type: sub.type,

      status: "published",

      title: sub.title,

      abstract: sub.abstract,

      keywords: sub.keywords,

      categories: sub.categories,

      authors: sub.authors,

      pdf_url: publicUrl.publicUrl,

      year: currentYear,

      month: new Date().toLocaleString("default", {
        month: "long",
      }),

      volume: 1,

      issue: 1,

      pages: "1-10",

      doi: sub.doi || null,

      doi_url: sub.doi ? `https://doi.org/${sub.doi}` : null,

      license: "CC BY 4.0",

      received_date: new Date().toISOString(),

      accepted_date: new Date().toISOString(),

      published_date: new Date().toISOString(),

      created_at: new Date().toISOString(),

      citation_apa: `${authors}. (${currentYear}). ${sub.title}. IndieResearch Archive.`,

      citation_bibtex: `@article{${slug},
  title={${sub.title}},
  author={${authors}},
  journal={IndieResearch Archive},
  year={${currentYear}}
}`,
    };

    const { error: pubError } = await supabase
      .from("publications")
      .insert(publicationData);

    if (pubError) {
      return alert(pubError.message);
    }

    await supabase
      .from("submissions")
      .update({
        status: "approved",
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", sub.id);

    alert("Paper published successfully.");

    fetchSubmissions();
    fetchPublications();
  }

  async function rejectSubmission(id) {
    const { error } = await supabase
      .from("submissions")
      .update({
        status: "rejected",
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      return alert(error.message);
    }

    alert("Submission rejected.");

    fetchSubmissions();
  }

  async function deletePublication(id) {
    const confirmed = confirm("Delete this publication permanently?");

    if (!confirmed) return;

    const { error } = await supabase.from("publications").delete().eq("id", id);

    if (error) {
      return alert(error.message);
    }

    alert("Publication deleted.");

    fetchPublications();
  }

  if (loading) {
    return <div className="archive-container py-20">Loading dashboard...</div>;
  }

  return (
    <div className="archive-container py-10">
      {/* Header */}
      <div className="mb-10">
        <p className="meta-label mb-2">Editorial Dashboard</p>

        <h1 className="font-serif text-display text-ink">Admin Panel</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="bg-white border border-rule rounded-sm p-5">
          <p className="text-label text-ink-faint mb-1">Pending Submissions</p>

          <h2 className="font-serif text-heading">{submissions.length}</h2>
        </div>

        <div className="bg-white border border-rule rounded-sm p-5">
          <p className="text-label text-ink-faint mb-1">Published Papers</p>

          <h2 className="font-serif text-heading">{publications.length}</h2>
        </div>

        <div className="bg-white border border-rule rounded-sm p-5">
          <p className="text-label text-ink-faint mb-1">Total Authors</p>

          <h2 className="font-serif text-heading">
            {
              new Set(
                publications.flatMap((pub) =>
                  (pub.authors || []).map((a) => a.name),
                ),
              ).size
            }
          </h2>
        </div>
      </div>

      {/* Pending Submissions */}
      <section className="mb-14">
        <h2 className="font-serif text-heading mb-6">Pending Submissions</h2>

        <div className="flex flex-col gap-5">
          {submissions.length === 0 && (
            <div className="bg-white border border-rule rounded-sm p-6">
              No pending submissions.
            </div>
          )}

          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="bg-white border border-rule rounded-sm p-6"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-serif text-subheading text-ink mb-2">
                    {sub.title}
                  </h3>

                  <p className="text-caption text-ink-muted">
                    {(sub.authors || []).map((a) => a.name).join(", ")}
                  </p>
                </div>

                <span className="pub-type-badge">{sub.type}</span>
              </div>

              <p className="text-caption text-ink-muted leading-relaxed mb-5">
                {sub.abstract}
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => approveSubmission(sub)}
                  className="pdf-button px-4 py-2"
                >
                  Approve & Publish
                </button>

                <button
                  onClick={() => rejectSubmission(sub.id)}
                  className="border border-red-300 text-red-600 px-4 py-2 rounded-sm"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Published Papers */}
      <section>
        <h2 className="font-serif text-heading mb-6">Published Papers</h2>

        <div className="flex flex-col gap-5">
          {publications.length === 0 && (
            <div className="bg-white border border-rule rounded-sm p-6">
              No published papers yet.
            </div>
          )}

          {publications.map((pub) => (
            <div
              key={pub.id}
              className="bg-white border border-rule rounded-sm p-6"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-serif text-subheading text-ink mb-2">
                    {pub.title}
                  </h3>

                  <p className="text-caption text-ink-muted">
                    {(pub.authors || []).map((a) => a.name).join(", ")}
                  </p>
                </div>

                <span className="pub-type-badge">{pub.type}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                <div>
                  <p className="text-label text-ink-faint mb-1">DOI</p>

                  <p className="text-caption text-ink">
                    {pub.doi || "Not assigned"}
                  </p>
                </div>

                <div>
                  <p className="text-label text-ink-faint mb-1">
                    Volume / Issue
                  </p>

                  <p className="text-caption text-ink">
                    Vol. {pub.volume}, Issue {pub.issue}
                  </p>
                </div>

                <div>
                  <p className="text-label text-ink-faint mb-1">Published</p>

                  <p className="text-caption text-ink">
                    {new Date(pub.published_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href={`/publications/${pub.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pdf-button px-4 py-2 no-underline"
                >
                  View Paper
                </a>

                <a
                  href={pub.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-rule px-4 py-2 rounded-sm no-underline"
                >
                  Download PDF
                </a>

                <button
                  onClick={() => deletePublication(pub.id)}
                  className="border border-red-300 text-red-600 px-4 py-2 rounded-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
