# NearDeal — Знайди дешевше поруч

A single-page React app for comparing grocery prices across Ukrainian supermarket chains — АТБ, Сільпо, and METRO.

## What it does

- **Add stores** — pick a chain (АТБ, Сільпо, METRO) and choose a specific branch. Stores are sorted by distance if you allow location access.
- **Search products** — type a product name in Ukrainian (e.g. `молоко`, `хліб`, `масло`) and results appear instantly in side-by-side columns.
- **Compare prices** — each column shows products sorted cheapest first, so the best deal is always at the top.
- **Multiple stores** — add as many branches as you want and compare them all at once.

## Stack

- React 19 + Vite
- Plain CSS (no UI library)
- Browser Geolocation API for distance sorting
- Built with [Claude Code](https://claude.ai/code) (claude-sonnet-4-6)

## Getting started

```bash
npm install
npm run dev
```

## Notes

АТБ does not expose a public API, so its data is mocked (real store addresses, realistic product names and prices). Сільпо and METRO use real live APIs proxied through Vite's dev server.

## Project structure

```
src/
├── components/
│   ├── AddShopModal.jsx   # 2-step modal: pick chain → pick store
│   ├── Logo.jsx           # NearDeal pin+basket SVG icon
│   ├── ProductCard.jsx    # Single product with price
│   ├── ResultsGrid.jsx    # Columns container
│   ├── SearchBar.jsx      # Search input
│   └── ShopColumn.jsx     # Per-store results column
├── services/
│   ├── api.js             # API interface + chain config
│   └── mockData.js        # ATB demo stores and products
└── utils/
    └── geo.js             # Haversine distance + geolocation
```
