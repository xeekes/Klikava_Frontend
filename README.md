# KlikAVA — Diploma Marketplace Frontend

Two SPAs sharing one API contract: customer storefront and admin/seller panel.

Team diploma project — I built the frontend (storefront and admin); the Java backend lives in a separate private repository.

## Stack

- Vite + React 18 + React Router + Sass
- Swiper, Vitest, Prettier
- Docker + nginx for storefront production builds

## Structure

```
Klikava_Frontend/
├── frontend/   # storefront (Vite dev server port 3000)
├── admin/      # panel (Vite dev server port 3001)
└── docs/       # API-CONTRACT.md
```

## Storefront features

Catalog, categories, search, product detail, cart, checkout,
profile, discounts / top products, auth (mock/localStorage without backend).

## Getting started

```bash
# Storefront
cd frontend
npm install
npm run dev

# Admin panel
cd admin
npm install
npm run dev
```

Set `VITE_API_BASE_URL` in each app’s env (see `.env.example`) to point at the backend.
Without it, apps run against mock/localStorage.
API details: `docs/API-CONTRACT.md`.
