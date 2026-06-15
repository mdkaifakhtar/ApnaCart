import { useEffect, useState, useRef } from 'react';
import api from '../../api/axios';
import { inr } from '../../utils/format';
import toast from 'react-hot-toast';
import { Upload, X, Plus, ImageIcon, Package } from 'lucide-react';

const empty = {
  name: '', brand: '', description: '', price: 0, mrp: 0,
  image: '', stock: 50, category: '', isFeatured: false, isTrending: false,
};

export default function AdminProducts() {
  const [items, setItems] = useState([]);
  const [cats, setCats] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef();

  const load = () => api.get('/products?limit=200').then((r) => setItems(r.data.items));
  useEffect(() => { load(); api.get('/categories').then((r) => setCats(r.data)); }, []);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setImageFiles(files);
    const previews = files.map((f) => URL.createObjectURL(f));
    setImagePreviews(previews);
  };

  const removePreview = (idx) => {
    const newFiles = imageFiles.filter((_, i) => i !== idx);
    const newPreviews = imagePreviews.filter((_, i) => i !== idx);
    URL.revokeObjectURL(imagePreviews[idx]);
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const f = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const fNum = (key) => (e) => setForm({ ...form, [key]: +e.target.value });
  const fBool = (key) => (e) => setForm({ ...form, [key]: e.target.checked });

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      imageFiles.forEach((file) => data.append('images', file));

      if (editing) {
        await api.put(`/products/${editing}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      }

      setForm(empty);
      setEditing(null);
      setImageFiles([]);
      setImagePreviews([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      load();
      toast.success(editing ? 'Product updated!' : 'Product created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const edit = (p) => {
    setEditing(p._id);
    setForm({ ...p, category: p.category?._id || p.category });
    setImageFiles([]);
    setImagePreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const del = async (id) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    await api.delete(`/products/${id}`);
    load();
    toast.success('Product deleted');
  };

  const cancel = () => {
    setEditing(null);
    setForm(empty);
    setImageFiles([]);
    imagePreviews.forEach((p) => URL.revokeObjectURL(p));
    setImagePreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Package size={22} className="text-primary" />
          {editing ? 'Edit Product' : 'Products'}
        </h1>
        <span className="text-sm text-gray-500">{items.length} products total</span>
      </div>

      <form onSubmit={save} className="card p-6 space-y-5">
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="font-semibold text-gray-700">{editing ? 'Edit Product' : 'Add New Product'}</h2>
          {editing && (
            <button type="button" onClick={cancel} className="text-sm text-gray-500 hover:text-red-600 flex items-center gap-1">
              <X size={14} /> Cancel
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Product Title *</label>
            <input className="input" placeholder="e.g. Sony WH-1000XM5 Headphones" required value={form.name} onChange={f('name')} />
          </div>
          <div>
            <label className="label">Brand</label>
            <input className="input" placeholder="e.g. Sony, Samsung, Nike" value={form.brand} onChange={f('brand')} />
          </div>

          <div>
            <label className="label">Price (₹) *</label>
            <input className="input" type="number" min="0" placeholder="0" required value={form.price} onChange={fNum('price')} />
          </div>
          <div>
            <label className="label">MRP / Original Price (₹) *</label>
            <input className="input" type="number" min="0" placeholder="0" required value={form.mrp} onChange={fNum('mrp')} />
          </div>

          <div>
            <label className="label">Stock Quantity</label>
            <input className="input" type="number" min="0" placeholder="50" value={form.stock} onChange={fNum('stock')} />
          </div>
          <div>
            <label className="label">Category *</label>
            <select className="input" required value={form.category} onChange={f('category')}>
              <option value="">Select a category</option>
              {cats.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="label">Description</label>
            <textarea
              className="input h-auto py-2"
              rows={3}
              placeholder="Describe the product features, specs, and benefits…"
              value={form.description}
              onChange={f('description')}
            />
          </div>

          <div className="md:col-span-2">
            <label className="label">Image URL (optional if uploading files)</label>
            <input className="input" placeholder="https://example.com/image.jpg" value={form.image} onChange={f('image')} />
          </div>
        </div>

        <div>
          <label className="label">Product Images</label>
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={28} className="mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 font-medium">Click to choose files</p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP up to 5 MB each · Multiple files supported</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {imagePreviews.length > 0 && (
            <div className="mt-3 grid grid-cols-4 sm:grid-cols-6 gap-2">
              {imagePreviews.map((src, i) => (
                <div key={i} className="relative group">
                  <img src={src} alt={`Preview ${i + 1}`} className="w-full aspect-square object-cover rounded-lg border border-gray-200" />
                  <button
                    type="button"
                    onClick={() => removePreview(i)}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                  >
                    <X size={12} />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 bg-primary text-white text-[9px] px-1 rounded">Main</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {editing && form.image && imagePreviews.length === 0 && (
            <div className="mt-3 flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
              <img src={form.image} alt="Current" className="w-14 h-14 object-cover rounded" />
              <div>
                <p className="text-xs font-medium text-gray-700">Current image</p>
                <p className="text-xs text-gray-400">Upload new files to replace</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-6 pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="h-4 w-4 rounded accent-primary" checked={form.isFeatured} onChange={fBool('isFeatured')} />
            <span className="text-sm font-medium text-gray-700">Featured</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="h-4 w-4 rounded accent-primary" checked={form.isTrending} onChange={fBool('isTrending')} />
            <span className="text-sm font-medium text-gray-700">Trending</span>
          </label>
        </div>

        <div className="flex gap-3 pt-2 border-t">
          <button className="btn-primary flex items-center gap-2 px-6" disabled={saving}>
            {saving ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Plus size={16} />
                {editing ? 'Update Product' : 'Create Product'}
              </>
            )}
          </button>
          {editing && (
            <button type="button" onClick={cancel} className="btn-outline">Cancel</button>
          )}
        </div>
      </form>

      <div className="card overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="font-semibold text-gray-700">All Products</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3 text-left text-gray-500 font-medium">Image</th>
                <th className="p-3 text-left text-gray-500 font-medium">Product</th>
                <th className="p-3 text-left text-gray-500 font-medium">Category</th>
                <th className="p-3 text-left text-gray-500 font-medium">Price</th>
                <th className="p-3 text-left text-gray-500 font-medium">Stock</th>
                <th className="p-3 text-center text-gray-500 font-medium">Tags</th>
                <th className="p-3 text-center text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50 transition">
                  <td className="p-3">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="w-12 h-12 object-cover rounded-lg border border-gray-200" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 grid place-items-center">
                        <ImageIcon size={16} className="text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="font-medium text-gray-800 line-clamp-1 max-w-xs">{p.name}</div>
                    {p.brand && <div className="text-xs text-gray-400">{p.brand}</div>}
                  </td>
                  <td className="p-3 text-gray-600 text-xs">{p.categorySlug || '—'}</td>
                  <td className="p-3">
                    <div className="font-semibold text-gray-800">{inr(p.price)}</div>
                    {p.mrp > p.price && <div className="text-xs text-gray-400 line-through">{inr(p.mrp)}</div>}
                  </td>
                  <td className="p-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.stock > 10 ? 'bg-green-50 text-green-700' : p.stock > 0 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-600'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex gap-1 justify-center">
                      {p.isFeatured && <span className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded-full font-medium">Featured</span>}
                      {p.isTrending && <span className="bg-saffron/10 text-saffron text-[10px] px-1.5 py-0.5 rounded-full font-medium">Trending</span>}
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => edit(p)} className="text-primary text-xs font-medium hover:underline">Edit</button>
                      <button onClick={() => del(p._id)} className="text-red-600 text-xs font-medium hover:underline">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && (
            <div className="p-12 text-center text-gray-400">
              <Package size={40} className="mx-auto mb-2 opacity-40" />
              <p>No products yet. Create your first product above.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
