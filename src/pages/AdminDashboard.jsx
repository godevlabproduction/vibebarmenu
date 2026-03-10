import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import AdminLayout from '../components/admin/AdminLayout'
import MenuItemsTable from '../components/admin/MenuItemsTable'
import MenuItemForm from '../components/admin/MenuItemForm'
import CategoriesManager from '../components/admin/CategoriesManager'

export default function AdminDashboard() {
  const [editingItem, setEditingItem] = useState(undefined)

  return (
    <AdminLayout>
      <Routes>
        <Route
          index
          element={
            editingItem !== undefined ? (
              <MenuItemForm
                item={editingItem}
                onClose={() => setEditingItem(undefined)}
              />
            ) : (
              <MenuItemsTable onEdit={setEditingItem} />
            )
          }
        />
        <Route path="categories" element={<CategoriesManager />} />
      </Routes>
    </AdminLayout>
  )
}
