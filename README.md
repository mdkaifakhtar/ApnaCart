# ApnaCart — MERN E-Commerce (React + JSX + Node + Express + MongoDB)

A production-ready MERN stack e-commerce app (Amazon/Flipkart/Myntra-inspired) with JWT auth, admin dashboard, cart, wishlist, checkout, coupons, reviews, order tracking, and a Gemini-powered AI assistant.

> Pure JavaScript. No TypeScript. No Next.js. No Supabase. MongoDB Atlas + Express APIs + JWT + Mongoose + React (Vite) + Tailwind.

---

## 1. Tech Stack

**Frontend** — React 18 · Vite · React Router · Redux Toolkit · Axios · Tailwind CSS · Lucide Icons · Firebase Web SDK (Google sign-in only)

**Backend** — Node.js 20 · Express 4 · MongoDB Atlas · Mongoose · JSON Web Tokens · bcryptjs · Multer · Firebase Admin (verify Google tokens) · Google Generative AI SDK (Gemini)

---

## 2. Project Structure

```
apnacart/
├── backend/
│   ├── config/db.js
│   ├── controllers/ (auth, product, category, cart, wishlist, order, review, coupon, admin, ai)
│   ├── middleware/ (auth.js, admin.js, error.js, upload.js)
│   ├── models/ (User, Product, Category, Order, Review, Coupon, Cart, Wishlist)
│   ├── routes/
│   ├── seed/seed.js   # 300 products across 20 categories
│   ├── uploads/       # static images
│   ├── .env.example
│   └── server.js
└── frontend/
    ├── src/
    │   ├── api/axios.js
    │   ├── components/ (Navbar, Footer, ProductCard, ProductRail, Hero, AIAssistant, ProtectedRoute, AdminRoute, ...)
    │   ├── pages/ (Home, Category, Product, Cart, Wishlist, Checkout, Orders, OrderTrack, Login, Register, Profile, Admin/*)
    │   ├── context/ (store.js, slices/*)
    │   ├── firebase.js
    │   └── App.jsx
    ├── .env.example
    ├── tailwind.config.js
    ├── vite.config.js
    └── index.html
```

---

## 3. Setup

### Prerequisites
- Node.js 20+
- MongoDB Atlas cluster (free tier works)
- (Optional) Firebase project for Google sign-in
- (Optional) Gemini API key for the AI assistant

### Backend
```bash
cd backend
cp .env.example .env       # fill MONGO_URI, JWT_SECRET, GEMINI_API_KEY, FIREBASE_*
npm install
npm run seed               # seeds 20 categories and 300 products
npm run dev                # http://localhost:5000
```

### Frontend
```bash
cd frontend
cp .env.example .env       # set VITE_API_URL and Firebase web config
npm install
npm run dev                # http://localhost:5173
```

### Default admin
The seed creates an admin user:


---

## 4. Environment Variables

### backend/.env
```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://USER:PASS@cluster.mongodb.net/apnacart
JWT_SECRET=replace-with-a-long-random-string
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

# Gemini AI (optional but recommended)
GEMINI_API_KEY=

# Firebase Admin (optional, for Google sign-in verification)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

### frontend/.env
```
VITE_API_URL=http://localhost:5000/api

# Firebase web config (optional, only if using Google sign-in)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
```

---

## 5. API Documentation (summary)

Base URL: `/api`

### Auth
| Method | Path | Body | Description |
| --- | --- | --- | --- |
| POST | `/auth/register` | `{name,email,password}` | Create user, returns JWT |
| POST | `/auth/login` | `{email,password}` | Email/password login |
| POST | `/auth/google` | `{idToken}` | Google sign-in (Firebase ID token) |
| GET | `/auth/me` | — | Current user (JWT) |

### Products
| Method | Path | Description |
| --- | --- | --- |
| GET | `/products` | List w/ `?q&category&min&max&sort&page` |
| GET | `/products/:slug` | Product details + reviews |
| GET | `/products/featured` | Featured rail |
| GET | `/products/trending` | Trending rail |
| POST | `/products` (admin) | Create |
| PUT | `/products/:id` (admin) | Update |
| DELETE | `/products/:id` (admin) | Delete |

### Categories — `/categories` (GET public, POST/PUT/DELETE admin)
### Cart — `/cart` (auth) GET/POST/PUT/DELETE
### Wishlist — `/wishlist` (auth) GET/POST/DELETE
### Reviews — `/reviews/:productId` GET, POST/PUT/DELETE (auth)
### Coupons — `/coupons/apply` (auth), CRUD (admin)
### Orders — `/orders` (auth) place/list, `/orders/:id` track, `/orders/admin` (admin) list+status
### Admin Analytics — `/admin/stats`, `/admin/sales`, `/admin/users`
### AI — `POST /ai/chat` `{messages}` → Gemini reply with product recommendations

---

## 6. Database Schema (Mongoose)

- **User** `{ name, email (unique), passwordHash, role: 'user'|'admin', googleId?, addresses:[{...}], createdAt }`
- **Category** `{ name, slug (unique), icon, image }`
- **Product** `{ name, slug (unique), category: ObjectId→Category, categorySlug, brand, description, price, mrp, image, images[], rating, reviewCount, stock, isFeatured, isTrending }`
- **Cart** `{ user, items:[{product, quantity}] }`
- **Wishlist** `{ user, products:[ObjectId] }`
- **Review** `{ product, user, rating(1-5), title, body, verifiedPurchase }`
- **Coupon** `{ code (unique), type:'flat'|'percent', value, minOrder, expiresAt, active }`
- **Order** `{ user, items:[{product,name,image,price,quantity}], subtotal, discount, shipping, total, address:{...}, paymentMethod:'cod'|'card'|'upi', paymentStatus, status: placed|confirmed|shipped|out_for_delivery|delivered|cancelled, couponCode?, timeline:[{status,at}], createdAt }`

---

## 7. Features Checklist

- [x] JWT auth + Google sign-in (Firebase)
- [x] Admin role protection (middleware + frontend route guard)
- [x] 300 seeded products across 20 categories with category-matched, de-duplicated Unsplash images
- [x] Modern Flipkart-inspired UI, mega-menu navbar, hero rotator, product rails
- [x] Search, filters (price/rating/sort), pagination
- [x] Cart, wishlist, coupons, checkout (address + payment), order tracking
- [x] Reviews: add / edit / delete, star ratings, verified-purchase badge
- [x] Admin dashboard: product CRUD, category CRUD, order management, user management, sales analytics, revenue
- [x] AI Assistant powered by Gemini with a `searchProducts` tool over the live catalog

---

## 8. Deployment

### MongoDB Atlas
1. Create free cluster, add a DB user, allow `0.0.0.0/0` (or your hosts).
2. Copy connection string into `MONGO_URI`.

### Backend — Render (or Railway)
1. New Web Service → connect repo → root `backend/`.
2. Build command: `npm install`
3. Start command: `npm start`
4. Add env vars from `.env.example`.
5. Note the URL (e.g. `https://apnacart-api.onrender.com`).

### Frontend — Vercel
1. Import repo → root `frontend/`.
2. Framework preset: **Vite**.
3. Env var: `VITE_API_URL=https://<your-backend>/api` (+ Firebase vars).
4. Deploy. Update backend `CLIENT_URL` env to your Vercel URL and redeploy.

### After deploy
- Run the seed once locally against Atlas: `MONGO_URI=... npm run seed`.
- Log in as `admin@apnacart.in` / `Admin@12345` and change the password.

---

## 9. Scripts

Backend: `npm run dev` (nodemon) · `npm start` · `npm run seed`
Frontend: `npm run dev` · `npm run build` · `npm run preview`

---

## 10. Notes

- Images use curated Unsplash URLs per category — no duplicates, no placeholders. To localize, run `node backend/seed/downloadImages.js` (optional helper).
- The AI assistant degrades gracefully: without `GEMINI_API_KEY` it returns a static helpful message rather than crashing.
- All admin endpoints require `role: 'admin'` enforced by `middleware/admin.js`.

---

## 12. Changelog

### v2 (UI polish + AI fixes)
- New ApnaCart logo (navy + orange cart mark) used in Navbar, Footer, Login, Register, favicon.
- Navbar redesigned: container max-width, balanced spacing, Lucide category icons (no emojis), responsive mobile drawer, animated hover states.
- Footer redesigned with logo and contact section.
- AI chatbot rewritten:
  - Persists messages in `sessionStorage` for the session.
  - Loading indicator, error toasts, graceful fallback when Gemini key is missing or the API errors (keyword-based local search).
  - Backend (`controllers/aiController.js`) never returns 500 — degrades gracefully with `fallback: true` and best-effort product results.
- Improved typography, padding, hover shadows on cards.
- Removed all emoji icons from UI.

### v1
- Initial MERN release with full admin, reviews, coupons, checkout and AI assistant.
