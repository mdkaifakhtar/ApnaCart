import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import api from '../api/axios';
import { setCart } from '../context/store';
import { inr } from '../utils/format';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { items } = useSelector((s) => s.cart);
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [address, setAddress] = useState({ fullName: user?.name || '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', country: 'India' });
  const [payment, setPayment] = useState('cod');
  const [coupon, setCoupon] = useState('');
  const [applied, setApplied] = useState(null);
  const [busy, setBusy] = useState(false);

  const subtotal = items.reduce((s, i) => s + (i.product?.price || 0) * i.quantity, 0);
  const discount = applied?.discount || 0;
  const shipping = subtotal - discount >= 499 ? 0 : 49;
  const total = subtotal - discount + shipping;

  const apply = async () => {
    try {
      const { data } = await api.post('/coupons/apply', { code: coupon, subtotal });
      setApplied(data); toast.success(`Coupon applied: −${inr(data.discount)}`);
    } catch (e) { toast.error(e.response?.data?.message || 'Invalid coupon'); }
  };
  const place = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post('/orders', { address, paymentMethod: payment, couponCode: applied?.code });
      dispatch(setCart({ items: [] }));
      toast.success('Order placed!');
      navigate(`/orders/${data._id}`);
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); } finally { setBusy(false); }
  };

  if (!items.length) return <div className="p-10 text-center">Cart is empty.</div>;

  return (
    <form onSubmit={place} className="max-w-5xl mx-auto px-4 py-6 grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-4">
        <section className="card p-4">
          <h2 className="font-bold mb-3">Shipping address</h2>
          <div className="grid grid-cols-2 gap-3">
            {['fullName','phone','line1','line2','city','state','pincode'].map((k) => (
              <input key={k} required={['fullName','phone','line1','city','state','pincode'].includes(k)} placeholder={k} value={address[k]} onChange={(e)=>setAddress({...address,[k]:e.target.value})} className="input"/>
            ))}
          </div>
        </section>
        <section className="card p-4">
          <h2 className="font-bold mb-3">Payment method</h2>
          {[{v:'cod',l:'Cash on Delivery'},{v:'card',l:'Credit/Debit Card'},{v:'upi',l:'UPI'}].map((m) => (
            <label key={m.v} className="flex items-center gap-2 py-1">
              <input type="radio" name="pay" checked={payment===m.v} onChange={()=>setPayment(m.v)}/> {m.l}
            </label>
          ))}
        </section>
      </div>
      <aside className="card p-4 h-fit">
        <h3 className="font-bold mb-3">Order summary</h3>
        <ul className="text-sm space-y-1 mb-3 max-h-40 overflow-auto">
          {items.map((i) => <li key={i.product._id} className="flex justify-between"><span className="line-clamp-1">{i.product.name} × {i.quantity}</span><span>{inr(i.product.price * i.quantity)}</span></li>)}
        </ul>
        <div className="flex gap-2 mb-2">
          <input className="input" placeholder="Coupon code" value={coupon} onChange={(e)=>setCoupon(e.target.value)}/>
          <button type="button" onClick={apply} className="btn-outline">Apply</button>
        </div>
        <div className="text-sm flex justify-between"><span>Subtotal</span><span>{inr(subtotal)}</span></div>
        {discount > 0 && <div className="text-sm flex justify-between text-green-700"><span>Discount</span><span>−{inr(discount)}</span></div>}
        <div className="text-sm flex justify-between"><span>Shipping</span><span>{shipping ? inr(shipping) : 'FREE'}</span></div>
        <div className="font-bold flex justify-between mt-2 border-t pt-2"><span>Total</span><span>{inr(total)}</span></div>
        <button disabled={busy} className="btn-primary w-full mt-4">{busy ? 'Placing…' : 'Place order'}</button>
      </aside>
    </form>
  );
}
