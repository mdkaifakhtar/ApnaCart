import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
export default function AdminCategories() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: '', icon: '', image: '' });
  const [editing, setEditing] = useState(null);
  const load = () => api.get('/categories').then((r)=>setItems(r.data));
  useEffect(() => { load(); }, []);
  const save = async (e) => {
    e.preventDefault();
    if (editing) await api.put(`/categories/${editing}`, form);
    else await api.post('/categories', form);
    setForm({ name:'',icon:'',image:'' }); setEditing(null); load(); toast.success('Saved');
  };
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Categories</h1>
      <form onSubmit={save} className="card p-4 grid grid-cols-3 gap-2">
        <input className="input" placeholder="Name" required value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})}/>
        <input className="input" placeholder="Icon (emoji)" value={form.icon} onChange={(e)=>setForm({...form,icon:e.target.value})}/>
        <input className="input" placeholder="Image URL" value={form.image} onChange={(e)=>setForm({...form,image:e.target.value})}/>
        <button className="btn-primary col-span-3">{editing ? 'Update' : 'Create'}</button>
      </form>
      <div className="card divide-y">
        {items.map((c) => (
          <div key={c._id} className="p-3 flex items-center gap-3">
            <span className="text-2xl">{c.icon}</span>
            <span className="flex-1 font-medium">{c.name}</span>
            <span className="text-xs text-gray-500">/{c.slug}</span>
            <button onClick={()=>{setEditing(c._id);setForm({name:c.name,icon:c.icon||'',image:c.image||''});}} className="text-primary text-sm">Edit</button>
            <button onClick={async()=>{if(confirm('Delete?')){await api.delete(`/categories/${c._id}`); load();}}} className="text-red-600 text-sm">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
