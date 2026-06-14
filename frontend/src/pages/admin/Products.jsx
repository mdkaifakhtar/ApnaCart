import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { inr } from '../../utils/format';
import toast from 'react-hot-toast';

const empty = { name: '', brand: '', description: '', price: 0, mrp: 0, image: '', stock: 50, category: '', isFeatured: false, isTrending: false };

export default function AdminProducts() {
  const [items, setItems] = useState([]);
  const [cats, setCats] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const load = () => api.get('/products?limit=200').then((r) => setItems(r.data.items));
  useEffect(() => { load(); api.get('/categories').then((r)=>setCats(r.data)); }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing) await api.put(`/products/${editing}`, form);
      else await api.post('/products', form);
      setForm(empty); setEditing(null); load(); toast.success('Saved');
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };
  const edit = (p) => { setEditing(p._id); setForm({ ...p, category: p.category?._id || p.category }); };
  const del = async (id) => { if (!confirm('Delete product?')) return; await api.delete(`/products/${id}`); load(); };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Products</h1>
      <form onSubmit={save} className="card p-4 grid grid-cols-2 gap-2">
        <input className="input" placeholder="Name" required value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})}/>
        <input className="input" placeholder="Brand" value={form.brand} onChange={(e)=>setForm({...form,brand:e.target.value})}/>
        <input className="input" type="number" placeholder="Price" required value={form.price} onChange={(e)=>setForm({...form,price:+e.target.value})}/>
        <input className="input" type="number" placeholder="MRP" required value={form.mrp} onChange={(e)=>setForm({...form,mrp:+e.target.value})}/>
        <input className="input" type="number" placeholder="Stock" value={form.stock} onChange={(e)=>setForm({...form,stock:+e.target.value})}/>
        <select className="input" required value={form.category} onChange={(e)=>setForm({...form,category:e.target.value})}>
          <option value="">Select category</option>
          {cats.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <input className="input col-span-2" placeholder="Image URL" required value={form.image} onChange={(e)=>setForm({...form,image:e.target.value})}/>
        <textarea className="input col-span-2" placeholder="Description" value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})}/>
        <label className="flex items-center gap-2"><input type="checkbox" checked={form.isFeatured} onChange={(e)=>setForm({...form,isFeatured:e.target.checked})}/> Featured</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={form.isTrending} onChange={(e)=>setForm({...form,isTrending:e.target.checked})}/> Trending</label>
        <button className="btn-primary col-span-2">{editing ? 'Update' : 'Create'} product</button>
        {editing && <button type="button" onClick={()=>{setEditing(null);setForm(empty);}} className="btn-outline col-span-2">Cancel</button>}
      </form>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50"><tr><th className="p-2 text-left">Image</th><th className="p-2 text-left">Name</th><th className="p-2">Price</th><th className="p-2">Stock</th><th className="p-2">Actions</th></tr></thead>
          <tbody>
            {items.map((p) => (
              <tr key={p._id} className="border-t">
                <td className="p-2"><img src={p.image} className="w-10 h-10 object-cover rounded"/></td>
                <td className="p-2">{p.name}</td>
                <td className="p-2">{inr(p.price)}</td>
                <td className="p-2">{p.stock}</td>
                <td className="p-2 space-x-2"><button onClick={()=>edit(p)} className="text-primary">Edit</button><button onClick={()=>del(p._id)} className="text-red-600">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
