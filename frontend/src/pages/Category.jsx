import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard.jsx';

export default function Category() {
  const { slug } = useParams();
  const [items, setItems] = useState([]);
  const [sort, setSort] = useState('popular');
  const [min, setMin] = useState(''); const [max, setMax] = useState('');
  useEffect(() => {
    const params = { category: slug, sort, limit: 48 };
    if (min) params.min = min; if (max) params.max = max;
    api.get('/products', { params }).then((r) => setItems(r.data.items));
  }, [slug, sort, min, max]);
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold capitalize mb-4">{slug.replace(/-/g, ' ')}</h1>
      <div className="flex flex-wrap gap-2 mb-4 text-sm">
        <select value={sort} onChange={(e)=>setSort(e.target.value)} className="input max-w-[180px]">
          <option value="popular">Popularity</option>
          <option value="rating">Top rated</option>
          <option value="priceAsc">Price: Low to High</option>
          <option value="priceDesc">Price: High to Low</option>
          <option value="newest">Newest</option>
        </select>
        <input value={min} onChange={(e)=>setMin(e.target.value)} placeholder="Min ₹" className="input max-w-[120px]"/>
        <input value={max} onChange={(e)=>setMax(e.target.value)} placeholder="Max ₹" className="input max-w-[120px]"/>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {items.map((p) => <ProductCard key={p._id} product={p}/>)}
      </div>
    </div>
  );
}
