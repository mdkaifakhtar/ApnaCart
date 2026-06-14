import { Link } from 'react-router-dom';
import { Star, Heart } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { inr, discountPct } from '../utils/format';
import api from '../api/axios';
import { setCart, setWishlist } from '../context/store';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const { token } = useSelector((s) => s.auth);

  const addCart = async (e) => {
    e.preventDefault();
    if (!token) return toast.error('Please sign in');
    const { data } = await api.post('/cart', { productId: product._id, quantity: 1 });
    dispatch(setCart(data));
    toast.success('Added to cart');
  };
  const addWish = async (e) => {
    e.preventDefault();
    if (!token) return toast.error('Please sign in');
    const { data } = await api.post('/wishlist', { productId: product._id });
    dispatch(setWishlist(data));
    toast.success('Saved');
  };

  return (
    <Link to={`/product/${product.slug}`} className="card p-3 hover:shadow-md transition group">
      <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden">
        <img src={product.image} alt={product.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition" />
        <button onClick={addWish} className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow"><Heart size={16}/></button>
        {discountPct(product.mrp, product.price) > 0 && (
          <span className="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded">{discountPct(product.mrp, product.price)}% OFF</span>
        )}
      </div>
      <div className="mt-2">
        <p className="text-xs text-gray-500">{product.brand}</p>
        <p className="text-sm font-medium line-clamp-2 min-h-[2.5rem]">{product.name}</p>
        <div className="flex items-center gap-1 mt-1 text-xs">
          <span className="bg-green-600 text-white px-1.5 py-0.5 rounded flex items-center gap-1">{product.rating} <Star size={10} fill="white"/></span>
          <span className="text-gray-500">({product.reviewCount})</span>
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="font-bold">{inr(product.price)}</span>
          {product.mrp > product.price && <span className="text-xs text-gray-500 line-through">{inr(product.mrp)}</span>}
        </div>
        <button onClick={addCart} className="mt-2 w-full bg-saffron text-primary font-semibold rounded-md py-1.5 text-sm hover:opacity-90">Add to cart</button>
      </div>
    </Link>
  );
}
