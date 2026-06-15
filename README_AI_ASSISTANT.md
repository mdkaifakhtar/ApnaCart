# ApnaCart — AI Features Guide

This document covers the AI Assistant and AI Logo Generator features built into ApnaCart.

---

## Table of Contents

1. [AI Assistant](#ai-assistant)
2. [AI Logo Generator](#ai-logo-generator)
3. [Required Environment Variables](#required-environment-variables)
4. [Setup Guide](#setup-guide)
5. [Troubleshooting](#troubleshooting)

---

## AI Assistant

The ApnaCart AI Assistant is a floating chat widget powered by Google Gemini. It helps shoppers find products, get recommendations, and compare items — all in natural language.

### How to Use

1. Click the **orange chat bubble** in the bottom-right corner of any page.
2. Type your query in plain English or Hindi-English mix, for example:
   - `Show me gaming laptops under ₹80,000`
   - `Best wireless earbuds for gym`
   - `Gift ideas for mom under 5000`
   - `Compare Sony and Bose headphones`
3. The assistant will reply with relevant products from the catalog.
4. Click any product card to go directly to its detail page.

### Features

- **Smart product search** — uses Gemini function calling to query the live catalog
- **Session memory** — conversation is preserved during your browser session
- **Graceful fallback** — if no Gemini API key is set, a keyword-based search still works
- **Loading states** — spinner shown while AI is thinking
- **Error recovery** — never crashes; always returns a helpful response
- **Suggestion chips** — quick-start prompts shown on first open

### How It Works (Technical)

```
User message → POST /api/ai/chat → Gemini 1.5 Flash
                                      ↓
                             function call: searchProducts
                                      ↓
                             MongoDB product lookup
                                      ↓
                             Gemini formats reply
                                      ↓
                           { reply, products[] } → UI
```

If `GEMINI_API_KEY` is not set, the backend falls back to a regex-based keyword search and returns matching products without an AI-generated reply.

---

## AI Logo Generator

The Logo Generator is an admin tool that creates professional SVG logos for any brand using Google Gemini AI.

### How to Access

1. Log in as an **admin** user.
2. Go to **Admin Dashboard** → **AI Tools → Logo Generator** (in the left sidebar).

### How to Use

1. **Brand Name** *(required)* — Enter the name of your brand.
2. **Brand Description** *(optional)* — A short description helps the AI design a fitting logo.
3. **Brand Colors** — Enter hex color codes separated by commas.
   - Default ApnaCart colors: `#0A2E73, #FF7A1A`
   - Use the preset buttons for quick selection.
4. **Logo Style** — Choose from:
   - Modern & Professional
   - Minimal & Clean
   - Bold & Playful
   - Elegant & Luxury
   - Tech & Futuristic
5. Click **Generate Logo**.
6. Preview the logo on the right panel.
7. Download as **SVG** (vector, scalable) or **PNG** (raster, 800×400 px).

### Download Options

| Format | Best For |
|--------|----------|
| SVG    | Web use, print, infinite scaling |
| PNG    | Documents, presentations, social media |

### ApnaCart Brand Colors

| Color | Hex |
|-------|-----|
| Primary Blue | `#0A2E73` |
| Brand Orange | `#FF7A1A` |
| White | `#FFFFFF` |

---

## Required Environment Variables

### Backend (server-side)

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | **Yes** | MongoDB connection string |
| `JWT_SECRET` | **Yes** | Secret key for signing JWT tokens |
| `JWT_EXPIRES_IN` | No | Token expiry, default `7d` |
| `PORT` | No | Server port, default `8000` |
| `NODE_ENV` | No | `development` or `production` |
| `CLIENT_URL` | No | Frontend URL for CORS |
| `GEMINI_API_KEY` | No* | Google Gemini API key |
| `GEMINI_MODEL` | No | Model name, default `gemini-1.5-flash` |
| `FIREBASE_PROJECT_ID` | No | Firebase project ID for Google Sign-In |
| `FIREBASE_CLIENT_EMAIL` | No | Firebase service account email |
| `FIREBASE_PRIVATE_KEY` | No | Firebase private key |

> *Without `GEMINI_API_KEY`, the AI Assistant falls back to keyword search and the Logo Generator uses a template engine instead of AI.

### Frontend (build-time)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | **Yes** | Backend API base URL (e.g. `/api`) |
| `VITE_FIREBASE_API_KEY` | No | Firebase web SDK key |
| `VITE_FIREBASE_AUTH_DOMAIN` | No | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | No | Firebase project ID |
| `VITE_FIREBASE_APP_ID` | No | Firebase app ID |

---

## Setup Guide

### 1. Prerequisites

- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Google Gemini API key *(optional but recommended)*

### 2. Clone & Install

```bash
git clone <repo-url>
cd apnacart

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 3. Configure Environment Variables

**Backend** — create `backend/.env`:

```env
PORT=8000
NODE_ENV=development
MONGO_URI=mongodb+srv://USER:PASS@cluster.mongodb.net/apnacart
JWT_SECRET=your-long-random-secret-key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5000

# AI features (optional)
GEMINI_API_KEY=your-gemini-api-key-here
```

**Frontend** — create `frontend/.env`:

```env
VITE_API_URL=/api
```

### 4. Seed the Database (Optional)

```bash
cd backend && npm run seed
```

This inserts 300 sample products across all categories.

### 5. Start Development Servers

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Frontend: http://localhost:5000  
Backend API: http://localhost:8000

### 6. Get a Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **Create API Key**
4. Copy the key and add it to your `backend/.env` as `GEMINI_API_KEY`
5. Restart the backend server

---

## Troubleshooting

### AI Assistant shows "Configure GEMINI_API_KEY" message

The assistant is running in fallback mode. Set `GEMINI_API_KEY` in your backend `.env` file and restart the server.

### AI Assistant returns "Network error"

- Check that the backend server is running on port 8000
- Verify `VITE_API_URL` is set to `/api` in the frontend environment
- Check browser console for CORS errors

### Logo Generator shows template logo instead of AI logo

Same as above — add a `GEMINI_API_KEY`. The template engine is the fallback and still produces usable logos.

### PNG download looks blank or wrong

Some browsers restrict `canvas` operations with SVGs. Try the SVG download instead, which is a pure vector format.

### Product image upload not working

- Images must be under 5 MB each
- Accepted formats: JPG, PNG, WebP, GIF
- Check the `backend/uploads/` directory exists and is writable
- The backend serves uploads at `/uploads/` (proxied through Vite in development)

### MongoDB connection fails

- Check your `MONGO_URI` is correct
- Ensure your IP address is whitelisted in MongoDB Atlas
- Verify the database user has read/write permissions

### Admin panel not accessible

- Log in with a user that has `role: "admin"` in the database
- Use MongoDB Atlas or a seed script to promote a user:
  ```js
  db.users.updateOne({ email: "your@email.com" }, { $set: { role: "admin" } })
  ```

---

## Modified Files Summary

### Backend
| File | Change |
|------|--------|
| `backend/routes/products.js` | Added multer middleware for multi-image upload |
| `backend/routes/ai.js` | Added `/generate-logo` route |
| `backend/controllers/productController.js` | Handle `req.files`, slug deduplication, category auto-resolve on update |
| `backend/controllers/aiController.js` | Added `generateLogo` export, refactored model init, improved error handling |

### Frontend
| File | Change |
|------|--------|
| `frontend/src/pages/admin/Products.jsx` | Full UI overhaul: labeled fields, file upload with preview, improved table |
| `frontend/src/pages/admin/LogoGenerator.jsx` | **New file** — AI Logo Generator page |
| `frontend/src/pages/admin/AdminLayout.jsx` | Added AI Tools section with Logo Generator link |
| `frontend/src/App.jsx` | Added `/admin/logo-generator` route |

### Documentation
| File | Change |
|------|--------|
| `README_AI_ASSISTANT.md` | **New file** — Full AI features documentation |
