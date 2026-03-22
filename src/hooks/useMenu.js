import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const MOCK_CATEGORIES = [
  { id: '1', name_mk: 'Безалкохолни пијалоци', name_en: 'Non-Alcoholic Drinks', layout: 'grid-2', sort_order: 1, image_url: 'https://picsum.photos/seed/softdrinks/400/400' },
  { id: '2', name_mk: 'Кафе', name_en: 'Coffee', layout: 'grid-2', sort_order: 2, image_url: 'https://picsum.photos/seed/coffee/400/400' },
  { id: '3', name_mk: 'Бабл чаеви', name_en: 'Bubble Tea', layout: 'grid-1', sort_order: 3, image_url: 'https://picsum.photos/seed/bubbletea/400/400' },
  { id: '4', name_mk: 'Пиво', name_en: 'Beer', layout: 'grid-2', sort_order: 4, image_url: 'https://picsum.photos/seed/beer/400/400' },
  { id: '5', name_mk: 'Вина', name_en: 'Wines', layout: 'grid-2', sort_order: 5, image_url: 'https://picsum.photos/seed/wine/400/400' },
  { id: '6', name_mk: 'Алкохолни пијалоци', name_en: 'Alcoholic Drinks', layout: 'grid-2', sort_order: 6, image_url: 'https://picsum.photos/seed/spirits/400/400' },
  { id: '7', name_mk: 'Коктели', name_en: 'Cocktails', layout: 'grid-1', sort_order: 7, image_url: 'https://picsum.photos/seed/cocktail/400/400' },
]

const MOCK_SUBCATEGORIES = [
  // Non-Alcoholic Drinks
  { id: 's1', category_id: '1', name_mk: 'Сокови', name_en: 'Juices', sort_order: 1 },
  { id: 's2', category_id: '1', name_mk: 'Газирани', name_en: 'Carbonated', sort_order: 2 },
  // Coffee
  { id: 's3', category_id: '2', name_mk: 'Топли', name_en: 'Hot', sort_order: 1 },
  { id: 's4', category_id: '2', name_mk: 'Ладни', name_en: 'Iced', sort_order: 2 },
  // Bubble Tea
  { id: 's5', category_id: '3', name_mk: 'Класични', name_en: 'Classic', sort_order: 1 },
  // Beer
  { id: 's6', category_id: '4', name_mk: 'Домашно', name_en: 'Local', sort_order: 1 },
  { id: 's7', category_id: '4', name_mk: 'Увозно', name_en: 'Imported', sort_order: 2 },
  // Wines
  { id: 's8', category_id: '5', name_mk: 'Бели', name_en: 'White', sort_order: 1 },
  { id: 's9', category_id: '5', name_mk: 'Црвени', name_en: 'Red', sort_order: 2 },
  // Alcoholic Drinks
  { id: 's10', category_id: '6', name_mk: 'Жестоки', name_en: 'Spirits', sort_order: 1 },
  // Cocktails
  { id: 's11', category_id: '7', name_mk: 'Алкохолни', name_en: 'Alcoholic', sort_order: 1 },
  { id: 's12', category_id: '7', name_mk: 'Безалкохолни', name_en: 'Non-Alcoholic', sort_order: 2 },
]

const MOCK_ITEMS = [
  { id: '1', category_id: '1', subcategory_id: 's1', name_mk: 'Лимонада', name_en: 'Lemonade', description_mk: 'Свежа домашна лимонада', description_en: 'Fresh homemade lemonade', price: 180, image_url: 'https://picsum.photos/seed/lemonade/200/200', tags: [], available: true, sort_order: 1 },
  { id: '2', category_id: '1', subcategory_id: 's2', name_mk: 'Кола', name_en: 'Coca-Cola', description_mk: '0.33л', description_en: '0.33L', price: 120, image_url: 'https://picsum.photos/seed/cola/200/200', tags: [], available: true, sort_order: 2 },
  { id: '3', category_id: '2', subcategory_id: 's3', name_mk: 'Еспресо', name_en: 'Espresso', description_mk: 'Класично еспресо', description_en: 'Classic espresso', price: 80, image_url: 'https://picsum.photos/seed/espresso/200/200', tags: [], available: true, sort_order: 1 },
  { id: '4', category_id: '2', subcategory_id: 's3', name_mk: 'Капучино', name_en: 'Cappuccino', description_mk: 'Еспресо со млеко и пена', description_en: 'Espresso with steamed milk foam', price: 120, image_url: 'https://picsum.photos/seed/cappuccino/200/200', tags: [], available: true, sort_order: 2 },
  { id: '5', category_id: '3', subcategory_id: 's5', name_mk: 'Класичен бабл чај', name_en: 'Classic Bubble Tea', description_mk: 'Црн чај со тапиока перли', description_en: 'Black tea with tapioca pearls', price: 200, image_url: 'https://picsum.photos/seed/bubbletea/200/200', tags: [], available: true, sort_order: 1 },
  { id: '6', category_id: '4', subcategory_id: 's6', name_mk: 'Скопско', name_en: 'Skopsko', description_mk: 'Домашно пиво, 0.5л', description_en: 'Local lager, 0.5L', price: 150, image_url: 'https://picsum.photos/seed/skopsko/200/200', tags: [], available: true, sort_order: 1 },
  { id: '7', category_id: '4', subcategory_id: 's6', name_mk: 'Злата', name_en: 'Zlaten Dab', description_mk: 'Домашно пиво, 0.5л', description_en: 'Local lager, 0.5L', price: 160, image_url: 'https://picsum.photos/seed/zlatendab/200/200', tags: [], available: true, sort_order: 2 },
  { id: '8', category_id: '5', subcategory_id: 's8', name_mk: 'Шардоне', name_en: 'Chardonnay', description_mk: 'Бело вино, чаша', description_en: 'White wine, glass', price: 250, image_url: 'https://picsum.photos/seed/chardonnay/200/200', tags: [], available: true, sort_order: 1 },
  { id: '9', category_id: '5', subcategory_id: 's9', name_mk: 'Мерло', name_en: 'Merlot', description_mk: 'Црвено вино, чаша', description_en: 'Red wine, glass', price: 280, image_url: 'https://picsum.photos/seed/merlot/200/200', tags: [], available: true, sort_order: 2 },
  { id: '10', category_id: '6', subcategory_id: 's10', name_mk: 'Џин тоник', name_en: 'Gin & Tonic', description_mk: 'Џин со тоник вода', description_en: 'Gin with tonic water', price: 300, image_url: 'https://picsum.photos/seed/gintonic/200/200', tags: [], available: true, sort_order: 1 },
  { id: '11', category_id: '7', subcategory_id: 's11', name_mk: 'Мохито', name_en: 'Mojito', description_mk: 'Рум, нане, лимета, шеќер', description_en: 'Rum, mint, lime, sugar', price: 350, image_url: 'https://picsum.photos/seed/mojito/200/200', tags: [], available: true, sort_order: 1 },
  { id: '12', category_id: '7', subcategory_id: 's11', name_mk: 'Маргарита', name_en: 'Margarita', description_mk: 'Текила, лимета, портокал', description_en: 'Tequila, lime, orange liqueur', price: 380, image_url: 'https://picsum.photos/seed/margarita/200/200', tags: [], available: true, sort_order: 2 },
  { id: '13', category_id: '7', subcategory_id: 's12', name_mk: 'Негрони', name_en: 'Negroni', description_mk: 'Џин, кампари, вермут', description_en: 'Gin, Campari, sweet vermouth', price: 400, image_url: 'https://picsum.photos/seed/negroni/200/200', tags: [], available: true, sort_order: 3 },
]

const useMock = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === 'your-supabase-url'

export function useMenu() {
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchMenu() {
      setLoading(true)

      if (useMock) {
        setCategories(MOCK_CATEGORIES)
        setSubcategories(MOCK_SUBCATEGORIES)
        setItems(MOCK_ITEMS)
        setLoading(false)
        return
      }

      const [categoriesRes, subcategoriesRes, itemsRes] = await Promise.all([
        supabase.from('categories').select('*').order('sort_order'),
        supabase.from('subcategories').select('*').order('sort_order'),
        supabase.from('menu_items').select('*').order('sort_order'),
      ])

      if (categoriesRes.error || subcategoriesRes.error || itemsRes.error) {
        setError(categoriesRes.error || subcategoriesRes.error || itemsRes.error)
      } else {
        setCategories(categoriesRes.data)
        setSubcategories(subcategoriesRes.data)
        setItems(itemsRes.data.filter(item => item.available))
      }

      setLoading(false)
    }

    fetchMenu()
  }, [])

  return { categories, subcategories, items, loading, error }
}
