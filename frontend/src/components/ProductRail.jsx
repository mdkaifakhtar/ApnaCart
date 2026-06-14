import ProductCard from './ProductCard.jsx';
export default function ProductRail({ title, items }) {
  if (!items?.length) return null;
  return (
    <section className="max-w-7xl mx-auto px-4 my-6">
      <h2 className="text-xl font-bold mb-3">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {items.map((p) => <ProductCard key={p._id} product={p} />)}
      </div>
    </section>
  );
}
