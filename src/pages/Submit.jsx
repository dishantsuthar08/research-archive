import { useState } from "react";
import { supabase } from "../lib/supabase";

const CATEGORIES = [
  "Cybersecurity",
  "Machine Learning",
  "Internet of Things",
  "Financial Technology",
  "Privacy & Security",
  "Natural Language Processing",
  "Quantum Computing",
  "Computer Architecture",
  "Bioinformatics",
];

const TYPES = [
  { value: "research-paper", label: "Research Paper" },
  { value: "review-paper", label: "Review Paper" },
  { value: "technical-article", label: "Technical Article" },
];

export default function Submit() {
  const [form, setForm] = useState({
    title: "",
    abstract: "",
    type: "research-paper",
    keywords: "",
    doi: "",
    coverLetter: "",
    authors: [
      {
        name: "",
        email: "",
        affiliation: "",
        orcid: "",
        corresponding: true,
      },
    ],
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | uploading | success | error
  const [error, setError] = useState("");

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pdfFile) return setError("Please attach a PDF file.");
    if (pdfFile.size > 50 * 1024 * 1024)
      return setError("PDF must be under 50 MB.");

    setStatus("uploading");
    setError("");

    // 1. Upload PDF to Supabase Storage
    const fileName = `${Date.now()}-${pdfFile.name.replace(/\s+/g, "-")}`;
    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from("papers")
      .upload(fileName, pdfFile, { contentType: "application/pdf" });

    if (uploadErr) {
      setStatus("error");
      return setError("PDF upload failed: " + uploadErr.message);
    }

    // 2. Save submission metadata
    const { error: dbErr } = await supabase.from("submissions").insert({
      title: form.title,
      abstract: form.abstract,
      type: form.type,
      keywords: form.keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
      categories: selectedCategories,
      authors: form.authors,
      pdf_path: uploadData.path,
      cover_letter: form.coverLetter,
      doi: form.doi,
    });

    if (dbErr) {
      setStatus("error");
      return setError("Submission failed: " + dbErr.message);
    }

    await supabase.functions.invoke("send-submission-email", {
      body: {
        email: form.authors[0].email,

        title: form.title,

        submissionId: `IRA-${Date.now()}`,

        authors: form.authors.map((a) => a.name).join(", "),

        categories: selectedCategories.join(", "),
      },
    });

    setStatus("success");
  };

  if (status === "success") {
    return (
      <div className="archive-container py-20 text-center">
        <p className="font-serif text-heading text-ink mb-2">
          Submission Received
        </p>
        <p className="text-caption text-ink-muted">
          Thank you. Your manuscript has been received and will be reviewed by
          our editors. You will be contacted at the email address provided.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-archive-50">
      <div className="bg-white border-b border-rule">
        <div className="archive-container py-8">
          <p className="meta-label mb-1">Manuscript Submission</p>
          <h1 className="font-serif text-display text-ink mb-3">
            Submit a Paper
          </h1>
          <p className="text-caption text-ink-muted max-w-prose">
            Submit your research paper, review paper, or technical article. All
            submissions are reviewed by our editorial team before publication.
          </p>
        </div>
      </div>

      <div className="archive-container py-10">
        <form onSubmit={handleSubmit} className="max-w-content">
          <div className="bg-white border border-rule rounded-sm p-8 flex flex-col gap-6">
            {/* Type */}
            <div>
              <label className="meta-label block mb-2">
                Publication Type *
              </label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm((p) => ({ ...p, type: e.target.value }))
                }
                className="search-input"
                required
              >
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="meta-label block mb-2">Title *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                className="search-input"
                placeholder="Full title of your manuscript"
              />
            </div>

            {/* Abstract */}
            <div>
              <label className="meta-label block mb-2">Abstract *</label>
              <textarea
                required
                rows={8}
                value={form.abstract}
                onChange={(e) =>
                  setForm((p) => ({ ...p, abstract: e.target.value }))
                }
                className="search-input resize-y"
                placeholder="Provide a complete abstract (150–300 words recommended)"
              />
            </div>

            {/* Keywords */}
            <div>
              <label className="meta-label block mb-2">Keywords</label>
              <input
                type="text"
                value={form.keywords}
                onChange={(e) =>
                  setForm((p) => ({ ...p, keywords: e.target.value }))
                }
                className="search-input"
                placeholder="Comma-separated: e.g. Machine Learning, IoT Security, Edge Computing"
              />
            </div>

            <div>
              <label className="meta-label block mb-2">DOI (optional)</label>

              <input
                type="text"
                value={form.doi}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    doi: e.target.value,
                  }))
                }
                className="search-input"
                placeholder="10.xxxx/xxxxx"
              />
            </div>

            {/* Categories */}
            <div>
              <label className="meta-label block mb-2">
                Subject Categories *
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`cat-tag ${
                      selectedCategories.includes(cat)
                        ? "bg-accent-light border-accent text-accent"
                        : ""
                    }`}
                    style={
                      selectedCategories.includes(cat)
                        ? {
                            backgroundColor: "#e8eef7",
                            borderColor: "#1a3a6b",
                            color: "#1a3a6b",
                          }
                        : {}
                    }
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <fieldset className="border border-rule rounded-sm p-4">
              <legend className="meta-label px-2">Authors</legend>

              <div className="space-y-6 mt-4">
                {form.authors.map((author, index) => (
                  <div
                    key={index}
                    className="border border-rule rounded-sm p-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-sm">
                        Author {index + 1}
                      </h3>

                      {form.authors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            setForm((prev) => ({
                              ...prev,
                              authors: prev.authors.filter(
                                (_, i) => i !== index,
                              ),
                            }));
                          }}
                          className="text-red-600 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-label text-ink-faint block mb-1">
                          Full Name *
                        </label>

                        <input
                          type="text"
                          required
                          value={author.name}
                          onChange={(e) => {
                            const updated = [...form.authors];
                            updated[index].name = e.target.value;
                            setForm((prev) => ({
                              ...prev,
                              authors: updated,
                            }));
                          }}
                          className="search-input"
                          placeholder="Dishant Suthar"
                        />
                      </div>

                      <div>
                        <label className="text-label text-ink-faint block mb-1">
                          Email *
                        </label>

                        <input
                          type="email"
                          required
                          value={author.email}
                          onChange={(e) => {
                            const updated = [...form.authors];
                            updated[index].email = e.target.value;
                            setForm((prev) => ({
                              ...prev,
                              authors: updated,
                            }));
                          }}
                          className="search-input"
                          placeholder="author@email.com"
                        />
                      </div>

                      <div>
                        <label className="text-label text-ink-faint block mb-1">
                          Affiliation
                        </label>

                        <input
                          type="text"
                          value={author.affiliation}
                          onChange={(e) => {
                            const updated = [...form.authors];
                            updated[index].affiliation = e.target.value;
                            setForm((prev) => ({
                              ...prev,
                              authors: updated,
                            }));
                          }}
                          className="search-input"
                          placeholder="Institution / Organization"
                        />
                      </div>

                      <div>
                        <label className="text-label text-ink-faint block mb-1">
                          ORCID
                        </label>

                        <input
                          type="text"
                          value={author.orcid}
                          onChange={(e) => {
                            const updated = [...form.authors];
                            updated[index].orcid = e.target.value;
                            setForm((prev) => ({
                              ...prev,
                              authors: updated,
                            }));
                          }}
                          className="search-input"
                          placeholder="0000-0000-0000-0000"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    setForm((prev) => ({
                      ...prev,
                      authors: [
                        ...prev.authors,
                        {
                          name: "",
                          email: "",
                          affiliation: "",
                          orcid: "",
                          corresponding: false,
                        },
                      ],
                    }));
                  }}
                  className="pdf-button"
                >
                  + Add Co-Author
                </button>
              </div>
            </fieldset>

            {/* PDF Upload */}
            <div>
              <label className="meta-label block mb-2">Manuscript PDF *</label>
              <input
                type="file"
                accept=".pdf"
                required
                onChange={(e) => setPdfFile(e.target.files[0])}
                className="block w-full text-caption text-ink-muted
                           file:mr-3 file:py-1.5 file:px-3 file:rounded-sm
                           file:border file:border-rule file:text-caption
                           file:bg-archive-50 file:text-ink-muted
                           file:cursor-pointer hover:file:bg-archive-100"
              />
              <p className="text-label text-ink-faint mt-1">
                PDF only · Max 50 MB
              </p>
            </div>

            {/* Cover Letter */}
            <div>
              <label className="meta-label block mb-2">
                Cover Letter (optional)
              </label>
              <textarea
                rows={4}
                value={form.coverLetter}
                onChange={(e) =>
                  setForm((p) => ({ ...p, coverLetter: e.target.value }))
                }
                className="search-input resize-y"
                placeholder="Brief note to the editors about your submission"
              />
            </div>

            {error && (
              <p className="text-caption text-red-600 bg-red-50 border border-red-200 rounded-sm px-4 py-3">
                {error}
              </p>
            )}

            <div className="pt-2 border-t border-rule flex items-center justify-between">
              <p className="text-label text-ink-faint">
                By submitting you agree to publication under CC BY 4.0
              </p>
              <button
                type="submit"
                disabled={status === "uploading"}
                className="pdf-button px-5 py-2 text-body disabled:opacity-50"
              >
                {status === "uploading" ? "Uploading…" : "Submit Manuscript"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
