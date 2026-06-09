# CCP — Cheaper Closest Products

A single-page React app for comparing grocery prices across Ukrainian supermarket chains — ATB, Сільпо, and METRO.

## What it does

- **Add stores** — pick a chain (АТБ, Сільпо, METRO) and choose a specific branch. Stores are sorted by distance if you allow location access.
- **Search products** — type a product name in Ukrainian (e.g. `молоко`, `хліб`, `масло`) and results appear instantly in side-by-side columns.
- **Compare prices** — each column shows products sorted cheapest first, so the best deal is always at the top.
- **Multiple stores** — add as many branches as you want and compare them all at once.

## Stack

- React 19 + Vite
- Plain CSS (no UI library)
- Browser Geolocation API for distance sorting

## Getting started

```bash
npm install
npm run dev
```

## Notes

ATB, Сільпо and METRO do not expose public APIs, so the app currently runs on realistic mock data (real store addresses, real product names and approximate prices). The architecture is set up so the mock layer in `src/services/api.js` can be swapped for real API calls when endpoints become available.

## Project structure

```
src/
├── components/
│   ├── AddShopModal.jsx   # 2-step modal: pick chain → pick store
│   ├── Logo.jsx           # SVG logo
│   ├── ProductCard.jsx    # Single product with price
│   ├── ResultsGrid.jsx    # Columns container
│   ├── SearchBar.jsx      # Search input
│   └── ShopColumn.jsx     # Per-store results column
├── services/
│   ├── api.js             # API interface + chain config
│   └── mockData.js        # Demo stores and products
└── utils/
    └── geo.js             # Haversine distance + geolocation
```
