# Setup Guide

## Prerequisites
- Node.js 20+
- npm 10+
- MongoDB Atlas free cluster (or local MongoDB)

## Backend
```bash
cd backend
cp .env.example .env
# fill MONGO_URI and JWT_SECRET at minimum
npm install
npm run seed     # creates 20 categories, 300 products, admin user, 3 coupons
npm run dev      # http://localhost:5000
```

## Frontend
```bash
cd frontend
cp .env.example .env       # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev                # http://localhost:5173
```

## Default admin
Email: `admin@apnacart.in` · Password: `Admin@12345`
Change the password after first login (Profile page).

## Coupons (seeded)
- `WELCOME100` — flat ₹100 off (min ₹499)
- `SAVE10` — 10% off (min ₹999)
- `BIGSALE` — 25% off (min ₹2999)

## Troubleshooting
- **Cannot connect to Mongo** — check `MONGO_URI` and whitelisted IPs.
- **CORS error** — set backend `CLIENT_URL` to your frontend URL exactly.
- **Login 401** — token expired; sign in again.
- **AI says "not configured"** — set `GEMINI_API_KEY` on the backend.
- **Google sign-in disabled** — set both server and client Firebase env vars.
