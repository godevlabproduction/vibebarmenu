import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LanguageProvider } from './context/LanguageContext'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import MenuPage from './pages/MenuPage'
import CategoryPage from './pages/CategoryPage'
import ProductPage from './pages/ProductPage'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import NotFoundPage from './pages/NotFoundPage'

const isAdminSubdomain = window.location.hostname === 'admin.vibebar.mk'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <Routes>
            {isAdminSubdomain ? (
              <>
                <Route path="/" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                <Route path="/login" element={<AdminLogin />} />
                <Route path="*" element={<NotFoundPage />} />
              </>
            ) : (
              <>
                <Route path="/" element={<MenuPage />} />
                <Route path="/menu/:categoryId" element={<CategoryPage />} />
                <Route path="/menu/:categoryId/:itemId" element={<ProductPage />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFoundPage />} />
              </>
            )}
          </Routes>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
