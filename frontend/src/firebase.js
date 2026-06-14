// Firebase Web SDK — only initialized if env vars are set.
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app = null;
export function firebaseReady() {
  return !!(cfg.apiKey && cfg.projectId && cfg.appId);
}
function ensureApp() {
  if (!firebaseReady()) return null;
  if (!app) app = getApps()[0] || initializeApp(cfg);
  return app;
}
export async function googleSignIn() {
  if (!ensureApp()) throw new Error('Google sign-in is not configured. Add Firebase env vars.');
  const auth = getAuth(ensureApp());
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return await result.user.getIdToken();
}
