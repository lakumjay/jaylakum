# AUVÉ storefront — analysis of the original static build and the dynamic plan

Source analysed: `~/workspace/auve-website/` (downloaded from the client's Google Drive share).
This dynamic build lives in `~/workspace/auve-website-dynamic/`; the source was not modified.

## 1. How the original site works

- `index.html` is a shell: a `<div id="root">` plus four script tags loaded in order —
  `vendor/react.production.min.js`, `vendor/react-dom.production.min.js`,
  `data/catalog.js`, then `app.js` (~183 KB, 844 lines).
- `app.js` is a compiled React app written in plain `React.createElement` calls (no JSX,
  no build step). It is a single-page app with hash routing (`#/`, `#/shop`, `#/product/<id>`,
  `#/bag`, `#/checkout`, `#/confirm`, `#/account`, policy pages, etc.).
- All styling is inline style strings computed in JS, driven by CSS variables set from
  `styles.css` plus a theme block inside `app.js` (site background "navy" `#1B1A34`).

### Products
- `data/catalog.js` sets `window.AUVE_CATALOG`: an array of 19 products built with helper
  functions (`P`, `V`, `D`). Product shape:
  `{ id, name, coll ('barely'|'gilded'|'veil'), type, price (INR), desc, cover?, cover2?,
     details?: [[label, value]], variants: [{ name, sw (swatch colour), imgs[], desc? }],
     soldOut: [EU sizes], tag? }`.
  The `P()` helper force-adds EU 35 to every product's `soldOut` list, and a `COV` table at
  the bottom overrides card photos (`cover` / `cover2`) per product.
- In `app.js` (line ~72): `let PRODUCTS = (window.AUVE_CATALOG || []).slice();` and
  `const BYID = Object.fromEntries(PRODUCTS.map(...))` are computed **once at script load**.
  Every screen (home, shop grid, product page, related items, quick view) renders from
  `PRODUCTS` / `BYID`. Collections (`barely`, `gilded`, `veil`) are a hardcoded `COLL`
  table in `app.js` (names, blurbs, hero images/videos) — that is presentation, not product
  data, so it stays in code.
- Sizes are a fixed list `SIZES = [35..41]`. Sold-out logic: `isOut(p, variantIndex, size)` —
  if a variant has a `stock` map it uses `variant.stock[size].inStock`, otherwise it falls
  back to `product.soldOut.includes(size)`. The current catalogue only uses `soldOut`.

### Cart
- Fully client-side. Cart lines `{ key, id, v (variant index), size, qty }` are kept in React
  state and persisted to `localStorage` key `auve_cart` on every change (`setCart`).
- `totals()` recomputes from `BYID` prices: subtotal, promo `WELCOME10` = 10% off,
  shipping free, COD free. `rate()` (multi-pair discount) currently returns 0.
- Add-to-cart comes from the product page (`cartAdd`) and quick view; the bag page supports
  quantity change and remove. The cart itself already works — it only lacked a server
  behind checkout.

### Checkout
- Checkout page collects name, phone, email, address, city, state, pincode
  (state `co`), one shipping option (Standard, free) and three payment options:
  `upi`, `card`, `cod`. UPI/card notes already say payment happens on "Razorpay's secure
  checkout"; the in-page card/UPI-id fields are disabled in the template
  (`upiIdOn: false, cardFieldsOn: false`).
- `placeOrder()` validates the form, builds an order `payload` (customer, items, payment,
  promo, client totals) — and then **throws it away**: a comment in the code marks the spot
  "BACKEND HOOK - Laravel: POST /api/orders … The local order below is a preview stand-in."
  It waits 900 ms, invents a random order id (`AUV` + 5 digits), saves the order to
  `localStorage` (`auve_orders`) and shows the confirmation page. No server, no payment,
  no email, no stock check.
- Orders, sign-in, subscribers and promo state all live only in the visitor's browser
  localStorage (`auve_orders`, `auve_cart`, `auve_promo`, `auve_subscribers`).

### What is hardcoded
1. The entire product catalogue (in `data/catalog.js`, baked into the page at load).
2. Order creation (fake, in-browser).
3. Payment (mentions Razorpay in copy, never calls it; no keys anywhere).
4. No shipping integration at all (orders never leave the browser).
5. Business/legal placeholders in `app.js` (`BIZ` — `[Registered Business Name]`, `[GSTIN]`,
   etc.) still need the client's real KYC details before go-live; left untouched here.
6. Policy `.html` files are static duplicates of the in-app policy text.

## 2. Plan (what this build does)

Keep the storefront pixel-identical; change only where data comes from and where orders go.

1. **Data layer** — `tools/build-products.js` evaluates the original `catalog.js` and writes
   the resolved catalogue to `data/products.json` (same 19 products, prices, images, covers,
   sold-out sizes). The storefront no longer loads `catalog.js`; a small bootstrap in
   `index.html` fetches `data/products.json`, sets `window.AUVE_CATALOG`, then loads `app.js`
   (with a fallback to `catalog.js` if the fetch fails). All rendering code is untouched, so
   products, titles, prices, variants and sold-out sizes now come from the JSON file.
2. **Server** — `server.js`: a dependency-free Node HTTP server that serves the static site
   and a small JSON API, and owns the writable data files (`data/products.json`,
   `data/orders.json`). It refuses to serve `server.js`, `config.js`, `lib/`, `tools/` and
   `data/orders.json`.
3. **Admin** — `admin.html` + `admin.js`: password gate (password checked server-side against
   `config.js` / `ADMIN_PASSWORD` env; a session token is issued). Full product CRUD:
   name/title, collection, type, price, description, tag, cover photos, detail rows,
   colour variants (name, swatch, images, per-variant description) and sold-out sizes.
   Saves go through the API and rewrite `data/products.json`; the storefront picks changes
   up on next page load. An Orders tab lists orders from `data/orders.json`.
4. **Cart + checkout** — the existing cart is unchanged. `placeOrder()` in `app.js` is
   patched at exactly the marked backend hook: it now POSTs the same payload to
   `/api/orders`. The server re-validates items and recomputes totals from
   `products.json` (never trusting client totals), saves the order into `data/orders.json`
   with a real sequential order id, and returns it. The confirmation page flow is unchanged.
5. **Payments (Razorpay)** — keys live in `config.js` / env (`RAZORPAY_KEY_ID`,
   `RAZORPAY_KEY_SECRET`), never in the browser except the public key id.
   - Keys set: server creates a Razorpay order (`POST api.razorpay.com/v1/orders`), the
     browser opens Razorpay Checkout with that order, and on success the server verifies the
     Razorpay signature (HMAC-SHA256) before marking the order `paid`.
   - No keys set: online options fall back to a clearly labelled **TEST mode** — the
     checkout notes say no real payment is taken and the order is saved as
     pay-on-delivery/test. COD works as before.
6. **Shiprocket** — `lib/shiprocket.js`: config placeholders (`SHIPROCKET_EMAIL`,
   `SHIPROCKET_PASSWORD`), token login + cache, `createOrderShipment(order)` (creates the
   Shiprocket order, requests AWB) and `getTracking(awb)`. With no credentials configured
   every function returns `{ configured: false, … }` and the server simply skips shipment
   creation — orders still save. Credential spots are marked with `TODO(client)`.
7. **Docs** — `README.md`: local run steps, owner product management, the exact credentials
   needed from the client, and the deploy note (this version needs the Node server running;
   it is not a static Vercel drop-in like the original).

## 3. Files changed vs the original

- `index.html` — script loading only (bootstrap fetch of `data/products.json`).
- `app.js` — three surgical patches, all at existing seams: (a) `componentDidMount` fetches
  `/api/store-config` so the checkout knows if payments are live; (b) the UPI/card note
  strings show a TEST MODE label when Razorpay keys are absent; (c) `placeOrder()` posts to
  `/api/orders` and opens Razorpay Checkout when the server returns a Razorpay order.
  No rendering, layout or style code was touched.
- Everything else (`styles.css`, policy pages, assets, vendor, fonts) is byte-identical.

## 4. Additions requested 2026-11-23 (owner-friendly admin + dynamic design)

1. **Fresher-proof admin** (`admin.html` / `admin.js`): written for someone who has never
   seen an admin panel. One job per tab (Products / Shop Look / Homepage Writing /
   Homepage Parts On/Off / Orders), big labels in plain words, a "what this does" help
   line under every field, an obvious green SAVE button per screen, plain-language success
   and error messages, and a two-step delete ("press again to confirm") instead of jargon
   dialogs. No technical words without a plain explanation next to them.
2. **Design settings in the data layer** (`data/settings.json`, served at
   `GET /api/settings`, edited via `PUT /api/admin/settings`): site-wide background,
   text (primary), button and button-text colours; a font preset (classic / modern /
   serif / simple) from a small built-in list; optional heading and body font sizes.
   The storefront bootstrap (`index.html`) fetches settings before `app.js` loads, and a
   small block added to the theme code in `app.js` applies them as the same CSS variables
   the design already uses (`--auve-bg`, `--auve-ink`, `--auve-btn`, `--auve-btn-ink`, …)
   plus one injected `<style>` for font family/size. The shipped defaults are exactly the
   original theme values, so the design is pixel-identical until the owner changes a value.
3. **Homepage content + sections from admin** (same settings file): the top announcement
   strip (on/off + text), hero heading lines, hero desktop/mobile photos, the Festive and
   Bestsellers heading texts, and on/off switches for the seven homepage sections the
   design is built from (hero, craft video banner, festive row, shop-by-collection,
   bestsellers row, reels, newsletter). Implementation: the template hooks that already
   existed were reused where possible (announcement text was already a prop; hero images
   and headings were literal strings now read from settings via `renderVals`), and each
   home section's compiled element is wrapped in an `auveSection('<name>')` conditional —
   no layout or style code changed. Things that remain code-level (collection names/blurbs,
   legal/business placeholders, which products appear in the bestsellers row) are listed in
   README.md so nobody expects them in the admin.

Test results are recorded in `TEST.md`.
