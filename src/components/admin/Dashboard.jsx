import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function Dashboard({ onNavigate }) {
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const [catsRes, itemsRes] = await Promise.all([
        supabase.from('categories').select('*').order('sort_order'),
        supabase.from('menu_items').select('id, category_id, available'),
      ])
      setCategories(catsRes.data || [])
      setItems(itemsRes.data || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) {
    return <div className="text-gray-400 py-8 text-center">Се вчитува...</div>
  }

  const totalItems = items.length
  const totalCategories = categories.length
  const unavailableItems = items.filter((i) => !i.available).length

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Преглед</h2>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{totalItems}</div>
          <div className="text-xs text-gray-500 mt-1">Производи</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{totalCategories}</div>
          <div className="text-xs text-gray-500 mt-1">Категории</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-red-500">{unavailableItems}</div>
          <div className="text-xs text-gray-500 mt-1">Исклучени</div>
        </div>
      </div>

      {/* Per-category breakdown */}
      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-medium text-gray-700">По категорија</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {categories.map((cat) => {
            const count = items.filter((i) => i.category_id === cat.id).length
            const unavailable = items.filter((i) => i.category_id === cat.id && !i.available).length
            return (
              <div key={cat.id} className="px-4 py-2.5 flex items-center justify-between">
                <span className="text-sm text-gray-900">{cat.name_mk}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">{count}</span>
                  {unavailable > 0 && (
                    <span className="text-[10px] bg-red-50 text-red-500 px-1.5 py-0.5 rounded font-medium">
                      {unavailable} исклучени
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-3">
        <button
          onClick={() => onNavigate('items', { create: true })}
          className="flex-1 px-4 py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          + Нов производ
        </button>
        <button
          onClick={() => onNavigate('categories')}
          className="flex-1 px-4 py-3 bg-white text-gray-900 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          + Нова категорија
        </button>
      </div>
    </div>
  )
}
