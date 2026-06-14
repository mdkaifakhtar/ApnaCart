# Database Schema (Mongoose)

## User
| field | type | notes |
| --- | --- | --- |
| name | string | required |
| email | string | unique, lowercase, indexed |
| passwordHash | string | bcrypt (10 rounds) |
| role | 'user' \| 'admin' | default `user` |
| googleId | string | set when signed in via Google |
| avatar | string | URL |
| addresses | [{fullName,phone,line1,line2,city,state,pincode,country}] | |

## Category
`{ name, slug (unique), icon, image }`

## Product
`{ name, slug (unique), category→Category, categorySlug, brand, description, price, mrp, image, images[], rating, reviewCount, stock, isFeatured, isTrending }`
Text index on `name, description, brand`.

## Cart
`{ user (unique→User), items: [{ product→Product, quantity }] }`

## Wishlist
`{ user (unique→User), products: [Product] }`

## Review
`{ product→Product, user→User, rating(1-5), title, body, verifiedPurchase }`
Compound unique index on `(product, user)`.

## Coupon
`{ code (unique upper), type: 'flat'|'percent', value, minOrder, expiresAt, active }`

## Order
`{ user→User, items:[{product,name,image,price,quantity}], subtotal, discount, shipping, total, address:{...}, paymentMethod:'cod'|'card'|'upi', paymentStatus:'pending'|'paid'|'failed', status:'placed'|'confirmed'|'shipped'|'out_for_delivery'|'delivered'|'cancelled', couponCode, timeline:[{status,at}] }`
