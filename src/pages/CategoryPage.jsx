import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMenu } from '../hooks/useMenu'
import { useLanguage } from '../context/LanguageContext'
import MenuItem from '../components/menu/MenuItem'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function CategoryPage() {
  const { categoryId } = useParams()
  const { categories, items, loading, error } = useMenu()
  const { language, toggleLanguage, t } = useLanguage()
  const [layoutOverride, setLayoutOverride] = useState(null)

  const category = categories.find((c) => c.id === categoryId)
  const categoryItems = items.filter((item) => item.category_id === categoryId)
  const activeLayout = layoutOverride || category?.layout || 'grid-2'

  if (loading) {
    return (
      <div className="min-h-screen bg-board flex items-center justify-center">
        <span className="font-chalk text-3xl text-gold animate-pulse">Loading...</span>
      </div>
    )
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-board flex items-center justify-center flex-col gap-4">
        <span className="font-chalk text-2xl text-red-400">
          {t('Категоријата не е пронајдена', 'Category not found')}
        </span>
        <Link to="/" className="font-menu text-gold text-sm hover:underline">
          {t('← Назад кон мени', '← Back to menu')}
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black/40 text-chalk px-[10%]">
        <Navbar />

        {/* Back arrow + grid toggle */}
        <div className="flex items-center justify-between">
          <Link to="/" className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-white/40 text-white">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>

          <div className="flex gap-2">
            {/* 2-column grid */}
            <button
              onClick={() => setLayoutOverride('grid-2')}
              className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${
                activeLayout === 'grid-2'
                  ? 'border-white text-white'
                  : 'border-white/30 text-white/40'
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                <rect x="0" y="0" width="7" height="7" rx="1" />
                <rect x="9" y="0" width="7" height="7" rx="1" />
                <rect x="0" y="9" width="7" height="7" rx="1" />
                <rect x="9" y="9" width="7" height="7" rx="1" />
              </svg>
            </button>
            {/* 1-column grid */}
            <button
              onClick={() => setLayoutOverride('grid-1')}
              className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${
                activeLayout === 'grid-1'
                  ? 'border-white text-white'
                  : 'border-white/30 text-white/40'
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                <rect x="0" y="0" width="16" height="7" rx="1" />
                <rect x="0" y="9" width="16" height="7" rx="1" />
              </svg>
            </button>
          </div>
        </div>

        <div className="pb-16">
          {/* Category heading */}
          <h1 className="font-chalk text-5xl md:text-6xl text-gold text-center mt-4 mb-2 tracking-wide">
            {t(category.name_mk, category.name_en)}
          </h1>
          <div className="w-16 h-px bg-chalk-muted mx-auto mb-8 opacity-50" />

          {/* Items grid — layout from admin */}
          <div className={`grid gap-4 ${activeLayout === 'grid-1' ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {categoryItems.map((item) => (
              <MenuItem key={item.id} item={item} />
            ))}
            {categoryItems.length === 0 && (
              <p className="text-chalk-muted text-center font-menu text-sm py-8">
                {t('Нема достапни производи', 'No items available')}
              </p>
            )}
          </div>
        </div>

        <Footer />
    </div>
  )
}
