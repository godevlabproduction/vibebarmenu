import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth()

  if (loading) return <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-400">Се вчитува...</div>
  const isAdminSubdomain = window.location.hostname === 'admin.vibebar.mk'
  if (!session) return <Navigate to={isAdminSubdomain ? '/login' : '/admin/login'} replace />

  return children
}
