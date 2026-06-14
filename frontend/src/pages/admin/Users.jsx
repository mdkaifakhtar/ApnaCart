import { useEffect, useState } from 'react';
import api from '../../api/axios';
export default function AdminUsers() {
  const [items, setItems] = useState([]);
  const load = () => api.get('/admin/users').then((r)=>setItems(r.data));
  useEffect(() => { load(); }, []);
  const setRole = async (id, role) => { await api.put(`/admin/users/${id}/role`, { role }); load(); };
  const del = async (id) => { if (confirm('Delete user?')) { await api.delete(`/admin/users/${id}`); load(); } };
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Users</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50"><tr><th className="p-2 text-left">Name</th><th className="p-2">Email</th><th className="p-2">Role</th><th className="p-2">Actions</th></tr></thead>
          <tbody>
            {items.map((u) => (
              <tr key={u._id} className="border-t">
                <td className="p-2">{u.name}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2"><select className="input h-9 max-w-[140px]" value={u.role} onChange={(e)=>setRole(u._id, e.target.value)}><option value="user">user</option><option value="admin">admin</option></select></td>
                <td className="p-2"><button onClick={()=>del(u._id)} className="text-red-600">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
