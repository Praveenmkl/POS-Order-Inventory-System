import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminRoute from "./components/auth/AdminRoute";

import DashboardLayout from "./components/layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import POS from "./pages/POS";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import Register from "./pages/Register";
import Users from "./pages/Users";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                {/* Cashier / Shared POS & Orders Routes */}
                <Route path="/pos" element={<POS />} />
                <Route path="/orders" element={<Orders />} />

                {/* Admin Only Portal Routes */}
                <Route element={<AdminRoute />}>
                  <Route path="/admin/dashboard" element={<Dashboard />} />
                  <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

                  <Route path="/admin/cashiers" element={<Users />} />
                  <Route path="/admin/users" element={<Navigate to="/admin/cashiers" replace />} />
                  <Route path="/users" element={<Navigate to="/admin/cashiers" replace />} />

                  <Route path="/admin/products" element={<Products />} />
                  <Route path="/products" element={<Navigate to="/admin/products" replace />} />

                  <Route path="/admin/orders" element={<Orders />} />
                </Route>
              </Route>
            </Route>

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" richColors closeButton />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;