import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { bootstrap } from './context/store';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import AIAssistant from './components/AIAssistant.jsx';
import Home from './pages/Home.jsx';
import Category from './pages/Category.jsx';
import Product from './pages/Product.jsx';
import Cart from './pages/Cart.jsx';
import Wishlist from './pages/Wishlist.jsx';
import Checkout from './pages/Checkout.jsx';
import Orders from './pages/Orders.jsx';
import OrderTrack from './pages/OrderTrack.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Profile from './pages/Profile.jsx';
import Search from './pages/Search.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import AdminDashboard from './pages/admin/Dashboard.jsx';
import AdminProducts from './pages/admin/Products.jsx';
import AdminCategories from './pages/admin/Categories.jsx';
import AdminOrders from './pages/admin/Orders.jsx';
import AdminUsers from './pages/admin/Users.jsx';

export default function App() {
  useEffect(() => { bootstrap(); }, []);
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/category/:slug" element={<Category />} />
          <Route path="/product/:slug" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><OrderTrack /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>
        </Routes>
      </main>
      <Footer />
      <AIAssistant />
    </div>
  );
}
