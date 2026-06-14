import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
export default function CategoryGrid() {
  const [cats, setCats] = useState([]);
  useEffect(() => { api.get('/categories').then((r) => setCats(r.data)); }, []);
  return (
    <section className="max-w-7xl mx-auto px-4 mt-6">
      <h2 className="text-xl font-bold mb-3">Shop by category</h2>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 gap-3">
        {cats.map((c) => (
          <Link key={c._id} to={`/category/${c.slug}`} className="card p-3 text-center hover:shadow-md transition">
            <div className="text-3xl">{c.icon}</div>
            <div className="text-xs font-medium mt-1 line-clamp-1">{c.name}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
