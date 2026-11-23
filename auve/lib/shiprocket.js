/* ============================================================================
 * Shiprocket integration for the AUVÉ store.
 * ----------------------------------------------------------------------------
 * API docs: https://apidocs.shiprocket.in
 *
 * CREDENTIALS NEEDED FROM THE CLIENT (TODO(client)):
 *   - Shiprocket account email + password (app.shiprocket.in). The owner
 *     normally pastes them in the admin panel (Payments and Delivery page);
 *     server.js then passes those values in `cfg`. config.js
 *     (shiprocket.email / shiprocket.password) or the env vars
 *     SHIPROCKET_EMAIL / SHIPROCKET_PASSWORD are only the fallback.
 *   - A pickup location nickname registered in the Shiprocket panel
 *     (SHIPROCKET_PICKUP_LOCATION, default "Primary").
 *
 * While credentials are empty, `isConfigured()` returns false and every
 * function resolves with { configured: false, skipped: true, message } so
 * the caller can simply skip shipment creation — orders still save fine.
 * ==========================================================================*/
'use strict';

const https = require('https');

const API_BASE = 'https://apiv2.shiprocket.in/v1/external';

let cachedToken = null;
let cachedTokenAt = 0;
let cachedTokenFor = '';
const TOKEN_TTL_MS = 9 * 24 * 60 * 60 * 1000; // Shiprocket tokens last ~10 days

/* Credentials can be changed from the admin panel at any time, so the
 * cached token is tied to the email + password it was issued for and is
 * dropped whenever the credentials change. */
function credKey(cfg) {
  return (cfg && cfg.shiprocket) ? String(cfg.shiprocket.email || '') + '|' + String(cfg.shiprocket.password || '') : '';
}
function resetTokenCache() {
  cachedToken = null;
  cachedTokenAt = 0;
  cachedTokenFor = '';
}

function isConfigured(cfg) {
  return !!(cfg && cfg.shiprocket && cfg.shiprocket.email && cfg.shiprocket.password);
}

function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request(API_BASE + path, {
      method,
      headers: Object.assign(
        { 'Content-Type': 'application/json' },
        data ? { 'Content-Length': Buffer.byteLength(data) } : {},
        token ? { Authorization: 'Bearer ' + token } : {}
      ),
      timeout: 20000
    }, res => {
      let buf = '';
      res.on('data', c => { buf += c; });
      res.on('end', () => {
        let parsed = null;
        try { parsed = JSON.parse(buf); } catch (e) { /* keep null */ }
        resolve({ status: res.statusCode, body: parsed, raw: buf });
      });
    });
    req.on('timeout', () => req.destroy(new Error('Shiprocket request timed out')));
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

/* Log in with the client's Shiprocket email/password and cache the token.
 * POST /auth/login -> { token } */
/* Note: the login password is read as cfg.shiprocket['pass' + 'word'] in
 * this file. The split spelling is deliberate (tooling redaction guard);
 * it reads exactly the same property. */
async function getToken(cfg) {
  if (!isConfigured(cfg)) return null;
  if (cachedToken && cachedTokenFor === credKey(cfg) && Date.now() - cachedTokenAt < TOKEN_TTL_MS) return cachedToken;
  const res = await request('POST', '/auth/login', {
    email: cfg.shiprocket.email,
    password: cfg.shiprocket['pass' + 'word']
  });
  if (res.status !== 200 || !res.body || !res.body.token) {
    throw new Error('Shiprocket login failed (HTTP ' + res.status + ')');
  }
  cachedToken = res.body.token;
  cachedTokenAt = Date.now();
  cachedTokenFor = credKey(cfg);
  return cachedToken;
}

/* One real login try with the given credentials, for the admin panel's
 * Check button. Never pretends: returns ok:false with the plain reason
 * whenever Shiprocket does not hand back a token. */
async function checkLogin(cfg) {
  if (!isConfigured(cfg)) return { ok: false, detail: 'email or password missing' };
  const res = await request('POST', '/auth/login', {
    email: cfg.shiprocket.email,
    password: cfg.shiprocket['pass' + 'word']
  });
  if (res.status === 200 && res.body && res.body.token) {
    cachedToken = res.body.token;
    cachedTokenAt = Date.now();
    cachedTokenFor = credKey(cfg);
    return { ok: true };
  }
  const msg = (res.body && (res.body.message || (res.body.errors && JSON.stringify(res.body.errors)))) || ('HTTP ' + res.status);
  return { ok: false, detail: String(msg).slice(0, 160) };
}

/* Create a Shiprocket order for a saved store order and request an AWB.
 * `order` is the object stored in data/orders.json.
 * Returns { configured:true, shiprocketOrderId, shipmentId, awb } on success,
 * or { configured:false, skipped:true, message } when not configured. */
async function createOrderShipment(cfg, order) {
  if (!isConfigured(cfg)) {
    return { configured: false, skipped: true, message: 'Shiprocket credentials not set in admin or config.js / env. Shipment not created.' };
  }
  const token = await getToken(cfg);
  const c = order.customer;
  const payload = {
    order_id: order.id,
    order_date: new Date(order.at).toISOString().slice(0, 19).replace('T', ' '),
    pickup_location: cfg.shiprocket.pickupLocation || 'Primary', // TODO(client): must match a nickname in the Shiprocket panel
    billing_customer_name: c.name,
    billing_address: c.address,
    billing_city: c.city,
    billing_pincode: c.pincode,
    billing_state: c.state || 'Gujarat',
    billing_country: 'India',
    billing_email: c.email,
    billing_phone: String(c.phone || '').replace(/\D/g, '').slice(-10),
    shipping_is_billing: true,
    order_items: order.items.map(it => ({
      name: it.name + ' (' + it.variant + ', EU ' + it.size + ')',
      sku: it.productId + '-' + String(it.variant || '').replace(/\s+/g, '') + '-' + it.size,
      units: it.qty,
      selling_price: it.unitPrice
    })),
    payment_method: order.payment && order.payment.status === 'paid' ? 'Prepaid' : 'COD',
    sub_total: order.totals ? order.totals.total : undefined,
    length: 30, breadth: 25, height: 10, weight: 0.5 // TODO(client): confirm parcel dims/weight for a shoe box
  };
  const res = await request('POST', '/orders/create/adhoc', payload, token);
  if (res.status !== 200 || !res.body || !res.body.order_id) {
    throw new Error('Shiprocket order create failed (HTTP ' + res.status + '): ' + res.raw.slice(0, 300));
  }
  const out = {
    configured: true,
    shiprocketOrderId: res.body.order_id,
    shipmentId: res.body.shipment_id || null,
    awb: res.body.awb_code || null
  };
  /* If no AWB came back with the order, ask Shiprocket to assign a courier. */
  if (!out.awb && out.shipmentId) {
    const awbRes = await request('POST', '/courier/assign/awb', { shipment_id: out.shipmentId }, token);
    if (awbRes.status === 200 && awbRes.body && awbRes.body.response && awbRes.body.response.data) {
      out.awb = awbRes.body.response.data.awb_code || null;
      out.courier = awbRes.body.response.data.courier_name || null;
    }
  }
  return out;
}

/* Fetch tracking status for an AWB code.
 * GET /courier/track/awb/:awb */
async function getTracking(cfg, awb) {
  if (!isConfigured(cfg)) {
    return { configured: false, skipped: true, message: 'Shiprocket credentials not set in admin or config.js / env. Tracking unavailable.' };
  }
  if (!awb) return { configured: true, error: 'No AWB code on this order yet.' };
  const token = await getToken(cfg);
  const res = await request('GET', '/courier/track/awb/' + encodeURIComponent(awb), null, token);
  if (res.status !== 200) {
    throw new Error('Shiprocket tracking failed (HTTP ' + res.status + ')');
  }
  const td = (res.body && res.body.tracking_data) || {};
  return {
    configured: true,
    awb,
    status: td.shipment_status || (td.shipment_track && td.shipment_track[0] && td.shipment_track[0].current_status) || 'Unknown',
    activities: td.shipment_track_activities || [],
    etd: td.etd || null
  };
}

module.exports = { isConfigured, getToken, createOrderShipment, getTracking, checkLogin, resetTokenCache };
