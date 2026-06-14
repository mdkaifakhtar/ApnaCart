import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Trash2 } from 'lucide-react';
import api from '../api/axios';
import { setCart } from '../context/store';
import { inr } from '../utils/format';

export default function Cart() {
  const { items } = useSelector((s) => s.cart);
  const { token } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (!token) return <div className="p-10 text-center">Please <Link className="text-primary underline" to="/login">sign in</Link> to view your cart.</div>;

  const update = async (productId, quantity) => {
    const { data } = await api.put('/cart', { productId, quantity });
    dispatch(setCart(data));
  };
  const remove = async (productId) => {
    const { data } = await api.delete(`/cart/${productId}`);
    dispatch(setCart(data));
  };

  const subtotal = items.reduce((s, i) => s + (i.product?.price || 0) * i.quantity, 0);
  if (!items.length) return <div className="p-10 text-center">Your cart is empty. <Link to="/" className="text-primary underline">Continue shopping</Link></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 grid md:grid-cols-3 gap-6">
      <ul className="md:col-span-2 space-y-3">
        {items.map((i) => (
          <li key={i.product._id} className="card p-4 flex gap-4">
            <img src={i.product.image} className="w-24 h-24 object-cover rounded" alt={i.product.name}/>
            <div className="flex-1">
              <Link to={`/product/${i.product.slug}`} className="font-semibold hover:underline">{i.product.name}</Link>
              <p className="text-sm text-gray-500">{i.product.brand}</p>
              <p className="font-bold mt-1">{inr(i.product.price)}</p>
              <div className="flex items-center gap-2 mt-2">
                <button onClick={() => update(i.product._id, i.quantity - 1)} className="btn-outline px-2 py-0.5">−</button>
                <span>{i.quantity}</span>
                <button onClick={() => update(i.product._id, i.quantity + 1)} className="btn-outline px-2 py-0.5">+</button>
                <button onClick={() => remove(i.product._id)} className="ml-3 text-red-600"><Trash2 size={16}/></button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <aside className="card p-4 h-fit">
        <h3 className="font-bold mb-3">Price details</h3>
        <div className="flex justify-between text-sm"><span>Subtotal</span><span>{inr(subtotal)}</span></div>
        <div className="flex justify-between text-sm"><span>Shipping</span><span>{subtotal >= 499 ? 'FREE' : inr(49)}</span></div>
        <div className="flex justify-between font-bold mt-2 border-t pt-2"><span>Total</span><span>{inr(subtotal + (subtotal >= 499 ? 0 : 49))}</span></div>
        <button onClick={() => navigate('/checkout')} className="btn-primary w-full mt-4">Place order</button>
      </aside>
    </div>
  );
}
