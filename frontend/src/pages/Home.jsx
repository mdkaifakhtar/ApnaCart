import { useEffect, useState } from 'react';
import api from '../api/axios';
import Hero from '../components/Hero.jsx';
import CategoryGrid from '../components/CategoryGrid.jsx';
import ProductRail from '../components/ProductRail.jsx';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [recommended, setRecommended] = useState([]);
  useEffect(() => {
    api.get('/products/featured').then((r) => setFeatured(r.data));
    api.get('/products/trending').then((r) => setTrending(r.data));
    api.get('/products?sort=rating&limit=12').then((r) => setRecommended(r.data.items));
  }, []);
  return (
    <div>
      <Hero />
      <CategoryGrid />
      <ProductRail title="🔥 Trending now" items={trending} />
      <ProductRail title="⭐ Featured deals" items={featured} />
      <ProductRail title="🎯 Recommended for you" items={recommended} />
    </div>
  );
}
