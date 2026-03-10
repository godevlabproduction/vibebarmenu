import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function AdminLayout({ children }) {
  const { signOut } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">VibeBar</h1>
          <button
            onClick={signOut}
            className="text-sm text-gray-400 hover:text-red-500 transition-colors"
          >
            Одјави се
          </button>
        </div>
      </header>

      {/* Tab nav */}
      <nav className="bg-white border-b border-gray-200 px-4">
        <div className="max-w-3xl mx-auto flex">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`
            }
          >
            Производи
          </NavLink>
          <NavLink
            to="/admin/categories"
            className={({ isActive }) =>
              `px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`
            }
          >
            Категории
          </NavLink>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-4">{children}</main>
    </div>
  )
}
