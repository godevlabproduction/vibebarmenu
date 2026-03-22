import { useState } from 'react'
import { ToastProvider } from '../context/ToastContext'
import AdminLayout from '../components/admin/AdminLayout'
import Dashboard from '../components/admin/Dashboard'
import MenuItemsTable from '../components/admin/MenuItemsTable'
import MenuItemForm from '../components/admin/MenuItemForm'
import CategoriesManager from '../components/admin/CategoriesManager'
import SubcategoriesManager from '../components/admin/SubcategoriesManager'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [editingItem, setEditingItem] = useState(undefined)

  const handleNavigate = (tab, options) => {
    setActiveTab(tab)
    if (tab === 'items' && options?.create) {
      setEditingItem(null)
    }
  }

  const renderContent = () => {
    if (activeTab === 'items' && editingItem !== undefined) {
      return (
        <MenuItemForm
          item={editingItem}
          onClose={() => setEditingItem(undefined)}
        />
      )
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />
      case 'items':
        return <MenuItemsTable onEdit={setEditingItem} />
      case 'categories':
        return <CategoriesManager />
      case 'subcategories':
        return <SubcategoriesManager />
      default:
        return <Dashboard onNavigate={handleNavigate} />
    }
  }

  return (
    <ToastProvider>
      <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
        {renderContent()}
      </AdminLayout>
    </ToastProvider>
  )
}
