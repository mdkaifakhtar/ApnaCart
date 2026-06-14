import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard.jsx';
export default function Search() {
  const [sp] = useSearchParams();
  const q = sp.get('q') || '';
  const [items, setItems] = useState([]);
  useEffect(() => { api.get('/products', { params: { q, limit: 48 } }).then((r) => setItems(r.data.items)); }, [q]);
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-4">Search results for "{q}" ({items.length})</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {items.map((p) => <ProductCard key={p._id} product={p}/>)}
      </div>
    </div>
  );
}
