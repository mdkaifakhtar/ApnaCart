import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function AdminRoute({ children }) {
  const { user, token } = useSelector((s) => s.auth);
  if (!token) return <Navigate to="/login" replace />;
  if (!user) return <div className="p-10 text-center">Loading…</div>;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}
