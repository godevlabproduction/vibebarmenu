import { useLanguage } from '../../context/LanguageContext'
import MenuItem from './MenuItem'

export default function ChalkboardSection({ category, items }) {
  const { t } = useLanguage()

  return (
    <div className="py-6 px-4 md:px-6">
      <h2 className="font-chalk text-4xl md:text-5xl text-gold text-center mb-6 tracking-wide">
        {t(category.name_mk, category.name_en)}
      </h2>
      <div className="w-16 h-px bg-chalk-muted mx-auto mb-6 opacity-50" />
      <div className="space-y-3">
        {items.map((item) => (
          <MenuItem key={item.id} item={item} />
        ))}
        {items.length === 0 && (
          <p className="text-chalk-muted text-center font-menu text-sm py-4">
            {t('Нема достапни производи', 'No items available')}
          </p>
        )}
      </div>
    </div>
  )
}
