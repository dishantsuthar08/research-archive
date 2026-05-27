import { Link } from 'react-router-dom'
import { categorySlug } from '../../utils/formatters'

export default function CategoryTag({ label, clickable = true }) {
  if (!clickable) {
    return (
      <span className="cat-tag cursor-default pointer-events-none">
        {label}
      </span>
    )
  }
  return (
    <Link
      to={`/categories/${categorySlug(label)}`}
      className="cat-tag no-underline"
    >
      {label}
    </Link>
  )
}
