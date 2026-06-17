# KlikAVA — Frontend

Монорепозиторий фронтенд-части маркетплейса KlikAVA.

## Структура

```
frontend/   — витрина (React + Vite, порт 3000)
admin/      — панель платформы и продавца (React + Vite, порт 3001)
docs/       — API-контракт и документация
```

## Быстрый старт

### Витрина

```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_BASE_URL и др.
npm run dev
```

http://localhost:3000

### Админка

```bash
cd admin
npm install
cp .env.example .env
npm run dev
```

http://localhost:3001

## Бэкенд

FastAPI на EC2. URL задаётся в `frontend/.env` → `VITE_API_BASE_URL`.

Подробнее: `docs/API-CONTRACT.md`.

## Демо-логины (mock / admin)

| Портал | Логин | Пароль |
|--------|-------|--------|
| Admin | `admin@klikava.com` | `admin123` |
| Seller | `seller@klikava.com` | `seller123` |
