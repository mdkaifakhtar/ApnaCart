import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Search, ShoppingCart, Heart, User, LogOut, Package, Settings,
  Menu, X, Smartphone, Shirt, Home, Sparkles, Tv, Watch, Book, Gift,
  Headphones, Footprints, Baby, Utensils, Car, Dumbbell, Tag,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../api/axios';
import { logout } from '../context/store';
import Logo from './Logo';

const ICONS = {
  smartphones: Smartphone, laptops: Tv, electronics: Tv, tvs: Tv,
  'mens-fashion': Shirt, 'womens-fashion': Shirt, footwear: Footprints,
  watches: Watch, accessories: Watch, headphones: Headphones,
  'home-kitchen': Home, kitchen: Utensils, books: Book, toys: Baby,
  beauty: Sparkles, grocery: Utensils, automotive: Car, sports: Dumbbell,
  gifts: Gift, deals: Tag,
};
function CatIcon({ slug, className }) {
  const I = ICONS[slug] || Tag;
  return <I size={16} className={className} />;
}

export default function Navbar() {
  const { user } = useSelector((s) => s.auth);
  const { items } = useSelector((s) => s.cart);
  const { products } = useSelector((s) => s.wishlist);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [cats, setCats] = useState([]);
  const [open, setOpen] = useState(false);
  const [drawer, setDrawer] = useState(false);

  useEffect(() => { api.get('/categories').then((r) => setCats(r.data)).catch(() => {}); }, []);
  const submit = (e) => { e.preventDefault(); if (q.trim()) navigate(`/search?q=${encodeURIComponent(q)}`); };

  return (
    <header className="bg-primary text-white sticky top-0 z-40 shadow-soft">
      {/* Top bar */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 sm:gap-6 py-3">
          <button
            onClick={() => setDrawer(true)}
            className="md:hidden rounded p-2 hover:bg-white/10"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          <Logo size="md" />

          <form onSubmit={submit} className="hidden md:flex flex-1 max-w-2xl mx-2">
            <div className="flex w-full rounded-lg overflow-hidden shadow-sm ring-1 ring-white/10 focus-within:ring-2 focus-within:ring-saffron">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search for products, brands and more"
                className="flex-1 h-11 px-4 text-gray-900 outline-none"
              />
              <button className="bg-saffron hover:bg-saffron-dark px-5 text-white" aria-label="Search">
                <Search size={18} />
              </button>
            </div>
          </form>

          <nav className="flex items-center gap-2 sm:gap-4 text-sm">
            <Link to="/wishlist" className="relative hidden sm:flex items-center gap-1.5 px-2.5 py-2 rounded hover:bg-white/10">
              <Heart size={18} />
              <span className="hidden lg:inline">Wishlist</span>
              {products?.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-saffron text-white text-[10px] font-bold rounded-full h-4 min-w-4 px-1 grid place-items-center">
                  {products.length}
                </span>
              )}
            </Link>
            <Link to="/cart" className="relative flex items-center gap-1.5 px-2.5 py-2 rounded hover:bg-white/10">
              <ShoppingCart size={18} />
              <span className="hidden lg:inline">Cart</span>
              {items?.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-saffron text-white text-[10px] font-bold rounded-full h-4 min-w-4 px-1 grid place-items-center">
                  {items.length}
                </span>
              )}
            </Link>
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setOpen((o) => !o)}
                  className="flex items-center gap-1.5 px-2.5 py-2 rounded hover:bg-white/10"
                >
                  <User size={18} />
                  <span className="hidden md:inline">{user.name?.split(' ')[0]}</span>
                </button>
                {open && (
                  <div
                    onMouseLeave={() => setOpen(false)}
                    className="absolute right-0 mt-2 w-56 bg-white text-gray-800 rounded-lg shadow-xl py-2 ring-1 ring-black/5"
                  >
                    <Link to="/profile" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50"><Settings size={16}/> Profile</Link>
                    <Link to="/orders" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50"><Package size={16}/> Orders</Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-primary font-semibold">
                        <Settings size={16}/> Admin Dashboard
                      </Link>
                    )}
                    <div className="border-t my-1" />
                    <button
                      onClick={() => { dispatch(logout()); navigate('/'); setOpen(false); }}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-red-600"
                    >
                      <LogOut size={16}/> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="bg-saffron hover:bg-saffron-dark text-white font-semibold px-4 py-2 rounded-md">
                Sign in
              </Link>
            )}
          </nav>
        </div>

        {/* Mobile search */}
        <form onSubmit={submit} className="md:hidden pb-3">
          <div className="flex w-full rounded-lg overflow-hidden bg-white">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search ApnaCart"
              className="flex-1 h-10 px-3 text-gray-900 outline-none text-sm"
            />
            <button className="bg-saffron px-4 text-white" aria-label="Search"><Search size={16}/></button>
          </div>
        </form>
      </div>

      {/* Category strip */}
      <div className="bg-primary-dark/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto no-scrollbar text-xs sm:text-sm py-2">
            {cats.map((c) => (
              <Link
                key={c._id}
                to={`/category/${c.slug}`}
                className="flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-md hover:bg-white/10 hover:text-saffron transition"
              >
                <CatIcon slug={c.slug} />
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDrawer(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-white text-gray-800 shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <Logo size="sm" variant="dark" />
              <button onClick={() => setDrawer(false)} aria-label="Close"><X size={20} /></button>
            </div>
            <div className="overflow-y-auto py-2">
              {cats.map((c) => (
                <Link
                  key={c._id}
                  to={`/category/${c.slug}`}
                  onClick={() => setDrawer(false)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50"
                >
                  <CatIcon slug={c.slug} className="text-primary" />
                  <span className="text-sm">{c.name}</span>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      )}
    </header>
  );
}
