import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../context/ToastContext'
import ConfirmModal from './ConfirmModal'

const PAGE_SIZE = 20

export default function MenuItemsTable({ onEdit }) {
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterCat, setFilterCat] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState('sort_order')
  const [sortDirection, setSortDirection] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [deleteTarget, setDeleteTarget] = useState(null)
  const { showToast } = useToast()

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

  // Reset page and selection on filter/search/sort change
  useEffect(() => {
    setCurrentPage(1)
    setSelectedIds(new Set())
  }, [filterCat, searchQuery, sortField, sortDirection])

  const toggleAvailability = async (item) => {
    const { error } = await supabase
      .from('menu_items')
      .update({ available: !item.available })
      .eq('id', item.id)
    if (error) {
      showToast('Грешка при промена', 'error')
    } else {
      showToast(item.available ? 'Производот е исклучен' : 'Производот е вклучен')
    }
    fetchData()
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    const { error } = await supabase.from('menu_items').delete().eq('id', deleteTarget)
    if (error) {
      showToast('Грешка при бришење', 'error')
    } else {
      showToast('Производот е избришан')
    }
    setDeleteTarget(null)
    fetchData()
  }

  const bulkUpdateAvailability = async (available) => {
    const ids = [...selectedIds]
    const { error } = await supabase
      .from('menu_items')
      .update({ available })
      .in('id', ids)
    if (error) {
      showToast('Грешка при промена', 'error')
    } else {
      showToast(`${ids.length} производи ${available ? 'вклучени' : 'исклучени'}`)
    }
    setSelectedIds(new Set())
    fetchData()
  }

  const getCategoryName = (categoryId) => {
    const cat = categories.find((c) => c.id === categoryId)
    return cat ? cat.name_mk : '\u2014'
  }

  // Filter
  let filtered = filterCat
    ? items.filter((i) => i.category_id === filterCat)
    : items

  // Search
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase()
    filtered = filtered.filter(
      (i) =>
        i.name_mk?.toLowerCase().includes(q) ||
        i.name_en?.toLowerCase().includes(q)
    )
  }

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0
    switch (sortField) {
      case 'name':
        cmp = (a.name_mk || '').localeCompare(b.name_mk || '')
        break
      case 'price':
        cmp = (a.price || 0) - (b.price || 0)
        break
      case 'category':
        cmp = getCategoryName(a.category_id).localeCompare(getCategoryName(b.category_id))
        break
      default:
        cmp = (a.sort_order || 0) - (b.sort_order || 0)
    }
    return sortDirection === 'desc' ? -cmp : cmp
  })

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const paginated = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    const pageIds = paginated.map((i) => i.id)
    const allSelected = pageIds.every((id) => selectedIds.has(id))
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        pageIds.forEach((id) => next.delete(id))
        return next
      })
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        pageIds.forEach((id) => next.add(id))
        return next
      })
    }
  }

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span className="text-gray-300 ml-1">↕</span>
    return <span className="text-gray-700 ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
  }

  if (loading) {
    return <div className="text-gray-400 py-8 text-center">Се вчитува...</div>
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Производи</h2>
          <span className="text-sm text-gray-400">{sorted.length}</span>
        </div>
        <button
          onClick={() => onEdit(null)}
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          + Додади
        </button>
      </div>

      {/* Search bar */}
      <div className="relative mb-3">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Пребарај производи..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-9 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
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

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 mb-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-sm font-medium text-blue-700">{selectedIds.size} избрани</span>
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => bulkUpdateAvailability(true)}
              className="px-3 py-1.5 text-xs font-medium bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Вклучи
            </button>
            <button
              onClick={() => bulkUpdateAvailability(false)}
              className="px-3 py-1.5 text-xs font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Исклучи
            </button>
          </div>
        </div>
      )}

      {/* Sort headers */}
      <div className="flex items-center gap-3 px-3 py-2 mb-1 text-[11px] font-medium text-gray-500 uppercase tracking-wider">
        <div className="w-5 shrink-0">
          <input
            type="checkbox"
            checked={paginated.length > 0 && paginated.every((i) => selectedIds.has(i.id))}
            onChange={toggleSelectAll}
            className="rounded border-gray-300"
          />
        </div>
        <div className="w-14 shrink-0" />
        <button onClick={() => handleSort('name')} className="flex-1 text-left flex items-center hover:text-gray-700">
          Име <SortIcon field="name" />
        </button>
        <button onClick={() => handleSort('category')} className="w-20 text-left flex items-center hover:text-gray-700 shrink-0 hidden sm:flex">
          Кат. <SortIcon field="category" />
        </button>
        <button onClick={() => handleSort('price')} className="w-16 text-right flex items-center justify-end hover:text-gray-700 shrink-0">
          Цена <SortIcon field="price" />
        </button>
        <div className="w-24 shrink-0" />
      </div>

      {/* Product cards */}
      <div className="space-y-2">
        {paginated.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-lg border p-3 flex items-center gap-3 ${
              selectedIds.has(item.id) ? 'border-blue-300 bg-blue-50/30' : 'border-gray-200'
            }`}
          >
            {/* Checkbox */}
            <div className="shrink-0">
              <input
                type="checkbox"
                checked={selectedIds.has(item.id)}
                onChange={() => toggleSelect(item.id)}
                className="rounded border-gray-300"
              />
            </div>

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
                <span className="text-xs text-gray-300">&middot;</span>
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
                onClick={() => setDeleteTarget(item.id)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}

        {paginated.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            {searchQuery ? 'Нема резултати за пребарувањето.' : 'Нема производи. Кликни "+ Додади" за да креираш.'}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-white transition-colors"
          >
            ← Претходна
          </button>
          <span className="text-xs text-gray-500">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-white transition-colors"
          >
            Следна →
          </button>
        </div>
      )}

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={deleteTarget !== null}
        title="Избриши производ"
        message="Дали сте сигурни дека сакате да го избришете овој производ? Ова дејство не може да се врати."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
