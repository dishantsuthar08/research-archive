import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Admin() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
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

  async function approveSubmission(sub) {
    const { data: publicUrl } = supabase.storage
      .from("papers")
      .getPublicUrl(sub.pdf_path);

    const slug = sub.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

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

      citation_apa: `${sub.authors?.[0]?.name || "Unknown"} (${currentYear}). ${sub.title}. IndieResearch Archive, 1(1), 1-10.`,

      license: "CC BY 4.0",

      received_date: new Date().toISOString(),

      accepted_date: new Date().toISOString(),

      published_date: new Date().toISOString(),

      created_at: new Date().toISOString(),
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
  }


  async function rejectSubmission(sub) {
    await supabase
      .from("submissions")
      .update({
        status: "rejected",
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", sub.id);

  }

  if (loading) {
    return (
      <div className="archive-container py-20">Loading submissions...</div>
    );
  }

  return (
    <div className="archive-container py-10">
      <h1 className="font-serif text-display text-ink mb-8">Admin Dashboard</h1>

      <div className="flex flex-col gap-6">
        {submissions.length === 0 && <p>No pending submissions.</p>}

        {submissions.map((sub) => (
          <div
            key={sub.id}
            className="border border-rule rounded-sm p-6 bg-white"
          >
            <h2 className="font-serif text-heading text-ink mb-2">
              {sub.title}
            </h2>

            <p className="text-caption text-ink-muted mb-3">{sub.abstract}</p>

            <div className="flex gap-3">
              <button
                onClick={() => approveSubmission(sub)}
                className="pdf-button px-4 py-2"
              >
                Approve & Publish
              </button>

              <button
                onClick={() => rejectSubmission(sub.id)}
                className="px-3 py-1 border border-red-300 text-red-600 rounded-sm"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
