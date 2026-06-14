import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { inr } from '../utils/format';

const colors = { placed: 'bg-yellow-500', confirmed: 'bg-blue-500', shipped: 'bg-indigo-500', out_for_delivery: 'bg-purple-500', delivered: 'bg-green-600', cancelled: 'bg-red-600' };

export default function Orders() {
  const [orders, setOrders] = useState([]);
  useEffect(() => { api.get('/orders/mine').then((r) => setOrders(r.data)); }, []);
  if (!orders.length) return <div className="p-10 text-center">No orders yet.</div>;
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-4">My orders</h1>
      <ul className="space-y-3">
        {orders.map((o) => (
          <li key={o._id} className="card p-4">
            <div className="flex justify-between flex-wrap gap-2">
              <div>
                <p className="text-xs text-gray-500">#{o._id.slice(-8).toUpperCase()}</p>
                <p className="text-sm">{new Date(o.createdAt).toLocaleString('en-IN')}</p>
              </div>
              <span className={`text-white text-xs px-3 py-1 rounded-full font-bold uppercase ${colors[o.status]}`}>{o.status.replace(/_/g,' ')}</span>
              <span className="font-bold">{inr(o.total)}</span>
              <Link to={`/orders/${o._id}`} className="text-primary text-sm underline">Track</Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
