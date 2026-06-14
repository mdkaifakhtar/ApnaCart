import { configureStore, createSlice } from '@reduxjs/toolkit';
import api from '../api/axios';

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, token: localStorage.getItem('token') || null },
  reducers: {
    setAuth(state, { payload }) {
      state.user = payload.user;
      state.token = payload.token;
      if (payload.token) localStorage.setItem('token', payload.token);
    },
    setUser(state, { payload }) { state.user = payload; },
    logout(state) {
      state.user = null; state.token = null;
      localStorage.removeItem('token');
    },
  },
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [] },
  reducers: { setCart(state, { payload }) { state.items = payload?.items || []; } },
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { products: [] },
  reducers: { setWishlist(state, { payload }) { state.products = payload?.products || []; } },
});

export const { setAuth, setUser, logout } = authSlice.actions;
export const { setCart } = cartSlice.actions;
export const { setWishlist } = wishlistSlice.actions;

export const store = configureStore({
  reducer: { auth: authSlice.reducer, cart: cartSlice.reducer, wishlist: wishlistSlice.reducer },
});

// Bootstrap on app start
export async function bootstrap() {
  const token = localStorage.getItem('token');
  if (!token) return;
  try {
    const { data } = await api.get('/auth/me');
    store.dispatch(setUser(data.user));
    const [c, w] = await Promise.all([api.get('/cart'), api.get('/wishlist')]);
    store.dispatch(setCart(c.data));
    store.dispatch(setWishlist(w.data));
  } catch {
    store.dispatch(logout());
  }
}
