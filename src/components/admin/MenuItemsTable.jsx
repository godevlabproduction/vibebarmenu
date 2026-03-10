import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function MenuItemsTable({ onEdit }) {
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterCat, setFilterCat] = useState('')

  const fetchData = async () => {
    setLoading(true)
    const [itemsRes, catsRes] = await Promise.all([
      supabase.from('menu_items').select('*').order('sort_order'),
      supabase.from('categories').select('*').order('sort_order'),
    ])
    setItems(itemsRes.data || [])
    setCategories(catsRes.data || [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const toggleAvailability = async (item) => {
    await supabase
      .from('menu_items')
      .update({ available: !item.available })
      .eq('id', item.id)
    fetchData()
  }

  const deleteItem = async (id) => {
    if (!window.confirm('Избриши го овој производ?')) return
    await supabase.from('menu_items').delete().eq('id', id)
    fetchData()
  }

  const getCategoryName = (categoryId) => {
    const cat = categories.find((c) => c.id === categoryId)
    return cat ? cat.name_mk : '\u2014'
  }

  const filtered = filterCat
    ? items.filter((i) => i.category_id === filterCat)
    : items

  if (loading) {
    return <div className="text-gray-400 py-8 text-center">Се вчитува...</div>
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Производи</h2>
          <span className="text-sm text-gray-400">{filtered.length}</span>
        </div>
        <button
          onClick={() => onEdit(null)}
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          + Додади
        </button>
      </div>

      {/* Category filter */}
      {categories.length > 1 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterCat('')}
            className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
              !filterCat
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Сите
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setFilterCat(c.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                filterCat === c.id
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {c.name_mk}
            </button>
          ))}
        </div>
      )}

      {/* Product cards */}
      <div className="space-y-2">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg border border-gray-200 p-3 flex items-center gap-3"
          >
            {/* Image */}
            {item.image_url ? (
              <img
                src={item.image_url}
                alt=""
                className="w-14 h-14 rounded-lg object-cover shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-lg bg-gray-100 shrink-0 flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900 truncate">{item.name_mk}</span>
                {!item.available && (
                  <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-medium">ИСКЛУЧЕН</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-400">{getCategoryName(item.category_id)}</span>
                <span className="text-xs text-gray-300">·</span>
                <span className="text-xs font-medium text-gray-700">{item.price} ден.</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => toggleAvailability(item)}
                className={`w-9 h-5 rounded-full relative transition-colors ${
                  item.available ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
                    item.available ? 'left-4' : 'left-0.5'
                  }`}
                />
              </button>
              <button
                onClick={() => onEdit(item)}
                className="p-2 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button
                onClick={() => deleteItem(item.id)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            Нема производи. Кликни "+ Додади" за да креираш.
          </div>
        )}
      </div>
    </div>
  )
}
