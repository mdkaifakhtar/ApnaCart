import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import api from '../api/axios';
import { setAuth, setCart, setWishlist } from '../context/store';
import { googleSignIn, firebaseReady } from '../firebase';
import toast from 'react-hot-toast';
import Logo from '../components/Logo';

export default function Login() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [busy, setBusy] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loc = useLocation();
  const next = loc.state?.from?.pathname || '/';

  const finish = async (data) => {
    dispatch(setAuth(data));
    const [c, w] = await Promise.all([api.get('/cart'), api.get('/wishlist')]);
    dispatch(setCart(c.data)); dispatch(setWishlist(w.data));
    navigate(next, { replace: true });
  };

  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      toast.success('Welcome back!'); await finish(data);
    } catch (err) { toast.error(err.response?.data?.message || 'Login failed'); } finally { setBusy(false); }
  };

  const google = async () => {
    try {
      const idToken = await googleSignIn();
      const { data } = await api.post('/auth/google', { idToken });
      toast.success('Welcome!'); await finish(data);
    } catch (err) { toast.error(err.message || 'Google sign-in failed'); }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <div className="flex justify-center mb-6"><Logo to="/" variant="dark" size="lg" /></div>
      <div className="card p-6">
        <h1 className="text-2xl font-bold">Sign in</h1>
        <p className="text-sm text-gray-500 mb-4">Access your cart, orders and wishlist</p>
        <form onSubmit={submit} className="space-y-3">
          <input className="input" type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} required/>
          <input className="input" type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} required minLength={6}/>
          <button disabled={busy} className="btn-primary w-full">{busy ? 'Signing in…' : 'Sign in'}</button>
        </form>
        {firebaseReady() && (
          <button onClick={google} className="btn-outline w-full mt-3">Continue with Google</button>
        )}
        <p className="text-sm mt-4 text-center">No account? <Link to="/register" className="text-primary underline">Create one</Link></p>
      </div>
    </div>
  );
}
