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
  const { t } = useLanguage()
  const [layoutOverride, setLayoutOverride] = useState(null)
  const [activeSubcategory, setActiveSubcategory] = useState(null)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const sectionRefs = useRef({})
  const navRef = useRef(null)
  const isScrollingToRef = useRef(false)

  const category = categories.find((c) => c.id === categoryId)
  const categoryItems = items.filter(
    (item) => item.category_id === categoryId && item.available
  )
  const categorySubcategories = subcategories
    .filter((sc) => sc.category_id === categoryId)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
  const activeLayout = layoutOverride || category?.layout || 'grid-2'

  // Group items by subcategory
  const groupedItems = categorySubcategories.map((sc) => ({
    subcategory: sc,
    items: categoryItems
      .filter((item) => item.subcategory_id === sc.id)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
  })).filter((group) => group.items.length > 0)

  // Items without a subcategory
  const ungroupedItems = categoryItems.filter(
    (item) => !item.subcategory_id || !categorySubcategories.some((sc) => sc.id === item.subcategory_id)
  )

  const hasSubcategories = groupedItems.length > 0

  // Track active section on scroll + show/hide scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)

      if (!hasSubcategories || isScrollingToRef.current) return

      const offset = 200

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

  // Center the active pill inside the nav strip WITHOUT moving the window.
  // (scrollIntoView would scroll the whole page to the top since the nav sits
  // near the top of the document.)
  useEffect(() => {
    if (!activeSubcategory || !navRef.current) return
    const nav = navRef.current
    const activeBtn = nav.querySelector(`[data-sub-id="${activeSubcategory}"]`)
    if (!activeBtn) return
    const targetLeft =
      activeBtn.offsetLeft - nav.offsetWidth / 2 + activeBtn.offsetWidth / 2
    nav.scrollTo({ left: targetLeft, behavior: 'smooth' })
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
        <span className="font-chalk text-3xl text-gold animate-pulse">{t('Се вчитува...', 'Loading...')}</span>
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
    <div className="min-h-screen text-chalk bg-black/40">
      <div className="max-w-2xl mx-auto px-[10%]">
        <Navbar />

        {/* Back arrow + title + grid toggle */}
        <div className="grid grid-cols-3 items-center mt-2">
          <div className="justify-self-start">
            <Link to="/" aria-label={t('Назад кон мени', 'Back to menu')} className="inline-flex items-center justify-center w-11 h-11 rounded-full border border-white/40 text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          </div>

          <h1 style={{ color: '#FFFFFF' }} className="font-chalk text-4xl md:text-5xl text-center tracking-wide">
            {t(category.name_mk, category.name_en)}
          </h1>

          <div className="flex justify-self-end">
            <button
              onClick={() => setLayoutOverride(activeLayout === 'grid-2' ? 'grid-1' : 'grid-2')}
              aria-label={
                activeLayout === 'grid-2'
                  ? t('Приказ во една колона', 'Switch to single-column view')
                  : t('Приказ во две колони', 'Switch to two-column view')
              }
              className="w-11 h-11 rounded-full border border-white/40 text-white flex items-center justify-center transition-colors hover:border-white"
            >
              {activeLayout === 'grid-2' ? (
                /* Currently 2 columns → tap for single column */
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                  <rect x="0" y="0" width="16" height="7" rx="1" />
                  <rect x="0" y="9" width="16" height="7" rx="1" />
                </svg>
              ) : (
                /* Currently 1 column → tap for two columns */
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                  <rect x="0" y="0" width="7" height="7" rx="1" />
                  <rect x="9" y="0" width="7" height="7" rx="1" />
                  <rect x="0" y="9" width="7" height="7" rx="1" />
                  <rect x="9" y="9" width="7" height="7" rx="1" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="w-16 h-px bg-chalk-muted mx-auto my-3 opacity-50" />

        {/* Subcategory navigation chips — sticky so they stay reachable while
            scrolling a long category */}
        {hasSubcategories && (
          <div
            ref={navRef}
            className="sticky top-0 z-20 w-screen ml-[calc(50%-50vw)] px-[10%] py-2 mb-4 backdrop-blur-sm flex gap-2 overflow-x-auto scrollbar-hide"
          >
            {groupedItems.map((group) => {
              const isActive = activeSubcategory === group.subcategory.id
              return (
                <button
                  key={group.subcategory.id}
                  data-sub-id={group.subcategory.id}
                  onClick={() => scrollToSection(group.subcategory.id)}
                  aria-current={isActive ? 'true' : undefined}
                  className={`px-4 py-2 rounded-full text-lg font-chalk tracking-wide whitespace-nowrap transition-colors duration-200 border ${
                    isActive
                      ? 'bg-white text-gray-900 border-white'
                      : 'text-white border-white/40 hover:border-white'
                  }`}
                >
                  {t(group.subcategory.name_mk, group.subcategory.name_en)}
                </button>
              )
            })}
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

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label={t('Кон врвот', 'Scroll to top')}
          className="fixed bottom-6 right-6 z-30 w-11 h-11 rounded-full border border-white/40 text-white flex items-center justify-center bg-board/80 backdrop-blur-sm transition-opacity"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}
    </div>
  )
}
