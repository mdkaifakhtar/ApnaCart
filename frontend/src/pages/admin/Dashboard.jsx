import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { inr } from '../../utils/format';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [sales, setSales] = useState([]);
  useEffect(() => {
    api.get('/admin/stats').then((r) => setStats(r.data));
    api.get('/admin/sales').then((r) => setSales(r.data));
  }, []);
  if (!stats) return <div>Loading…</div>;
  const cards = [
    { l: 'Revenue', v: inr(stats.revenue) },
    { l: 'Orders', v: stats.orders },
    { l: 'Products', v: stats.products },
    { l: 'Users', v: stats.users },
  ];
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map((c) => (
          <div key={c.l} className="card p-4"><p className="text-xs text-gray-500">{c.l}</p><p className="text-xl font-bold">{c.v}</p></div>
        ))}
      </div>
      <div className="card p-4">
        <h3 className="font-bold mb-2">Revenue (last 30 days)</h3>
        <div style={{height: 260}}>
          <ResponsiveContainer><LineChart data={sales}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="date"/><YAxis/><Tooltip/><Line type="monotone" dataKey="revenue" stroke="#1e3a8a"/></LineChart></ResponsiveContainer>
        </div>
      </div>
      <div className="card p-4">
        <h3 className="font-bold mb-2">Orders per day</h3>
        <div style={{height: 220}}>
          <ResponsiveContainer><BarChart data={sales}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="date"/><YAxis/><Tooltip/><Bar dataKey="orders" fill="#ff9933"/></BarChart></ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
