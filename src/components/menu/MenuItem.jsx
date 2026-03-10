import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'

const TAG_STYLES = {
  vegan: 'text-green-400/70',
  'gluten-free': 'text-yellow-400/70',
  'sugar-free': 'text-blue-400/70',
  'non-alcoholic': 'text-purple-400/70',
}

export default function MenuItem({ item }) {
  const { t } = useLanguage()
  const name = t(item.name_mk, item.name_en)
  const description = t(item.description_mk, item.description_en)

  return (
    <Link to={`/menu/${item.category_id}/${item.id}`} className="font-menu block">
      {/* Product image */}
      <div className="aspect-square rounded-t overflow-hidden">
        <img
          src={item.image_url || '/no-image.webp'}
          alt={name}
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
        <div className="flex items-center justify-between">
          <span className="text-gold text-sm font-normal whitespace-nowrap">
            {item.price} ден.
          </span>
          {item.tags?.length > 0 && (
            <div className="flex gap-1">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className={`text-[10px] italic ${TAG_STYLES[tag] || 'text-chalk-muted'}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
