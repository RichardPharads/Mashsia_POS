/**
 * ═══════════════════════════════════════════════════════════════
 *  Main App Component - Router Setup with Persistent Sidebar
 * ═══════════════════════════════════════════════════════════════
 */

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "./store/authStore";
import { ProtectedRoute, PublicRoute } from "./utils/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";

// Layout
import MainLayout from "./layouts/MainLayout";

// Pages
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import SettingsPage from "./pages/SettingsPage";
import OrdersPage from "./pages/OrdersPage";

export default function App() {
  const { isAuthenticated, setLoading } = useAuthStore();

  useEffect(() => {
    setLoading(false);

    window.addEventListener("error", (event) => {
      console.error("🔴 Global error:", event.error);
    });

    window.addEventListener("unhandledrejection", (event) => {
      console.error("🔴 Unhandled rejection:", event.reason);
    });
  }, [setLoading]);

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Public Routes - No Sidebar */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          {/* Protected Routes WITH Persistent Sidebar */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* These routes will render inside MainLayout's <Outlet /> */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/product/:productId" element={<ProductDetailPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

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
  );
}
