import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { inr } from '../utils/format';

const steps = ['placed','confirmed','shipped','out_for_delivery','delivered'];

export default function OrderTrack() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  useEffect(() => { api.get(`/orders/${id}`).then((r) => setOrder(r.data)); }, [id]);
  if (!order) return <div className="p-10 text-center">Loading…</div>;
  const currentIdx = steps.indexOf(order.status);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-1">Order #{order._id.slice(-8).toUpperCase()}</h1>
      <p className="text-sm text-gray-500 mb-6">Placed {new Date(order.createdAt).toLocaleString('en-IN')}</p>

      {order.status !== 'cancelled' ? (
        <div className="flex justify-between mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex-1 text-center">
              <div className={`mx-auto w-8 h-8 rounded-full ${i <= currentIdx ? 'bg-green-600' : 'bg-gray-300'} text-white grid place-items-center text-xs font-bold`}>{i+1}</div>
              <p className="text-xs mt-1 capitalize">{s.replace(/_/g,' ')}</p>
            </div>
          ))}
        </div>
      ) : <div className="bg-red-50 text-red-700 p-3 rounded mb-4">Order cancelled</div>}

      <section className="card p-4 mb-4">
        <h3 className="font-bold mb-2">Items</h3>
        {order.items.map((i) => (
          <div key={i.product} className="flex gap-3 py-2 border-b last:border-0">
            <img src={i.image} className="w-14 h-14 object-cover rounded"/>
            <div className="flex-1"><p className="text-sm">{i.name}</p><p className="text-xs text-gray-500">Qty {i.quantity}</p></div>
            <div className="font-semibold">{inr(i.price * i.quantity)}</div>
          </div>
        ))}
      </section>

      <section className="card p-4 mb-4">
        <h3 className="font-bold mb-2">Shipping</h3>
        <p className="text-sm">{order.address.fullName}, {order.address.phone}</p>
        <p className="text-sm">{order.address.line1}, {order.address.line2}</p>
        <p className="text-sm">{order.address.city}, {order.address.state} {order.address.pincode}</p>
      </section>

      <section className="card p-4">
        <h3 className="font-bold mb-2">Summary</h3>
        <div className="flex justify-between text-sm"><span>Subtotal</span><span>{inr(order.subtotal)}</span></div>
        {order.discount > 0 && <div className="flex justify-between text-sm text-green-700"><span>Discount</span><span>−{inr(order.discount)}</span></div>}
        <div className="flex justify-between text-sm"><span>Shipping</span><span>{order.shipping ? inr(order.shipping) : 'FREE'}</span></div>
        <div className="flex justify-between font-bold mt-2 border-t pt-2"><span>Total</span><span>{inr(order.total)}</span></div>
        <p className="text-xs text-gray-500 mt-2">Payment: {order.paymentMethod.toUpperCase()} ({order.paymentStatus})</p>
      </section>
    </div>
  );
}
