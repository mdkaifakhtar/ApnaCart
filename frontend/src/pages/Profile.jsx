import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import api from '../api/axios';
import { setUser } from '../context/store';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const [name, setName] = useState(user?.name || '');
  const [addresses, setAddresses] = useState(user?.addresses || []);

  const addAddr = () => setAddresses([...addresses, { fullName: name, phone: '', line1: '', city: '', state: '', pincode: '', country: 'India' }]);
  const updAddr = (i, k, v) => { const c = [...addresses]; c[i] = { ...c[i], [k]: v }; setAddresses(c); };
  const delAddr = (i) => setAddresses(addresses.filter((_, j) => j !== i));

  const save = async () => {
    const { data } = await api.put('/auth/me', { name, addresses });
    dispatch(setUser(data.user)); toast.success('Saved');
  };

  if (!user) return null;
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-xl font-bold">My profile</h1>
      <section className="card p-4 space-y-2">
        <label className="label">Name</label>
        <input className="input" value={name} onChange={(e)=>setName(e.target.value)}/>
        <p className="text-sm text-gray-500">Email: {user.email}</p>
      </section>
      <section className="card p-4 space-y-3">
        <div className="flex justify-between items-center"><h2 className="font-bold">Addresses</h2><button className="btn-outline" onClick={addAddr}>+ Add address</button></div>
        {addresses.map((a, i) => (
          <div key={i} className="border rounded p-3 grid grid-cols-2 gap-2">
            {['fullName','phone','line1','line2','city','state','pincode'].map((k) => (
              <input key={k} className="input" placeholder={k} value={a[k]||''} onChange={(e)=>updAddr(i,k,e.target.value)}/>
            ))}
            <button onClick={()=>delAddr(i)} className="text-red-600 text-sm col-span-2 text-right">Remove</button>
          </div>
        ))}
      </section>
      <button className="btn-primary" onClick={save}>Save changes</button>
    </div>
  );
}
