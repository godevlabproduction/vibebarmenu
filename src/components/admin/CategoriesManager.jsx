import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function CategoriesManager() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [newNameMk, setNewNameMk] = useState('')
  const [newNameEn, setNewNameEn] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editMk, setEditMk] = useState('')
  const [editEn, setEditEn] = useState('')

  const fetchCategories = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order')
    setCategories(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchCategories() }, [])

  const addCategory = async (e) => {
    e.preventDefault()
    if (!newNameMk.trim() || !newNameEn.trim()) return
    const maxOrder = Math.max(0, ...categories.map((c) => c.sort_order))
    await supabase.from('categories').insert({
      name_mk: newNameMk.trim(),
      name_en: newNameEn.trim(),
      sort_order: maxOrder + 1,
    })
    setNewNameMk('')
    setNewNameEn('')
    fetchCategories()
  }

  const startEdit = (cat) => {
    setEditingId(cat.id)
    setEditMk(cat.name_mk)
    setEditEn(cat.name_en)
  }

  const saveEdit = async (id) => {
    await supabase
      .from('categories')
      .update({ name_mk: editMk, name_en: editEn })
      .eq('id', id)
    setEditingId(null)
    fetchCategories()
  }

  const toggleLayout = async (cat) => {
    const newLayout = cat.layout === 'grid-1' ? 'grid-2' : 'grid-1'
    await supabase
      .from('categories')
      .update({ layout: newLayout })
      .eq('id', cat.id)
    fetchCategories()
  }

  const deleteCategory = async (id) => {
    if (!window.confirm('Избриши ја категоријата и сите нејзини производи?')) return
    await supabase.from('categories').delete().eq('id', id)
    fetchCategories()
  }

  const moveCategory = async (index, direction) => {
    const newCats = [...categories]
    const swapIndex = index + direction
    if (swapIndex < 0 || swapIndex >= newCats.length) return

    const tempOrder = newCats[index].sort_order
    newCats[index].sort_order = newCats[swapIndex].sort_order
    newCats[swapIndex].sort_order = tempOrder

    await Promise.all([
      supabase.from('categories').update({ sort_order: newCats[index].sort_order }).eq('id', newCats[index].id),
      supabase.from('categories').update({ sort_order: newCats[swapIndex].sort_order }).eq('id', newCats[swapIndex].id),
    ])
    fetchCategories()
  }

  if (loading) return <div className="text-gray-400 py-8 text-center">Се вчитува...</div>

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Категории</h2>

      {/* Add form */}
      <form onSubmit={addCategory} className="bg-white rounded-lg border border-gray-200 p-3 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
          <input
            placeholder="Име (МК)"
            value={newNameMk}
            onChange={(e) => setNewNameMk(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            placeholder="Име (EN)"
            value={newNameEn}
            onChange={(e) => setNewNameEn(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="w-full sm:w-auto px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          + Додади категорија
        </button>
      </form>

      {/* Category list */}
      <div className="space-y-2">
        {categories.map((cat, index) => (
          <div
            key={cat.id}
            className="bg-white rounded-lg border border-gray-200 p-3"
          >
            {editingId === cat.id ? (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                  <input
                    value={editMk}
                    onChange={(e) => setEditMk(e.target.value)}
                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    value={editEn}
                    onChange={(e) => setEditEn(e.target.value)}
                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => saveEdit(cat.id)}
                    className="px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg"
                  >
                    Зачувај
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-3 py-1.5 text-gray-500 text-xs font-medium"
                  >
                    Откажи
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* Reorder */}
                <div className="flex flex-col shrink-0">
                  <button
                    onClick={() => moveCategory(index, -1)}
                    disabled={index === 0}
                    className="text-gray-400 hover:text-gray-700 disabled:opacity-20 text-xs leading-none p-0.5"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => moveCategory(index, 1)}
                    disabled={index === categories.length - 1}
                    className="text-gray-400 hover:text-gray-700 disabled:opacity-20 text-xs leading-none p-0.5"
                  >
                    ▼
                  </button>
                </div>

                {/* Names */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{cat.name_mk}</div>
                  <div className="text-xs text-gray-400 truncate">{cat.name_en}</div>
                </div>

                {/* Layout toggle */}
                <button
                  onClick={() => toggleLayout(cat)}
                  className={`text-xs px-2 py-1 rounded-md font-medium transition-colors shrink-0 ${
                    cat.layout === 'grid-1'
                      ? 'bg-blue-50 text-blue-600'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {cat.layout === 'grid-1' ? '1 кол' : '2 кол'}
                </button>

                {/* Edit */}
                <button
                  onClick={() => startEdit(cat)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>

                {/* Delete */}
                <button
                  onClick={() => deleteCategory(cat.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ))}

        {categories.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            Нема категории. Додади една горе.
          </div>
        )}
      </div>
    </div>
  )
}
