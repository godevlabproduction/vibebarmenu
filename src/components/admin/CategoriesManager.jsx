import { useState, useEffect } from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { supabase } from '../../lib/supabase'
import { removeStorageFile } from '../../lib/storage'
import { useToast } from '../../context/ToastContext'
import ConfirmModal from './ConfirmModal'

function SortableCategoryItem({ cat, isEditing, editMk, editEn, editImagePreview, editImageUrl, uploading, onEditMk, onEditEn, onEditImageChange, onClearImage, onSaveEdit, onCancelEdit, onStartEdit, onToggleLayout, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cat.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="bg-white rounded-lg border border-gray-200 p-3">
      {isEditing ? (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
            <input
              value={editMk}
              onChange={(e) => onEditMk(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              value={editEn}
              onChange={(e) => onEditEn(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <label className="cursor-pointer block mb-2">
            {(editImagePreview || editImageUrl) ? (
              <div className="relative w-full h-24 rounded-lg overflow-hidden bg-gray-100">
                <img src={editImagePreview || editImageUrl} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
                  <span className="text-white text-xs font-medium opacity-0 hover:opacity-100">Промени</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onClearImage()
                  }}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="w-full h-16 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center gap-2 hover:border-gray-400 transition-colors">
                <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs text-gray-400">Додади слика</span>
              </div>
            )}
            <input type="file" accept="image/*" onChange={onEditImageChange} className="hidden" />
          </label>
          <div className="flex gap-2">
            <button onClick={() => onSaveEdit(cat.id)} disabled={uploading} className="px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg disabled:opacity-50">
              {uploading ? 'Се качува...' : 'Зачувај'}
            </button>
            <button onClick={onCancelEdit} className="px-3 py-1.5 text-gray-500 text-xs font-medium">Откажи</button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {/* Drag handle */}
          <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-gray-300 hover:text-gray-500 shrink-0 touch-none">
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="5" cy="3" r="1.5" /><circle cx="11" cy="3" r="1.5" />
              <circle cx="5" cy="8" r="1.5" /><circle cx="11" cy="8" r="1.5" />
              <circle cx="5" cy="13" r="1.5" /><circle cx="11" cy="13" r="1.5" />
            </svg>
          </button>

          {/* Image thumbnail */}
          {cat.image_url ? (
            <img src={cat.image_url} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded bg-gray-100 shrink-0 flex items-center justify-center">
              <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Names */}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">{cat.name_mk}</div>
            <div className="text-xs text-gray-400 truncate">{cat.name_en}</div>
          </div>

          {/* Layout toggle */}
          <button onClick={() => onToggleLayout(cat)} className={`text-xs px-2 py-1 rounded-md font-medium transition-colors shrink-0 ${cat.layout === 'grid-1' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
            {cat.layout === 'grid-1' ? '1 кол' : '2 кол'}
          </button>

          {/* Edit */}
          <button onClick={() => onStartEdit(cat)} className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>

          {/* Delete */}
          <button onClick={() => onDelete(cat.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

export default function CategoriesManager() {
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [newNameMk, setNewNameMk] = useState('')
  const [newNameEn, setNewNameEn] = useState('')
  const [newImageFile, setNewImageFile] = useState(null)
  const [newImagePreview, setNewImagePreview] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editMk, setEditMk] = useState('')
  const [editEn, setEditEn] = useState('')
  const [editImageFile, setEditImageFile] = useState(null)
  const [editImagePreview, setEditImagePreview] = useState(null)
  const [editImageUrl, setEditImageUrl] = useState('')
  const [savingNew, setSavingNew] = useState(false)
  const [savingEdit, setSavingEdit] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const { showToast } = useToast()

  const fetchCategories = async () => {
    const [catsRes, itemsRes] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('menu_items').select('id, category_id'),
    ])
    setCategories(catsRes.data || [])
    setItems(itemsRes.data || [])
    setLoading(false)
  }

  useEffect(() => { fetchCategories() }, [])

  const uploadImage = async (file) => {
    if (!file) return null
    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}.${ext}`
    const { error } = await supabase.storage
      .from('menu-images')
      .upload(`categories/${fileName}`, file, { upsert: true })
    if (error) throw error
    const { data } = supabase.storage
      .from('menu-images')
      .getPublicUrl(`categories/${fileName}`)
    return data.publicUrl
  }

  // Revoke object URLs when previews change or on unmount
  useEffect(() => {
    return () => {
      if (newImagePreview) URL.revokeObjectURL(newImagePreview)
    }
  }, [newImagePreview])
  useEffect(() => {
    return () => {
      if (editImagePreview) URL.revokeObjectURL(editImagePreview)
    }
  }, [editImagePreview])

  const handleNewImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setNewImageFile(file)
      setNewImagePreview(URL.createObjectURL(file))
    }
    e.target.value = ''
  }

  const handleEditImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setEditImageFile(file)
      setEditImagePreview(URL.createObjectURL(file))
    }
    e.target.value = ''
  }

  const clearNewImage = () => {
    setNewImageFile(null)
    setNewImagePreview(null)
  }

  const clearEditImage = () => {
    setEditImageFile(null)
    setEditImagePreview(null)
    setEditImageUrl('')
  }

  const addCategory = async (e) => {
    e.preventDefault()
    if (!newNameMk.trim() || !newNameEn.trim()) return
    setSavingNew(true)
    try {
      const image_url = await uploadImage(newImageFile)
      const maxOrder = Math.max(0, ...categories.map((c) => c.sort_order || 0))
      const { error } = await supabase.from('categories').insert({
        name_mk: newNameMk.trim(),
        name_en: newNameEn.trim(),
        image_url,
        sort_order: maxOrder + 1,
      })
      if (error) throw error
      setNewNameMk('')
      setNewNameEn('')
      setNewImageFile(null)
      setNewImagePreview(null)
      showToast('Категоријата е додадена')
      fetchCategories()
    } catch (err) {
      showToast('Грешка: ' + err.message, 'error')
    } finally {
      setSavingNew(false)
    }
  }

  const startEdit = (cat) => {
    setEditingId(cat.id)
    setEditMk(cat.name_mk)
    setEditEn(cat.name_en)
    setEditImageUrl(cat.image_url || '')
    setEditImageFile(null)
    setEditImagePreview(null)
  }

  const saveEdit = async (id) => {
    setSavingEdit(true)
    try {
      const image_url = editImageFile
        ? await uploadImage(editImageFile)
        : editImageUrl || null
      const { error } = await supabase
        .from('categories')
        .update({ name_mk: editMk, name_en: editEn, image_url })
        .eq('id', id)
      if (error) throw error
      // Clean up the old file if the image was replaced or removed
      const original = categories.find((c) => c.id === id)
      if (original?.image_url && original.image_url !== image_url) {
        removeStorageFile(original.image_url)
      }
      setEditingId(null)
      setEditImageFile(null)
      setEditImagePreview(null)
      showToast('Категоријата е зачувана')
      fetchCategories()
    } catch (err) {
      showToast('Грешка: ' + err.message, 'error')
    } finally {
      setSavingEdit(false)
    }
  }

  const toggleLayout = async (cat) => {
    const newLayout = cat.layout === 'grid-1' ? 'grid-2' : 'grid-1'
    const { error } = await supabase
      .from('categories')
      .update({ layout: newLayout })
      .eq('id', cat.id)
    if (error) {
      showToast('Грешка при промена', 'error')
    }
    fetchCategories()
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    const target = categories.find((c) => c.id === deleteTarget)
    try {
      // Delete items and subcategories explicitly so this works
      // regardless of whether the DB has ON DELETE CASCADE
      let res = await supabase.from('menu_items').delete().eq('category_id', deleteTarget)
      if (res.error) throw res.error
      res = await supabase.from('subcategories').delete().eq('category_id', deleteTarget)
      if (res.error) throw res.error
      res = await supabase.from('categories').delete().eq('id', deleteTarget)
      if (res.error) throw res.error
      if (target?.image_url) removeStorageFile(target.image_url)
      showToast('Категоријата е избришана')
    } catch {
      showToast('Грешка при бришење', 'error')
    }
    setDeleteTarget(null)
    fetchCategories()
  }

  const getItemCount = (catId) => items.filter((i) => i.category_id === catId).length

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const handleDragEnd = async (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = categories.findIndex((c) => c.id === active.id)
    const newIndex = categories.findIndex((c) => c.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    // Optimistic reorder
    const reordered = [...categories]
    const [moved] = reordered.splice(oldIndex, 1)
    reordered.splice(newIndex, 0, moved)

    const updated = reordered.map((c, i) => ({ ...c, sort_order: i + 1 }))
    setCategories(updated)

    // Persist
    const results = await Promise.all(
      updated.map((c) =>
        supabase.from('categories').update({ sort_order: c.sort_order }).eq('id', c.id)
      )
    )
    if (results.some((r) => r.error)) {
      showToast('Грешка при преместување', 'error')
      fetchCategories()
    }
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
        {/* Image upload */}
        <label className="cursor-pointer block mb-2">
          {newImagePreview ? (
            <div className="relative w-full h-24 rounded-lg overflow-hidden bg-gray-100">
              <img src={newImagePreview} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
                <span className="text-white text-xs font-medium opacity-0 hover:opacity-100">Промени</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  clearNewImage()
                }}
                className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="w-full h-16 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center gap-2 hover:border-gray-400 transition-colors">
              <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs text-gray-400">Додади слика</span>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleNewImageChange}
            className="hidden"
          />
        </label>
        <button
          type="submit"
          disabled={savingNew}
          className="w-full sm:w-auto px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {savingNew ? 'Се качува...' : '+ Додади категорија'}
        </button>
      </form>

      {/* Category list */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {categories.map((cat) => (
              <SortableCategoryItem
                key={cat.id}
                cat={cat}
                isEditing={editingId === cat.id}
                editMk={editMk}
                editEn={editEn}
                editImagePreview={editImagePreview}
                editImageUrl={editImageUrl}
                uploading={savingEdit}
                onEditMk={setEditMk}
                onEditEn={setEditEn}
                onEditImageChange={handleEditImageChange}
                onClearImage={clearEditImage}
                onSaveEdit={saveEdit}
                onCancelEdit={() => setEditingId(null)}
                onStartEdit={startEdit}
                onToggleLayout={toggleLayout}
                onDelete={setDeleteTarget}
              />
            ))}

            {categories.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-sm">
                Нема категории. Додади една горе.
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={deleteTarget !== null}
        title="Избриши категорија"
        message={`Дали сте сигурни? Ова ќе ја избрише категоријата и сите ${getItemCount(deleteTarget)} производи во неа. Ова дејство не може да се врати.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
