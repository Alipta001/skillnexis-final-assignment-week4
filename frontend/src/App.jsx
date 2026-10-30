import { BrowserRouter, Route, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";
import AdminPage from "./pages/AdminPage";
import AuthPage from "./pages/AuthPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import HomePage from "./pages/HomePage";
import OrdersPage from "./pages/OrdersPage";
import ProductPage from "./pages/ProductPage";
import ShopPage from "./pages/ShopPage";

function NotFoundPage() {
  return (
    <>
      <Header />
      <main className="not-found-page">
        <p className="eyebrow">NOT FOUND</p>
        <h1>This page wandered off.</h1>
        <p>Let's get you back to the good things.</p>
        <a className="button button-dark" href="/">
          Back home
        </a>
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<HomePage />} path="/" />
              <Route element={<ShopPage />} path="/shop" />
              <Route element={<ProductPage />} path="/products/:id" />
              <Route element={<AuthPage mode="login" />} path="/login" />
              <Route element={<AuthPage mode="register" />} path="/register" />
              <Route element={<CartPage />} path="/cart" />
              <Route element={<ProtectedRoute />}>
                <Route element={<CheckoutPage />} path="/checkout" />
                <Route element={<OrdersPage />} path="/orders" />
                <Route element={<OrdersPage />} path="/orders/:id" />
              </Route>
              <Route element={<ProtectedRoute adminOnly />}>
                <Route element={<AdminPage />} path="/admin" />
              </Route>
              <Route element={<NotFoundPage />} path="*" />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
