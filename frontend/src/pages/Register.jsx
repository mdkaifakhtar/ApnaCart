import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import api from '../api/axios';
import { setAuth } from '../context/store';
import toast from 'react-hot-toast';
import Logo from '../components/Logo';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try {
      const { data } = await api.post('/auth/register', form);
      dispatch(setAuth(data));
      toast.success('Account created!'); navigate('/');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); } finally { setBusy(false); }
  };
  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <div className="flex justify-center mb-6"><Logo to="/" variant="dark" size="lg" /></div>
      <div className="card p-6">
        <h1 className="text-2xl font-bold">Create account</h1>
        <form onSubmit={submit} className="space-y-3 mt-4">
          <input className="input" placeholder="Full name" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} required/>
          <input className="input" type="email" placeholder="Email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} required/>
          <input className="input" type="password" placeholder="Password (min 6)" value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})} required minLength={6}/>
          <button disabled={busy} className="btn-primary w-full">{busy ? 'Creating…' : 'Create account'}</button>
        </form>
        <p className="text-sm mt-4 text-center">Have an account? <Link to="/login" className="text-primary underline">Sign in</Link></p>
      </div>
    </div>
  );
}
