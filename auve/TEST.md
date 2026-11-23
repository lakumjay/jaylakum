# AUVÉ dynamic store — test results

Tested 2026-11-23 against `node server.js` on http://localhost:8080 with the
local headless Chromium (`~/.cache/ms-playwright/chromium-1248`). All test
data was removed afterwards: `data/orders.json` ships empty, `data/settings.json`
ships with the original design values, `data/products.json` holds the original
19 products.

## API tests (curl) — all passed

| Test | Result |
| --- | --- |
| `GET /api/store-config` | `paymentsLive:false`, no key exposed, Shiprocket not configured |
| `GET /api/products` | 19 products, first = Whisper ₹2,190 (matches original catalogue) |
| `GET /api/settings` | Returns design + content + sections |
| Blocked files | `/config.js`, `/data/orders.json`, `/data/settings.json` all return **403** |
| `GET /data/products.json` | 200 (public data layer) |
| Admin login, wrong password | Rejected ("Wrong password.") |
| Admin login, correct password | Token issued |
| Admin CRUD without token | **401** |
| Admin create product | Created with validation (id, variants, soldOut, details) |
| Admin edit product (price 1999 → 1799) | Saved to `data/products.json` |
| Admin delete product | Removed; catalogue back to 19 |
| Admin settings save | Announcement text, `bestsellers:false`, background `#402020` saved; other keys untouched (merge works) |
| COD order (Whisper 38 + Muse 37, WELCOME10) | Order `AUV10001`, server totals: subtotal 4780, promo 478, **total 4302** — client totals not trusted |
| Order with sold-out size (Whisper EU 35) | **Rejected**: "Whisper in EU 35 just sold out…" |
| UPI order with no Razorpay keys | Saved as `payment.status = test_mode` with a clear TEST note; response `paymentMode: "test"` |

## Browser tests (headless Chromium, screenshots + scripted CDP run)

Screenshots taken: homepage (default settings), homepage (test settings),
product page, order confirmation page, admin login, admin Products tab,
admin Shop Look tab, admin Orders tab.

Scripted end-to-end run (product page → cart → bag → checkout → confirm):

| Check | Result |
| --- | --- |
| Announcement bar shows the settings text ("TEST ANNOUNCEMENT XYZ") | PASS |
| Bestsellers section hidden when switched off in settings; Festive still visible | PASS |
| Background colour from settings applied (`--auve-bg` = `#402020`) | PASS |
| Shop page renders all 19 product names + prices from `products.json` | PASS (DOM check) |
| Product page (Whisper) renders name, ₹2,190, variants, sizes, details from JSON | PASS (screenshot) |
| Add to cart (Whisper, EU 38) | PASS — cart line `{id: whisper, v: 0, size: 38, qty: 1}` |
| Bag page shows item and ₹2,190 total | PASS |
| Checkout form fills and validates | PASS |
| "TEST MODE" label visible on checkout when Razorpay keys are absent | PASS |
| Place COD order → confirmation page | PASS — order `AUV10003`, "Thank you" page with address + total |
| Order saved server-side in `data/orders.json` with correct totals/payment | PASS |
| Cart cleared after ordering | PASS |
| `GET /api/orders/:id/tracking` with Shiprocket unconfigured | PASS — clean `{configured:false}` skip, no crash |
| Admin login in browser → product list shows all 19 products | PASS |
| Admin Orders tab shows the placed order | PASS |
| Settings restored to defaults → homepage shows original announcement, navy background, Bestsellers back | PASS |

One check in the scripted run initially reported FAIL ("homepage contains the
word Whisper") — that was a faulty check, not a site bug: with the Bestsellers
row switched off, the Whisper product name simply does not appear as text on
the homepage (it lives in the shop grid and its product page, both verified
separately above).

## Performance + instant-reflect pass — 2026-11-23

User order: the site must load fast, and any change made in the admin panel
must refresh on the frontend fast. All changes are in `server.js` only —
no design, content or app files were touched, so the shop is pixel-identical.

### What was wrong before

Static files were served with **no Cache-Control, no ETag and no
compression at all**. `data/products.json` went out as a plain static file
with no cache header (heuristic-caching risk), and a normal reload
re-downloaded ~7 MB.

### What changed in `server.js`

- `data/products.json`, all HTML and the app code (`app.js`, `styles.css`,
  `admin.js`): `Cache-Control: no-cache` + ETag — the browser revalidates on
  every load and gets a 0-byte **304** when unchanged, so an admin save is
  always visible on the next normal load. All `/api/…` responses were
  already `Cache-Control: no-store` (unchanged).
- `vendor/` and `fonts/`: `Cache-Control: public, max-age=31536000,
  immutable` (they never change in place).
- Images and videos: `Cache-Control: public, max-age=604800` (7 days) —
  long enough for fast repeat visits, short enough that a photo replaced
  under the same file name heals within a week.
- gzip compression for text assets (HTML/CSS/JS/JSON/SVG) when the browser
  accepts it: `app.js` 190,206 → **39,496 bytes** on the wire,
  `data/products.json` 13,666 → **2,145 bytes**, React vendor file →
  4,269 bytes.
- HEAD requests now return headers only (previously the body was streamed).
- Deliberately NOT done: editing the compiled `app.js` to lazy-load images
  (risk to the pixel-identical design; the template already ships its
  videos with `preload="metadata"`). The homepage's remaining weight is
  the design's own media — about 5.5 MB of autoplay video and 6.2 MB of
  photos — content, not code.

### Measurements (headless Chromium, localhost, fresh profile per run)

| Metric | Before | After |
| --- | --- | --- |
| Homepage first load — DOMContentLoaded | 479 ms | 317–408 ms |
| Homepage first load — load event | 479 ms | 317–408 ms |
| First contentful paint | not captured | 1,096–1,504 ms (behind the design's own 2.4 s loader animation) |
| Code + data + fonts on first load | ~352 KB (uncompressed JS/JSON/HTML/CSS + fonts) | **~277 KB total, of which JS+JSON+HTML+CSS only ~95 KB** |
| **Normal reload — total transferred** | **6,985,812 bytes / 19 requests** | **4,189 bytes / 76 revalidations (304s + cache hits)** |
| Normal reload — load event | 611 ms | 202 ms |

First-load totals are dominated by the autoplay media both before and
after (7.6 MB vs 12.1 MB of *finished* transfers inside the measurement
window — the after run simply streamed more of the same videos before the
window closed; the media files themselves are byte-identical).

### Instant-reflect test (headless Chromium, one session, NORMAL reloads)

| Step | Result |
| --- | --- |
| Initial load | Whisper shows ₹2,190; announcement = "Free shipping across India on all orders" |
| Admin API: Whisper price 2190 → 2001; announcement → "INSTANT TEST 123" | Both PUTs saved |
| **Normal reload** (cache allowed, no hard refresh) | **₹2,001 shown, ₹2,190 gone, "INSTANT TEST 123" shown — PASS** |
| Admin API: price and announcement restored | Both PUTs saved |
| **Normal reload** | **₹2,190 and the original announcement back — PASS** |

### Regression checks after the change

| Check | Result |
| --- | --- |
| Shop page (`#/shop`) renders all 19 products from `products.json` | PASS — 19/19 names found in DOM, none missing |
| COD order via API (Whisper, EU 38) | PASS — order `AUV10001`, server total ₹2,190, saved to `data/orders.json` |
| Admin login (API) + product/settings CRUD round-trip | PASS (exercised by the instant-reflect test) |
| Blocked files still blocked | PASS — `/config.js`, `/server.js`, `/data/orders.json`, `/data/settings.json` all 403; `/` and `/admin.html` 200 |
| Test data cleaned up | PASS — `data/products.json`, `data/settings.json`, `data/orders.json` restored byte-for-byte (md5 verified against the pre-test snapshot); orders empty, settings at original defaults |

## Not tested (needs real client credentials)

- Razorpay live/test-key payment: the full code path is wired (server creates
  the Razorpay order, browser opens Razorpay Checkout, server verifies the
  signature before marking the order paid), but it was **not** run end-to-end
  because no Razorpay keys exist yet — by design, no keys were invented.
  With `rzp_test_…` keys in `config.js` it can be exercised immediately.
- Shiprocket shipment creation / AWB / tracking: module implemented against
  the documented API; with no account credentials it returns the clean
  "not configured" skip (verified). Needs the client's Shiprocket login to
  test for real.
