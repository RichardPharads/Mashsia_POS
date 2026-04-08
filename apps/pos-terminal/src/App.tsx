/**
 * ═══════════════════════════════════════════════════════════════
 *  Main App Component - Router Setup
 * ═══════════════════════════════════════════════════════════════
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import { ProtectedRoute, PublicRoute } from './utils/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'

// Pages
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ProductDetailPage from './pages/ProductDetailPage'

export default function App() {
  const { isAuthenticated, setLoading } = useAuthStore()

  useEffect(() => {
    // Initialize app - check for existing session
    setLoading(false)
    
    // Global error handling
    window.addEventListener('error', (event) => {
      console.error('🔴 Global error:', event.error)
    })
    
    window.addEventListener('unhandledrejection', (event) => {
      console.error('🔴 Unhandled rejection:', event.reason)
    })
  }, [setLoading])

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/product/:productId"
            element={
              <ProtectedRoute>
                <ProductDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Default Routes */}
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  )
}

