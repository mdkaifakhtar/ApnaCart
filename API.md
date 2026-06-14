# API Documentation

Base URL: `${API}/api`. Auth: `Authorization: Bearer <JWT>`.

## Auth
- `POST /auth/register` → `{name,email,password}` → `{token,user}`
- `POST /auth/login` → `{email,password}` → `{token,user}`
- `POST /auth/google` → `{idToken}` → `{token,user}` (requires Firebase Admin configured)
- `GET /auth/me` (auth) → `{user}`
- `PUT /auth/me` (auth) → update name/addresses

## Products
- `GET /products?q=&category=&min=&max=&sort=popular|rating|priceAsc|priceDesc|newest&page=&limit=`
- `GET /products/featured` · `GET /products/trending`
- `GET /products/:slug` → `{product, related}`
- (admin) `POST /products`, `PUT /products/:id`, `DELETE /products/:id`

## Categories
- `GET /categories`
- (admin) `POST`, `PUT /:id`, `DELETE /:id`

## Cart (auth)
- `GET /cart` · `POST /cart {productId,quantity}` · `PUT /cart {productId,quantity}`
- `DELETE /cart/:productId` · `DELETE /cart` (clear)

## Wishlist (auth)
- `GET /wishlist` · `POST /wishlist {productId}` · `DELETE /wishlist/:productId`

## Reviews
- `GET /reviews/:productId`
- (auth) `POST /reviews/:productId {rating,title,body}` (upsert)
- (auth) `PUT /reviews/:id` · `DELETE /reviews/:id`

## Coupons
- (auth) `POST /coupons/apply {code, subtotal}` → `{code, discount, type, value}`
- (admin) `GET/POST/PUT/DELETE /coupons[/:id]`

## Orders (auth)
- `POST /orders {address, paymentMethod, couponCode}` → places order
- `GET /orders/mine` · `GET /orders/:id` · `PUT /orders/:id/cancel`
- (admin) `GET /orders/admin` · `PUT /orders/:id/status {status}`

## Admin Analytics
- `GET /admin/stats` · `GET /admin/sales` · `GET /admin/users`
- `PUT /admin/users/:id/role {role}` · `DELETE /admin/users/:id`

## AI
- `POST /ai/chat {messages: [{role,content}]}` → `{reply, products[]}`
