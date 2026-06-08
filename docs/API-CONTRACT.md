# KlikAVA — контракт API (frontend ↔ backend)

Два SPA используют один бэкенд:

| Приложение | Порт (dev) | Env |
|------------|------------|-----|
| Витрина `frontend/` | 3000 | `VITE_API_BASE_URL` |
| Панель `admin/` | 3001 | `VITE_API_BASE_URL` |

Без `VITE_API_BASE_URL` оба приложения работают на mock/localStorage.

---

## 1. Витрина (покупатель)

### Auth — `/auth/*`
Уже реализовано в `frontend/src/api/auth.js`.

```
POST /auth/login
POST /auth/register
POST /auth/verification/send
POST /auth/verification/verify
POST /auth/password/create
POST /auth/password/reset
POST /auth/oauth/google
POST /auth/logout
GET  /auth/me          → { id, emailOrPhone, displayName }
```

### Cart — `/cart`
Уже реализовано в `frontend/src/api/cart.js`.

### Каталог (планируется)
```
GET  /products              ?category&search&page&limit
GET  /products/:id
GET  /categories
```

### Профиль покупателя (планируется)
```
GET  /user/profile
PUT  /user/profile
GET  /user/addresses
POST /user/addresses
PUT  /user/addresses/:id
DELETE /user/addresses/:id
GET  /user/orders
POST /checkout
```

---

## 2. Панель (admin + seller)

Один набор эндпоинтов, **роль в JWT** определяет scope данных.

### Auth
```
POST /admin/auth/login     → { token, user: { id, email, name, role: "admin" } }
POST /seller/auth/login    → { token, user: { id, email, name, role: "seller", sellerId } }
POST /seller/auth/register → { token, user }   // после регистрации продавца
GET  /panel/auth/me        → user
POST /panel/auth/logout
```

### Products
```
GET    /panel/products           ?search=   // admin: все, seller: только свои
GET    /panel/products/:id
POST   /panel/products           // seller создаёт свой товар
PUT    /panel/products/:id
DELETE /panel/products/:id
DELETE /panel/products             body: { ids: number[] }   // bulk
```

**Product:**
```ts
{
  id: number
  sellerId: number
  name: string
  sku: string
  stock: "in stock" | "out of stock"
  price: number
  categories: string
  tags: string
  date: string          // "DD.MM.YY"
  description?: string
  regularPrice?: number
  salePrice?: number
}
```

### Orders
```
GET    /panel/orders             ?search=
DELETE /panel/orders/:id
DELETE /panel/orders             body: { ids: number[] }
```

**Order:**
```ts
{
  id: number
  sellerId: number
  sku: string
  date: string
  status: string
  billing: string
  total: number
}
```

### Seller account
```
GET  /panel/seller/profile       → SellerProfile
PUT  /panel/seller/profile
GET  /panel/seller/settings      → SellerSettings
PUT  /panel/seller/settings
DELETE /panel/seller/account
GET  /panel/seller/stats         ?days=7
GET  /panel/seller/dashboard     → { productsCount, ordersCount, views, purchased }
```

---

## 3. Связка витрина → seller-панель

Покупатель в профиле нажимает **Account for sellers** → переход на:

```
http://localhost:3001/seller/login?email={email}
```

Бэкенд (целевой флоу):
1. Покупатель уже залогинен на витрине (`auth_token`).
2. При регистрации продавца `POST /seller/auth/register` может принять `storefrontToken` и привязать seller к тому же user.
3. Либо seller логинится тем же email — бэкенд находит связанный аккаунт.

На фронте сейчас: prefill email на странице логина продавца.

---

## 4. Паттерн mock / real на фронте

```js
// admin/src/api/products.js
export const productsApi = hasApiBaseUrl() ? realProductsApi : mockProductsApi;
```

Mock-режим хранит данные в `localStorage` (`panel_store_*`), чтобы Save/Delete/Publish реально работали до подключения бэкенда.

---

## 5. Заголовки

```
Authorization: Bearer <token>
Content-Type: application/json
```

Ошибки: `{ message: string, ... }` с HTTP 4xx/5xx.
