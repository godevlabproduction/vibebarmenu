import { CocktailIcon, WineIcon, BeerIcon, LeavesIcon } from '../../assets/illustrations'
import { useLanguage } from '../../context/LanguageContext'

export default function BrandingPanel() {
  const { t } = useLanguage()

  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-chalk">
      <LeavesIcon className="w-24 h-auto text-chalk-muted mb-4 opacity-60" />
      <h1 className="font-chalk text-6xl md:text-7xl text-gold tracking-wide">
        VibeBar
      </h1>
      <p className="font-chalk text-2xl md:text-3xl text-chalk mt-2 tracking-wider">
        {t('Секогаш добра атмосфера', 'Always Good Vibes')}
      </p>
      <div className="flex items-center gap-6 mt-8 text-chalk-muted opacity-50">
        <CocktailIcon className="w-14 h-auto" />
        <WineIcon className="w-10 h-auto" />
        <BeerIcon className="w-12 h-auto" />
      </div>
      <LeavesIcon className="w-24 h-auto text-chalk-muted mt-6 opacity-60 rotate-180" />
    </div>
  )
}
