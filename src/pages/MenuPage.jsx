import { Link } from 'react-router-dom'
import { useMenu } from '../hooks/useMenu'
import { useLanguage } from '../context/LanguageContext'
import Navbar from '../components/Navbar'

export default function MenuPage() {
  const { categories, loading, error } = useMenu()
  const { t } = useLanguage()

  if (loading) {
    return (
      <div className="min-h-screen bg-board flex items-center justify-center">
        <span className="font-chalk text-3xl text-gold animate-pulse">Loading...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-board flex items-center justify-center">
        <span className="font-chalk text-2xl text-red-400">
          {t('Грешка при вчитување на менито', 'Error loading menu')}
        </span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black/40 text-chalk px-[10%]">
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
      </div>
    </div>
  )
}
