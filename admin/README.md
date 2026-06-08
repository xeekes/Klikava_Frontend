# KlikAVA Panel

Единая панель управления с двумя порталами: **админ платформы** и **продавец**.

## Запуск

```bash
cd admin
npm install
npm run dev
```

Приложение откроется на `http://localhost:3001`.

## Порталы

| Роль | Логин | Страницы |
|------|-------|----------|
| Admin | `/login` | `/products`, `/orders` |
| Seller | `/seller/login` | shop: `/seller/products`, `/seller/orders`; account: `/seller/profile`, `/seller/settings`, `/seller/statistics`, `/seller/dashboard` |

Продавец попадает в seller-портал с витрины: **Profile → Account for sellers**.

## Демо-логины (mock)

**Admin**
- Email: `admin@klikava.com`
- Password: `admin123`

**Seller**
- Email: `seller@klikava.com`
- Password: `seller123`

Продавец видит только свои товары и заказы (3 из 6 в mock-данных).

## API

Когда бэкенд будет готов, укажи базовый URL:

```env
VITE_API_BASE_URL=https://api.example.com
```

Ожидаемые эндпоинты:

- `POST /admin/auth/login` — вход админа
- `POST /seller/auth/login` — вход продавца
- `GET /panel/auth/me` — текущий пользователь с `role` и `sellerId`

Без `VITE_API_BASE_URL` панель работает на mock-данных с сохранением в `localStorage` (товары, заказы, профиль продавца).

Контракт API для бэкенда: `docs/API-CONTRACT.md`.

## Структура

- `src/pages` — экраны (login, products, orders, add product)
- `src/layouts` — общий layout с sidebar
- `src/constants/routes.js` — маршруты admin и seller
- `src/utils/dataScope.js` — фильтрация данных по роли
- `src/api` — клиент и auth
