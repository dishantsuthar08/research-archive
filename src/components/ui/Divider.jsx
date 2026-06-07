/**
 * Divider.jsx
 * PURPOSE: Thin horizontal rule used between sections on detail pages.
 */

export default function Divider({ label }) {
  if (!label) return <hr className="border-rule my-8" />
  return (
    <div className="flex items-center gap-4 my-8">
      <div className="flex-1 border-t border-rule" />
      <span className="meta-label">{label}</span>
      <div className="flex-1 border-t border-rule" />
    </div>
  )
}
