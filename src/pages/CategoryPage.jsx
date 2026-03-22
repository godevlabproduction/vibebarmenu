import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMenu } from '../hooks/useMenu'
import { useLanguage } from '../context/LanguageContext'
import MenuItem from '../components/menu/MenuItem'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function CategoryPage() {
  const { categoryId } = useParams()
  const { categories, subcategories, items, loading, error } = useMenu()
  const { language, toggleLanguage, t } = useLanguage()
  const [layoutOverride, setLayoutOverride] = useState(null)
  const [activeSubcategory, setActiveSubcategory] = useState(null)
  const sectionRefs = useRef({})
  const navRef = useRef(null)
  const isScrollingToRef = useRef(false)

  const category = categories.find((c) => c.id === categoryId)
  const categoryItems = items.filter((item) => item.category_id === categoryId)
  const categorySubcategories = subcategories
    .filter((sc) => sc.category_id === categoryId)
    .sort((a, b) => a.sort_order - b.sort_order)
  const activeLayout = layoutOverride || category?.layout || 'grid-2'

  // Group items by subcategory
  const groupedItems = categorySubcategories.map((sc) => ({
    subcategory: sc,
    items: categoryItems
      .filter((item) => item.subcategory_id === sc.id)
      .sort((a, b) => a.sort_order - b.sort_order),
  })).filter((group) => group.items.length > 0)

  // Items without a subcategory
  const ungroupedItems = categoryItems.filter(
    (item) => !item.subcategory_id || !categorySubcategories.some((sc) => sc.id === item.subcategory_id)
  )

  const hasSubcategories = groupedItems.length > 0

  // Track active section on scroll
  useEffect(() => {
    if (!hasSubcategories) return

    const handleScroll = () => {
      if (isScrollingToRef.current) return

      const navHeight = navRef.current?.offsetHeight || 0
      const offset = navHeight + 120 // account for sticky nav + some padding

      let currentActive = null
      for (const group of groupedItems) {
        const el = sectionRefs.current[group.subcategory.id]
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= offset) {
            currentActive = group.subcategory.id
          }
        }
      }
      if (currentActive !== null) {
        setActiveSubcategory(currentActive)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hasSubcategories, groupedItems])

  // Scroll active pill into view in the horizontal nav
  useEffect(() => {
    if (!activeSubcategory || !navRef.current) return
    const activeBtn = navRef.current.querySelector(`[data-sub-id="${activeSubcategory}"]`)
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }
  }, [activeSubcategory])

  const scrollToSection = useCallback((subcategoryId) => {
    const el = sectionRefs.current[subcategoryId]
    if (!el) return

    setActiveSubcategory(subcategoryId)
    isScrollingToRef.current = true

    const navHeight = navRef.current?.offsetHeight || 0
    const y = el.getBoundingClientRect().top + window.scrollY - navHeight - 80

    window.scrollTo({ top: y, behavior: 'smooth' })

    // Re-enable scroll tracking after animation
    setTimeout(() => {
      isScrollingToRef.current = false
    }, 800)
  }, [])

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
    <div className="min-h-screen bg-black/40 text-chalk">
      <div className="max-w-2xl mx-auto px-[10%]">
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

        {/* Category heading */}
        <h1 className="font-chalk text-5xl md:text-6xl text-gold text-center mt-4 mb-2 tracking-wide">
          {t(category.name_mk, category.name_en)}
        </h1>
        <div className="w-16 h-px bg-chalk-muted mx-auto mb-4 opacity-50" />

        {/* Subcategory navigation pills */}
        {hasSubcategories && (
          <div
            ref={navRef}
            className="sticky top-0 z-20 -mx-[10%] px-[10%] py-3 mb-4"
          >
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {groupedItems.map((group) => (
                <button
                  key={group.subcategory.id}
                  data-sub-id={group.subcategory.id}
                  onClick={() => scrollToSection(group.subcategory.id)}
                  className={`px-4 py-1.5 rounded-full text-sm font-chalk tracking-wide whitespace-nowrap transition-all duration-200 ${
                    activeSubcategory === group.subcategory.id
                      ? 'text-gold border border-chalk-muted/40'
                      : 'text-chalk-muted border border-chalk-muted/20 hover:text-gold/70 hover:border-chalk-muted/30'
                  }`}
                >
                  {t(group.subcategory.name_mk, group.subcategory.name_en)}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="pb-16">
          {/* Grouped items by subcategory */}
          {hasSubcategories ? (
            <>
              {groupedItems.map((group) => (
                <div
                  key={group.subcategory.id}
                  ref={(el) => { sectionRefs.current[group.subcategory.id] = el }}
                  className="mb-8"
                >
                  {/* Subcategory header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-px flex-1 bg-chalk-muted/30" />
                    <h2 className="font-chalk text-2xl md:text-3xl text-chalk/80 whitespace-nowrap">
                      {t(group.subcategory.name_mk, group.subcategory.name_en)}
                    </h2>
                    <div className="h-px flex-1 bg-chalk-muted/30" />
                  </div>

                  {/* Items grid */}
                  <div className={`grid gap-4 ${activeLayout === 'grid-1' ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    {group.items.map((item) => (
                      <MenuItem key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              ))}

              {/* Ungrouped items (no subcategory assigned) */}
              {ungroupedItems.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-px flex-1 bg-chalk-muted/30" />
                    <h2 className="font-chalk text-2xl md:text-3xl text-chalk/80 whitespace-nowrap">
                      {t('Останато', 'Other')}
                    </h2>
                    <div className="h-px flex-1 bg-chalk-muted/30" />
                  </div>
                  <div className={`grid gap-4 ${activeLayout === 'grid-1' ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    {ungroupedItems.map((item) => (
                      <MenuItem key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* No subcategories — flat list like before */
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
          )}
        </div>

        <Footer />
      </div>
    </div>
  )
}
