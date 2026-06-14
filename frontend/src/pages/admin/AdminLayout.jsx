import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Package, Tag, ShoppingBag, Users } from 'lucide-react';

const link = ({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded ${isActive ? 'bg-primary text-white' : 'hover:bg-gray-100'}`;

export default function AdminLayout() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 grid md:grid-cols-[220px_1fr] gap-6">
      <aside className="card p-3 h-fit space-y-1">
        <NavLink to="/admin" end className={link}><LayoutDashboard size={16}/> Dashboard</NavLink>
        <NavLink to="/admin/products" className={link}><Package size={16}/> Products</NavLink>
        <NavLink to="/admin/categories" className={link}><Tag size={16}/> Categories</NavLink>
        <NavLink to="/admin/orders" className={link}><ShoppingBag size={16}/> Orders</NavLink>
        <NavLink to="/admin/users" className={link}><Users size={16}/> Users</NavLink>
      </aside>
      <div><Outlet/></div>
    </div>
  );
}
