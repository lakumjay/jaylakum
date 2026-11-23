/* ============================================================================
 * AUVÉ dynamic store — server.js
 * ----------------------------------------------------------------------------
 * A small Node.js server with ZERO external dependencies (core modules only).
 *
 *   node server.js            ->  http://localhost:8080  (store)
 *                                 http://localhost:8080/admin.html (owner)
 *
 * What it does:
 *   - Serves the static storefront (index.html, app.js, assets, ...).
 *   - Serves the product data layer at  GET /data/products.json  and
 *     GET /api/products.
 *   - Admin API (password login -> token): full product CRUD writing back to
 *     data/products.json, and an orders list.
 *   - POST /api/orders: validates the cart against data/products.json,
 *     recomputes totals on the server, saves the order to data/orders.json.
 *   - Razorpay: when keys are configured in config.js / env, creates a
 *     Razorpay order and verifies the payment signature on
 *     POST /api/orders/confirm-payment. Without keys, online payment runs in
 *     clearly labelled TEST mode (order saved as pay-on-delivery).
 *   - Shiprocket: after an order is finalised, creates a shipment via
 *     lib/shiprocket.js when credentials are configured; otherwise skips.
 *
 * Secrets live in config.js / environment variables — see .env.example.
 * This file, config.js, lib/, tools/, data/orders.json, data/settings.json
 * and data/admin-auth.json (password + recovery hashes) are NEVER served.
 * ==========================================================================*/
'use strict';

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');

const shiprocket = require('./lib/shiprocket');

/* ---------------- config ---------------- */
function loadDotEnv() {
  const p = path.join(__dirname, '.env');
  if (!fs.existsSync(p)) return;
  fs.readFileSync(p, 'utf8').split(/\r?\n/).forEach(line => {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  });
}
loadDotEnv();

const fileConfig = require('./config');
const config = {
  port: Number(process.env.PORT || fileConfig.port || 8080),
  adminPassword: process.env.ADMIN_PASSWORD || fileConfig.adminPassword,
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || (fileConfig.razorpay && fileConfig.razorpay.keyId) || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || (fileConfig.razorpay && fileConfig.razorpay.keySecret) || ''
  },
  shiprocket: {
    email: process.env.SHIPROCKET_EMAIL || (fileConfig.shiprocket && fileConfig.shiprocket.email) || '',
    password: process.env.SHIPROCKET_PASSWORD || (fileConfig.shiprocket && fileConfig.shiprocket.password) || '',
    pickupLocation: process.env.SHIPROCKET_PICKUP_LOCATION || (fileConfig.shiprocket && fileConfig.shiprocket.pickupLocation) || 'Primary'
  }
};
/* Payment liveness is NOT fixed at boot: razorpayCreds() below reads the
 * admin store on every request, so keys pasted in admin go live at once. */

/* ---------------- data files ---------------- */
const ROOT = __dirname;
const PRODUCTS_FILE = path.join(ROOT, 'data', 'products.json');
const ORDERS_FILE = path.join(ROOT, 'data', 'orders.json');
const SETTINGS_FILE = path.join(ROOT, 'data', 'settings.json');

function readJSON(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { return fallback; }
}
function writeJSON(file, data) {
  const tmp = file + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2) + '\n');
  fs.renameSync(tmp, file);
}
const loadProducts = () => readJSON(PRODUCTS_FILE, []);
const loadOrders = () => readJSON(ORDERS_FILE, []);
const loadSettings = () => readJSON(SETTINGS_FILE, {});

/* ---------------- helpers ---------------- */
const SIZES = [35, 36, 37, 38, 39, 40, 41];

function sendJSON(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(body);
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let buf = '';
    req.on('data', c => { buf += c; if (buf.length > 2 * 1024 * 1024) req.destroy(); });
    req.on('end', () => {
      if (!buf) return resolve({});
      try { resolve(JSON.parse(buf)); } catch (e) { reject(new Error('Invalid JSON body')); }
    });
    req.on('error', reject);
  });
}
function httpsJSON(hostname, pathName, method, auth, payload) {
  return new Promise((resolve, reject) => {
    const data = payload ? JSON.stringify(payload) : null;
    const req = https.request({
      hostname, path: pathName, method,
      headers: Object.assign(
        { 'Content-Type': 'application/json' },
        data ? { 'Content-Length': Buffer.byteLength(data) } : {},
        auth ? { Authorization: auth } : {}
      ),
      timeout: 20000
    }, res => {
      let buf = '';
      res.on('data', c => { buf += c; });
      res.on('end', () => {
        let parsed = null;
        try { parsed = JSON.parse(buf); } catch (e) { /* ignore */ }
        resolve({ status: res.statusCode, body: parsed, raw: buf });
      });
    });
    req.on('timeout', () => req.destroy(new Error('Request timed out')));
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

/* ---------------- admin auth ---------------- */
const adminTokens = new Set();
function isAdmin(req) {
  const t = req.headers['x-admin-token'];
  return t && adminTokens.has(t);
}
function issueAdminToken() {
  const token = crypto.randomBytes(24).toString('hex');
  adminTokens.add(token);
  return token;
}

/* ---------------- admin password + recovery code ----------------
 * The owner can change her password and set a secret recovery code from
 * inside the admin (Password and Safety page). Those secrets are stored
 * ONLY as salted hashes in data/admin-auth.json, a file that is blocked
 * from static serving above and is never sent to any browser. While no
 * custom password is stored, the password from config.js / the
 * ADMIN_PASSWORD environment variable is the fallback (first delivery). */
const AUTH_FILE = path.join(ROOT, 'data', 'admin-auth.json');
const loadAuth = () => readJSON(AUTH_FILE, {});
function saveAuth(auth) { writeJSON(AUTH_FILE, auth); }
function hashSecret(secret) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(secret), salt, 64).toString('hex');
  return { salt: salt, hash: hash };
}
function verifySecret(secret, rec) {
  if (!rec || !rec.salt || !rec.hash || typeof secret !== 'string') return false;
  try {
    const h = crypto.scryptSync(secret, rec.salt, 64);
    const b = Buffer.from(rec.hash, 'hex');
    return h.length === b.length && crypto.timingSafeEqual(h, b);
  } catch (e) { return false; }
}
function adminPasswordMatches(pw) {
  if (typeof pw !== 'string' || !pw) return false;
  const auth = loadAuth();
  if (auth.password) return verifySecret(pw, auth.password);
  const a = Buffer.from(pw), b = Buffer.from(String(config.adminPassword || ''));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
/* Recovery attempts are rate limited in memory: 5 wrong tries lock the
 * forgot-password form for 5 minutes. */
const recoveryGuard = { fails: 0, lockedUntil: 0 };

/* ---------------- payment + delivery keys (dynamic) ----------------
 * The owner pastes her Razorpay keys and Shiprocket login on the admin
 * Payments and Delivery page. They live in the same server-only store
 * as the password hashes (data/admin-auth.json, blocked from static
 * serving above, never sent to any browser; the admin API reports only
 * whether a secret is set, never the secret itself). These getters run
 * on EVERY request, so a key saved in admin works at once, with no file
 * edit and no server restart. While the admin store holds no keys, the
 * config.js / environment values are the fallback. */
function integrationStore() { return loadAuth().integrations || {}; }
function razorpayCreds() {
  const s = integrationStore();
  if (s.razorpayKeyId && s.razorpayKeySecret) {
    return { keyId: s.razorpayKeyId, keySecret: s.razorpayKeySecret, live: true, source: 'admin' };
  }
  const keyId = config.razorpay.keyId || '', keySecret = config.razorpay.keySecret || '';
  return { keyId, keySecret, live: !!(keyId && keySecret), source: (keyId || keySecret) ? 'server file' : 'none' };
}
function shiprocketCreds() {
  const s = integrationStore();
  if (s.shiprocketEmail && s.shiprocketPassword) {
    return {
      email: s.shiprocketEmail, password: s.shiprocketPassword,
      pickupLocation: s.shiprocketPickup || config.shiprocket.pickupLocation || 'Primary', source: 'admin'
    };
  }
  return {
    email: config.shiprocket.email || '', password: config.shiprocket.password || '',
    pickupLocation: config.shiprocket.pickupLocation || 'Primary',
    source: (config.shiprocket.email || config.shiprocket.password) ? 'server file' : 'none'
  };
}
function liveShiprocketConfig() {
  return Object.assign({}, config, { shiprocket: shiprocketCreds() });
}

/* ---------------- orders ---------------- */
function nextOrderId(orders) {
  let max = 10000;
  orders.forEach(o => {
    const m = /^AUV(\d+)$/.exec(o.id || '');
    if (m) max = Math.max(max, parseInt(m[1], 10));
  });
  return 'AUV' + (max + 1);
}

/* Validate the client's cart against the data layer and recompute totals.
 * Never trust client-sent prices or totals. Throws Error with a message
 * suitable for the customer. */
function buildOrder(payload) {
  const products = loadProducts();
  const byId = Object.fromEntries(products.map(p => [p.id, p]));
  const c = payload.customer || {};
  const name = String(c.name || '').trim();
  const phone = String(c.phone || '').replace(/\D/g, '').slice(-10);
  const email = String(c.email || '').trim();
  const address = String(c.address || '').trim();
  const city = String(c.city || '').trim();
  const state = String(c.state || '').trim();
  const pincode = String(c.pincode || '').trim();
  const missing = [];
  if (!name) missing.push('name');
  if (phone.length !== 10) missing.push('10-digit mobile');
  if (!/^\S+@\S+\.\S+$/.test(email)) missing.push('email');
  if (!address) missing.push('address');
  if (!city) missing.push('city');
  if (!/^\d{6}$/.test(pincode)) missing.push('6-digit pincode');
  if (missing.length) throw new Error('Please add your ' + missing.join(', ') + '.');

  const rawItems = Array.isArray(payload.items) ? payload.items : [];
  if (!rawItems.length) throw new Error('Your bag is empty.');
  let pairs = 0;
  const items = rawItems.map(it => {
    const p = byId[it.productId];
    if (!p) throw new Error('A product in your bag is no longer available.');
    const vIdx = p.variants.findIndex(v => v.name === it.variant);
    const variant = vIdx >= 0 ? p.variants[vIdx] : p.variants[0];
    const size = Number(it.size);
    if (!SIZES.includes(size)) throw new Error('Invalid size for ' + p.name + '.');
    const variantSoldOut = variant && variant.stock ? !(variant.stock[size] && variant.stock[size].inStock) : (p.soldOut || []).includes(size);
    if (variantSoldOut) throw new Error(p.name + ' in EU ' + size + ' just sold out. Please pick another size.');
    const qty = Math.max(1, Math.min(5, parseInt(it.qty, 10) || 1));
    pairs += qty;
    return { productId: p.id, name: p.name, variant: variant.name, size, qty, unitPrice: p.price };
  });
  if (pairs > 5) throw new Error('You can order up to 5 pairs per order.');

  const subtotal = items.reduce((n, it) => n + it.unitPrice * it.qty, 0);
  const promoCode = payload.promoCode ? String(payload.promoCode).toUpperCase() : null;
  const promo = promoCode === 'WELCOME10' ? Math.round(subtotal * 0.10) : 0;
  const shipping = 0; /* free shipping on all orders */
  const total = subtotal - promo + shipping;

  const method = ['upi', 'card', 'cod'].includes(payload.payment && payload.payment.method) ? payload.payment.method : 'cod';
  return {
    customer: { name, phone: '+91' + phone, email, address, city, state, pincode },
    items,
    promoCode: promo ? promoCode : null,
    totals: { pairs, subtotal, promo, shipping, total },
    method
  };
}

async function maybeCreateShipment(order) {
  const srCfg = liveShiprocketConfig();
  if (!shiprocket.isConfigured(srCfg)) return;
  try {
    const result = await shiprocket.createOrderShipment(srCfg, order);
    if (result && result.configured) {
      const orders = loadOrders();
      const saved = orders.find(o => o.id === order.id);
      if (saved) {
        saved.shipment = {
          provider: 'Shiprocket',
          shiprocketOrderId: result.shiprocketOrderId,
          shipmentId: result.shipmentId,
          awb: result.awb,
          courier: result.courier || null
        };
        writeJSON(ORDERS_FILE, orders);
      }
      console.log('[shiprocket] shipment for ' + order.id + ': AWB ' + (result.awb || '(pending)'));
    }
  } catch (e) {
    console.error('[shiprocket] failed for ' + order.id + ': ' + e.message);
  }
}

async function handleCreateOrder(req, res) {
  const payload = await readBody(req);
  let built;
  try { built = buildOrder(payload); }
  catch (e) { return sendJSON(res, 400, { ok: false, error: e.message }); }

  const orders = loadOrders();
  const order = {
    id: nextOrderId(orders),
    at: Date.now(),
    placedAt: new Date().toISOString(),
    customer: built.customer,
    items: built.items,
    promoCode: built.promoCode,
    totals: built.totals,
    shipping: payload.shipping || 'standard',
    payment: { method: built.method, status: 'cod' },
    shipment: null
  };

  let razorpayInfo = null;
  const rzCreds = razorpayCreds();
  if (built.method === 'cod') {
    order.payment = { method: 'cod', status: 'cod' }; // pay on delivery
  } else if (rzCreds.live) {
    /* Create a Razorpay order; the browser then opens Razorpay Checkout. */
    try {
      const auth = 'Basic ' + Buffer.from(rzCreds.keyId + ':' + rzCreds.keySecret).toString('base64');
      const rz = await httpsJSON('api.razorpay.com', '/v1/orders', 'POST', auth, {
        amount: built.totals.total * 100, /* paise */
        currency: 'INR',
        receipt: order.id,
        payment_capture: 1
      });
      if (rz.status !== 200 || !rz.body || !rz.body.id) {
        console.error('[razorpay] order create failed: HTTP ' + rz.status + ' ' + rz.raw.slice(0, 200));
        return sendJSON(res, 502, { ok: false, error: 'Payment could not be started. Please try again or choose cash on delivery.' });
      }
      order.payment = { method: built.method, status: 'payment_pending', razorpayOrderId: rz.body.id };
      razorpayInfo = { keyId: rzCreds.keyId, orderId: rz.body.id, amount: rz.body.amount, currency: 'INR' };
    } catch (e) {
      console.error('[razorpay] ' + e.message);
      return sendJSON(res, 502, { ok: false, error: 'Payment could not be started. Please try again or choose cash on delivery.' });
    }
  } else {
    /* No Razorpay keys configured: TEST mode, clearly labelled to the buyer. */
    order.payment = { method: built.method, status: 'test_mode', note: 'TEST MODE - Razorpay keys not configured; no payment was taken. Treated as pay on delivery.' };
  }

  orders.unshift(order);
  writeJSON(ORDERS_FILE, orders);
  console.log('[order] ' + order.id + ' saved: ' + built.totals.pairs + ' pair(s), total INR ' + built.totals.total + ', payment ' + order.payment.status);

  if (order.payment.status === 'cod' || order.payment.status === 'test_mode') {
    maybeCreateShipment(order); // fire and forget
  }

  sendJSON(res, 200, {
    ok: true,
    order: { id: order.id, totals: order.totals, payment: order.payment },
    paymentMode: razorpayInfo ? 'razorpay' : (order.payment.status === 'test_mode' ? 'test' : 'cod'),
    testMode: order.payment.status === 'test_mode',
    razorpay: razorpayInfo
  });
}

async function handleConfirmPayment(req, res) {
  const rzCreds = razorpayCreds();
  if (!rzCreds.live) return sendJSON(res, 400, { ok: false, error: 'Online payments are not configured.' });
  const body = await readBody(req);
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
  const expected = crypto.createHmac('sha256', rzCreds.keySecret)
    .update(String(razorpay_order_id) + '|' + String(razorpay_payment_id)).digest('hex');
  if (expected !== razorpay_signature) {
    return sendJSON(res, 400, { ok: false, error: 'Payment verification failed.' });
  }
  const orders = loadOrders();
  const order = orders.find(o => o.id === orderId && o.payment && o.payment.razorpayOrderId === razorpay_order_id);
  if (!order) return sendJSON(res, 404, { ok: false, error: 'Order not found.' });
  order.payment.status = 'paid';
  order.payment.razorpayPaymentId = razorpay_payment_id;
  order.payment.paidAt = new Date().toISOString();
  writeJSON(ORDERS_FILE, orders);
  console.log('[order] ' + order.id + ' marked PAID (' + razorpay_payment_id + ')');
  maybeCreateShipment(order); // fire and forget
  sendJSON(res, 200, { ok: true, order: { id: order.id, payment: order.payment } });
}

/* ---------------- static files ---------------- */
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.mp4': 'video/mp4',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.md': 'text/plain; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};
/* Paths that must never be served to the browser. */
function isBlocked(rel) {
  const p = rel.replace(/\\/g, '/');
  return (
    p === 'server.js' || p === 'config.js' ||
    p.startsWith('lib/') || p.startsWith('tools/') ||
    p === 'data/orders.json' || p === 'data/settings.json' ||
    p === 'data/admin-auth.json' ||
    /(^|\/)\.env/.test(p) || /(^|\/)\./.test(p)
  );
}
/* Cache policy (2026-11-23 performance pass):
 * - Data + HTML + app code: "no-cache" with an ETag. The browser revalidates
 *   on every load and gets a tiny 304 when nothing changed, so an admin save
 *   is ALWAYS visible on the very next normal page load, never stale.
 * - vendor/ and fonts/: immutable for a year (they never change in place).
 * - Images and videos: cached for 7 days. Long enough to make repeat visits
 *   fast; short enough that a photo replaced under the same file name heals
 *   within a week.
 * Text assets (html/css/js/json/svg) are gzip-compressed when the browser
 * accepts it. */
const COMPRESSIBLE = new Set(['.html', '.js', '.css', '.json', '.svg', '.md', '.txt']);
function etagFor(stat) { return 'W/"' + stat.size + '-' + Math.floor(stat.mtimeMs) + '"'; }
function cachePolicy(rel, ext) {
  const p = rel.replace(/\\/g, '/');
  if (p.startsWith('vendor/') || p.startsWith('fonts/')) return 'public, max-age=31536000, immutable';
  if (['.jpg', '.jpeg', '.png', '.webp', '.ico', '.mp4'].includes(ext)) return 'public, max-age=604800';
  return 'no-cache'; /* data/products.json, *.html, app code, everything else */
}
function serveStatic(req, res, urlPath) {
  let rel = decodeURIComponent(urlPath);
  if (rel === '/' || rel === '') rel = '/index.html';
  rel = rel.replace(/^\/+/, '');
  if (isBlocked(rel)) { res.writeHead(403); return res.end('Forbidden'); }
  const filePath = path.join(ROOT, rel);
  if (!filePath.startsWith(ROOT) || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    res.writeHead(404); return res.end('Not found');
  }
  const ext = path.extname(filePath).toLowerCase();
  const stat = fs.statSync(filePath);
  const etag = etagFor(stat);
  const headers = {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Cache-Control': cachePolicy(rel, ext),
    'ETag': etag
  };
  if (req.headers['if-none-match'] === etag) {
    res.writeHead(304, headers);
    return res.end();
  }
  const gzipOk = stat.size > 512 && COMPRESSIBLE.has(ext) && /\bgzip\b/.test(req.headers['accept-encoding'] || '');
  if (gzipOk) {
    headers['Content-Encoding'] = 'gzip';
    headers['Vary'] = 'Accept-Encoding';
  } else {
    headers['Content-Length'] = stat.size;
  }
  res.writeHead(200, headers);
  if (req.method === 'HEAD') return res.end();
  const stream = fs.createReadStream(filePath);
  if (gzipOk) stream.pipe(zlib.createGzip()).pipe(res);
  else stream.pipe(res);
}

/* ---------------- product validation for admin saves ---------------- */
function cleanProduct(input, existing) {
  const p = Object.assign({}, existing || {}, input || {});
  const id = String(p.id || '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
  if (!id) throw new Error('Product id is required.');
  if (!String(p.name || '').trim()) throw new Error('Product name is required.');
  const price = Number(p.price);
  if (!Number.isFinite(price) || price < 0) throw new Error('Price must be a number.');
  const variants = (Array.isArray(p.variants) ? p.variants : []).map(v => ({
    name: String(v.name || '').trim(),
    sw: String(v.sw || '#EEEEEE'),
    imgs: (Array.isArray(v.imgs) ? v.imgs : []).map(s => String(s).trim()).filter(Boolean),
    ...(v.desc ? { desc: String(v.desc) } : {}),
    ...(v.stock ? { stock: v.stock } : {})
  })).filter(v => v.name && v.imgs.length);
  if (!variants.length) throw new Error('Add at least one colour variant with at least one image.');
  const out = {
    id,
    name: String(p.name).trim(),
    coll: ['barely', 'gilded', 'veil'].includes(p.coll) ? p.coll : 'barely',
    type: String(p.type || 'Flats').trim(),
    price: Math.round(price),
    desc: String(p.desc || ''),
    variants,
    soldOut: (Array.isArray(p.soldOut) ? p.soldOut : []).map(Number).filter(z => SIZES.includes(z))
  };
  if (p.tag) out.tag = String(p.tag).trim();
  if (p.cover) out.cover = String(p.cover).trim();
  if (p.cover2) out.cover2 = String(p.cover2).trim();
  if (Array.isArray(p.details) && p.details.length) {
    out.details = p.details.filter(d => Array.isArray(d) && d[0]).map(d => [String(d[0]), String(d[1] || '')]);
  }
  return out;
}

/* ---------------- site settings (design + content + sections) ----------------
 * Stored in data/settings.json and edited from admin.html. The storefront
 * fetches them at load (GET /api/settings) and applies colours/fonts as CSS
 * variables, texts as content, and section flags as show/hide switches.
 * Defaults in the shipped settings.json reproduce the original design
 * exactly, so nothing changes visually until the owner edits a value. */
const FONT_PRESETS = ['classic', 'modern', 'serif', 'simple'];
const SECTION_KEYS = ['hero', 'craftBanner', 'festive', 'collections', 'bestsellers', 'reels', 'newsletter'];
function cleanSettings(input, existing) {
  const s = JSON.parse(JSON.stringify(existing || {}));
  const inp = input || {};
  const hex = v => /^#[0-9a-fA-F]{6}$/.test(String(v || '')) ? String(v) : null;
  const str = (v, max) => String(v == null ? '' : v).slice(0, max || 300);
  const sizeOrNull = v => { if (v === null || v === '' || v === undefined) return null; const n = Number(v); return Number.isFinite(n) && n >= 10 && n <= 120 ? Math.round(n) : null; };

  if (inp.design && typeof inp.design === 'object') {
    const d = Object.assign({}, s.design || {});
    ['backgroundColor', 'primaryColor', 'buttonColor', 'buttonTextColor'].forEach(k => {
      if (inp.design[k] !== undefined) { const c = hex(inp.design[k]); if (c) d[k] = c; }
    });
    if (inp.design.fontPreset !== undefined && FONT_PRESETS.includes(inp.design.fontPreset)) d.fontPreset = inp.design.fontPreset;
    if (inp.design.headingSize !== undefined) d.headingSize = sizeOrNull(inp.design.headingSize);
    if (inp.design.bodySize !== undefined) d.bodySize = sizeOrNull(inp.design.bodySize);
    s.design = d;
  }
  if (inp.content && typeof inp.content === 'object') {
    const c = Object.assign({}, s.content || {});
    if (inp.content.announcementOn !== undefined) c.announcementOn = !!inp.content.announcementOn;
    ['announcementText', 'heroHeading1', 'heroHeading2', 'festiveHeading', 'bestsellersHeading'].forEach(k => {
      if (inp.content[k] !== undefined) c[k] = str(inp.content[k], 200);
    });
    ['heroDesktopImage', 'heroMobileImage'].forEach(k => {
      if (inp.content[k] !== undefined) c[k] = str(inp.content[k], 300);
    });
    s.content = c;
  }
  if (inp.sections && typeof inp.sections === 'object') {
    const sec = Object.assign({}, s.sections || {});
    SECTION_KEYS.forEach(k => { if (inp.sections[k] !== undefined) sec[k] = !!inp.sections[k]; });
    s.sections = sec;
  }
  return s;
}

/* ---------------- router ---------------- */
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const pathname = url.pathname;
  try {
    /* Public store config: only the Razorpay KEY ID is public-safe. */
    if (req.method === 'GET' && pathname === '/api/store-config') {
      const rzCreds = razorpayCreds();
      return sendJSON(res, 200, {
        paymentsLive: rzCreds.live,
        razorpayKeyId: rzCreds.live ? rzCreds.keyId : null,
        shiprocketConfigured: shiprocket.isConfigured(liveShiprocketConfig())
      });
    }
    if (req.method === 'GET' && pathname === '/api/products') {
      return sendJSON(res, 200, loadProducts());
    }
    if (req.method === 'GET' && pathname === '/api/settings') {
      return sendJSON(res, 200, loadSettings());
    }
    if (req.method === 'POST' && pathname === '/api/orders') return await handleCreateOrder(req, res);
    if (req.method === 'POST' && pathname === '/api/orders/confirm-payment') return await handleConfirmPayment(req, res);

    const trackMatch = pathname.match(/^\/api\/orders\/([A-Za-z0-9]+)\/tracking$/);
    if (req.method === 'GET' && trackMatch) {
      const orders = loadOrders();
      const order = orders.find(o => o.id.toLowerCase() === trackMatch[1].toLowerCase());
      if (!order) return sendJSON(res, 404, { ok: false, error: 'Order not found.' });
      const awb = order.shipment && order.shipment.awb;
      const tracking = await shiprocket.getTracking(liveShiprocketConfig(), awb);
      return sendJSON(res, 200, { ok: true, orderId: order.id, payment: order.payment, shipment: order.shipment, tracking });
    }

    /* Admin */
    if (req.method === 'POST' && pathname === '/api/admin/login') {
      const body = await readBody(req);
      if (adminPasswordMatches(body.password)) {
        return sendJSON(res, 200, { ok: true, token: issueAdminToken() });
      }
      return sendJSON(res, 401, { ok: false, error: 'Wrong password.' });
    }
    /* Forgot password: the owner types the secret recovery code she set
     * inside the admin, then chooses a new password on the spot. No email
     * is needed. Wrong codes are rate limited (see recoveryGuard). */
    if (req.method === 'POST' && pathname === '/api/admin/forgot-password') {
      const body = await readBody(req);
      const now = Date.now();
      if (now < recoveryGuard.lockedUntil) {
        const mins = Math.max(1, Math.ceil((recoveryGuard.lockedUntil - now) / 60000));
        return sendJSON(res, 429, { ok: false, error: 'Too many wrong tries. Please wait ' + mins + ' minute' + (mins === 1 ? '' : 's') + ' and try again.' });
      }
      const auth = loadAuth();
      if (!auth.recovery) {
        return sendJSON(res, 400, { ok: false, error: 'No recovery code has been set yet. Please ask your developer to open your shop manager and set one.' });
      }
      const newPw = typeof body.newPassword === 'string' ? body.newPassword : '';
      if (newPw.length < 6) {
        return sendJSON(res, 400, { ok: false, error: 'Please choose a new password of at least 6 letters or numbers.' });
      }
      const code = typeof body.recoveryCode === 'string' ? body.recoveryCode.trim() : '';
      if (!verifySecret(code, auth.recovery)) {
        recoveryGuard.fails += 1;
        if (recoveryGuard.fails >= 5) { recoveryGuard.lockedUntil = now + 5 * 60 * 1000; recoveryGuard.fails = 0; }
        return sendJSON(res, 401, { ok: false, error: 'That recovery code is not right. Please check it and try again.' });
      }
      recoveryGuard.fails = 0;
      auth.password = hashSecret(newPw);
      saveAuth(auth);
      adminTokens.clear();
      console.log('[admin] password reset with recovery code');
      return sendJSON(res, 200, { ok: true, token: issueAdminToken() });
    }
    if (pathname.startsWith('/api/admin/')) {
      if (!isAdmin(req)) return sendJSON(res, 401, { ok: false, error: 'Admin login required.' });
      if (req.method === 'GET' && pathname === '/api/admin/products') {
        return sendJSON(res, 200, { ok: true, products: loadProducts() });
      }
      if (req.method === 'GET' && pathname === '/api/admin/orders') {
        return sendJSON(res, 200, { ok: true, orders: loadOrders() });
      }
      if (req.method === 'GET' && pathname === '/api/admin/settings') {
        return sendJSON(res, 200, { ok: true, settings: loadSettings() });
      }
      /* Photo and video files the owner can pick from (assets folder). */
      if (req.method === 'GET' && pathname === '/api/admin/assets') {
        const images = [], videos = [];
        const walk = (dir, prefix) => {
          let entries = [];
          try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }
          entries.forEach(en => {
            if (en.isDirectory()) walk(path.join(dir, en.name), prefix + en.name + '/');
            else {
              const ext = path.extname(en.name).toLowerCase();
              if (['.jpg', '.jpeg', '.png', '.webp', '.svg'].includes(ext)) images.push('assets/' + prefix + en.name);
              else if (ext === '.mp4') videos.push('assets/' + prefix + en.name);
            }
          });
        };
        walk(path.join(ROOT, 'assets'), '');
        images.sort(); videos.sort();
        return sendJSON(res, 200, { ok: true, images, videos });
      }
      /* Password and safety: status, change password, set recovery code. */
      if (req.method === 'GET' && pathname === '/api/admin/security') {
        const auth = loadAuth();
        return sendJSON(res, 200, { ok: true, recoverySet: !!auth.recovery, customPasswordSet: !!auth.password });
      }
      if (req.method === 'POST' && pathname === '/api/admin/security/change-password') {
        const body = await readBody(req);
        if (!adminPasswordMatches(body.currentPassword)) {
          return sendJSON(res, 401, { ok: false, error: 'Your current password is not right. Please check it and try again.' });
        }
        const newPw = typeof body.newPassword === 'string' ? body.newPassword : '';
        if (newPw.length < 6) {
          return sendJSON(res, 400, { ok: false, error: 'Please choose a new password of at least 6 letters or numbers.' });
        }
        const auth = loadAuth();
        auth.password = hashSecret(newPw);
        saveAuth(auth);
        adminTokens.clear();
        console.log('[admin] password changed');
        return sendJSON(res, 200, { ok: true, token: issueAdminToken() });
      }
      if (req.method === 'POST' && pathname === '/api/admin/security/recovery-code') {
        const body = await readBody(req);
        if (!adminPasswordMatches(body.currentPassword)) {
          return sendJSON(res, 401, { ok: false, error: 'Your current password is not right. Please check it and try again.' });
        }
        const code = typeof body.recoveryCode === 'string' ? body.recoveryCode.trim() : '';
        if (code.length < 4) {
          return sendJSON(res, 400, { ok: false, error: 'Please choose a recovery code of at least 4 letters or numbers.' });
        }
        const auth = loadAuth();
        auth.recovery = hashSecret(code);
        saveAuth(auth);
        console.log('[admin] recovery code updated');
        return sendJSON(res, 200, { ok: true, recoverySet: true });
      }
      /* Payments and delivery keys. Status answers never include a
       * secret value, only whether one is saved. */
      if (req.method === 'GET' && pathname === '/api/admin/integrations') {
        const s = integrationStore();
        const rz = razorpayCreds(), sr = shiprocketCreds();
        return sendJSON(res, 200, {
          ok: true,
          razorpay: {
            keyId: rz.keyId || '',
            keyIdSet: !!rz.keyId,
            secretSet: !!rz.keySecret,
            live: rz.live,
            source: rz.source,
            adminKeyId: s.razorpayKeyId || '',
            adminSecretSet: !!s.razorpayKeySecret
          },
          shiprocket: {
            email: sr.email || '',
            passwordSet: !!sr.password,
            pickupLocation: sr.pickupLocation || 'Primary',
            configured: shiprocket.isConfigured(liveShiprocketConfig()),
            source: sr.source,
            adminEmail: s.shiprocketEmail || '',
            adminPasswordSet: !!s.shiprocketPassword,
            adminPickup: s.shiprocketPickup || ''
          }
        });
      }
      if (req.method === 'PUT' && pathname === '/api/admin/integrations') {
        const body = await readBody(req);
        const auth = loadAuth();
        const s = Object.assign({}, auth.integrations || {});
        const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
        /* Secret fields: an empty box means "keep the saved secret", so
         * the owner never has to retype a secret she cannot see. */
        if (body.razorpayKeyId !== undefined) s.razorpayKeyId = str(body.razorpayKeyId, 120);
        if (body.razorpayKeySecret) s.razorpayKeySecret = str(body.razorpayKeySecret, 200);
        if (body.shiprocketEmail !== undefined) s.shiprocketEmail = str(body.shiprocketEmail, 160);
        if (body.shiprocketPassword) s.shiprocketPassword = str(body.shiprocketPassword, 200);
        if (body.shiprocketPickup !== undefined) s.shiprocketPickup = str(body.shiprocketPickup, 80);
        auth.integrations = s;
        saveAuth(auth);
        if (typeof shiprocket.resetTokenCache === 'function') shiprocket.resetTokenCache();
        console.log('[admin] payment/delivery keys updated');
        return sendJSON(res, 200, { ok: true });
      }
      if (req.method === 'POST' && pathname === '/api/admin/integrations/clear') {
        const body = await readBody(req);
        const auth = loadAuth();
        const s = Object.assign({}, auth.integrations || {});
        if (body.which === 'razorpay') { delete s.razorpayKeyId; delete s.razorpayKeySecret; }
        else if (body.which === 'shiprocket') { delete s.shiprocketEmail; delete s.shiprocketPassword; delete s.shiprocketPickup; }
        else return sendJSON(res, 400, { ok: false, error: 'Unknown keys to remove.' });
        auth.integrations = s;
        saveAuth(auth);
        if (typeof shiprocket.resetTokenCache === 'function') shiprocket.resetTokenCache();
        console.log('[admin] payment/delivery keys removed: ' + body.which);
        return sendJSON(res, 200, { ok: true });
      }
      /* Razorpay check: the key format can be checked safely here. A full
       * check is only possible when a real payment is made, and the
       * answer says exactly that. */
      if (req.method === 'POST' && pathname === '/api/admin/integrations/check-razorpay') {
        const rz = razorpayCreds();
        if (!rz.keyId && !rz.keySecret) {
          return sendJSON(res, 200, { ok: false, error: 'No Razorpay keys are saved yet. Paste your Key ID and Key Secret above, press Save, then check again.' });
        }
        if (!/^rzp_(test|live)_[A-Za-z0-9]{8,}$/.test(rz.keyId || '')) {
          return sendJSON(res, 200, { ok: false, error: 'The Key ID does not look right. A Razorpay Key ID starts with rzp_test_ or rzp_live_ and is followed by letters and numbers. Please copy it again from the Razorpay dashboard.' });
        }
        if (!rz.keySecret) {
          return sendJSON(res, 200, { ok: false, error: 'The Key ID is saved, but no Key Secret is saved yet. Paste the Key Secret too, then press Save.' });
        }
        const kind = rz.keyId.indexOf('rzp_live_') === 0 ? 'These are LIVE keys, so real customer payments will work.' : 'These are TEST keys, so payments will run in Razorpay test mode and no real money moves. For real sales, generate live keys in the Razorpay dashboard.';
        return sendJSON(res, 200, { ok: true, message: 'The key format looks right. ' + kind + ' Razorpay keys cannot be fully checked without a real payment, so the first real customer order will be the final confirmation.' });
      }
      /* Shiprocket check: a real login try with the saved details. */
      if (req.method === 'POST' && pathname === '/api/admin/integrations/check-shiprocket') {
        const srCfg = liveShiprocketConfig();
        if (!shiprocket.isConfigured(srCfg)) {
          return sendJSON(res, 200, { ok: false, error: 'No Shiprocket email and password are saved yet. Fill them in above, press Save, then check again.' });
        }
        try {
          const r = await shiprocket.checkLogin(srCfg);
          if (r.ok) return sendJSON(res, 200, { ok: true, message: 'Shiprocket login worked. Your saved email and password are correct, so shipments can be created when orders come in.' });
          return sendJSON(res, 200, { ok: false, error: 'Shiprocket did not accept this login (it answered: ' + (r.detail || 'login failed') + '). Please check the email and password, the same ones you use at app.shiprocket.in, then save and check again.' });
        } catch (e) {
          return sendJSON(res, 200, { ok: false, error: 'Shiprocket could not be reached from the server just now. Please try the check again in a few minutes.' });
        }
      }
      if (req.method === 'PUT' && pathname === '/api/admin/settings') {
        const body = await readBody(req);
        let settings;
        try { settings = cleanSettings(body.settings, loadSettings()); }
        catch (e) { return sendJSON(res, 400, { ok: false, error: e.message }); }
        writeJSON(SETTINGS_FILE, settings);
        console.log('[admin] settings updated');
        return sendJSON(res, 200, { ok: true, settings });
      }
      if (req.method === 'POST' && pathname === '/api/admin/products') {
        const body = await readBody(req);
        const products = loadProducts();
        let product;
        try { product = cleanProduct(body.product); } catch (e) { return sendJSON(res, 400, { ok: false, error: e.message }); }
        if (products.some(p => p.id === product.id)) return sendJSON(res, 400, { ok: false, error: 'A product with this id already exists.' });
        products.push(product);
        writeJSON(PRODUCTS_FILE, products);
        console.log('[admin] product created: ' + product.id);
        return sendJSON(res, 200, { ok: true, product });
      }
      const pm = pathname.match(/^\/api\/admin\/products\/(.+)$/);
      if (pm && req.method === 'PUT') {
        const id = decodeURIComponent(pm[1]);
        const body = await readBody(req);
        const products = loadProducts();
        const idx = products.findIndex(p => p.id === id);
        if (idx < 0) return sendJSON(res, 404, { ok: false, error: 'Product not found.' });
        let product;
        try { product = cleanProduct(Object.assign({}, body.product, { id }), products[idx]); }
        catch (e) { return sendJSON(res, 400, { ok: false, error: e.message }); }
        products[idx] = product;
        writeJSON(PRODUCTS_FILE, products);
        console.log('[admin] product updated: ' + product.id);
        return sendJSON(res, 200, { ok: true, product });
      }
      if (pm && req.method === 'DELETE') {
        const id = decodeURIComponent(pm[1]);
        const products = loadProducts();
        const next = products.filter(p => p.id !== id);
        if (next.length === products.length) return sendJSON(res, 404, { ok: false, error: 'Product not found.' });
        writeJSON(PRODUCTS_FILE, next);
        console.log('[admin] product deleted: ' + id);
        return sendJSON(res, 200, { ok: true });
      }
      return sendJSON(res, 404, { ok: false, error: 'Unknown admin endpoint.' });
    }

    if (req.method === 'GET' || req.method === 'HEAD') return serveStatic(req, res, pathname);
    res.writeHead(405); res.end('Method not allowed');
  } catch (e) {
    console.error(e);
    if (!res.headersSent) sendJSON(res, 500, { ok: false, error: 'Server error: ' + e.message });
  }
});

server.listen(config.port, () => {
  console.log('AUVÉ dynamic store running at http://localhost:' + config.port);
  console.log('  Storefront : http://localhost:' + config.port + '/');
  console.log('  Admin      : http://localhost:' + config.port + '/admin.html');
  console.log('  Payments   : ' + (razorpayCreds().live ? 'Razorpay LIVE (keys from ' + razorpayCreds().source + ')' : 'TEST mode (no Razorpay keys in admin, config.js or env)'));
  console.log('  Shiprocket : ' + (shiprocket.isConfigured(liveShiprocketConfig()) ? 'configured (from ' + shiprocketCreds().source + ')' : 'not configured (shipments skipped)'));
});
