import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { inr } from '../../utils/format';

const statuses = ['placed','confirmed','shipped','out_for_delivery','delivered','cancelled'];

export default function AdminOrders() {
  const [items, setItems] = useState([]);
  const load = () => api.get('/orders/admin').then((r)=>setItems(r.data));
  useEffect(() => { load(); }, []);
  const setStatus = async (id, status) => { await api.put(`/orders/${id}/status`, { status }); load(); };
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Orders</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50"><tr><th className="p-2 text-left">Order</th><th className="p-2">Customer</th><th className="p-2">Total</th><th className="p-2">Status</th><th className="p-2">Date</th></tr></thead>
          <tbody>
            {items.map((o) => (
              <tr key={o._id} className="border-t">
                <td className="p-2 font-mono text-xs">{o._id.slice(-8).toUpperCase()}</td>
                <td className="p-2">{o.user?.name}<br/><span className="text-xs text-gray-500">{o.user?.email}</span></td>
                <td className="p-2">{inr(o.total)}</td>
                <td className="p-2">
                  <select value={o.status} onChange={(e)=>setStatus(o._id, e.target.value)} className="input h-9 max-w-[160px]">
                    {statuses.map((s) => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
                  </select>
                </td>
                <td className="p-2 text-xs">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
