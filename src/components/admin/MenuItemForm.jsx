import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { removeStorageFile } from '../../lib/storage'
import { useToast } from '../../context/ToastContext'

const AVAILABLE_TAGS = ['vegan', 'gluten-free', 'sugar-free', 'non-alcoholic']

export default function MenuItemForm({ item, onClose }) {
  const isEditing = item !== null
  const { showToast } = useToast()
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [form, setForm] = useState({
    category_id: '',
    subcategory_id: '',
    name_mk: '',
    name_en: '',
    description_mk: '',
    description_en: '',
    price: '',
    tags: [],
    available: true,
    image_url: '',
    sort_order: 0,
  })

  useEffect(() => {
    Promise.all([
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('subcategories').select('*').order('sort_order'),
    ]).then(([catsRes, subsRes]) => {
      setCategories(catsRes.data || [])
      setSubcategories(subsRes.data || [])
    })

    if (isEditing) {
      setForm({
        category_id: item.category_id,
        subcategory_id: item.subcategory_id || '',
        name_mk: item.name_mk,
        name_en: item.name_en,
        description_mk: item.description_mk || '',
        description_en: item.description_en || '',
        price: item.price,
        tags: item.tags || [],
        available: item.available,
        image_url: item.image_url || '',
        sort_order: item.sort_order || 0,
      })
    }
  }, [item, isEditing])

  // Filter subcategories based on selected category
  const filteredSubcategories = subcategories.filter(
    (sc) => sc.category_id === form.category_id
  )

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => {
      const updated = { ...prev, [name]: type === 'checkbox' ? checked : value }
      // Reset subcategory when category changes
      if (name === 'category_id') {
        updated.subcategory_id = ''
      }
      return updated
    })
  }

  const handleTagToggle = (tag) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }))
  }

  // Revoke the previous object URL whenever the preview changes or on unmount
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
    e.target.value = ''
  }

  const clearImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setForm((prev) => ({ ...prev, image_url: '' }))
  }

  const uploadImage = async () => {
    if (!imageFile) return form.image_url
    const ext = imageFile.name.split('.').pop()
    const fileName = `${Date.now()}.${ext}`
    const { error } = await supabase.storage
      .from('menu-images')
      .upload(fileName, imageFile)
    if (error) throw error
    const { data } = supabase.storage
      .from('menu-images')
      .getPublicUrl(fileName)
    return data.publicUrl
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const image_url = await uploadImage()
      const payload = {
        ...form,
        subcategory_id: form.subcategory_id || null,
        price: parseFloat(form.price),
        sort_order: parseInt(form.sort_order) || 0,
        image_url: image_url || null,
      }

      // New items go to the end of their category instead of all piling at 0.
      if (!isEditing) {
        const { data: last } = await supabase
          .from('menu_items')
          .select('sort_order')
          .eq('category_id', payload.category_id)
          .order('sort_order', { ascending: false })
          .limit(1)
        payload.sort_order = (last?.[0]?.sort_order || 0) + 1
      }

      const { error } = isEditing
        ? await supabase.from('menu_items').update(payload).eq('id', item.id)
        : await supabase.from('menu_items').insert(payload)
      if (error) throw error

      // Clean up the old file if the image was replaced or removed
      if (item?.image_url && item.image_url !== image_url) {
        removeStorageFile(item.image_url)
      }
      showToast(isEditing ? 'Производот е зачуван' : 'Производот е додаден')
      onClose()
    } catch (err) {
      showToast('Грешка: ' + err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const currentImage = imagePreview || form.image_url

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onClose}
          aria-label="Назад"
          className="w-11 h-11 flex items-center justify-center -ml-2 text-gray-400 hover:text-gray-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-gray-900">
          {isEditing ? 'Уреди производ' : 'Нов производ'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Image upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Слика</label>
          <label className="cursor-pointer block">
            {currentImage ? (
              <div className="relative w-full aspect-[3/2] rounded-lg overflow-hidden bg-gray-100">
                <img src={currentImage} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
                  <span className="text-white text-sm font-medium opacity-0 hover:opacity-100">Промени</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    clearImage()
                  }}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="w-full aspect-[3/2] rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 hover:border-gray-400 transition-colors">
                <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="text-sm text-gray-400">Додади слика</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Категорија <span className="text-red-500">*</span></label>
          <select
            name="category_id"
            value={form.category_id}
            onChange={handleChange}
            required
            className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Избери...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name_mk} / {c.name_en}
              </option>
            ))}
          </select>
        </div>

        {/* Subcategory */}
        {filteredSubcategories.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Поткатегорија</label>
            <select
              name="subcategory_id"
              value={form.subcategory_id}
              onChange={handleChange}
              className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Без поткатегорија</option>
              {filteredSubcategories.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {sc.name_mk} / {sc.name_en}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Names */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Име (МК) <span className="text-red-500">*</span></label>
            <input
              name="name_mk"
              value={form.name_mk}
              onChange={handleChange}
              required
              className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Име (EN) <span className="text-red-500">*</span></label>
            <input
              name="name_en"
              value={form.name_en}
              onChange={handleChange}
              required
              className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Descriptions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Опис (МК)</label>
            <textarea
              name="description_mk"
              value={form.description_mk}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Опис (EN)</label>
            <textarea
              name="description_en"
              value={form.description_en}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Цена (МКД) <span className="text-red-500">*</span></label>
          <input
            name="price"
            type="number"
            inputMode="numeric"
            step="1"
            min="0"
            value={form.price}
            onChange={handleChange}
            required
            className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ознаки</label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagToggle(tag)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  form.tags.includes(tag)
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Available */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={form.available}
            aria-label="Достапен на мени"
            onClick={() => setForm((prev) => ({ ...prev, available: !prev.available }))}
            className={`w-10 h-6 rounded-full relative transition-colors shrink-0 ${
              form.available ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${
                form.available ? 'left-5' : 'left-1'
              }`}
            />
          </button>
          <span className="text-sm text-gray-700">Достапен на мени</span>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {loading ? 'Се зачувува...' : isEditing ? 'Зачувај промени' : 'Додади производ'}
        </button>
      </form>
    </div>
  )
}
