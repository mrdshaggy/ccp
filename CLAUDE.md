# NearDeal — Current State

## What it is
A Ukrainian grocery price comparison SPA — pick stores from multiple chains, search a product, see prices side-by-side, compare across shops, and build a shopping cart printable as PDF. React 19 + Vite, no UI library, plain CSS. Branded as **NearDeal** ("Знайди дешевше поруч").

---

## Architecture

```
src/
├── App.jsx                        # root: shop/search/cart/modal state + handlers
├── App.css                        # all styles (single file, ~840 lines)
├── components/
│   ├── AddShopModal.jsx           # chain picker → store picker (with geolocation sort)
│   ├── ShopColumn.jsx             # one result column per selected store
│   ├── ResultsGrid.jsx            # thin wrapper: maps shops → ShopColumns
│   ├── ProductCard.jsx            # product row + clickable + "Дешевше" badge
│   ├── ProductCompareModal.jsx    # cross-shop product comparison + add-to-cart
│   ├── CartDrawer.jsx             # slide-in cart grouped by shop + print/PDF
│   ├── SearchBar.jsx              # search input + button
│   └── Logo.jsx                  # NearDeal pin+basket SVG icon
├── services/
│   ├── api.js                     # all fetch logic + CHAINS config
│   └── mockData.js                # ATB static store list + fake product results
├── utils/
│   └── geo.js                     # getCurrentPosition, haversineKm, formatDistance
└── assets/
    └── neardeal_icon.svg          # source icon file
index.html                         # title: NearDeal, favicon: /favicon.svg
public/favicon.svg                 # NearDeal pin+basket icon
vite.config.js                     # 4 proxies: /silpo-api, /silpo-branches, /metro-api, /metro-www
```

---

## Chain status

| Chain | Stores | Products | Notes |
|-------|--------|----------|-------|
| **Сільпо** | Live — `sf-ecom-api.silpo.ua` | Live — same API | Multi-word fallback: if phrase returns 0, searches each word separately and intersects by UUID. Parallel image fetch from old catalog API. |
| **METRO** | Live — `www.metro.ua/sxa/search/results` (26 stores) | Live — 2-step: search → betty-variants | `x-sd-token: mq6k5cu8` static header. Store locator parses HTML: radio `value` attribute = storeId (zero-padded to 5 digits). Coordinates from `Geospatial` field. |
| **АТБ** | Mocked (13 Kyiv/Харків/Одеса/Дніпро stores) | Mocked | No public API found. |

---

## Files

| File | Role |
|------|------|
| `vite.config.js` | 4 dev proxies: `/silpo-api` → `api.catalog.ecom.silpo.ua`, `/silpo-branches` → `sf-ecom-api.silpo.ua`, `/metro-api` → `shop.metro.ua`, `/metro-www` → `www.metro.ua` |
| `src/services/api.js` | All fetch logic. `getStores(hub)` and `searchProducts(store, query, chainKey)` are the public exports. Metro: live store locator + 2-step search (articlesearch → betty-variants). Silpo: dual-API (new ecom + old catalog for images), multi-word intersection fallback. |
| `src/App.jsx` | State: `selectedShops[]`, `results{}`, `currentQuery`, `compareModal`, `cart{}`, `isCartOpen`. `addToCart(shopEntry, product)` deduplicates by EAN. `removeFromCart(shopId, ean)` auto-removes empty shop buckets. Cart icon in header shows badge count. |
| `src/App.css` | Fixed-height viewport layout: `height: 100dvh; overflow: hidden` on `.app`. Flex column chain: `.app-main` → `.results-grid` (flex:1) → `.shop-column` → `.column-body` (overflow-y: auto). Per-column independent scroll. Print CSS: `body * { visibility: hidden }` + cart-drawer override for clean print/PDF output. |
| `src/components/Logo.jsx` | NearDeal pin+basket SVG. `viewBox="0 0 248 340"`, `width={size}` prop (portrait, aspect-ratio preserved). Blue pin (#2563EB), green badge (#16A34A). |
| `src/components/ProductCard.jsx` | `onClick` → makes card clickable. `isCheapest` → green "Дешевше" badge + green border. Renders `oldPrice` strikethrough when `oldPrice > price`. |
| `src/components/ShopColumn.jsx` | Accepts `onCardClick(product, shop)` prop, passes `() => onCardClick(p, shop)` to each ProductCard. |
| `src/components/ResultsGrid.jsx` | Threads `onCardClick` prop down to ShopColumn. |
| `src/components/ProductCompareModal.jsx` | On open: shows source product immediately, searches all other selected shops in parallel. `findBestMatch` scores by word-overlap. Cheapest badge shown when ≥2 shops have results. Each column has "+ До кошика" / "✓ В кошику" button. |
| `src/components/CartDrawer.jsx` | Slide-in from right. Grouped by shop (chain color header). Per-shop subtotal + grand total. Remove items with ✕. "Друк / PDF" calls `window.print()`. |
| `src/services/mockData.js` | ATB only. Static store list + fake search results. |
| `public/favicon.svg` | NearDeal pin+basket icon (same as Logo.jsx, plain SVG attributes). |
| `index.html` | Page title: NearDeal. Favicon: `/favicon.svg`. |

---

## Known limitations / pending tasks

- **ATB** has no real API — needs reverse-engineering if real data is wanted
- **METRO returns max 24 results** per search (page 1 only); pagination not implemented
- **Silpo images** are fetched from the old catalog API in parallel — if that endpoint goes down, images fall back to the cart emoji placeholder
- **No persistence** — selected shops, search state, and cart are lost on page refresh
- **Compare modal matching** uses simple word-overlap scoring — may not find the exact same product variant (e.g. different package sizes) for highly ambiguous names
