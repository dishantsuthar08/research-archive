import { useState } from "react";

export default function CitationBlock({
  citationAPA,
  citationBibtex,
}) {

  const [tab, setTab] = useState("apa");

  const value =
    tab === "apa"
      ? citationAPA
      : citationBibtex;

  async function copyCitation() {

    await navigator.clipboard.writeText(value);

    alert("Citation copied.");
  }

  return (

    <div className="border border-rule rounded-sm bg-white p-4">

      <div className="flex items-center gap-2 mb-4">

        <button
          onClick={() => setTab("apa")}
          className={`px-3 py-1 text-xs border rounded-sm ${
            tab === "apa"
              ? "bg-ink text-white"
              : "bg-white"
          }`}
        >
          APA
        </button>

        <button
          onClick={() => setTab("bibtex")}
          className={`px-3 py-1 text-xs border rounded-sm ${
            tab === "bibtex"
              ? "bg-ink text-white"
              : "bg-white"
          }`}
        >
          BibTeX
        </button>

      </div>

      <div className="border border-rule rounded-sm p-4 bg-archive-50">

        <pre className="text-caption whitespace-pre-wrap break-words overflow-auto">
          {value}
        </pre>

      </div>

      <button
        onClick={copyCitation}
        className="mt-4 pdf-button px-4 py-2"
      >
        Copy Citation
      </button>

    </div>

  );
}