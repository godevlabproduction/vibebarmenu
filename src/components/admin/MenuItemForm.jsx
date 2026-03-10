import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const AVAILABLE_TAGS = ['vegan', 'gluten-free', 'sugar-free', 'non-alcoholic']

export default function MenuItemForm({ item, onClose }) {
  const isEditing = item !== null
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [form, setForm] = useState({
    category_id: '',
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
    supabase
      .from('categories')
      .select('*')
      .order('sort_order')
      .then(({ data }) => setCategories(data || []))

    if (isEditing) {
      setForm({
        category_id: item.category_id,
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleTagToggle = (tag) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
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
        price: parseFloat(form.price),
        sort_order: parseInt(form.sort_order) || 0,
        image_url,
      }

      if (isEditing) {
        await supabase.from('menu_items').update(payload).eq('id', item.id)
      } else {
        await supabase.from('menu_items').insert(payload)
      }
      onClose()
    } catch (err) {
      alert('Грешка: ' + err.message)
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
          className="p-1 text-gray-400 hover:text-gray-700 transition-colors"
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Категорија</label>
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

        {/* Names */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Име (МК)</label>
            <input
              name="name_mk"
              value={form.name_mk}
              onChange={handleChange}
              required
              className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Име (EN)</label>
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

        {/* Price + Sort */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Цена (МКД)</label>
            <input
              name="price"
              type="number"
              step="1"
              value={form.price}
              onChange={handleChange}
              required
              className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Редослед</label>
            <input
              name="sort_order"
              type="number"
              value={form.sort_order}
              onChange={handleChange}
              className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
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
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            className={`w-10 h-6 rounded-full relative transition-colors ${
              form.available ? 'bg-green-500' : 'bg-gray-300'
            }`}
            onClick={() => setForm((prev) => ({ ...prev, available: !prev.available }))}
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${
                form.available ? 'left-5' : 'left-1'
              }`}
            />
          </div>
          <span className="text-sm text-gray-700">Достапен на мени</span>
        </label>

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
