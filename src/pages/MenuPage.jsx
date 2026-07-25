import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useMenu } from '../hooks/useMenu'
import { useLanguage } from '../context/LanguageContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

// Show the splash only once per page load. Navigating back to the menu (e.g.
// tapping the back arrow) remounts this component but must NOT replay it.
// Resets on a full page reload, which is the intended "first visit" moment.
let splashShown = false

export default function MenuPage() {
  const { categories, loading, error } = useMenu()
  const { t } = useLanguage()
  const [showSplash, setShowSplash] = useState(!splashShown)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    if (!loading && showSplash) {
      // Data loaded — start fade out, and mark it as shown for this page load
      splashShown = true
      const fadeTimer = setTimeout(() => setFadeOut(true), 1000)
      const removeTimer = setTimeout(() => setShowSplash(false), 1500)
      return () => {
        clearTimeout(fadeTimer)
        clearTimeout(removeTimer)
      }
    }
  }, [loading, showSplash])

  if (error) {
    return (
      <div className="min-h-screen bg-black/40 text-chalk flex items-center justify-center px-6 text-center">
        <span className="font-chalk text-2xl text-red-400">
          {t('Грешка при вчитување на менито', 'Error loading menu')}
        </span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black/40 text-chalk">
      <div className="max-w-2xl mx-auto px-[10%]">
      {/* Splash overlay */}
      {showSplash && (
        <div
          className={`fixed inset-0 z-50 backdrop-blur-xl bg-black/60 flex items-center justify-center transition-opacity duration-500 ${
            fadeOut ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <h1 className="font-chalk text-4xl md:text-5xl text-white tracking-[0.2em] flex">
            {'VIBE BAR'.split('').map((char, i) => (
              <span
                key={i}
                className="inline-block animate-[splash-letter_0.6s_ease-out_both]"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </h1>
        </div>
      )}

      <div className="flex flex-col">
        <Navbar />

        {/* Main content — category grid */}
        <main className="flex-1 pb-4 pt-6">
          <div className="grid grid-cols-2 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/menu/${cat.id}`}
                className="group relative aspect-square"
              >
                {/* Chalk-drawn frame */}
                <div className="absolute inset-0 border border-white/50 rounded-sm rotate-[0.5deg] group-hover:border-white transition-colors duration-500" />
                <div className="absolute inset-[3px] border border-white/30 rounded-sm -rotate-[0.3deg] group-hover:border-white/60 transition-colors duration-500" />

                {/* Card content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center px-3 gap-1">
                  {/* Category icon image */}
                  {cat.image_url && (
                    <img
                      src={cat.image_url}
                      alt={t(cat.name_mk, cat.name_en)}
                      loading="lazy"
                      className="w-20 h-20 md:w-28 md:h-28 object-contain group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] transition-all duration-500"
                    />
                  )}
                  <h2 className="font-chalk text-xl md:text-2xl text-white group-hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.3)] transition-all duration-500 tracking-wider text-center leading-tight h-[2lh] flex items-center">
                    {t(cat.name_mk, cat.name_en)}
                  </h2>
                </div>
              </Link>
            ))}
          </div>
        </main>

        <Footer />
      </div>
      </div>
    </div>
  )
}
