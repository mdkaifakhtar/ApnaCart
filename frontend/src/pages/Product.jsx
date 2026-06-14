import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Star, ShieldCheck, Trash2, Edit3 } from 'lucide-react';
import api from '../api/axios';
import { inr, discountPct } from '../utils/format';
import { setCart, setWishlist } from '../context/store';
import ProductRail from '../components/ProductRail.jsx';
import toast from 'react-hot-toast';

export default function Product() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector((s) => s.auth);
  const [data, setData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({ rating: 5, title: '', body: '' });
  const [editId, setEditId] = useState(null);

  const load = async () => {
    const { data } = await api.get(`/products/${slug}`); setData(data);
    const r = await api.get(`/reviews/${data.product._id}`); setReviews(r.data);
  };
  useEffect(() => { load(); }, [slug]);
  if (!data) return <div className="p-10 text-center">Loading…</div>;
  const { product, related } = data;

  const addCart = async () => {
    if (!token) return navigate('/login');
    const { data } = await api.post('/cart', { productId: product._id, quantity: 1 });
    dispatch(setCart(data)); toast.success('Added to cart');
  };
  const buyNow = async () => { await addCart(); navigate('/checkout'); };
  const addWish = async () => {
    if (!token) return navigate('/login');
    const { data } = await api.post('/wishlist', { productId: product._id });
    dispatch(setWishlist(data)); toast.success('Saved');
  };
  const submitReview = async (e) => {
    e.preventDefault();
    if (!token) return navigate('/login');
    await api.post(`/reviews/${product._id}`, form);
    setForm({ rating: 5, title: '', body: '' }); setEditId(null);
    await load(); toast.success('Review saved');
  };
  const deleteReview = async (id) => {
    if (!confirm('Delete review?')) return;
    await api.delete(`/reviews/${id}`); await load();
  };
  const startEdit = (r) => { setForm({ rating: r.rating, title: r.title || '', body: r.body || '' }); setEditId(r._id); };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="card p-4"><img src={product.image} alt={product.name} className="w-full aspect-square object-contain"/></div>
        <div>
          <p className="text-sm text-gray-500">{product.brand}</p>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="bg-green-600 text-white px-2 py-0.5 rounded text-sm flex items-center gap-1">{product.rating} <Star size={12} fill="white"/></span>
            <span className="text-sm text-gray-500">{product.reviewCount} ratings</span>
          </div>
          <div className="flex items-baseline gap-3 mt-3">
            <span className="text-3xl font-bold">{inr(product.price)}</span>
            {product.mrp > product.price && <><span className="text-gray-500 line-through">{inr(product.mrp)}</span><span className="text-green-700 font-semibold">{discountPct(product.mrp, product.price)}% off</span></>}
          </div>
          <p className="text-sm text-gray-700 mt-4">{product.description}</p>
          <p className="text-sm mt-2">{product.stock > 0 ? <span className="text-green-700">In stock</span> : <span className="text-red-600">Out of stock</span>}</p>
          <div className="flex gap-3 mt-6">
            <button onClick={addCart} className="btn bg-saffron text-primary px-6 py-3 font-semibold">Add to cart</button>
            <button onClick={buyNow} className="btn-primary px-6 py-3">Buy now</button>
            <button onClick={addWish} className="btn-outline px-4 py-3">♥ Wishlist</button>
          </div>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-bold mb-3">Ratings & reviews</h2>
        {token && (
          <form onSubmit={submitReview} className="card p-4 mb-4 space-y-2">
            <div className="flex gap-1">
              {[1,2,3,4,5].map((n) => (
                <button type="button" key={n} onClick={() => setForm({ ...form, rating: n })}><Star size={20} className={n <= form.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}/></button>
              ))}
            </div>
            <input className="input" placeholder="Title (optional)" value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})}/>
            <textarea className="input h-24" placeholder="Share your experience" value={form.body} onChange={(e)=>setForm({...form,body:e.target.value})}/>
            <button className="btn-primary">{editId ? 'Update review' : 'Submit review'}</button>
          </form>
        )}
        <ul className="space-y-3">
          {reviews.map((r) => (
            <li key={r._id} className="card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="bg-green-600 text-white px-2 py-0.5 rounded text-xs flex items-center gap-1">{r.rating} <Star size={10} fill="white"/></span>
                  <span className="font-semibold">{r.title}</span>
                  {r.verifiedPurchase && <span className="text-xs text-green-700 flex items-center gap-1"><ShieldCheck size={12}/> Verified purchase</span>}
                </div>
                {user && r.user?._id === user._id && (
                  <div className="flex gap-2 text-gray-500">
                    <button onClick={() => startEdit(r)}><Edit3 size={16}/></button>
                    <button onClick={() => deleteReview(r._id)}><Trash2 size={16}/></button>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-700 mt-1">{r.body}</p>
              <p className="text-xs text-gray-500 mt-1">— {r.user?.name}</p>
            </li>
          ))}
          {!reviews.length && <p className="text-sm text-gray-500">No reviews yet. Be the first!</p>}
        </ul>
      </section>

      <ProductRail title="Related products" items={related} />
    </div>
  );
}
