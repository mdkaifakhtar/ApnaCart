import { Link } from 'react-router-dom';
const slides = [
  { title: 'Big Billion Deals', sub: 'Up to 80% off on Electronics', cta: 'Shop Mobiles', to: '/category/mobiles', bg: 'from-blue-700 to-purple-700' },
  { title: 'Fashion Festival', sub: 'Min 50% off — top brands', cta: 'Shop Fashion', to: '/category/women-fashion', bg: 'from-pink-600 to-rose-500' },
  { title: 'Home Makeover', sub: 'Furniture & decor from ₹299', cta: 'Shop Home', to: '/category/home-decor', bg: 'from-amber-500 to-orange-600' },
];
export default function Hero() {
  return (
    <section className="max-w-7xl mx-auto px-4 mt-4 grid md:grid-cols-3 gap-3">
      {slides.map((s, i) => (
        <Link key={i} to={s.to} className={`bg-gradient-to-br ${s.bg} text-white rounded-2xl p-6 hover:opacity-95 transition`}>
          <p className="text-xs uppercase opacity-80">Top deal</p>
          <h3 className="text-2xl font-extrabold">{s.title}</h3>
          <p className="opacity-90 mt-1">{s.sub}</p>
          <span className="inline-block mt-3 bg-white text-primary font-semibold px-3 py-1.5 rounded-md text-sm">{s.cta}</span>
        </Link>
      ))}
    </section>
  );
}
