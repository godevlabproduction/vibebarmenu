import { Link, useParams } from 'react-router-dom'
import { useMenu } from '../hooks/useMenu'
import { useLanguage } from '../context/LanguageContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const TAG_LABELS = {
  vegan: { mk: 'Вегански', en: 'Vegan' },
  'gluten-free': { mk: 'Без глутен', en: 'Gluten-free' },
  'sugar-free': { mk: 'Без шеќер', en: 'Sugar-free' },
  'non-alcoholic': { mk: 'Безалкохолен', en: 'Non-alcoholic' },
}

const TAG_STYLES = {
  vegan: 'border-green-400/40 text-green-400/80',
  'gluten-free': 'border-yellow-400/40 text-yellow-400/80',
  'sugar-free': 'border-blue-400/40 text-blue-400/80',
  'non-alcoholic': 'border-purple-400/40 text-purple-400/80',
}

export default function ProductPage() {
  const { categoryId, itemId } = useParams()
  const { categories, items, loading } = useMenu()
  const { t } = useLanguage()

  const category = categories.find((c) => c.id === categoryId)
  const item = items.find((i) => i.id === itemId)

  if (loading) {
    return (
      <div className="min-h-screen bg-board flex items-center justify-center">
        <span className="font-chalk text-3xl text-gold animate-pulse">Loading...</span>
      </div>
    )
  }

  if (!item || !category) {
    return (
      <div className="min-h-screen bg-board flex items-center justify-center flex-col gap-4">
        <span className="font-chalk text-2xl text-red-400">
          {t('Производот не е пронајден', 'Product not found')}
        </span>
        <Link to="/" className="font-menu text-gold text-sm hover:underline">
          {t('← Назад кон мени', '← Back to menu')}
        </Link>
      </div>
    )
  }

  const name = t(item.name_mk, item.name_en)
  const description = t(item.description_mk, item.description_en)

  return (
    <div className="min-h-screen bg-black/40 text-chalk">
      <div className="max-w-2xl mx-auto px-[10%]">
      <Navbar />

      {/* Back arrow */}
      <Link
        to={`/menu/${categoryId}`}
        className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-white/40 text-white"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </Link>

      <div className="pb-16 mt-4">
        {/* Product image */}
        <div className="aspect-square rounded-lg overflow-hidden border border-white/20">
          <img
            src={item.image_url || '/no-image.webp'}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product info */}
        <div className="mt-5">
          {/* Category label */}
          <span className="font-menu text-xs text-chalk-muted uppercase tracking-wider">
            {t(category.name_mk, category.name_en)}
          </span>

          {/* Name */}
          <h1 className="font-chalk text-4xl text-white mt-1 leading-tight">
            {name}
          </h1>

          {/* Price */}
          <div className="mt-3">
            <span className="font-menu text-2xl text-gold font-normal">
              {item.price} ден.
            </span>
          </div>

          {/* Divider */}
          <div className="w-12 h-px bg-white/20 my-2" />

          {/* Description */}
          {description && (
            <p className="font-menu text-sm text-white/70 leading-relaxed">
              {description}
            </p>
          )}

          {/* Tags */}
          {item.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className={`font-menu text-xs px-3 py-1 rounded-full border ${TAG_STYLES[tag] || 'border-white/20 text-white/50'}`}
                >
                  {TAG_LABELS[tag] ? t(TAG_LABELS[tag].mk, TAG_LABELS[tag].en) : tag}
                </span>
              ))}
            </div>
          )}

          {/* Availability */}
          {!item.available && (
            <div className="mt-4 font-menu text-sm text-red-400/80 border border-red-400/30 rounded-lg px-3 py-2 inline-block">
              {t('Моментално недостапен', 'Currently unavailable')}
            </div>
          )}
        </div>
      </div>

      <Footer />
      </div>
    </div>
  )
}
