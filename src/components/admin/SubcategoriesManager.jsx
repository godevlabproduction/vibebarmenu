import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../context/ToastContext'
import ConfirmModal from './ConfirmModal'

export default function SubcategoriesManager() {
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [newNameMk, setNewNameMk] = useState('')
  const [newNameEn, setNewNameEn] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editMk, setEditMk] = useState('')
  const [editEn, setEditEn] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const { showToast } = useToast()

  const fetchData = async () => {
    const [catsRes, subsRes] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('subcategories').select('*').order('sort_order'),
    ])
    setCategories(catsRes.data || [])
    setSubcategories(subsRes.data || [])
    if (!selectedCategory && catsRes.data?.length > 0) {
      setSelectedCategory(catsRes.data[0].id)
    }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const filteredSubs = subcategories
    .filter((s) => s.category_id === selectedCategory)
    .sort((a, b) => a.sort_order - b.sort_order)

  const addSubcategory = async (e) => {
    e.preventDefault()
    if (!newNameMk.trim() || !newNameEn.trim() || !selectedCategory) return
    const maxOrder = Math.max(0, ...filteredSubs.map((s) => s.sort_order || 0))
    const { error } = await supabase.from('subcategories').insert({
      category_id: selectedCategory,
      name_mk: newNameMk.trim(),
      name_en: newNameEn.trim(),
      sort_order: maxOrder + 1,
    })
    if (error) {
      showToast('Грешка: ' + error.message, 'error')
    } else {
      setNewNameMk('')
      setNewNameEn('')
      showToast('Поткатегоријата е додадена')
      fetchData()
    }
  }

  const startEdit = (sub) => {
    setEditingId(sub.id)
    setEditMk(sub.name_mk)
    setEditEn(sub.name_en)
  }

  const saveEdit = async (id) => {
    const { error } = await supabase
      .from('subcategories')
      .update({ name_mk: editMk, name_en: editEn })
      .eq('id', id)
    if (error) {
      showToast('Грешка: ' + error.message, 'error')
    } else {
      setEditingId(null)
      showToast('Поткатегоријата е зачувана')
      fetchData()
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    const { error } = await supabase.from('subcategories').delete().eq('id', deleteTarget)
    if (error) {
      showToast('Грешка при бришење', 'error')
    } else {
      showToast('Поткатегоријата е избришана')
    }
    setDeleteTarget(null)
    fetchData()
  }

  const moveSubcategory = async (sub, direction) => {
    const idx = filteredSubs.findIndex((s) => s.id === sub.id)
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= filteredSubs.length) return

    const other = filteredSubs[swapIdx]
    const results = await Promise.all([
      supabase.from('subcategories').update({ sort_order: other.sort_order }).eq('id', sub.id),
      supabase.from('subcategories').update({ sort_order: sub.sort_order }).eq('id', other.id),
    ])
    if (results.some((r) => r.error)) {
      showToast('Грешка при преместување', 'error')
    }
    fetchData()
  }

  if (loading) return <div className="text-gray-400 py-8 text-center">Се вчитува...</div>

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Поткатегории</h2>

      {/* Category selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Категорија</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name_mk} / {c.name_en}
            </option>
          ))}
        </select>
      </div>

      {/* Add form */}
      <form onSubmit={addSubcategory} className="bg-white rounded-lg border border-gray-200 p-3 mb-4">
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
          + Додади поткатегорија
        </button>
      </form>

      {/* Subcategory list */}
      <div className="space-y-2">
        {filteredSubs.map((sub, idx) => (
          <div key={sub.id} className="bg-white rounded-lg border border-gray-200 p-3">
            {editingId === sub.id ? (
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
                  <button onClick={() => saveEdit(sub.id)} className="px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg">
                    Зачувај
                  </button>
                  <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-gray-500 text-xs font-medium">
                    Откажи
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* Reorder buttons */}
                <div className="flex flex-col shrink-0">
                  <button
                    onClick={() => moveSubcategory(sub, 'up')}
                    disabled={idx === 0}
                    className="text-gray-300 hover:text-gray-500 disabled:opacity-20 p-0.5"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => moveSubcategory(sub, 'down')}
                    disabled={idx === filteredSubs.length - 1}
                    className="text-gray-300 hover:text-gray-500 disabled:opacity-20 p-0.5"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Names */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{sub.name_mk}</div>
                  <div className="text-xs text-gray-400 truncate">{sub.name_en}</div>
                </div>

                {/* Edit */}
                <button onClick={() => startEdit(sub)} className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>

                {/* Delete */}
                <button onClick={() => setDeleteTarget(sub.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ))}

        {filteredSubs.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            Нема поткатегории за оваа категорија.
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={deleteTarget !== null}
        title="Избриши поткатегорија"
        message="Дали сте сигурни дека сакате да ја избришете оваа поткатегорија? Производите нема да бидат избришани, но ќе останат без поткатегорија."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
