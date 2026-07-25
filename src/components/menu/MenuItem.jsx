import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { TAG_LABELS, TAG_STYLES } from '../../lib/tags'

export default function MenuItem({ item }) {
  const { t } = useLanguage()
  const name = t(item.name_mk, item.name_en)
  const description = t(item.description_mk, item.description_en)
  const hasImage = Boolean(item.image_url)

  const tags = item.tags?.length > 0 && (
    <div className="flex gap-1 overflow-hidden">
      {item.tags.map((tag) => (
        <span
          key={tag}
          className={`shrink-0 text-[11px] leading-none px-1.5 py-0.5 rounded-full border ${TAG_STYLES[tag] || 'border-white/20 text-white/60'}`}
        >
          {TAG_LABELS[tag] ? t(TAG_LABELS[tag].mk, TAG_LABELS[tag].en) : tag}
        </span>
      ))}
    </div>
  )

  // Compact, text-forward card for items without a photo — avoids a wall of
  // giant "no image" placeholders on an image-light menu.
  if (!hasImage) {
    return (
      <Link to={`/menu/${item.category_id}/${item.id}`} className="font-menu block h-full">
        <div className="border border-white/30 rounded px-3 py-2.5 bg-white/5 h-full flex flex-col justify-center gap-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-white text-sm font-light leading-tight line-clamp-2 min-w-0 flex-1">{name}</span>
            <span className="text-gold text-sm font-normal whitespace-nowrap tabular-nums shrink-0">
              {item.price} ден.
            </span>
          </div>
          {description && (
            <span className="text-white/50 text-xs leading-snug line-clamp-1">{description}</span>
          )}
          {tags}
        </div>
      </Link>
    )
  }

  return (
    <Link to={`/menu/${item.category_id}/${item.id}`} className="font-menu block">
      {/* Product image */}
      <div className="aspect-square rounded-t overflow-hidden">
        <img
          src={item.image_url}
          alt={name}
          loading="lazy"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Text section with border — fixed layout */}
      <div className="border border-white/30 rounded-b px-1.5 py-0.5 bg-white/5 h-14 flex flex-col justify-center overflow-hidden gap-0">
        {/* Name */}
        <span className="text-white text-sm font-light leading-tight line-clamp-2">
          {name}
        </span>

        {/* Price */}
        <div className="flex items-center justify-between gap-1">
          <span className="text-gold text-sm font-normal whitespace-nowrap tabular-nums">
            {item.price} ден.
          </span>
          {tags}
        </div>
      </div>
    </Link>
  )
}
