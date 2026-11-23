# AUVÉ — dynamic store (storefront + owner admin + orders + payments)

This is the dynamic version of the AUVÉ handmade-footwear store. The design is
exactly the original one; what changed is that products, orders, payments,
shipping and the shop's look now run on a small server instead of being fixed
inside the page.

## How to run it locally

You need Node.js (version 18 or newer). No packages to install — the server
uses only Node's built-in parts.

```bash
cd auve-website-dynamic
node server.js
```

Then open:

- **Shop:** http://localhost:8080/
- **Owner admin (Shop Manager):** http://localhost:8080/admin.html
  - Password: whatever is set as `adminPassword` in `config.js`
    (placeholder `CHANGE-ME-auve-admin` — **change it before going live**),
    or the `ADMIN_PASSWORD` environment variable.

To use a different port: `PORT=3000 node server.js`.

Files that hold the shop's data (back these up):

- `data/products.json` — all products (edited from the admin).
- `data/settings.json` — shop look, homepage words and section switches.
- `data/orders.json` — every order received. **Never delete this file.**

## How the owner manages the shop (admin.html)

The admin is written in plain words, one job per page:

- **Products** — add/edit/delete products; change the name, price, description,
  collection, type, tag, card photos, colour variants (name, colour dot,
  photos, own description), sold-out sizes (tick the finished sizes) and extra
  detail rows. Changes are live in the shop as soon as SAVE is pressed.
- **Shop Look** — background colour, text colour, button colour, button text
  colour, writing style (Classic / Modern clean / Old-style book / Simple) and
  optional heading and reading-text sizes. The page lists the original values
  so the look can always be restored.
- **Homepage Writing** — the top strip (on/off + its words), the big homepage
  heading lines, the big homepage photos (computer + phone), and the Festive
  and Bestsellers headings.
- **Homepage Parts On/Off** — show or hide the top photo banner, craft video
  banner, festive row, shop-by-collection, bestsellers row, video reels and
  newsletter box. Hiding never deletes anything.
- **Orders** — every order with customer, address, items, total, payment
  status (Paid online / Cash on delivery / TEST) and the Shiprocket AWB when
  one exists.

Still code-level (ask the developer): collection names and blurbs, the legal
pages' business details (name, address, GSTIN in `app.js` — search for `BIZ`),
which products appear in the bestsellers row, and uploading brand-new photo
files (the admin asks for photo file names; the files themselves are added to
the `assets/` folder by the developer).

## Going live — credentials needed from the client

Nothing here invents credentials. Until the real ones are added, online
payment runs in a clearly labelled TEST mode and shipping is skipped.

1. **Razorpay** (for UPI / card / net-banking payments)
   - Needed: **Key ID** and **Key Secret** from the client's Razorpay
     Dashboard → Settings → API Keys (business KYC must be complete).
   - Put them in `config.js` (`razorpay.keyId`, `razorpay.keySecret`) or set
     env vars `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`. Use `rzp_test_…`
     keys while testing, `rzp_live_…` keys to go live.
   - The secret is only ever used on the server; the browser only receives
     the public Key ID. Payments are verified on the server by signature
     before an order is marked paid.
2. **Shiprocket** (for shipping labels, AWB and tracking)
   - Needed: the client's **Shiprocket account email + password**
     (app.shiprocket.in) and the **pickup location nickname** registered in
     their Shiprocket panel.
   - Put them in `config.js` (`shiprocket.email`, `shiprocket.password`,
     `shiprocket.pickupLocation`) or env vars `SHIPROCKET_EMAIL`,
     `SHIPROCKET_PASSWORD`, `SHIPROCKET_PICKUP_LOCATION`.
3. **Admin password** — change `adminPassword` in `config.js` (or
   `ADMIN_PASSWORD`) from the placeholder before the admin page is public.
4. **Business details for the legal pages** — registered business name,
   address and GSTIN must replace the `[BRACKETED]` placeholders in `app.js`
   (the `BIZ` block) so they match the Razorpay KYC exactly.

See `.env.example` for the full environment-variable list.

## Speed and freshness (how the site stays fast, and edits show at once)

The server is tuned so the shop loads fast and an admin edit is **always**
visible on the very next normal page load — no hard refresh, no stale copy:

- **Edits show instantly.** Product data (`data/products.json`), the pages
  and the app code are served with `Cache-Control: no-cache` plus an ETag.
  The browser checks with the server on every load and downloads only when
  something actually changed (otherwise it gets a tiny "304 Not Modified").
  All `/api/…` answers are `no-store` for the same reason. So: press SAVE in
  the admin, reload the shop normally, and the new price / words / colours
  are there.
- **Repeat visits are almost free.** Photos and videos are cached in the
  visitor's browser for 7 days, and the React vendor files and fonts for a
  year, so a returning visitor re-downloads almost nothing (measured: about
  4 KB instead of about 7 MB on a reload). Photos keep a 7-day limit — not
  forever — so a photo replaced under the same file name still shows up
  within a week.
- **Text travels compressed.** HTML, CSS, JavaScript and JSON are sent
  gzip-compressed (for example `app.js` travels at about 39 KB instead of
  190 KB, the product data at about 2 KB instead of 14 KB).
- The shop's weight that remains is the design's own photos and autoplay
  videos (about 11.8 MB of media on the homepage) — that is content, not
  code, and it is unchanged from the original design.

Full before/after measurements are in `TEST.md` (2026-11-23 performance
pass).

## Deploy note

The original site was a static folder on Vercel. **This dynamic version is
not a static site**: products, orders, the admin and payments all need
`server.js` running. Host it on any Node host (a small VPS, Render, Railway,
Fly.io, or Vercel/another platform only with the server adapted to its
serverless model). The host must keep the `data/` folder writable and
persistent, because orders and products live there — back up `data/`
regularly. Put the site behind HTTPS before taking live payments (Razorpay
requires it).

## Project map

| File | What it is |
| --- | --- |
| `server.js` | The whole backend: static files + API + orders + Razorpay + admin auth |
| `config.js` | Server-only settings and credential placeholders (never served) |
| `.env.example` | The same settings as environment variables |
| `lib/shiprocket.js` | Shiprocket login, shipment creation, AWB and tracking |
| `index.html` | Shop shell; loads `data/products.json` + settings, then `app.js` |
| `app.js` | The original storefront app (design untouched; data/order/payment hooks patched) |
| `admin.html`, `admin.js` | The owner Shop Manager |
| `data/products.json` | Product data layer (from the original `data/catalog.js`) |
| `data/settings.json` | Shop look + homepage words + section switches |
| `data/orders.json` | Orders received |
| `data/catalog.js` | The original static catalogue — kept as a fallback and as the source for `tools/build-products.js` |
| `tools/build-products.js` | Regenerates `data/products.json` from `data/catalog.js` (`node tools/build-products.js`) |
| `ANALYSIS.md` | How the original site worked and what was changed, in detail |
| `TEST.md` | Test results for this build |
