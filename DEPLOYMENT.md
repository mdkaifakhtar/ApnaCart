# Deployment Guide

## 1. MongoDB Atlas (database)
1. Create a free M0 cluster at https://cloud.mongodb.com
2. Database Access → add user with read/write
3. Network Access → allow `0.0.0.0/0` (or your hosting IPs)
4. Copy the connection string → use as `MONGO_URI`

## 2. Backend → Render
1. Push the repo to GitHub.
2. https://render.com → New → Web Service → connect repo.
3. Root directory: `backend`
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Environment: add every var from `backend/.env.example` (MONGO_URI, JWT_SECRET, CLIENT_URL=https://your-frontend.vercel.app, GEMINI_API_KEY, FIREBASE_*).
7. Deploy. Note URL e.g. `https://apnacart-api.onrender.com`.
8. One-time seed: locally run `MONGO_URI=... node seed/seed.js`.

## 3. Frontend → Vercel
1. https://vercel.com → New Project → import repo.
2. Root directory: `frontend`. Framework: Vite. Output: `dist`.
3. Env vars: `VITE_API_URL=https://apnacart-api.onrender.com/api` plus Firebase web config.
4. Deploy. Update backend `CLIENT_URL` to your Vercel URL and redeploy backend.

## 4. (Optional) Firebase Google Sign-in
1. Create Firebase project → Authentication → enable Google.
2. Add web app → copy config into frontend env vars (`VITE_FIREBASE_*`).
3. Project settings → Service accounts → Generate new private key → use those values for `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` on the backend.

## 5. Gemini AI
1. Get key at https://aistudio.google.com/apikey
2. Set `GEMINI_API_KEY` on the backend.
3. Without it the assistant falls back to a friendly canned reply (no errors).
