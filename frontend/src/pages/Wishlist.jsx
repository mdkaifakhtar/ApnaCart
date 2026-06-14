import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import api from '../api/axios';
import { setWishlist } from '../context/store';
export default function Wishlist() {
  const { products } = useSelector((s) => s.wishlist);
  const dispatch = useDispatch();
  if (!products.length) return <div className="p-10 text-center">No saved items. <Link to="/" className="text-primary underline">Browse</Link></div>;
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-4">My wishlist</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {products.map((p) => <ProductCard key={p._id} product={p}/>)}
      </div>
    </div>
  );
}
