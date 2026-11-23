/*! AUVÉ storefront - frontend-only build.
 * Compiled from the design's template + logic into plain React (no proprietary runtime).
 * Requires (in order): vendor/react*.js, data/catalog.js, app.js. No backend - cart, orders and sign-in live in localStorage.
 */
(function () {
'use strict';
var h = React.createElement, F = React.Fragment;
var SITE = { whatsappNumber: '+91 97251 24422', email: 'contact@auve.in', announcementText: 'Free shipping across India on all orders', freeShippingOver: 0, showLoader: true,
  /* Site background: navy (brand blue). */
  background: 'navy' };
(function () {
  var BG = {
    cream: ['#F3E6D8', 'rgba(243,230,216,0.95)'], white: ['#FFFFFF', 'rgba(255,255,255,0.95)'],
    ivory: ['#FAF5EF', 'rgba(250,245,239,0.95)'], sand: ['#EBDDC9', 'rgba(235,221,201,0.95)'],
    blush: ['#F4E4DE', 'rgba(244,228,222,0.95)'], stone: ['#ECE8E2', 'rgba(236,232,226,0.95)'],
    sage: ['#E7E9DF', 'rgba(231,233,223,0.95)'], lavender: ['#ECE9F2', 'rgba(236,233,242,0.95)'],
    /* dark tones: [bg, header glass, card] */
    navy: ['#1B1A34', 'rgba(27,26,52,0.95)', '#25244A'], espresso: ['#2A211C', 'rgba(42,33,28,0.95)', '#362B25'],
    charcoal: ['#222222', 'rgba(34,34,34,0.95)', '#2E2E2E'], forest: ['#1E2A24', 'rgba(30,42,36,0.95)', '#283730'],
    plum: ['#2B1D2A', 'rgba(43,29,42,0.95)', '#382737'], oxblood: ['#31191B', 'rgba(49,25,27,0.95)', '#402326']
  };
  var r = document.documentElement.style;
  try { localStorage.removeItem('auve-bg'); } catch (e) {}
  function apply(k) {
    var t = BG[k] || BG.cream, dark = !!t[2]; r.setProperty('--auve-bg', t[0]); r.setProperty('--auve-bg-glass', t[1]); r.background = t[0];
    r.setProperty('--auve-card', dark ? t[2] : '#FFFFFF'); r.setProperty('--auve-ink', dark ? '#F3E6D8' : '#1B1A34'); r.setProperty('--auve-ink-rgb', dark ? '243,230,216' : '27,26,52');
    r.setProperty('--auve-muted', dark ? 'rgba(243,230,216,0.72)' : '#6B6257'); r.setProperty('--auve-muted2', dark ? 'rgba(243,230,216,0.85)' : '#50485A');
    document.documentElement.classList.toggle('auve-dark', dark); r.setProperty('--auve-btn', dark ? '#F3E6D8' : '#1B1A34'); r.setProperty('--auve-btn-ink', dark ? t[0] : '#FAF5EF'); r.color = dark ? '#F3E6D8' : '#1B1A34';
  }
  apply(SITE.background);
  /* Dynamic design settings (data/settings.json, edited in admin.html and
     loaded by index.html into window.AUVE_SETTINGS before app.js runs).
     The shipped defaults equal the theme values above, so nothing changes
     visually until the owner edits a colour, font or size in the admin. */
  (function () {
    var d = (window.AUVE_SETTINGS || {}).design || {};
    function rgb(hex) { var m = /^#?([0-9a-f]{6})$/i.exec(hex || ''); if (!m) return null; var n = parseInt(m[1], 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
    if (d.backgroundColor) { r.setProperty('--auve-bg', d.backgroundColor); r.background = d.backgroundColor; var b = rgb(d.backgroundColor); if (b) r.setProperty('--auve-bg-glass', 'rgba(' + b.join(',') + ',0.95)'); }
    if (d.primaryColor) { r.setProperty('--auve-ink', d.primaryColor); r.color = d.primaryColor; var p = rgb(d.primaryColor); if (p) r.setProperty('--auve-ink-rgb', p.join(',')); }
    if (d.buttonColor) r.setProperty('--auve-btn', d.buttonColor);
    if (d.buttonTextColor) r.setProperty('--auve-btn-ink', d.buttonTextColor);
    var shape = d.buttonShape === "rounded" ? "8px" : d.buttonShape === "boxy" ? "2px" : "999px";
    r.setProperty('--auve-btn-radius', shape);
    var pad = d.buttonSize === "compact" ? "12px 22px" : d.buttonSize === "large" ? "19px 36px" : "16px 28px";
    r.setProperty('--auve-btn-pad', pad);
    var FONTS = {
      classic: ['Belleza, sans-serif', 'Garet, Montserrat, system-ui, sans-serif'],
      modern: ['Montserrat, system-ui, sans-serif', 'Montserrat, system-ui, sans-serif'],
      serif: ['Georgia, "Times New Roman", serif', 'Arial, Helvetica, sans-serif'],
      simple: ['Arial, Helvetica, sans-serif', 'Arial, Helvetica, sans-serif']
    };
    var f = FONTS[d.fontPreset] || FONTS.classic;
    var css = 'h1,h2,h3{font-family:' + f[0] + ' !important}html,body{font-family:' + f[1] + ' !important}p,dd,li{font-family:' + f[1] + ' !important}button,a.au-h3,button.au-h5,a.au-h6,button.au-h7,.btn-pill{border-radius:var(--auve-btn-radius, 999px) !important;}';
    if (d.headingSize) css += 'h2{font-size:min(' + Number(d.headingSize) + 'px,9vw) !important}';
    if (d.bodySize) css += 'body{font-size:' + Number(d.bodySize) + 'px}p,dd,li{font-size:' + Number(d.bodySize) + 'px}';
    var st = document.createElement('style'); st.id = 'auve-settings-style'; st.textContent = css;
    (document.head || document.documentElement).appendChild(st);
  })();
})();

/* Section on/off switches from data/settings.json (edited in admin.html). */
function auveSection(name) { var S = window.AUVE_SETTINGS; return !(S && S.sections && S.sections[name] === false); }

/* ---- template helpers ---- */
function R(vals, expr) {
  if (expr === 'true') return true; if (expr === 'false') return false; if (expr === 'null') return null;
  if (/^-?\d+(\.\d+)?$/.test(expr)) return Number(expr);
  if (/^(['"]).*\1$/.test(expr)) return expr.slice(1, -1);
  var parts = expr.split('.'), cur = vals;
  for (var i = 0; i < parts.length; i++) { if (cur == null) return undefined; cur = cur[parts[i]]; }
  return cur;
}
function A(list) { return Array.isArray(list) ? list : []; }
function Z(v) { return v == null ? '' : v; }
function D(v, d) { return v === undefined ? d : v; }
function X(v) {
  if (v === undefined || v === null || typeof v === 'boolean') return null;
  if (React.isValidElement(v) || Array.isArray(v)) return v;
  return h('span', null, String(v));
}
var styleCache = new Map();
function S(css) {
  if (css == null || typeof css === 'object') return css;
  var hit = styleCache.get(css); if (hit) return hit;
  var o = {};
  String(css).split(';').forEach(function (d) { var i = d.indexOf(':'); if (i < 0) return; var p = d.slice(0, i).trim(); o[p.indexOf('--') === 0 ? p : p.replace(/-([a-z])/g, function (_, c) { return c.toUpperCase(); })] = d.slice(i + 1).trim(); });
  if (styleCache.size > 4000) styleCache.clear();
  styleCache.set(css, o); return o;
}
/* ---- base class: logic + template ---- */
class DCLogic extends React.Component {
  renderVals() { return {}; }
  render() { return h(F, null, ...renderTemplate(Object.assign({}, this.props, this.renderVals()))); }
}

/* ---- store data + logic ---- */
const COLL = {
  barely: { key: 'barely', name: 'The Barely Edit', tag: 'Everyday · 2026', blurb: 'Soft, barely-there flats, slides and low heels for every ordinary day.', img: 'assets/p/bn-trace-1.jpg', video: 'assets/reels/muse.mp4', poster: 'assets/p/bn-muse-1.jpg' },
  gilded: { key: 'gilded', name: 'Gilded', tag: 'The way we wear · 2026', blurb: 'Covered with gold. Chain-detail flats and block heels that dress up anything.', img: 'assets/p/gd-poise-1.jpg', video: 'assets/reels/poise.mp4' },
  veil: { key: 'veil', name: 'Veil & Vow', tag: 'Rooted in tradition · 2026', blurb: 'Brocade, velvet and heirloom gold for the days everyone remembers.', img: 'assets/p/v-08.jpg', video: 'assets/reels/first-look.mp4' }
};
/* BACKEND HOOK - Laravel: GET /api/products (same shape as data/catalog.js, plus per-size stock). */
let PRODUCTS = (window.AUVE_CATALOG || []).slice();
const BYID = Object.fromEntries(PRODUCTS.map(p => [p.id, p]));
const BLANK_IMG = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
const EMPTY_P = { id: '', name: '', coll: '', type: '', price: 0, desc: '', variants: [{ name: '', sw: '#EEE', imgs: [BLANK_IMG] }], soldOut: [] };
const collOf = k => COLL[k] || { key: '', name: '', tag: '', blurb: '' };
const isOut = (p, vi, z) => { const v = p.variants[vi] || p.variants[0]; if (v && v.stock) { const e = v.stock[z]; return !e || !e.inStock; } return p.soldOut.includes(z); };
const pickIds = (ids, n) => { const out = ids.filter(id => BYID[id]).map(id => BYID[id]); PRODUCTS.forEach(p => { if (out.length < n && !out.includes(p)) out.push(p); }); return out.slice(0, n); };

const SIZES = [35, 36, 37, 38, 39, 40, 41];
const SIZE_ROWS = [['35', '2', '5', '22.5'], ['36', '3', '6', '23.2'], ['37', '4', '6.5', '23.9'], ['38', '5', '7.5', '24.6'], ['39', '6', '8.5', '25.3'], ['40', '7', '9', '26.0'], ['41', '8', '10', '26.7']].map(r => ({ eu: r[0], ind: r[1], us: r[2], cm: r[3] }));
const sizeIn = (z, sys) => { const r = SIZE_ROWS.find(x => +x.eu === z); return !r || !sys || sys === 'EU' ? String(z) : sys === 'IND' ? r.ind : r.us; };
const PAGES = ['home', 'shop', 'product', 'bag', 'checkout', 'confirm', 'about', 'contact', 'faq', 'account', 'terms', 'privacy', 'refund', 'shipping'];
/* Policy pages. Replace the [BRACKETED] business details before going live - they must match your Razorpay/Cashfree KYC exactly. */
const BIZ = { name: '[Registered Business Name]', address: '[Registered Business Address], Surat, Gujarat [PIN], India', gst: '[GSTIN]', grievance: '[Grievance Officer Name]', phone: '+91 97251 24422', email: 'contact@auve.in', updated: '29 October 2026' };
const LEGAL = {
  terms: { label: 'Terms & Conditions', file: 'terms.html', title: 'Terms & Conditions', intro: 'These terms apply to every purchase made on this website. By placing an order, you agree to them. Please read them together with our Privacy Policy, Exchange & Cancellation Policy and Shipping Policy.', sections: [
    ['About us', ['This website is owned and operated by ' + BIZ.name + ' ("AUVÉ", "we", "us"), ' + BIZ.address + '. GSTIN: ' + BIZ.gst + '.', 'Contact: ' + BIZ.phone + ' · ' + BIZ.email + ' · 10am to 8pm, Monday to Saturday.']],
    ['Products', ['We sell handmade women\'s footwear, made in Surat, India. Every pair is made by hand, so small variations in colour, stitching and embellishment are natural and are not defects. Colours may look slightly different on different screens.', 'Please check the size guide before ordering. Product availability may change without notice.']],
    ['Prices', ['All prices are in Indian Rupees (₹) and include GST. Shipping is free on all orders, including cash on delivery. There are no extra charges at checkout.', 'If a product is listed at an incorrect price because of an error, we will contact you before dispatch; you may then accept the correct price or cancel the order for a full refund of any amount paid.']],
    ['Offers', ['Code WELCOME10 gives 10% off your first order only, limited to one use per customer and mobile number. This is our only discount: there are no further discounts on later orders and no discounts based on the number of pairs ordered. Offers have no cash value and cannot be exchanged.']],
    ['Orders', ['An order is confirmed when you receive an order number on screen and by email. You can order up to 5 pairs per order.', 'We may decline or cancel an order if a product is unavailable, the delivery address cannot be served, or we suspect fraud. If we cancel, any amount paid online is refunded in full to the original payment method within 5 to 7 working days.']],
    ['Payment', ['We accept UPI, debit and credit cards, net banking and wallets through our payment partner Razorpay, and cash on delivery. Online payments are processed on Razorpay\'s secure, PCI-DSS compliant checkout. We never see or store your card number, CVV, UPI PIN or bank login details.', 'Cash on delivery is free and may be unavailable for some PIN codes or orders.']],
    ['Shipping', ['We have a separate Shipping Policy page that explains delivery locations, dispatch and delivery times, shipping charges, tracking and what happens if a parcel is delayed or damaged. Please read it before placing your order; it forms part of these terms.']],
    ['Exchanges, cancellations and refunds', ['We offer size or design exchanges within 5 days of delivery. We do not offer refunds on delivered orders. Refunds are made only when an order is cancelled before dispatch or cannot be fulfilled by us. Full details are in our Exchange & Cancellation Policy.']]
  ] },
  privacy: { label: 'Privacy Policy', file: 'privacy-policy.html', title: 'Privacy Policy', intro: 'This policy explains what personal information ' + BIZ.name + ' (AUVÉ) collects when you use this website, how we use it and how we protect it, in line with the Digital Personal Data Protection Act, 2023 and the Information Technology Act, 2000.', sections: [
    ['Information we collect', ['Information you give us: your name, mobile number, email address and delivery address when you place an order, subscribe to updates or contact us.', 'Order information: products, sizes, amounts, payment method and order status.', 'Payment information: payments are processed by Razorpay. We receive only the payment status and a transaction reference, never your card number, CVV, UPI PIN or bank login details.', 'Technical information: device and browser type, pages visited and similar data, used to keep the site secure and working well.']],
    ['How we use it', ['To process, deliver and support your orders, including exchanges and cancellations.', 'To send order and delivery updates by email.', 'To answer your questions and provide customer support.', 'To send offers and new arrivals by email, only if you subscribe. You can unsubscribe at any time using the link in any email or by writing to us.', 'To prevent fraud and meet our legal and tax obligations.']],
    ['Who we share it with', ['Courier partners, to deliver your order.', 'Razorpay, our payment partner, to process payments and any refunds.', 'Government or law-enforcement authorities, where required by law.', 'We never sell, rent or trade your personal information.']],
    ['Cookies and local storage', ['This site stores your cart, recent orders and sign-in in your browser so they are there when you return. You can clear these at any time from your browser settings.']],
    ['Data security and retention', ['We use reasonable security practices to protect your information. We keep it only as long as needed to fulfil orders, handle exchanges and meet legal, tax and accounting requirements.']],
    ['Your rights', ['You can ask to access, correct or delete your personal information, or withdraw consent for marketing, by writing to ' + BIZ.email + '. We respond within 7 working days.']],
    ['Grievance officer', [BIZ.grievance + ', ' + BIZ.name + ', ' + BIZ.address + '. Email ' + BIZ.email + ', phone ' + BIZ.phone + '.']],
    ['Changes to this policy', ['We may update this policy from time to time. The latest version is always on this page.']]
  ] },
  refund: { label: 'Exchange & Cancellation', file: 'exchange-policy.html', title: 'Exchange, Cancellation & Refund Policy', intro: 'Every AUVÉ pair is made by hand in small batches, so we offer exchanges instead of refunds on delivered orders. Here is exactly how exchanges, cancellations and refunds work.', sections: [
    ['Exchanges', ['You can exchange a pair for a different size, or for another design of equal value, within 5 days of delivery.', 'To request an exchange, email ' + BIZ.email + ' with your order number and the size or design you would like.', 'We arrange the pickup and dispatch the replacement once the original pair reaches us and passes inspection, usually within 3 to 5 working days. If your choice is unavailable, you receive store credit of the same value, valid for 12 months.']],
    ['Conditions for exchange', ['The pair must be unused, unworn, clean and undamaged.', 'It must be returned in the original box with all packaging and tags.']],
    ['Not eligible for exchange', ['Pairs that have been used or worn.', 'Pairs damaged after delivery.', 'Pairs without the original box or packaging.', 'Requests made more than 5 days after delivery.']],
    ['Wrong or defective pair', ['If you receive the wrong product or a pair with a manufacturing defect, tell us within 48 hours of delivery with photos of the shoes and the box. We will replace it at no cost to you, including pickup.']],
    ['Refunds', ['We do not offer refunds on delivered orders, except where a wrong or defective pair cannot be replaced.', 'Refunds are issued only when an order is cancelled before dispatch, when we cannot fulfil an order, or when a wrong or defective pair cannot be replaced.', 'Approved refunds are processed within 5 to 7 working days to the original payment method (UPI, card, net banking or wallet). Your bank may take a few more days to show the credit. Cash-on-delivery orders are refunded to a bank account or UPI ID you provide.']],
    ['Cancellations', ['You can cancel an order free of charge any time before it is dispatched. Email your order number to ' + BIZ.email + '. Prepaid orders cancelled before dispatch are refunded in full.', 'Orders cannot be cancelled once dispatched; you can request an exchange after delivery instead.']],
    ['Charges', ['Pickup for eligible exchanges is free. Shipping and cash on delivery are free, so there are no charges to refund.']]
  ] },
  shipping: { label: 'Shipping Policy', file: 'shipping-policy.html', title: 'Shipping & Delivery Policy', intro: 'Every AUVÉ order is packed by hand at our studio in Surat, Gujarat, and shipped through trusted courier partners. This policy explains how and when your order reaches you, what it costs, and what happens if something goes wrong on the way.', sections: [
    ['Delivery locations', ['We deliver to most PIN codes across India through our courier partners, including metro cities, towns and most rural areas. You can check delivery to your PIN code at checkout before you pay.', 'For orders outside India, email ' + BIZ.email + ' with your address and the pairs you would like. We will share shipping options, charges and timelines before you pay.']],
    ['Order processing', ['Orders are processed once payment is confirmed, or once a cash-on-delivery order is confirmed by email.', 'Orders placed on Sundays or public holidays are processed on the next working day.']],
    ['Dispatch time', ['Orders are dispatched within 48 hours (2 working days) of confirmation, Monday to Saturday.', 'During sales, festive seasons and peak wedding periods, dispatch may take 1 to 2 extra working days. We will tell you by email if this applies to your order.']],
    ['Delivery time', ['The estimated delivery time for your order is shown at checkout, based on your PIN code, and is confirmed in your order confirmation email.', 'Delivery times are estimates from our courier partners and may vary for remote areas. During festive seasons and sale periods with high order volumes, processing or delivery timelines may vary slightly.']],
    ['Shipping charges', ['Standard shipping is free on all orders across India.', 'All shipping charges are shown at checkout before you pay. There are no hidden charges at delivery for prepaid orders.']],
    ['Cash on delivery', ['Cash on delivery is available on most PIN codes at no extra charge.', 'You can pay the courier in cash or by UPI at delivery. Please keep the exact amount ready where possible.', 'We may confirm cash-on-delivery orders by email before dispatch, and may decline cash on delivery for some PIN codes or repeated refused deliveries.']],
    ['Packaging', ['Every pair is shipped in its AUVÉ box inside a protective outer carton. Please keep the box: it is required for any exchange.']],
    ['Order tracking', ['As soon as your order is dispatched, we email you the courier name and a tracking link. You can also check your order status on the Track Order page using your order number.']],
    ['Address changes', ['Please check your address and PIN code carefully at checkout. To change the address, email ' + BIZ.email + ' before your order is dispatched. Once dispatched, the address cannot be changed.']],
    ['Delivery attempts', ['The courier will make up to 3 delivery attempts. If delivery fails because of an incorrect address, an unreachable phone number or no one being available, the order is returned to us.', 'Returned prepaid orders can be re-shipped once the shipping charge is paid again. Cash-on-delivery orders refused at delivery may make you ineligible for cash on delivery on future orders.']],
    ['Delays', ['Deliveries may occasionally be delayed by weather, strikes, festivals, regional restrictions or other events outside our control. We will keep you informed by email and help you track your parcel.']],
    ['Damaged, tampered or missing parcels', ['If the outer packaging looks damaged or tampered with, please refuse the parcel or record an unboxing video.', 'Email us within 48 hours of delivery with photos or the video and your order number. We will arrange a replacement at no cost once the courier confirms the issue.', 'If tracking shows your order as delivered but you have not received it, email us within 48 hours and we will raise a claim with the courier.']],
    ['Contact', ['For any shipping question, email ' + BIZ.email + ' with your order number. We reply within one working day.']]
  ] }
};
const TYPES = ['All styles', 'Flats', 'Slides', 'Heels', 'Wedges'];
const FAQ = [
  { title: 'Orders & payment', items: [
    ['How do I place an order?', 'Pick your pair, choose a size and add it to your cart. Check out with UPI, card or cash on delivery. No DM needed.'],
    ['Is cash on delivery available?', 'Yes, across most Indian pincodes, at no extra charge. We email you to confirm before dispatch.'],
    ['Do you offer any discounts?', 'Yes, your first order gets 10% off with code WELCOME10. Sign up to our newsletter and it\'s applied to your cart automatically.']
  ] },
  { title: 'Shipping', items: [
    ['How long does delivery take?', 'Orders are dispatched within 48 hours, and delivery takes 5 to 7 working days. During festive seasons and sale periods with high order volumes, processing or delivery may take slightly longer.'],
    ['How much is shipping?', 'Shipping is free on all orders, including cash on delivery. Enter your PIN code at checkout to check availability.'],
    ['Do you ship outside India?', 'Not yet through the site. Email us and we will arrange it.']
  ] },
  { title: 'Sizing', items: [
    ['Do your styles run true to size?', 'Yes. If you are between sizes, go one up. Our size guide has foot-length measurements for every size.'],
    ['What sizes do you make?', 'EU 35 to 41 (IND/UK 2 to 8). We do not make custom or made-to-order pairs.']
  ] },
  { title: 'Exchanges & returns', items: [
    ['Can I exchange for a different size?', 'Yes, within 5 days of delivery, unused, unworn and undamaged, in the original box. We pick up and send the new size.'],
    ['Can I return a pair for a refund?', 'No. Since every pair is made in small batches, we offer exchanges only, no refunds. Used, worn or damaged pairs cannot be exchanged. If you receive a wrong or defective pair, tell us within 48 hours and we will replace it.']
  ] }
];

const inr = n => '₹' + Math.round(n).toLocaleString('en-IN');
const fmtDate = d => d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
const addDays = n => { const d = new Date(); d.setDate(d.getDate() + n); return d; };
const load = (k, f) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? f : v; } catch (e) { return f; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

const REELS = [
  { video: 'assets/reels/first-look.mp4', poster: 'assets/p/v-09.jpg', caption: 'First Look, brocade on a gold wedge', pid: 'first-look' },
  { video: 'assets/reels/muse.mp4', poster: 'assets/p/bn-muse-1.jpg', caption: 'Muse, in pastel', pid: 'muse' },
  { video: 'assets/reels/after-glow.mp4', poster: 'assets/p/gh-top.jpg', caption: 'Golden Hour', pid: 'golden-hour' },
  { video: 'assets/reels/desertsand.mp4', poster: 'assets/p/bn-softfocus-2.jpg', caption: 'Soft Focus, all day', pid: 'soft-focus' },
  { video: 'assets/reels/daydream-pink.mp4', poster: 'assets/p/bn-daydream-2.jpg', caption: 'Day Dream, barely there', pid: 'daydream-b' },
  { video: 'assets/reels/champagne.mp4', poster: 'assets/p/bn-whisper-1.jpg', caption: 'Step in. Stand out.', pid: 'whisper' },
  { video: 'assets/reels/dune.mp4', poster: 'assets/p/bn-dune-2.jpg', caption: 'The Barely Edit 2026', pid: 'dune' }
];
const VID = Object.fromEntries(REELS.map(r => [r.pid, r.video]));
/* Product-page-only videos (not in the home reels) */
VID['desert-sand'] = 'assets/reels/desertsand.mp4';
/* Product-page videos per colour ('id:Colour'); these take the place of the reel above on that colour's page */
Object.assign(VID, {
  'whisper:Brown': 'assets/reels/whisper-brown.mp4', 'whisper:Beige': 'assets/reels/whisper-beige.mp4',
  'muse': 'assets/reels/muse.mp4', 'dune': 'assets/reels/dune.mp4', 'trace': 'assets/reels/trace.mp4',
  'daydream-b:Pink': 'assets/reels/daydream-pink.mp4',
  'twine:Pink': 'assets/reels/twine-pink.mp4', 'twine:Silver': 'assets/reels/twine-silver.mp4',
  'soft-focus': 'assets/reels/soft-focus.mp4', 'heirloom': 'assets/reels/heirloom.mp4', 'golden-hour': 'assets/reels/after-glow.mp4',
  'poise': 'assets/reels/poise.mp4', 'champagne': 'assets/reels/champagne.mp4', 'eclipse': 'assets/reels/eclipse.mp4', 'first-look': 'assets/reels/first-look.mp4'
});
const INTERESTS = ['Everyday flats & slides', 'Gold-detail pairs', 'Wedding & occasion'];

class Component extends DCLogic {
  rowA = React.createRef(); rowB = React.createRef(); reelRow = React.createRef();
  videoRef = el => { if (el) { el.muted = true; el.loop = true; el.playsInline = true; const pr = el.play && el.play(); if (pr && pr.catch) pr.catch(() => {}); } };
  reelEls = {}; reelRefs = {};
  reelRefFor(i) {
    if (!this.reelRefs[i]) this.reelRefs[i] = el => { this.reelEls[i] = el; if (el) { el.muted = true; el.playsInline = true; this.syncReels(); } };
    return this.reelRefs[i];
  }
  reelBox = el => {
    if (this.reelIO) { this.reelIO.disconnect(); this.reelIO = null; }
    if (!el) { if (this.state.reelInView) this.setState({ reelInView: false }); return; }
    this.reelIO = new IntersectionObserver(es => { const v = es.some(x => x.isIntersecting); if (v !== this.state.reelInView) this.setState({ reelInView: v }, () => this.syncReels()); }, { threshold: 0.45 });
    this.reelIO.observe(el);
  };
  stepReel(d) { const n = REELS.length; this.setState(st => ({ reelIdx: ((st.reelIdx + d) % n + n) % n }), () => this.syncReels()); }
  pickReel(i) { this.setState({ reelIdx: i }, () => this.syncReels()); }
  syncReels() {
    const s = this.state;
    Object.keys(this.reelEls).forEach(k => {
      const el = this.reelEls[k]; if (!el) return;
      if (+k === s.reelIdx && s.reelInView && s.page === 'home') { if (el.paused) { const p = el.play(); if (p && p.catch) p.catch(() => {}); } }
      else if (!el.paused) { el.pause(); }
      if (+k !== s.reelIdx && el.currentTime > 0 && el.paused) el.currentTime = 0;
    });
    clearTimeout(this.reelTimer);
    if (s.reelInView && s.page === 'home' && !REELS[s.reelIdx].video) this.reelTimer = setTimeout(() => this.stepReel(1), 4500);
  }
  componentDidUpdate() {
    const s = this.state, k = s.reelIdx + '|' + s.reelInView + '|' + s.page;
    if (k !== this._lastReel) { this._lastReel = k; this.syncReels(); }
  }
  scrollRow(ref, dir) { const el = ref.current; if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' }); }
  state = Object.assign({
    loading: true, vw: typeof window !== 'undefined' ? window.innerWidth : 1200, menuOpen: false,
    cart: load('auve_cart', []), orders: load('auve_orders', []), lastOrder: null,
    type: 'All styles', sort: 'featured',
    pdpImg: 0, pdpVar: 0, pdpSize: null, pdpQty: 1, pdpErr: '', sizeSys: load('auve_sizesys', 'EU'),
    toast: '', sizeGuide: false,
    co: { name: '', phone: '', email: '', address: '', city: '', state: 'Gujarat', pin: '' },
    ship: 'standard', pay: 'upi', upiApp: 'GPay', upiId: '', card: { num: '', name: '', exp: '', cvv: '' }, coErr: '',
    bulk: { name: '', email: '', city: '', date: '' }, bulkKind: 'Wedding / family', bulkNote: '', bulkSent: false, bulkErr: '',
    contact: { name: '', email: '' }, contactNote: '', contactSent: false,
    faqOpen: '0-0',
    tab: 'track', trackId: '', trackPhone: '', trackErr: '', trackShown: null,
    authStep: load('auve_auth', null) ? 'in' : 'phone', authErr: '', authNum: load('auve_auth', '') || '', otp: '',
    nl: { email: '', phone: '' }, nlPhone: '', nlSize: null, nlInt: [], nlMonth: '', nlSent: false, nlErr: '',
    promo: load('auve_promo', ''), promoInput: '', promoErr: '',
    quickId: null, reelIdx: 0, reelInView: false, popup: false
  }, this.parse(typeof location !== 'undefined' ? location.hash : ''));

  parse(h) {
    const parts = (h || '').replace(/^#\/?/, '').split('/').filter(Boolean);
    const page = PAGES.includes(parts[0]) ? parts[0] : 'home';
    return { page, arg: decodeURIComponent(parts[1] || '') };
  }

  sampleBgs() {
    const srcs = [...new Set(PRODUCTS.flatMap(p => p.variants.flatMap(v => v.imgs.slice(0, 2))))];
    srcs.forEach(src => {
      const im = new Image();
      im.onload = () => {
        try {
          const W = 60, H = Math.round(60 * im.naturalHeight / im.naturalWidth);
          const c = document.createElement('canvas'); c.width = W; c.height = H;
          const x = c.getContext('2d'); x.drawImage(im, 0, 0, W, H);
          const d = x.getImageData(0, 0, W, H).data; let r = 0, g = 0, b = 0, n = 0;
          for (let y = 0; y < H; y++) for (const xx of [0, 1, W - 2, W - 1]) { const i = (y * W + xx) * 4; r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; }
          const col = 'rgb(' + Math.round(r / n) + ',' + Math.round(g / n) + ',' + Math.round(b / n) + ')';
          this.setState(s => ({ bgs: Object.assign({}, s.bgs, { [src]: col }) }));
        } catch (e) {}
      };
      im.src = src;
    });
  }

  componentDidMount() {
    this.sampleBgs();
    /* Dynamic backend: learn whether online payments are live (Razorpay keys
       configured on the server) so checkout can label TEST mode honestly. */
    try { fetch('api/store-config').then(r => r.json()).then(c => { window.AUVE_STORE = c; this.setState({ payLive: !!c.paymentsLive }); }).catch(() => {}); } catch (e) {}
    this.timer = setTimeout(() => this.setState({ loading: false }), 2350);
    let seen = false; try { seen = sessionStorage.getItem('auve_popup_seen') === '1'; } catch (e) {}
    if (!seen && !load('auve_subscribers', []).length) {
      this.popupTimer = setTimeout(() => { try { sessionStorage.setItem('auve_popup_seen', '1'); } catch (e) {} this.setState({ popup: true }); }, (this.props.showLoader ?? true) ? 2700 : 600);
    }
    this.onHash = (to, opt) => {
      const hash = typeof to === 'string' ? to : location.hash;
      if (!(opt && opt.force) && hash === this.lastHash) return;
      this.lastHash = hash;
      const r = this.parse(hash);
      const extra = r.page === 'product' ? { pdpImg: 0, pdpVar: 0, pdpSize: null, pdpQty: 1, pdpErr: '' } : {};
      if (r.page === 'shop') extra.type = 'All styles';
      extra.collOpen = false;
      if (r.page === 'account' && r.arg) Object.assign(extra, { tab: 'track', trackId: r.arg, trackShown: this.state.orders.some(o => o.id.toLowerCase() === r.arg.toLowerCase()) ? r.arg : null, trackErr: '' });
      const y = opt && typeof opt.y === 'number' ? opt.y : 0;
      const de = document.scrollingElement || document.documentElement;
      const apply = () => {
        const upd = () => this.setState(Object.assign({ page: r.page, arg: r.arg, menuOpen: false, quickId: null }, extra));
        if (window.ReactDOM && ReactDOM.flushSync) ReactDOM.flushSync(upd); else upd();
        de.scrollTop = y; document.body.scrollTop = y;
      };
      /* Smooth page change: the page dips out, switches and lands at the right scroll position while hidden, then fades back in.
         Nothing moves on screen, so coming back to a page feels calm instead of jumping. */
      const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
      const root = document.getElementById('root');
      if (!this.navReady || reduce || !root) { apply(); return; }
      const token = (this.navToken = (this.navToken || 0) + 1);
      root.style.transition = 'opacity 0.18s ease';
      root.style.opacity = '0';
      setTimeout(() => {
        if (token !== this.navToken) return;
        apply();
        const started = Date.now();
        const land = () => {
          if (token !== this.navToken) return;
          const room = de.scrollHeight - window.innerHeight;
          if (y && room < y - 4 && Date.now() - started < 700) { requestAnimationFrame(land); return; }
          de.scrollTop = y;
          root.style.transition = 'opacity 0.38s cubic-bezier(0.22,1,0.36,1)';
          root.style.opacity = '1';
        };
        requestAnimationFrame(() => requestAnimationFrame(land));
      }, 180);
    };
    /* Browser back / forward between in-site pages: restore the page and where you were on it. */
    this.onPop = e => this.onHash(location.hash, { y: e.state && typeof e.state.y === 'number' ? e.state.y : 0 });
    window.addEventListener('popstate', this.onPop);
    this.onResize = () => { const w = document.documentElement.clientWidth || window.innerWidth; if (w && w !== this.state.vw) this.setState({ vw: w }); };
    window.addEventListener('hashchange', this.onHash);
    /* In-site links (#/...) navigate through go(), so they work even where the browser's own hash navigation is blocked (e.g. inside a preview frame). */
    this.onLinkClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target && e.target.closest ? e.target.closest('a[href^="#/"]') : null;
      if (!a || a.target === '_blank') return;
      e.preventDefault();
      this.go(a.getAttribute('href'));
    };
    document.addEventListener('click', this.onLinkClick, true);
    window.addEventListener('resize', this.onResize);
    this.onResize();
    window.addEventListener('load', this.onResize);
    requestAnimationFrame(this.onResize);
    this.vwTimers = [100, 500, 1500, 3000].map(t => setTimeout(this.onResize, t));
    if (typeof ResizeObserver !== 'undefined') { this.ro = new ResizeObserver(this.onResize); this.ro.observe(document.body); }
    this.lastHash = location.hash;
    try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}
    if (this.state.page === 'account' && this.state.arg) this.onHash(location.hash, { force: true });
    this.navReady = true;
  }
  componentWillUnmount() {
    clearTimeout(this.timer); clearTimeout(this.toastTimer); clearTimeout(this.popupTimer); if (this.onPopupScroll) window.removeEventListener('scroll', this.onPopupScroll); clearTimeout(this.reelTimer); if (this.reelIO) this.reelIO.disconnect(); if (this.ro) this.ro.disconnect(); (this.vwTimers || []).forEach(clearTimeout); window.removeEventListener('load', this.onResize);
    window.removeEventListener('hashchange', this.onHash);
    window.removeEventListener('popstate', this.onPop);
    document.removeEventListener('click', this.onLinkClick, true);
    window.removeEventListener('resize', this.onResize);
  }

  go(h) {
    try {
      if (location.hash !== h) {
        const st = history.state || {};
        history.replaceState(Object.assign({}, st, { y: window.scrollY || 0 }), '', location.href);
        history.pushState({ y: 0, d: (st.d || 0) + 1 }, '', h);
      }
    } catch (e) {}
    this.onHash(h, { force: true });
  }
  goBack() { const st = history.state || {}; if (st.d > 0) history.back(); else this.go(this.state.page === 'product' ? '#/shop' : '#/'); }
  setCart(fn) { this.setState(s => { const cart = fn(s.cart); save('auve_cart', cart); return { cart }; }); }
  showToast(t) { this.setState({ toast: t }); clearTimeout(this.toastTimer); this.toastTimer = setTimeout(() => this.setState({ toast: '' }), 2800); }

  chip(active) {
    return 'font-size: 12.5px; letter-spacing: 0.08em; padding: 10px 17px; border-radius: 999px; cursor: pointer; transition: all 0.22s ease; display: inline-block; border: 1px solid ' +
      (active ? 'var(--auve-ink); background: var(--auve-ink); color: var(--auve-bg);' : 'rgba(var(--auve-ink-rgb),0.2); background: none; color: var(--auve-muted2);');
  }
  optBox(active) {
    return 'display: flex; align-items: center; gap: 14px; width: 100%; padding: 16px 18px; border-radius: 4px; cursor: pointer; color: var(--auve-ink); background: ' + (active ? '#FFF' : 'transparent') + '; border: 1px solid ' + (active ? 'var(--auve-ink)' : 'rgba(var(--auve-ink-rgb),0.16)') + ';';
  }
  card(p, ov) {
    const v = p.variants[ov ? ov[2] : 0];
    const m = this.state.vw < 700;
    return {
      onQuick: e => { if (e) { e.preventDefault(); e.stopPropagation(); } this.setState({ quickId: p.id }); },
      infoStyle: 'display: flex; flex-direction: column; gap: 5px; margin-top: 12px;' + (m ? ' align-items: center; text-align: center;' : ''),
      metaStyle: m ? 'display: flex; flex-direction: column; align-items: center; gap: 8px; margin-top: 2px;' : 'display: flex; justify-content: space-between; align-items: center; margin-top: 2px;',
      href: '#/product/' + p.id, name: p.name, price: inr(p.price),
      sub: collOf(p.coll).name + ' · ' + p.variants.map(x => x.name).join(' / '),
      img: ov ? ov[0] : (p.cover || v.imgs[0]), img2: ov ? ov[1] : (p.cover2 || (p.cover ? v.imgs[0] : (v.imgs[1] || v.imgs[0]))),
      bgStyle: 'position: absolute; inset: 0; background: ' + ((this.state.bgs || {})[v.imgs[0]] || '#F3EFEA') + ';',
      bg2Style: 'position: absolute; inset: 0; background: ' + ((this.state.bgs || {})[v.imgs[1] || v.imgs[0]] || '#F3EFEA') + '; opacity: 0; transition: opacity 0.6s ease;',
      hasQuick: !!m, hasTag: !!p.tag, tag: p.tag || '',
      swatches: p.variants.map(x => ({ name: x.name, style: 'width: 12px; height: 12px; border-radius: 50%; background: ' + x.sw + '; box-shadow: inset 0 0 0 1px rgba(var(--auve-ink-rgb),0.18);' }))
    };
  }

  rate() { return 0; }
  totals(s, withCheckout) {
    const free = this.props.freeShippingOver ?? 0;
    const lines = s.cart.filter(c => BYID[c.id]);
    const pairs = lines.reduce((n, c) => n + c.qty, 0);
    const sub = lines.reduce((n, c) => n + BYID[c.id].price * c.qty, 0);
    const r = this.rate(pairs);
    const disc = Math.round(sub * r);
    const coupons = (window.AUVE_COUPONS || ((window.AUVE_SETTINGS || {}).coupons) || []);
    let promo = 0;
    let promoLabel = '';
    if (s.promo) {
      const cp = coupons.find(c => c.code.toUpperCase() === s.promo.toUpperCase() && c.active !== false);
      if (cp) {
        if (cp.type === 'flat') {
          promo = Math.min(sub - disc, Number(cp.value) || 0);
          promoLabel = 'Code ' + s.promo + ' · ₹' + cp.value + ' off';
        } else {
          const pct = Number(cp.value) || 10;
          promo = Math.round((sub - disc) * (pct / 100));
          promoLabel = 'Code ' + s.promo + ' · ' + pct + '% off';
        }
      } else {
        promo = Math.round((sub - disc) * 0.10);
        promoLabel = 'Code ' + s.promo + ' · 10% off';
      }
    }
    const after = Math.max(0, sub - disc - promo);
    let ship = 0;
    const cod = 0; /* cash on delivery is free */
    return {
      pairs, raw: { sub, disc, promo, after, ship, cod, total: after + ship + cod, free },
      view: {
        subtotal: inr(sub), hasDiscount: disc > 0, discount: inr(disc),
        discountLabel: 'Pair & Spare ' + Math.round(r * 100) + '% off',
        hasPromo: promo > 0, promo: inr(promo), promoLabel: promoLabel,
        shipping: ship === 0 ? 'Free' : inr(ship), hasCod: cod > 0, total: inr(after + ship + cod)
      }
    };
  }
  lineView(c) {
    const p = BYID[c.id]; const v = p.variants[c.v] || p.variants[0];
    return { href: '#/product/' + p.id, img: v.imgs[0], name: p.name, qty: c.qty, unitPrice: inr(p.price), meta: v.name + ' · EU ' + c.size + ' / IND ' + (c.size - 33), lineTotal: inr(c.lineTotal != null ? c.lineTotal : p.price * c.qty) };
  }

  /* BACKEND HOOK - Laravel: POST /api/orders (validate stock, totals, WELCOME10 first-order, free COD), then redirect to Razorpay hosted checkout. The local order below is a preview stand-in. */
  placeOrder() {
    const s = this.state; const co = s.co;
    const phone = co.phone.replace(/\D/g, '').slice(-10);
    const missing = [];
    if (!co.name.trim()) missing.push('name');
    if (phone.length !== 10) missing.push('10-digit mobile');
    if (!/^\S+@\S+\.\S+$/.test(co.email.trim())) missing.push('email');
    if (!co.address.trim()) missing.push('address');
    if (!co.city.trim()) missing.push('city');
    if (!/^\d{6}$/.test(co.pin.trim())) missing.push('6-digit pincode');
        if (missing.length) { this.setState({ coErr: 'Please add your ' + missing.join(', ') + '.' }); return; }
    const t = this.totals(s, true);
    const etaDays = [3, 5];
    const items = s.cart.filter(c => BYID[c.id]).map(c => { const pr = BYID[c.id]; return { productId: pr.id, name: pr.name, variant: (pr.variants[c.v] || pr.variants[0]).name, size: c.size, qty: c.qty, unitPrice: pr.price }; });
    const payload = {
      customer: { name: co.name.trim(), phone: '+91' + phone, email: co.email.trim(), address: co.address.trim(), city: co.city.trim(), state: co.state.trim(), pincode: co.pin.trim() },
      items, shipping: s.ship,
      payment: { method: s.pay, upiApp: s.pay === 'upi' && !s.upiId ? s.upiApp : null, upiId: s.pay === 'upi' && s.upiId ? s.upiId : null },
      promoCode: s.promo || null, clientTotals: t.raw
    };
    if (s.placing) return;
    this.setState({ placing: true, coErr: '', coWa: false });
    /* Dynamic backend (was a local preview stand-in): the order is saved by
       POST /api/orders, which validates stock and totals against
       data/products.json. Online payment goes through Razorpay Checkout when
       the server has keys configured; without keys the server saves the order
       in clearly labelled TEST mode (pay on delivery). */
    const self = this;
    const finishOrder = (orderId, methodLabel) => {
      const order = {
        id: orderId, at: Date.now(), phone, email: co.email.trim(), first: co.name.trim().split(' ')[0],
        lines: s.cart.map(c => self.lineView(c)),
        count: t.pairs + (t.pairs === 1 ? ' pair' : ' pairs'), total: inr(t.raw.total),
        address: [co.address, co.city, co.state + ' ' + co.pin].filter(Boolean).join(', '),
        method: methodLabel,
        eta: fmtDate(addDays(etaDays[0])) + ' to ' + fmtDate(addDays(etaDays[1]))
      };
      const orders = [order].concat(self.state.orders);
      save('auve_orders', orders); save('auve_cart', []); save('auve_promo', '');
      self.setState({ orders, cart: [], lastOrder: order.id, coErr: '', promo: '', placing: false, card: { num: '', name: '', exp: '', cvv: '' } });
      self.go('#/confirm');
    };
    const baseMethod = s.pay === 'upi' ? 'UPI' : s.pay === 'card' ? 'Card / net banking' : 'Cash on delivery';
    fetch('api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then(r => r.json())
      .then(res => {
        if (!res || !res.ok) { self.setState({ placing: false, coErr: (res && res.error) || 'Something went wrong placing your order. Please try again.' }); return; }
        if (res.paymentMode === 'razorpay' && res.razorpay) {
          const openCheckout = () => {
            const rzp = new window.Razorpay({
              key: res.razorpay.keyId, amount: res.razorpay.amount, currency: res.razorpay.currency || 'INR',
              order_id: res.razorpay.orderId, name: 'AUVÉ', description: 'Order ' + res.order.id,
              prefill: { name: co.name.trim(), email: co.email.trim(), contact: '+91' + phone },
              theme: { color: '#1B1A34' },
              handler: (resp) => {
                fetch('api/orders/confirm-payment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({ orderId: res.order.id }, resp)) })
                  .then(r2 => r2.json())
                  .then(v => {
                    if (v && v.ok) finishOrder(res.order.id, baseMethod);
                    else self.setState({ placing: false, coErr: 'Your payment went through but could not be verified. Please WhatsApp us with order ' + res.order.id + '.' });
                  })
                  .catch(() => self.setState({ placing: false, coErr: 'Your payment went through but could not be verified. Please WhatsApp us with order ' + res.order.id + '.' }));
              },
              modal: { ondismiss: () => self.setState({ placing: false, coErr: 'Payment was cancelled, so order ' + res.order.id + ' is not confirmed. You can try again, or choose cash on delivery.' }) }
            });
            rzp.open();
          };
          if (window.Razorpay) openCheckout();
          else { const sc = document.createElement('script'); sc.src = 'https://checkout.razorpay.com/v1/checkout.js'; sc.onload = openCheckout; sc.onerror = () => self.setState({ placing: false, coErr: 'Razorpay checkout could not load. Please try again or choose cash on delivery.' }); document.body.appendChild(sc); }
          return;
        }
        finishOrder(res.order.id, res.testMode ? baseMethod + ' (TEST - pay on delivery)' : baseMethod);
      })
      .catch(() => self.setState({ placing: false, coErr: 'We could not reach the server to place your order. Please check your connection and try again.' }));
  }

  cartAdd(p, vi, size, qty) {
    const key = p.id + '|' + vi + '|' + size;
    this.setCart(cart => cart.some(x => x.key === key) ? cart.map(x => x.key === key ? Object.assign({}, x, { qty: x.qty + qty }) : x) : cart.concat([{ key, id: p.id, v: vi, size, qty }]));
    return Promise.resolve(true);
  }
  cartQty(c, qty) { this.setCart(cart => cart.map(x => x.key === c.key ? Object.assign({}, x, { qty }) : x)); }
  cartRemove(c) { this.setCart(cart => cart.filter(x => x.key !== c.key)); }
  shipAvailable() { return true; }
  shipPriceLabel(kind, fallback) { return fallback; }
  pickShip(kind) { this.setState({ ship: kind }); }
  payAvailable() { return true; }
  pickPay(k) { this.setState({ pay: k }); }

  trackView(id) {
    const o = this.state.orders.find(x => x.id.toLowerCase() === String(id).toLowerCase());
    const td = this.state.trackData && String(this.state.trackData.id).toLowerCase() === String(id).toLowerCase() ? this.state.trackData : null;
    const at = o ? o.at : (td && td.placedAt ? Date.parse(td.placedAt) : Date.now());
    const stage = td && Number.isFinite(Number(td.stage)) ? Math.max(0, Math.min(4, Number(td.stage))) : 0;
    const labels = [['Order placed', fmtDate(new Date(at))], ['Order confirmed', 'Confirmation sent to your email'], ['Being made & packed', 'Finishing by hand in Surat'], ['Shipped', 'Tracking link sent by email'], ['Delivered', '']];
    return {
      id: o ? o.id : String(id).toUpperCase(),
      eta: td && td.eta ? td.eta : o ? o.eta : 'To be confirmed',
      steps: labels.map((l, i) => {
        const done = i <= stage, cur = i === stage;
        return {
          label: l[0], note: l[1],
          dot: 'width: 14px; height: 14px; border-radius: 50%; flex-shrink: 0; margin-top: 3px; ' + (done ? 'background: #B98E4F;' : 'background: #FAF5EF; border: 1px solid rgba(var(--auve-ink-rgb),0.25);') + (cur ? ' box-shadow: 0 0 0 5px rgba(185,142,79,0.2);' : ''),
          line: i === labels.length - 1 ? 'display: none;' : 'width: 1px; flex: 1; min-height: 26px; background: ' + (i < stage ? '#B98E4F' : 'rgba(var(--auve-ink-rgb),0.15)') + ';',
          labelStyle: 'font-size: 15px; color: ' + (done ? 'var(--auve-ink)' : 'var(--auve-muted)') + ';'
        };
      })
    };
  }

  renderVals() {
    const s = this.state;
    const wa = this.props.whatsappNumber ?? '+91 97251 24422';
    const email = this.props.email ?? 'contact@auve.in';
    let digits = wa.replace(/\D/g, ''); if (digits.length === 10) digits = '91' + digits;
    const waUrl = t => 'https://wa.me/' + digits + (t ? '?text=' + encodeURIComponent(t) : '');
    const free = this.props.freeShippingOver ?? 0;
    const wide = s.vw >= 1060;
    const mob = s.vw < 700;
    const T = this.totals(s, s.page === 'checkout');
    const cartLines = s.cart.filter(c => BYID[c.id]).map(c => Object.assign(this.lineView(c), {
      inc: () => this.cartQty(c, c.qty + 1),
      dec: () => this.cartQty(c, Math.max(1, c.qty - 1)),
      remove: () => this.cartRemove(c)
    }));

    // shop
    const coll = COLL[s.arg] ? s.arg : 'all';
    let list = PRODUCTS.filter(p => (coll === 'all' || p.coll === coll) && (s.type === 'All styles' || p.type === s.type));
    if (s.sort === 'low') list = list.slice().sort((a, b) => a.price - b.price);
    if (s.sort === 'high') list = list.slice().sort((a, b) => b.price - a.price);

    // pdp
    const p = BYID[s.arg] || PRODUCTS[0] || EMPTY_P;
    const pv = p.variants[s.pdpVar] || p.variants[0];
    const media = pv.imgs.map(src => ({ src, video: '' }));
    const pvid = VID[p.id + ':' + pv.name] || VID[p.id];
    if (pvid) media.splice(Math.min(1, media.length), 0, { src: pv.imgs[0], video: pvid });
    const imgIdx = Math.min(s.pdpImg, media.length - 1);
    const qtyRate = this.rate(s.pdpQty);
    const addToBag = then => {
      if (!s.pdpSize) { this.setState({ pdpErr: 'Pick your size first.' }); return false; }
      const size = s.pdpSize;
      this.cartAdd(p, s.pdpVar, size, s.pdpQty).then(ok => {
        if (!ok) return;
        this.setState({ pdpErr: '' });
        if (then) this.go(then); else this.showToast(p.name + ' · EU ' + size + ' added');
      });
      return true;
    };

    const order = s.orders.find(o => o.id === s.lastOrder) || null;
    const fieldsFrom = (key, defs) => defs.map(d => ({
      label: d[1], ph: d[2], mode: d[3] || 'text', value: s[key][d[0]],
      onChange: e => { const val = e.target.value; this.setState(st => ({ [key]: Object.assign({}, st[key], { [d[0]]: val }) })); }
    }));
    const navActive = h => (s.page === 'shop' && ('#/shop' + (s.arg ? '/' + s.arg : '')) === h) || ('#/' + s.page === h && h !== '#/shop');

    var _c = ((window.AUVE_SETTINGS || {}).content || {});
    var _d = ((window.AUVE_SETTINGS || {}).design || {});
    return {
      showLoader: (s.loading && (this.props.showLoader ?? true)),
      announcementText: (this.props.announcementText ?? 'Free shipping across India on all orders'),
      announcementLink: _c.announcementLink || '',
      announcementBg: _c.announcementBg || '#1B1A34',
      announcementColor: _c.announcementColor || '#FFFFFF',
      heroDesktopImg: _c.heroDesktopImage || 'assets/hero-desktop.jpg',
      heroMobileImg: _c.heroMobileImage || 'assets/hero-mobile.jpg',
      heroHeading1: _c.heroHeading1 || 'Step In.',
      heroHeading2: _c.heroHeading2 || 'Stand Out.',
      festiveHeading: _c.festiveHeading || 'Festive collection',
      bestsellersHeading: _c.bestsellersHeading || 'Bestsellers',
      craftHeading: _c.craftHeading || 'Handcrafted. Comfort first.',
      craftSubheading: _c.craftSubheading || 'From our hands, to your feet',
      craftBtnText: _c.craftBtnText || _c.btnShopAllText || 'Shop all pairs',
      craftBtnLink: _c.craftBtnLink || '#/shop',
      craftVideo: _c.craftVideo || 'assets/banner2.mp4',
      reelsHeading: _c.reelsHeading || 'Moments in motion',
      newsletterHeading: _c.newsletterHeading || 'Get 10% off',
      newsletterText: _c.newsletterText || 'New drops, restock alerts and early access to offers, straight to your inbox. 10% off your first order.',
      newsletterPlaceholder: _c.newsletterPlaceholder || 'Your mobile number',
      newsletterButton: _c.newsletterButton || 'Subscribe',
      newsletterCode: _c.newsletterCode || _c.announcementPromoCode || 'WELCOME10',
      btnShopAllText: _c.btnShopAllText || 'Shop all pairs',
      btnAddToBagText: _c.btnAddToBagText || 'Add to cart',
      btnBuyNowText: _c.btnBuyNowText || 'Buy now',
      whatsappNumber: wa, email, waLink: waUrl('Hi AUVÉ! I have a question.'), mailLink: 'mailto:' + email, telLink: 'tel:+' + digits,
      freeShipLine: 'Free shipping on all orders', codFee: inr(200),
      wide, narrow: !wide, menuOpen: s.menuOpen, menuLabel: s.menuOpen ? 'Close' : 'Menu',
      toggleMenu: () => this.setState(st => ({ menuOpen: !st.menuOpen })),
      menuLine1: 'display: block; width: 22px; height: 1.5px; background: var(--auve-ink); transition: transform .25s; transform: ' + (s.menuOpen ? 'translateY(6.5px) rotate(45deg)' : 'none') + ';',
      menuLine2: 'display: block; width: 22px; height: 1.5px; background: var(--auve-ink); transition: opacity .2s; opacity: ' + (s.menuOpen ? 0 : 1) + ';',
      menuLine3: 'display: block; width: 22px; height: 1.5px; background: var(--auve-ink); transition: transform .25s; transform: ' + (s.menuOpen ? 'translateY(-6.5px) rotate(-45deg)' : 'none') + ';',
      collOpen: !!s.collOpen, openColl: () => this.setState({ collOpen: true }), closeColl: () => this.setState({ collOpen: false }), toggleColl: () => this.setState({ collOpen: !s.collOpen }),
      collActive: s.page === 'shop' && !!COLL[s.arg], collBtnStyle: { display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', padding: '0 0 3px', cursor: 'pointer', font: 'inherit', letterSpacing: 'inherit', textTransform: 'inherit', color: 'var(--auve-ink)', whiteSpace: 'nowrap', borderBottom: '1px solid ' + (s.page === 'shop' && COLL[s.arg] ? 'var(--auve-ink)' : 'transparent') },
      collCaret: { display: 'inline-block', width: '6px', height: '6px', borderRight: '1.2px solid var(--auve-ink)', borderBottom: '1.2px solid var(--auve-ink)', transform: s.collOpen ? 'translateY(2px) rotate(-135deg)' : 'translateY(-2px) rotate(45deg)', transition: 'transform .2s' },
      headerLinks: [['Shop all', '#/shop'], ['Our story', '#/about'], ['Account', '#/account']].map(n => ({
        label: n[0], href: n[1], style: 'white-space: nowrap; padding-bottom: 3px; border-bottom: 1px solid ' + (navActive(n[1]) ? 'var(--auve-ink)' : 'transparent') + ';'
      })),
      navLinks: [['Shop all', '#/shop'], ['Our story', '#/about'], ['Account', '#/account']].map(n => ({
        label: n[0], href: n[1], style: 'white-space: nowrap; padding-bottom: 3px; border-bottom: 1px solid ' + (navActive(n[1]) ? 'var(--auve-ink)' : 'transparent') + ';'
      })),
      cartCount: T.pairs,
      videoRef: this.videoRef,

      isHome: s.page === 'home', isShop: s.page === 'shop', isProduct: s.page === 'product', isBag: s.page === 'bag',
      isCheckout: s.page === 'checkout', isConfirm: s.page === 'confirm', isAbout: s.page === 'about', isBulk: s.page === 'bulk',
      isContact: s.page === 'contact', isFaq: s.page === 'faq', isLegal: !!LEGAL[s.page], legal: LEGAL[s.page] || {}, legalUpdated: 'Last updated: ' + BIZ.updated,
      legalSections: ((LEGAL[s.page] || {}).sections || []).map(x => ({ h: x[0], p: x[1] })),
      legalTabs: Object.keys(LEGAL).map(k => ({ label: LEGAL[k].label, href: LEGAL[k].file, style: { padding: '9px 16px', borderRadius: '999px', fontSize: '13px', whiteSpace: 'nowrap', border: '1px solid ' + (s.page === k ? 'var(--auve-ink)' : 'rgba(var(--auve-ink-rgb),0.18)'), background: s.page === k ? 'var(--auve-ink)' : 'transparent', color: s.page === k ? 'var(--auve-bg)' : 'var(--auve-ink)' } })), isAccount: s.page === 'account',

      collections: Object.values(COLL).map(c => Object.assign({ href: '#/shop/' + c.key }, c)),
      featured: (PRODUCTS.length ? PRODUCTS.slice(0, 4) : pickIds(['heirloom', 'poise', 'whisper', 'first-look'], 4)).map(x => this.card(x)),
      latest: (PRODUCTS.length ? PRODUCTS.slice(0, mob ? 4 : 6) : []).map(x => this.card(x)),
      bestsellers: (PRODUCTS.length ? PRODUCTS.slice(0, mob ? 4 : 8) : []).map(x => this.card(x)),
      isMobile: mob, notMobile: !mob,
      b2SectionStyle: 'margin-top: 0; background: var(--auve-bg); color: var(--auve-ink); display: grid; grid-template-columns: ' + (mob ? '1fr' : 'repeat(3, minmax(0, 1fr))') + '; overflow: hidden;',
      b2TextStyle: 'padding: ' + (mob ? '28px 22px 34px' : 'clamp(32px, 4vw, 60px) clamp(22px, 5vw, 72px)') + '; display: flex; flex-direction: column; justify-content: center; gap: 14px; order: ' + (mob ? 2 : 1) + ';' + (mob ? '' : ' grid-column: span 1;'),
      b2VideoStyle: 'position: relative; min-height: ' + (mob ? '165vw' : 'clamp(540px, 64vw, 820px)') + ';' + (mob ? '' : ' grid-column: span 2;') + ' overflow: hidden; background: #111027; order: ' + (mob ? 1 : 2) + ';',
      rowStyle: mob ? 'display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 28px 12px;' : 'display: grid; grid-auto-flow: column; grid-auto-columns: minmax(200px, calc((100% - 64px) / 5)); gap: 16px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; padding-bottom: 6px;',
      shopGridStyle: mob ? 'display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 28px 12px;' : 'display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 36px 16px;',
      reelsM: REELS.map((r, i) => {
        const n = REELS.length; let off = ((i - s.reelIdx) % n + n) % n; if (off > n / 2) off -= n;
        const a = Math.abs(off);
        return { video: r.video || '', poster: r.poster, caption: r.caption, isVideo: !!r.video && a === 0, isPoster: !r.video || a !== 0, showBadge: !r.video,
          ref: this.reelRefFor(i), onEnded: () => { if (i === this.state.reelIdx) this.stepReel(1); },
          onPick: () => { if (off !== 0) this.pickReel(i); },
          shade: 'position: absolute; inset: 0; background: rgba(255,255,255,' + (a === 0 ? 0 : 0.35) + '); transition: background 0.6s ease; pointer-events: none; z-index: 1;',
          style: 'position: absolute; top: 0; left: 50%; height: 100%; aspect-ratio: 9 / 16; border-radius: 8px; overflow: hidden; background: #1B1A34; cursor: ' + (a ? 'pointer' : 'default') + '; transition: transform 0.6s cubic-bezier(0.22,1,0.36,1), opacity 0.6s ease; transform: translateX(calc(-50% + ' + (off * (mob ? 100 : 108)) + '%)) scale(' + (a === 0 ? 1 : 0.82) + '); opacity: ' + (a > 1 ? 0 : 1) + '; z-index: ' + (10 - a) + '; pointer-events: ' + (a > 1 ? 'none' : 'auto') + '; box-shadow: ' + (a === 0 ? '0 12px 30px rgba(var(--auve-ink-rgb),0.16)' : 'none') + ';' };
      }),
      reelActive: (() => { const rp = BYID[REELS[s.reelIdx].pid] || PRODUCTS[0] || EMPTY_P; return { href: '#/product/' + rp.id, name: rp.name, price: inr(rp.price), thumb: rp.variants[0].imgs[0] }; })(),
      reelDots: REELS.map((r, i) => ({ onPick: () => this.pickReel(i), style: 'width: ' + (i === s.reelIdx ? 22 : 7) + 'px; height: 7px; border-radius: 999px; border: none; padding: 0; cursor: pointer; transition: all 0.3s ease; background: ' + (i === s.reelIdx ? 'var(--auve-ink)' : 'rgba(var(--auve-ink-rgb),0.2)') + ';' })),
      reelTouchStart: e => { this.tx = e.touches[0].clientX; },
      reelTouchEnd: e => { const dx = e.changedTouches[0].clientX - (this.tx || 0); if (Math.abs(dx) > 40) this.stepReel(dx < 0 ? 1 : -1); },
      popupOpen: s.popup && !s.loading && !s.sizeGuide, closePopup: () => this.setState({ popup: false }),
      quickOpen: !!BYID[s.quickId], closeQuick: () => this.setState({ quickId: null }),
      quick: (() => {
        const q = BYID[s.quickId]; if (!q) return { sizes: [] };
        return { name: q.name, sub: q.variants[0].name, price: inr(q.price), img: q.variants[0].imgs[0], href: '#/product/' + q.id,
          sizes: SIZES.map(z => { const out = isOut(q, 0, z); return { label: sizeIn(z, s.sizeSys),
            onPick: () => { if (out) return; this.cartAdd(q, 0, z, 1).then(ok => { if (ok) { this.setState({ quickId: null }); this.showToast(q.name + ' · EU ' + z + ' added'); } }); },
            style: 'height: 48px; border-radius: 3px; font-size: 14px; cursor: ' + (out ? 'not-allowed' : 'pointer') + '; border: 1px solid rgba(var(--auve-ink-rgb),0.18); background: var(--auve-card); color: ' + (out ? '#B4ACA2' : 'var(--auve-ink)') + '; text-decoration: ' + (out ? 'line-through' : 'none') + ';' }; }) };
      })(),
      rowA: this.rowA, rowB: this.rowB, reelRow: this.reelRow,
      aPrev: () => this.scrollRow(this.rowA, -1), aNext: () => this.scrollRow(this.rowA, 1),
      bPrev: () => this.scrollRow(this.rowB, -1), bNext: () => this.scrollRow(this.rowB, 1),
      rPrev: () => this.stepReel(-1), rNext: () => this.stepReel(1), reelBox: this.reelBox,
      reelBoxStyle: mob ? 'position: relative; width: 100%; aspect-ratio: 1 / 1; overflow: hidden; touch-action: pan-y;' : 'position: relative; width: 100%; height: min(620px, 72vh); overflow: hidden;',
      reels: REELS.map(r => { const rp = BYID[r.pid] || PRODUCTS[0] || EMPTY_P; return { video: r.video || '', poster: r.poster, caption: r.caption, isVideo: !!r.video, isPoster: !r.video, href: '#/product/' + rp.id, name: rp.name, price: inr(rp.price), thumb: rp.variants[0].imgs[0] }; }),
      nlFields: fieldsFrom('nl', [['email', 'Email', 'priya@email.com', 'email'], ['phone', 'WhatsApp (optional)', '98XXX XXXXX', 'tel']]),
      nlSizes: SIZES.map(z => ({ label: String(z), onPick: () => this.setState({ nlSize: s.nlSize === z ? null : z }), style: 'height: 42px; border-radius: 3px; font-size: 13.5px; cursor: pointer; border: 1px solid ' + (s.nlSize === z ? '#B98E4F' : 'rgba(243,230,216,0.25)') + '; background: ' + (s.nlSize === z ? '#B98E4F' : 'transparent') + '; color: #FFF;' })),
      nlInterests: INTERESTS.map(i => { const on = s.nlInt.includes(i); return { label: i, onPick: () => this.setState(st => ({ nlInt: on ? st.nlInt.filter(x => x !== i) : st.nlInt.concat([i]) })), style: 'font-size: 12.5px; letter-spacing: 0.04em; padding: 10px 15px; border-radius: 999px; cursor: pointer; border: 1px solid ' + (on ? '#B98E4F' : 'rgba(243,230,216,0.25)') + '; background: ' + (on ? '#B98E4F' : 'transparent') + '; color: #FFF;' }; }),
      nlPhone: s.nlPhone, onNlPhone: e => this.setState({ nlPhone: e.target.value, nlErr: '' }),
      nlMonth: s.nlMonth, onNlMonth: e => this.setState({ nlMonth: e.target.value }),
      nlOpen: !s.nlSent, nlSent: s.nlSent, hasNlErr: !!s.nlErr, nlErr: s.nlErr,
      /* BACKEND HOOK - Laravel: POST /api/newsletter (email). */
      submitNl: () => {
        if (!/^\S+@\S+\.\S+$/.test(s.nlPhone.trim())) { this.setState({ nlErr: 'Enter a valid email address.' }); return; }
        save('auve_subscribers', load('auve_subscribers', []).concat([{ at: new Date().toISOString() }]));
        const first = this.state.orders.length === 0;
        if (first) save('auve_promo', 'WELCOME10');
        this.setState({ nlSent: true, nlErr: '', promo: first ? 'WELCOME10' : this.state.promo });
      },
      nlSummary: (s.orders.length ? 'Your code is ready.' : 'Your code is already applied to your cart.') + ' We\'ll email new drops to ' + s.nlPhone.trim() + '.',
      promoOn: !!s.promo, promoOff: !s.promo, promoCode: s.promo,
      promoInput: s.promoInput, onPromoInput: e => this.setState({ promoInput: e.target.value, promoErr: '' }),
      hasPromoErr: !!s.promoErr, promoErr: s.promoErr,
      applyPromo: () => {
        const code = s.promoInput.trim().toUpperCase();
        if (!code) return;
        const coupons = (window.AUVE_COUPONS || ((window.AUVE_SETTINGS || {}).coupons) || []);
        let cp = coupons.find(c => c.code.toUpperCase() === code && c.active !== false);
        if (!cp && code === 'WELCOME10') {
          cp = { code: 'WELCOME10', type: 'percent', value: 10, min: 0 };
        }
        if (!cp) {
          this.setState({ promoErr: "That coupon code isn't valid." });
          return;
        }
        const lines = s.cart.filter(c => BYID[c.id]);
        const sub = lines.reduce((n, c) => n + BYID[c.id].price * c.qty, 0);
        if (cp.min && sub < cp.min) {
          this.setState({ promoErr: 'Minimum order of ₹' + cp.min + ' required for code ' + cp.code + '.' });
          return;
        }
        save('auve_promo', cp.code);
        this.setState({ promo: cp.code, promoInput: '', promoErr: '' });
      },
      removePromo: () => { save('auve_promo', ''); this.setState({ promo: '' }); },

      shopEyebrow: coll === 'all' ? 'Shop' : COLL[coll].tag,
      shopTitle: coll === 'all' ? 'Every pair, in stock.' : COLL[coll].name,
      shopBlurb: coll === 'all' ? PRODUCTS.length + ' handmade pairs across three collections. Sizes EU 35 to 41.' : COLL[coll].blurb,
      collChips: [['All', 'all'], ['The Barely Edit', 'barely'], ['Gilded', 'gilded'], ['Veil & Vow', 'veil']].map(c => ({ label: c[0], href: c[1] === 'all' ? '#/shop' : '#/shop/' + c[1], style: this.chip(coll === c[1]) })),
      typeChips: TYPES.map(t => ({ label: t, style: this.chip(s.type === t), onPick: () => this.setState({ type: t }) })),
      sort: s.sort, onSort: e => this.setState({ sort: e.target.value }),
      shopCount: list.length + (list.length === 1 ? ' pair' : ' pairs'),
      shopList: list.map(x => this.card(x)),

      pdp: {
        goBack: () => this.goBack(),
        name: p.name, desc: pv.desc || p.desc, details: (() => { const d = Object.fromEntries(p.details || []); const flat = d['Heel type'] === 'Flat' || p.type === 'Flats' || p.type === 'Slides'; return (flat ? [['Heel type', 'Flat'], ['Toe shape', d['Toe']], ['Colour', pv.name]] : [['Heel type', d['Heel type']], ['Heel size', d['Heel height']], ['Toe shape', d['Toe']], ['Colour', pv.name]]).filter(r => r[1]); })(), type: p.type.replace(/s$/, ''), collName: collOf(p.coll).name, collHref: '#/shop/' + p.coll,
        unitPrice: inr(p.price), mainImg: media[imgIdx].src, isVideo: !!media[imgIdx].video, mainVideo: media[imgIdx].video, multi: media.length > 1, imgCount: (imgIdx + 1) + ' / ' + media.length,
        prevImg: () => this.setState({ pdpImg: (imgIdx - 1 + media.length) % media.length }),
        nextImg: () => this.setState({ pdpImg: (imgIdx + 1) % media.length }),
        thumbs: media.map((m, i) => ({ src: m.src, isVideo: !!m.video, onPick: () => this.setState({ pdpImg: i }), style: 'position: relative; padding: 0; aspect-ratio: 4 / 5; overflow: hidden; border-radius: 2px; cursor: pointer; background: #F3EFEA; border: 1px solid ' + (i === imgIdx ? 'var(--auve-ink)' : 'transparent') + '; opacity: ' + (i === imgIdx ? 1 : 0.7) + ';' })),
        varName: pv.name,
        swatches: p.variants.map((v, i) => ({ name: v.name, sw: v.sw, onPick: () => this.setState({ pdpVar: i, pdpImg: 0 }), style: 'display: inline-flex; align-items: center; gap: 8px; padding: 9px 14px; cursor: pointer; background: transparent; color: var(--auve-ink); font-size: 13.5px; border-radius: 2px; border: 1px solid ' + (i === s.pdpVar ? 'var(--auve-ink)' : 'rgba(var(--auve-ink-rgb),0.2)') + ';' })),
        sizeLabel: s.pdpSize ? (() => { const r = SIZE_ROWS.find(x => +x.eu === s.pdpSize) || {}; return 'EU ' + r.eu + ' · IND ' + r.ind + ' · US ' + r.us; })() : 'Select',
        sysTabs: ['EU', 'IND', 'US'].map(k => { const on = (s.sizeSys || 'EU') === k; return { label: k, onPick: () => { save('auve_sizesys', k); this.setState({ sizeSys: k }); }, style: 'border: none; cursor: pointer; padding: 6px 12px; border-radius: 999px; font-size: 11px; letter-spacing: 0.1em; background: ' + (on ? 'var(--auve-ink)' : 'transparent') + '; color: ' + (on ? 'var(--auve-bg)' : 'var(--auve-ink)') + ';' }; }),
        sizes: SIZES.map(z => {
          const out = isOut(p, s.pdpVar, z), on = s.pdpSize === z;
          return {
            label: sizeIn(z, s.sizeSys), onPick: () => { if (!out) this.setState({ pdpSize: z, pdpErr: '' }); },
            style: 'height: 48px; border-radius: 3px; font-size: 14px; cursor: ' + (out ? 'not-allowed' : 'pointer') + '; border: 1px solid ' + (on ? 'var(--auve-ink)' : 'rgba(var(--auve-ink-rgb),0.18)') + '; background: ' + (on ? 'var(--auve-ink)' : 'var(--auve-card)') + '; color: ' + (on ? 'var(--auve-bg)' : out ? '#B4ACA2' : 'var(--auve-ink)') + '; text-decoration: ' + (out ? 'line-through' : 'none') + ';'
          };
        }),
        hasErr: !!s.pdpErr, err: s.pdpErr,
        qty: s.pdpQty, inc: () => this.setState(st => ({ pdpQty: Math.min(5, st.pdpQty + 1) })), dec: () => this.setState(st => ({ pdpQty: Math.max(1, st.pdpQty - 1) })),
        lineTotal: inr(p.price * s.pdpQty * (1 - qtyRate)),
        add: () => addToBag(null), buyNow: () => addToBag('#/checkout')
      },
      related: PRODUCTS.filter(x => x.coll === p.coll && x.id !== p.id).slice(0, 4).map(x => this.card(x)),
      openSizeGuide: () => this.setState({ sizeGuide: true }), closeSizeGuide: () => this.setState({ sizeGuide: false }),
      sizeGuide: s.sizeGuide, sizeRows: SIZE_ROWS,

      cartEmpty: cartLines.length === 0, cartFull: cartLines.length > 0, cartLines, t: T.view,
      pairsLabel: T.pairs + (T.pairs === 1 ? ' pair' : ' pairs'),
      bagNudge: T.raw.after < free ? 'Add ' + inr(free - T.raw.after) + ' more for free shipping.' : 'Free shipping unlocked.',

      coFields: fieldsFrom('co', [['name', 'Full name', 'Priya Shah'], ['phone', 'Mobile', '98XXX XXXXX', 'tel'], ['email', 'Email', 'priya@email.com', 'email'], ['address', 'House, street, area', 'B-402, Shanti Residency, Vesu'], ['city', 'City', 'Surat'], ['state', 'State', 'Gujarat'], ['pin', 'Pincode', '395007', 'numeric']]),
      shipOpts: [['standard', 'Standard', '5 to 7 working days · arrives by ' + fmtDate(addDays(7)), this.shipPriceLabel('standard', T.raw.after >= free ? 'Free' : inr(99))]].filter(o => this.shipAvailable(o[0])).map(o => ({
        label: o[1], eta: o[2], price: o[3], onPick: () => this.pickShip(o[0]), style: this.optBox(s.ship === o[0]),
        dot: 'width: 16px; height: 16px; border-radius: 50%; flex-shrink: 0; border: ' + (s.ship === o[0] ? '5px solid var(--auve-ink)' : '1px solid rgba(var(--auve-ink-rgb),0.35)') + ';'
      })),
      payOpts: [['upi', 'UPI', 'GPay · PhonePe · Paytm'], ['card', 'Card', 'Debit · Credit'], ['cod', 'Cash on delivery', 'Free']].filter(o => this.payAvailable(o[0])).map(o => ({
        label: o[1], sub: o[2], onPick: () => this.pickPay(o[0]),
        style: 'display: flex; flex-direction: column; gap: 4px; align-items: flex-start; text-align: left; padding: 14px; border-radius: 4px; cursor: pointer; color: var(--auve-ink); background: ' + (s.pay === o[0] ? '#FFF' : 'transparent') + '; border: 1px solid ' + (s.pay === o[0] ? 'var(--auve-ink)' : 'rgba(var(--auve-ink-rgb),0.16)') + ';'
      })),
      payUpi: s.pay === 'upi', payCard: s.pay === 'card', payCod: s.pay === 'cod',
      upiApps: [].map(a => ({ label: a, style: this.chip(s.upiApp === a && !s.upiId), onPick: () => this.setState({ upiApp: a, upiId: '' }) })),
      upiId: s.upiId, onUpiId: e => this.setState({ upiId: e.target.value }),
      cardFields: fieldsFrom('card', [['num', 'Card number', '1234 5678 9012 3456', 'numeric'], ['name', 'Name on card', 'Priya Shah'], ['exp', 'Expiry', 'MM / YY', 'numeric'], ['cvv', 'CVV', '•••', 'numeric']]).map((f, i) => Object.assign(f, {
        wrap: 'display: flex; flex-direction: column; gap: 7px; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--auve-muted);' + (i < 2 ? ' grid-column: 1 / -1;' : '')
      })),
      hasCoErr: !!s.coErr, coErr: s.coErr,
      upiIdOn: false, cardFieldsOn: false,
      upiNote: s.payLive ? "You'll pay on Razorpay's secure checkout using GPay, PhonePe, Paytm or any UPI app." : "TEST MODE: online payment is not live yet (no Razorpay keys configured), so no payment will be taken. Your order is saved as pay on delivery.",
      cardNote: s.payLive ? "You'll pay on Razorpay's secure checkout by card, net banking or wallet. Card details are never entered on this site." : "TEST MODE: online payment is not live yet (no Razorpay keys configured), so no payment will be taken. Your order is saved as pay on delivery.",
      coWhatsApp: !!s.coWa,
      coWaLink: waUrl("Hi AUVÉ! I'd like to order:\n" + cartLines.map(c => '• ' + c.name + ' (' + c.meta + ') × ' + c.qty).join('\n') + '\nTotal: ' + T.view.total + (s.co.name ? '\nName: ' + s.co.name : '') + (s.co.phone ? '\nMobile: ' + s.co.phone : '') + (s.co.address ? '\nAddress: ' + [s.co.address, s.co.city, s.co.state + ' ' + s.co.pin].filter(Boolean).join(', ') : '') + '\nPayment: ' + (s.pay === 'cod' ? 'Cash on delivery' : s.pay === 'upi' ? 'UPI' : 'Card')),
      placeLabel: s.placing ? 'Please wait…' : s.pay === 'cod' ? 'Place order · ' + T.view.total : 'Pay ' + T.view.total,
      placeOrder: () => this.placeOrder(),

      hasOrder: !!order, noOrder: !order,
      order: order ? Object.assign({ trackHref: '#/account/' + order.id }, order) : { lines: [] },

      waBulk: waUrl('Hi AUVÉ! I would like a bulk quote.'),
      bulkKinds: ['Wedding / family', 'Gifting', 'Retailer / reseller', 'Other'].map(k => ({ label: k, style: this.chip(s.bulkKind === k), onPick: () => this.setState({ bulkKind: k }) })),
      bulkFields: fieldsFrom('bulk', [['name', 'Your name', 'Priya Shah'], ['email', 'Email', 'priya@email.com', 'email'], ['city', 'City', 'Surat'], ['date', 'Needed by', '14 December']]),
      bulkNote: s.bulkNote, onBulkNote: e => this.setState({ bulkNote: e.target.value }),
      hasBulkErr: !!s.bulkErr, bulkErr: s.bulkErr,
      bulkOpen: !s.bulkSent, bulkSent: s.bulkSent,
      submitBulk: () => {
        if (!s.bulk.name.trim() || !/^\S+@\S+\.\S+$/.test(s.bulk.email.trim())) { this.setState({ bulkErr: 'Add your name and a valid email address.' }); return; }
        this.setState({ bulkSent: true, bulkErr: '' });
      },
      bulkMsg: (s.bulk.name ? s.bulk.name.split(' ')[0] + ', we' : 'We') + ' have your ' + s.bulkKind.toLowerCase() + ' request and will email ' + (s.bulk.email || 'you') + ' with a quote within a few hours.',
      waBulkFilled: waUrl('Hi AUVÉ! Bulk enquiry (' + s.bulkKind + ') from ' + s.bulk.name + (s.bulk.city ? ', ' + s.bulk.city : '') + (s.bulk.date ? '. Needed by ' + s.bulk.date : '') + '. ' + s.bulkNote),

      contactFields: fieldsFrom('contact', [['name', 'Your name', 'Priya Shah'], ['email', 'Your email', 'priya@email.com', 'email']]),
      contactNote: s.contactNote, onContactNote: e => this.setState({ contactNote: e.target.value }),
      contactOpen: !s.contactSent, contactSent: s.contactSent,
      submitContact: () => {
        /* BACKEND HOOK - Laravel: POST /api/contact. Preview opens the visitor's email app. */
        const body = 'Hi AUVÉ! ' + (s.contact.name.trim() ? 'This is ' + s.contact.name.trim() + '. ' : '') + s.contactNote + (s.contact.email.trim() ? '\n\nReply to: ' + s.contact.email.trim() : '');
        window.location.href = 'mailto:' + BIZ.email + '?subject=' + encodeURIComponent('Website enquiry') + '&body=' + encodeURIComponent(body); this.setState({ contactSent: true });
      },
      resetContact: () => this.setState({ contactSent: false, contact: { name: '', email: '' }, contactNote: '' }),
      contactMsg: 'Thanks' + (s.contact.name ? ', ' + s.contact.name.split(' ')[0] : '') + '. We reply by email within a few hours, 10am to 8pm.',

      faqGroups: FAQ.map((g, gi) => ({
        title: g.title,
        items: g.items.map((q, qi) => {
          const k = gi + '-' + qi, open = s.faqOpen === k;
          return { q: q[0], a: q[1], open, sign: open ? '−' : '+', toggle: () => this.setState({ faqOpen: open ? '' : k }) };
        })
      })),

      accountTitle: s.tab === 'track' ? 'Track your order' : 'Your account',
      accountTabs: [['track', 'Track order'], ['signin', s.authStep === 'in' ? 'My orders' : 'Sign in']].map(t => ({ label: t[1], style: this.chip(s.tab === t[0]), onPick: () => this.setState({ tab: t[0] }) })),
      tabTrack: s.tab === 'track', tabSignin: s.tab === 'signin',
      trackId: s.trackId, onTrackId: e => this.setState({ trackId: e.target.value }),
      trackPhone: s.trackPhone, onTrackPhone: e => this.setState({ trackPhone: e.target.value }),
      hasTrackErr: !!s.trackErr, trackErr: s.trackErr,
      /* BACKEND HOOK - Laravel: GET /api/orders/{id}/track. Preview only finds orders on this device. */
      doTrack: () => {
        const id = s.trackId.trim();
        if (!/^auv\d{4,8}$/i.test(id)) { this.setState({ trackErr: 'Order numbers look like AUV48213. Check your confirmation message.', trackShown: null }); return; }
        if (!s.orders.some(o => o.id.toLowerCase() === id.toLowerCase())) { this.setState({ trackErr: "We couldn't find that order on this device. Email your order number to " + BIZ.email + " for an update.", trackShown: null }); return; }
        this.setState({ trackShown: id, trackErr: '' });
      },
      hasTrack: !!s.trackShown, track: s.trackShown ? this.trackView(s.trackShown) : { steps: [] },
      authPhone: s.authStep === 'phone', authOtp: s.authStep === 'otp', authIn: s.authStep === 'in',
      authNum: s.authNum, onAuthNum: e => this.setState({ authNum: e.target.value }),
      otp: s.otp, onOtp: e => this.setState({ otp: e.target.value.replace(/\D/g, '').slice(0, 4) }),
      /* BACKEND HOOK - Laravel: POST /api/auth/otp (send OTP). */
      sendOtp: () => {
        const ph = s.authNum.replace(/\D/g, '').slice(-10);
        if (ph.length !== 10) { this.setState({ authErr: 'Enter a valid 10-digit mobile number.' }); return; }
        this.setState({ authStep: 'otp', otp: '', authErr: '' });
      },
      /* BACKEND HOOK - Laravel: POST /api/auth/verify (check OTP, start session). Preview accepts any 4 digits. */
      verifyOtp: () => {
        if (s.otp.length !== 4) return;
        save('auve_auth', s.authNum);
        this.setState({ authStep: 'in', authErr: '' });
      },
      hasAuthErr: !!s.authErr, authErr: s.authErr,
      backToPhone: () => this.setState({ authStep: 'phone' }),
      signOut: () => { save('auve_auth', null); this.setState({ authStep: 'phone', otp: '' }); },
      noOrders: s.orders.length === 0,
      myOrders: s.orders.map(o => ({ id: o.id, count: o.count, total: o.total, date: fmtDate(new Date(o.at)), track: () => this.setState({ tab: 'track', trackId: o.id, trackShown: o.id }) })),

      hasToast: !!s.toast, toast: s.toast
    };
  }
}

/* ---- template (compiled) ---- */
function renderTemplate(v0) {
  return [h("div", { "style": {"fontFamily":"Montserrat, system-ui, sans-serif","color":"var(--auve-ink)","background":"var(--auve-bg)","position":"relative","minHeight":"100vh"} }, "\n\n  ", (R(v0, "showLoader") ? h(F, null, "\n    ", h("div", { "style": {"position":"fixed","inset":"0","zIndex":"300","background":"#1B1A34","display":"flex","flexDirection":"column","alignItems":"center","justifyContent":"center","gap":"28px","animation":"auveLoaderOut 2.4s cubic-bezier(0.4,0,0.2,1) forwards","pointerEvents":"none"} }, "\n      ", h("div", { "style": {"position":"relative","width":"128px","height":"128px","display":"flex","alignItems":"center","justifyContent":"center"} }, "\n        ", h("div", { "style": {"position":"absolute","inset":"0","borderRadius":"50%","border":"1px solid rgba(185,142,79,0.25)"} }), "\n        ", h("div", { "style": {"position":"absolute","inset":"0","borderRadius":"50%","border":"1px solid transparent","borderTopColor":"#B98E4F","animation":"auveRing 1.1s linear infinite"} }), "\n        ", h("img", { "src": "assets/logo-cream.png", "alt": "AUVÉ", "style": {"height":"28px","width":"auto","display":"block","animation":"auveMarkIn 1.5s cubic-bezier(0.22,1,0.36,1) forwards"} }), "\n      "), "\n      ", h("div", { "style": {"width":"160px","height":"1px","background":"rgba(243,230,216,0.2)","overflow":"hidden"} }, "\n        ", h("div", { "style": {"width":"100%","height":"100%","background":"#B98E4F","transformOrigin":"left","animation":"auveBarFill 1.8s cubic-bezier(0.55,0,0.3,1) forwards"} }), "\n      "), "\n    "), "\n  ") : null), "\n\n  ", (R(v0, "announcementText") ? h("div", { "style": {"padding":"9px 20px","background":R(v0, "announcementBg") || "#1B1A34","color":R(v0, "announcementColor") || "#FFFFFF","fontSize":"11px","letterSpacing":"0.15em","textTransform":"uppercase","textAlign":"center"} }, R(v0, "announcementLink") ? h("a", { "href": R(v0, "announcementLink"), "style": {"color":"inherit","textDecoration":"none"} }, X(R(v0, "announcementText"))) : X(R(v0, "announcementText"))) : null), "\n\n  ", h("header", { "style": {"position":"sticky","top":"0","zIndex":"80","background":"var(--auve-bg-glass)","backdropFilter":"blur(14px)","borderBottom":"1px solid rgba(var(--auve-ink-rgb),0.09)"} }, "\n    ", h("div", { "style": {"maxWidth":"1320px","margin":"0 auto","padding":"16px 22px","display":"flex","alignItems":"center","gap":"18px"} }, "\n      ", h("a", { "href": "#/", "aria-label": "AUVÉ home", "style": {"display":"block","flexShrink":"0"} }, h("img", { "src": "assets/logo-navy.png", "alt": "AUVÉ", "style": {"height":"32px","width":"auto","display":"block"} })), "\n      ", (R(v0, "wide") ? h(F, null, "\n        ", h("nav", { "style": {"display":"flex","gap":"24px","marginLeft":"14px","fontSize":"12.5px","letterSpacing":"0.1em","textTransform":"uppercase"} }, "\n          ", A(R(v0, "headerLinks")).map((it, i) => { const v1 = Object.assign({}, v0, { "n": it, $index: i }); return h(F, { key: i }, "\n            ", h("a", { "href": R(v1, "n.href"), "style": S(R(v1, "n.style")) }, X(R(v1, "n.label"))), "\n          "); }).slice(0, 1), h("div", { "onMouseEnter": R(v0, "openColl"), "onMouseLeave": R(v0, "closeColl"), "style": {"position":"relative"} }, h("button", { "onClick": R(v0, "toggleColl"), "aria-expanded": R(v0, "collOpen"), "style": R(v0, "collBtnStyle") }, "Shop by collection", h("span", { "style": R(v0, "collCaret") })), (R(v0, "collOpen") ? h("div", { "style": {"position":"absolute","top":"100%","left":"-22px","paddingTop":"18px","zIndex":"60"} }, h("div", { "style": {"background":"var(--auve-bg)","border":"1px solid rgba(var(--auve-ink-rgb),0.1)","boxShadow":"0 18px 40px rgba(27,26,52,0.12)","padding":"18px","display":"grid","gridTemplateColumns":"repeat(3, 190px)","gap":"14px","textTransform":"none","letterSpacing":"0"} }, A(R(v0, "collections")).map((c, i) => h("a", { key: i, "href": c.href, "onClick": R(v0, "closeColl"), "style": {"display":"flex","flexDirection":"column","gap":"10px","color":"var(--auve-ink)"} }, h("div", { "style": {"aspectRatio":"4 / 5","overflow":"hidden","background":"#F3EFEA"} }, (c.video ? h("video", { "src": c.video, "poster": c.poster || c.img, "autoPlay": true, "muted": true, "loop": true, "playsInline": true, "preload": "metadata", "style": {"width":"100%","height":"100%","objectFit":"cover","display":"block"} }) : h("img", { "src": c.img, "alt": "", "style": {"width":"100%","height":"100%","objectFit":"cover","display":"block"} }))), h("div", { "style": {"display":"flex","flexDirection":"column","gap":"3px"} }, h("span", { "style": {"fontFamily":"Belleza, sans-serif","fontSize":"18.1px","lineHeight":"1.1"} }, c.name), h("span", { "style": {"fontSize":"11px","letterSpacing":"0.14em","textTransform":"uppercase","color":"var(--auve-muted)"} }, c.tag)))))) : null)), A(R(v0, "headerLinks")).slice(1).map((it, i) => h("a", { key: 'h' + i, "href": it.href, "style": S(it.style) }, it.label)), "\n        "), "\n      ") : null), "\n      ", h("div", { "style": {"flex":"1"} }), "\n      ", h("a", { "href": "#/bag", "style": {"display":"flex","alignItems":"center","gap":"8px","fontSize":"12.5px","letterSpacing":"0.1em","textTransform":"uppercase","whiteSpace":"nowrap"} }, "\n        Cart\n        ", h("span", { "style": {"minWidth":"21px","height":"21px","padding":"0 5px","display":"inline-flex","alignItems":"center","justifyContent":"center","borderRadius":"999px","background":"var(--auve-btn)","color":"var(--auve-btn-ink)","fontSize":"11px"} }, X(R(v0, "cartCount"))), "\n      "), "\n      ", h("button", { "onClick": R(v0, "toggleMenu"), "aria-label": "Menu", "style": {"background":"none","border":"none","width":"44px","height":"44px","marginRight":"-11px","display":"flex","flexDirection":"column","alignItems":"center","justifyContent":"center","gap":"5px","cursor":"pointer"} }, "\n        ", h("span", { "style": S(R(v0, "menuLine1")) }), "\n        ", h("span", { "style": S(R(v0, "menuLine2")) }), "\n        ", h("span", { "style": S(R(v0, "menuLine3")) }), "\n      "), "\n    "), "\n    ", (R(v0, "menuOpen") ? h(F, null, "\n      ", h("div", { "style": {"borderTop":"1px solid rgba(var(--auve-ink-rgb),0.09)","maxWidth":"1320px","margin":"0 auto","padding":"10px 22px 22px","display":"flex","flexDirection":"column"} }, "\n        ", A(R(v0, "navLinks")).map((it, i) => { const v1 = Object.assign({}, v0, { "n": it, $index: i }); return h(F, { key: i }, "\n          ", h("a", { "href": R(v1, "n.href"), "style": {"padding":"14px 0","borderBottom":"1px solid rgba(var(--auve-ink-rgb),0.07)","fontFamily":"Belleza, sans-serif","fontSize":"20.6px"} }, X(R(v1, "n.label"))), (i === 0 ? h("div", { "style": {"display":"flex","flexDirection":"column","padding":"14px 0 8px","borderBottom":"1px solid rgba(var(--auve-ink-rgb),0.07)"} }, h("div", { "style": {"fontSize":"11px","letterSpacing":"0.2em","textTransform":"uppercase","color":"#A8743F","marginBottom":"4px"} }, "Shop by collection"), A(R(v0, "collections")).map((c, j) => h("a", { key: j, "href": c.href, "style": {"padding":"10px 0","fontFamily":"Belleza, sans-serif","fontSize":"18.1px","display":"flex","justifyContent":"space-between","alignItems":"baseline","gap":"12px"} }, c.name, h("span", { "style": {"fontFamily":"Montserrat, system-ui, sans-serif","fontSize":"11px","letterSpacing":"0.14em","textTransform":"uppercase","color":"var(--auve-muted)"} }, c.tag.split(' · ')[0])))) : null), "\n        "); }), "\n      "), "\n    ") : null), "\n  "), "\n\n  ", "\n  ", (R(v0, "isHome") ? h(F, null, "\n    ", (auveSection('hero') ? h("section", { "data-screen-label": "Home", "style": {"position":"relative","height":"min(88vh, 860px)","minHeight":"540px","overflow":"hidden","background":"#1B1A34"} }, "\n      ", h("picture", null, h("source", { "media": "(min-width: 600px)", "srcSet": R(v0, "heroDesktopImg") }), h("img", { "src": R(v0, "heroMobileImg"), "alt": "AUVÉ gold wedges with red brocade knot straps", "style": {"position":"absolute","inset":"0","width":"100%","height":"100%","objectFit":"cover","objectPosition":R(v0, "wide") ? "50% 45%" : "50% 52%"} })), "\n      ", h("div", { "style": {"position":"absolute","inset":"0","background":"linear-gradient(to top, rgba(27,26,52,0.78) 0%, rgba(27,26,52,0.25) 45%, rgba(27,26,52,0.1) 100%)"} }), "\n      ", h("div", { "style": {"position":"absolute","left":"0","right":"0","bottom":"0","maxWidth":"1320px","margin":"0 auto","padding":"0 clamp(22px, 5vw, 64px) clamp(40px, 7vh, 80px)","display":"flex","flexDirection":"column","gap":"22px","color":"#FFF"} }, "\n        ", h("h1", { "style": {"margin":"0","fontFamily":"Belleza, sans-serif","fontWeight":"400","fontSize":"clamp(44.7px, 7.2vw, 101.5px)","lineHeight":"0.92","letterSpacing":"-0.01em"} }, X(R(v0, "heroHeading1")), h("br", null), h("em", { "style": {"color":"#E8CDB6"} }, X(R(v0, "heroHeading2")))), "\n        ", h("div", { "style": {"display":"flex","flexWrap":"wrap","gap":"12px"} }, "\n          ", h("a", { "href": "#/shop", "style": {"background":"var(--auve-bg)","color":"var(--auve-ink)","padding":"16px 32px","borderRadius":"999px","fontSize":"13px","letterSpacing":"0.12em","textTransform":"uppercase"}, className: "au-h0" }, "Shop all pairs"), "\n        "), "\n      "), "\n    ") : null), "\n\n    ", (auveSection('craftBanner') ? h("div", { "style": {"maxWidth":"1320px","margin":"0 auto","padding":"clamp(56px, 7vw, 96px) 22px 24px"} }, "\n      ", h("h2", { "style": {"margin":"0","fontFamily":"Belleza, sans-serif","fontWeight":"400","fontSize":"clamp(25.2px, 2.7vw, 34.2px)","lineHeight":"1","textTransform":"uppercase","letterSpacing":"0.06em"} }, X(R(v0, "craftSubheading") || "From our hands, to your feet")), "\n    ") : null), "\n    ", (auveSection('craftBanner') ? h("section", { "style": S(R(v0, "b2SectionStyle")) }, "\n      ", h("div", { "style": S(R(v0, "b2TextStyle")) }, "\n        ", h("h2", { "style": {"margin":"0","maxWidth":"12ch","fontFamily":"Belleza, sans-serif","fontWeight":"400","fontSize":"clamp(24.1px, 2.6vw, 36.1px)","lineHeight":"1.05","color":"var(--auve-ink)"} }, X(R(v0, "craftHeading") || "Handcrafted. Comfort first.")), "\n        ", h("div", { "style": {"display":"flex","flexWrap":"wrap","gap":"12px","marginTop":"6px"} }, "\n          ", h("a", { "href": R(v0, "craftBtnLink") || "#/shop", "style": {"background":"var(--auve-btn)","color":"var(--auve-btn-ink)","padding":"15px 30px","borderRadius":"var(--auve-btn-radius, 999px)","fontSize":"12.5px","letterSpacing":"0.12em","textTransform":"uppercase"}, className: "au-h3" }, X(R(v0, "craftBtnText") || "Shop all pairs")), "\n        "), "\n      "), "\n      ", h("div", { "style": S(R(v0, "b2VideoStyle")) }, "\n        ", h("video", { "ref": R(v0, "videoRef"), "src": R(v0, "craftVideo") || "assets/banner2.mp4", "preload": "auto", "autoPlay": true, "muted": true, "loop": true, "playsInline": true, "style": {"position":"absolute","inset":"0","width":"100%","height":"100%","objectFit":"cover","transform":"scale(1.12)","transformOrigin":"50% 40%"} }), "\n      "), "\n    ") : null), "\n\n    ", (auveSection('festive') ? h("section", { "style": {"maxWidth":"1320px","margin":"0 auto","padding":"clamp(48px, 6vw, 80px) 22px 0"} }, "\n      ", h("div", { "style": {"display":"flex","flexWrap":"wrap","alignItems":"end","justifyContent":"space-between","gap":"16px","marginBottom":"24px"} }, "\n        ", h("h2", { "style": {"margin":"0","fontFamily":"Belleza, sans-serif","fontWeight":"400","fontSize":"clamp(25.2px, 2.7vw, 34.2px)","lineHeight":"1","textTransform":"uppercase","letterSpacing":"0.06em"} }, X(R(v0, "festiveHeading"))), "\n        ", h("div", { "style": {"display":"flex","alignItems":"center","gap":"18px"} }, "\n          ", h("a", { "href": "#/shop", "style": {"fontSize":"12px","letterSpacing":"0.14em","textTransform":"uppercase","borderBottom":"1px solid var(--auve-ink)","paddingBottom":"4px"} }, "View all"), "\n          ", (R(v0, "notMobile") ? h(F, null, h("div", { "style": {"display":"flex","gap":"8px"} }, "\n            ", h("button", { "onClick": R(v0, "aPrev"), "aria-label": "Previous", "style": {"width":"44px","height":"44px","borderRadius":"50%","border":"1px solid rgba(var(--auve-ink-rgb),0.2)","background":"var(--auve-card)","color":"var(--auve-ink)","fontSize":"17px","cursor":"pointer"}, className: "au-h1" }, "‹"), "\n            ", h("button", { "onClick": R(v0, "aNext"), "aria-label": "Next", "style": {"width":"44px","height":"44px","borderRadius":"50%","border":"1px solid rgba(var(--auve-ink-rgb),0.2)","background":"var(--auve-card)","color":"var(--auve-ink)","fontSize":"17px","cursor":"pointer"}, className: "au-h1" }, "›"), "\n          ")) : null), "\n        "), "\n      "), "\n      ", h("div", { "ref": R(v0, "rowA"), "style": S(R(v0, "rowStyle")) }, "\n          ", A(R(v0, "latest")).map((it, i) => { const v1 = Object.assign({}, v0, { "p": it, $index: i }); return h(F, { key: i }, "\n            ", h("a", { "href": R(v1, "p.href"), "style": {"display":"block","scrollSnapAlign":"start"} }, "\n              ", h("div", { "style": {"position":"relative","overflow":"hidden","borderRadius":"2px","aspectRatio":"4 / 5","background":"#F3EFEA"} }, "\n                ", h("div", { "style": S(R(v1, "p.bgStyle")) }), "\n                ", h("img", { "src": R(v1, "p.img"), "alt": R(v1, "p.name"), "style": {"position":"absolute","inset":"0","width":"100%","height":"100%","objectFit":"cover","objectPosition":"50% 50%"} }), "\n                ", h("div", { "style": S(R(v1, "p.bg2Style")), className: "au-h2" }, h("img", { "src": R(v1, "p.img2"), "alt": "", "style": {"position":"absolute","inset":"0","width":"100%","height":"100%","objectFit":"cover","objectPosition":"50% 50%"} })), "\n              "), "\n              ", h("div", { "style": S(R(v1, "p.infoStyle")) }, "\n                ", h("div", { "style": {"fontSize":"14px","letterSpacing":"0.02em"} }, X(R(v1, "p.name"))), "\n                ", h("div", { "style": {"fontSize":"12px","color":"var(--auve-muted)"} }, X(R(v1, "p.sub"))), "\n                ", h("div", { "style": S(R(v1, "p.metaStyle")) }, "\n                  ", h("div", { "style": {"fontSize":"14px","fontWeight":"500"} }, X(R(v1, "p.price"))), "\n                  ", h("div", { "style": {"display":"flex","gap":"5px"} }, "\n                    ", A(R(v1, "p.swatches")).map((it, i) => { const v2 = Object.assign({}, v1, { "s": it, $index: i }); return h(F, { key: i }, h("span", { "title": R(v2, "s.name"), "style": S(R(v2, "s.style")) })); }), "\n                  "), "\n                "), "\n              "), "\n            "), "\n          "); }), "\n      "), "\n      ", (R(v0, "isMobile") ? h(F, null, "\n        ", h("a", { "href": "#/shop", "style": {"display":"block","marginTop":"28px","textAlign":"center","background":"var(--auve-btn)","color":"var(--auve-btn-ink)","padding":"15px","borderRadius":"999px","fontSize":"12.5px","letterSpacing":"0.16em","textTransform":"uppercase"}, className: "au-h3" }, "View all"), "\n      ") : null), "\n    ") : null), "\n\n    ", (auveSection('collections') ? h("section", { "style": {"maxWidth":"1320px","margin":"0 auto","padding":"clamp(56px, 7vw, 96px) 22px 0"} }, "\n      ", h("h2", { "style": {"margin":"0 0 24px","fontFamily":"Belleza, sans-serif","fontWeight":"400","fontSize":"clamp(25.2px, 2.7vw, 34.2px)","lineHeight":"1","textTransform":"uppercase","letterSpacing":"0.06em"} }, "Shop by collection"), "\n      ", h("div", { "style": {"display":"grid","gridTemplateColumns":"repeat(auto-fit, minmax(260px, 1fr))","gap":"16px"} }, "\n        ", A(R(v0, "collections")).map((it, i) => { const v1 = Object.assign({}, v0, { "c": it, $index: i }); return h(F, { key: i }, "\n          ", h("a", { "href": R(v1, "c.href"), "style": {"position":"relative","display":"block","overflow":"hidden","borderRadius":"2px","aspectRatio":"4 / 5","background":"#F3EFEA"} }, "\n            ", (R(v1, "c.video") ? h("video", { "src": R(v1, "c.video"), "poster": R(v1, "c.poster") || R(v1, "c.img"), "autoPlay": true, "muted": true, "loop": true, "playsInline": true, "preload": "metadata", "aria-label": R(v1, "c.name"), "style": {"position":"absolute","inset":"0","width":"100%","height":"100%","objectFit":"cover","transform":"scale(1.02)","transition":"transform 1.1s cubic-bezier(0.22,1,0.36,1)"}, className: "au-h4" }) : h("img", { "src": R(v1, "c.img"), "alt": R(v1, "c.name"), "style": {"position":"absolute","inset":"0","width":"100%","height":"100%","objectFit":"cover","transform":"scale(1.02)","transition":"transform 1.1s cubic-bezier(0.22,1,0.36,1)"}, className: "au-h4" })), "\n            ", h("div", { "style": {"position":"absolute","inset":"0","background":"linear-gradient(to top, rgba(27,26,52,0.7), rgba(27,26,52,0) 45%)","pointerEvents":"none"} }), "\n            ", h("div", { "style": {"position":"absolute","bottom":"0","left":"0","right":"0","padding":"24px","pointerEvents":"none","display":"flex","flexDirection":"column","gap":"6px"} }, "\n              ", h("div", { "style": {"fontFamily":"Belleza, sans-serif","fontSize":"clamp(22.4px, 2.2vw, 29.2px)","color":"#FFF"} }, X(R(v1, "c.name"))), "\n            "), "\n          "), "\n        "); }), "\n      "), "\n    ") : null), "\n\n    ", (auveSection('bestsellers') ? h("section", { "style": {"maxWidth":"1320px","margin":"0 auto","padding":"clamp(48px, 6vw, 80px) 22px 0"} }, "\n      ", h("div", { "style": {"display":"flex","flexWrap":"wrap","alignItems":"end","justifyContent":"space-between","gap":"16px","marginBottom":"24px"} }, "\n        ", h("h2", { "style": {"margin":"0","fontFamily":"Belleza, sans-serif","fontWeight":"400","fontSize":"clamp(25.2px, 2.7vw, 34.2px)","lineHeight":"1","textTransform":"uppercase","letterSpacing":"0.06em"} }, X(R(v0, "bestsellersHeading"))), "\n        ", h("div", { "style": {"display":"flex","alignItems":"center","gap":"18px"} }, "\n          ", h("a", { "href": "#/shop", "style": {"fontSize":"12px","letterSpacing":"0.14em","textTransform":"uppercase","borderBottom":"1px solid var(--auve-ink)","paddingBottom":"4px"} }, "View all"), "\n          ", (R(v0, "notMobile") ? h(F, null, h("div", { "style": {"display":"flex","gap":"8px"} }, "\n            ", h("button", { "onClick": R(v0, "bPrev"), "aria-label": "Previous", "style": {"width":"44px","height":"44px","borderRadius":"50%","border":"1px solid rgba(var(--auve-ink-rgb),0.2)","background":"var(--auve-card)","color":"var(--auve-ink)","fontSize":"17px","cursor":"pointer"}, className: "au-h1" }, "‹"), "\n            ", h("button", { "onClick": R(v0, "bNext"), "aria-label": "Next", "style": {"width":"44px","height":"44px","borderRadius":"50%","border":"1px solid rgba(var(--auve-ink-rgb),0.2)","background":"var(--auve-card)","color":"var(--auve-ink)","fontSize":"17px","cursor":"pointer"}, className: "au-h1" }, "›"), "\n          ")) : null), "\n        "), "\n      "), "\n      ", h("div", { "ref": R(v0, "rowB"), "style": S(R(v0, "rowStyle")) }, "\n          ", A(R(v0, "bestsellers")).map((it, i) => { const v1 = Object.assign({}, v0, { "p": it, $index: i }); return h(F, { key: i }, "\n            ", h("a", { "href": R(v1, "p.href"), "style": {"display":"block","scrollSnapAlign":"start"} }, "\n              ", h("div", { "style": {"position":"relative","overflow":"hidden","borderRadius":"2px","aspectRatio":"4 / 5","background":"#F3EFEA"} }, "\n                ", h("div", { "style": S(R(v1, "p.bgStyle")) }), "\n                ", h("img", { "src": R(v1, "p.img"), "alt": R(v1, "p.name"), "style": {"position":"absolute","inset":"0","width":"100%","height":"100%","objectFit":"cover","objectPosition":"50% 50%"} }), "\n                ", h("div", { "style": S(R(v1, "p.bg2Style")), className: "au-h2" }, h("img", { "src": R(v1, "p.img2"), "alt": "", "style": {"position":"absolute","inset":"0","width":"100%","height":"100%","objectFit":"cover","objectPosition":"50% 50%"} })), "\n              "), "\n              ", h("div", { "style": S(R(v1, "p.infoStyle")) }, "\n                ", h("div", { "style": {"fontSize":"14px","letterSpacing":"0.02em"} }, X(R(v1, "p.name"))), "\n                ", h("div", { "style": {"fontSize":"12px","color":"var(--auve-muted)"} }, X(R(v1, "p.sub"))), "\n                ", h("div", { "style": S(R(v1, "p.metaStyle")) }, "\n                  ", h("div", { "style": {"fontSize":"14px","fontWeight":"500"} }, X(R(v1, "p.price"))), "\n                  ", h("div", { "style": {"display":"flex","gap":"5px"} }, "\n                    ", A(R(v1, "p.swatches")).map((it, i) => { const v2 = Object.assign({}, v1, { "s": it, $index: i }); return h(F, { key: i }, h("span", { "title": R(v2, "s.name"), "style": S(R(v2, "s.style")) })); }), "\n                  "), "\n                "), "\n              "), "\n            "), "\n          "); }), "\n      "), "\n      ", (R(v0, "isMobile") ? h(F, null, "\n        ", h("a", { "href": "#/shop", "style": {"display":"block","marginTop":"28px","textAlign":"center","background":"var(--auve-btn)","color":"var(--auve-btn-ink)","padding":"15px","borderRadius":"999px","fontSize":"12.5px","letterSpacing":"0.16em","textTransform":"uppercase"}, className: "au-h3" }, "View all"), "\n      ") : null), "\n    ") : null), "\n\n    ", (auveSection('reels') ? h("section", { "style": {"background":"#EEEDF5","marginTop":"clamp(56px, 7vw, 96px)","color":"#1B1A34","--auve-ink":"#1B1A34","--auve-ink-rgb":"27,26,52","--auve-card":"#FFFFFF","--auve-muted":"#6B6257","--auve-muted2":"#50485A","--auve-bg":"#FFFFFF","--auve-btn":"#1B1A34","--auve-btn-ink":"#FAF5EF"} }, "\n      ", h("div", { "style": {"maxWidth":"1320px","margin":"0 auto","padding":"clamp(50px, 6vw, 84px) 22px"} }, "\n        ", h("div", { "style": {"display":"flex","flexWrap":"wrap","alignItems":"end","justifyContent":"space-between","gap":"16px","marginBottom":"24px"} }, "\n          ", h("h2", { "style": {"margin":"0","fontFamily":"Belleza, sans-serif","fontWeight":"400","fontSize":"clamp(25.2px, 2.7vw, 34.2px)","lineHeight":"1","textTransform":"uppercase","letterSpacing":"0.06em"} }, X(R(v0, "reelsHeading") || "Moments in motion")), "\n          ", h("div", { "style": {"display":"flex","alignItems":"center","gap":"18px"} }, "\n            ", h("a", { "href": "https://www.instagram.com/stepwithauve/", "target": "_blank", "rel": "noopener", "style": {"fontSize":"12px","letterSpacing":"0.14em","textTransform":"uppercase","borderBottom":"1px solid var(--auve-ink)","paddingBottom":"4px"} }, "Follow"), "\n          ", (R(v0, "true") ? h(F, null, h("div", { "style": {"display":"flex","gap":"8px"} }, "\n            ", h("button", { "onClick": R(v0, "rPrev"), "aria-label": "Previous", "style": {"width":"44px","height":"44px","borderRadius":"50%","border":"1px solid rgba(var(--auve-ink-rgb),0.2)","background":"var(--auve-card)","color":"var(--auve-ink)","fontSize":"17px","cursor":"pointer"}, className: "au-h1" }, "‹"), "\n            ", h("button", { "onClick": R(v0, "rNext"), "aria-label": "Next", "style": {"width":"44px","height":"44px","borderRadius":"50%","border":"1px solid rgba(var(--auve-ink-rgb),0.2)","background":"var(--auve-card)","color":"var(--auve-ink)","fontSize":"17px","cursor":"pointer"}, className: "au-h1" }, "›"), "\n          ")) : null), "\n          "), "\n        "), "\n        ", h("div", { "ref": R(v0, "reelBox"), "onTouchStart": R(v0, "reelTouchStart"), "onTouchEnd": R(v0, "reelTouchEnd"), "style": S(R(v0, "reelBoxStyle")) }, "\n          ", A(R(v0, "reelsM")).map((it, i) => { const v1 = Object.assign({}, v0, { "r": it, $index: i }); return h(F, { key: i }, "\n            ", h("div", { "onClick": R(v1, "r.onPick"), "style": S(R(v1, "r.style")) }, "\n              ", (R(v1, "r.isVideo") ? h(F, null, "\n                ", h("video", { "ref": R(v1, "r.ref"), "onEnded": R(v1, "r.onEnded"), "src": R(v1, "r.video"), "poster": R(v1, "r.poster"), "muted": true, "playsInline": true, "preload": "auto", "style": {"position":"absolute","inset":"0","width":"100%","height":"100%","objectFit":"cover","transform":"scale(1.14)","transformOrigin":"50% 46%"} }), "\n              ") : null), "\n              ", (R(v1, "r.isPoster") ? h(F, null, "\n                ", h("img", { "src": R(v1, "r.poster"), "alt": R(v1, "r.caption"), "style": {"position":"absolute","inset":"0","width":"100%","height":"100%","objectFit":"cover"} }), "\n                ", (R(v1, "r.showBadge") ? h(F, null, h("span", { "style": {"position":"absolute","top":"10px","left":"10px","background":"rgba(255,255,255,0.92)","color":"var(--auve-muted)","fontSize":"9.5px","letterSpacing":"0.14em","textTransform":"uppercase","padding":"5px 8px","borderRadius":"999px"} }, "Reel coming soon")) : null), "\n              ") : null), "\n              ", h("div", { "style": S(R(v1, "r.shade")) }), "\n              ", h("div", { "style": {"position":"absolute","inset":"auto 0 0 0","padding":"40px 14px 14px","background":"linear-gradient(to top, rgba(27,26,52,0.8), rgba(27,26,52,0))","color":"#FFF","fontSize":"13.5px","lineHeight":"1.4","pointerEvents":"none"} }, X(R(v1, "r.caption"))), "\n            "), "\n          "); }), "\n        "), "\n        ", h("div", { "style": {"display":"flex","flexDirection":"column","alignItems":"center","gap":"14px","marginTop":"20px"} }, "\n          ", h("a", { "href": R(v0, "reelActive.href"), "style": {"display":"flex","alignItems":"center","gap":"10px"} }, "\n            ", h("img", { "src": R(v0, "reelActive.thumb"), "alt": "", "style": {"width":"40px","height":"48px","objectFit":"cover","borderRadius":"2px","background":"#F3EFEA"} }), "\n            ", h("span", { "style": {"display":"flex","flexDirection":"column","gap":"2px"} }, h("span", { "style": {"fontSize":"13.5px"} }, X(R(v0, "reelActive.name"))), h("span", { "style": {"fontSize":"12px","color":"var(--auve-muted)"} }, X(R(v0, "reelActive.price")), " · Shop the look →")), "\n          "), "\n          ", h("div", { "style": {"display":"flex","gap":"6px"} }, "\n            ", A(R(v0, "reelDots")).map((it, i) => { const v1 = Object.assign({}, v0, { "d": it, $index: i }); return h(F, { key: i }, h("button", { "onClick": R(v1, "d.onPick"), "aria-label": "Go to reel", "style": S(R(v1, "d.style")) })); }), "\n          "), "\n        "), "\n      "), "\n    ") : null), "\n\n    ", (auveSection('newsletter') ? h("section", { "style": {"position":"relative","overflow":"hidden","background":"#1B1A34"} }, "\n      ", h("div", { "style": {"position":"relative","padding":"clamp(44px, 7vw, 90px) 22px","display":"flex","justifyContent":"center"} }, "\n        ", h("div", { "style": {"width":"min(460px, 100%)","background":"var(--auve-card)","padding":"clamp(28px, 5vw, 44px) clamp(22px, 4vw, 40px)","textAlign":"center","display":"flex","flexDirection":"column","gap":"16px","alignItems":"center","boxShadow":"none"} }, "\n          ", (R(v0, "nlOpen") ? h(F, null, "\n            ", h("div", { "style": {"fontSize":"15px","letterSpacing":"0.18em","textTransform":"uppercase","fontWeight":"500","lineHeight":"1.5"} }, X(R(v0, "newsletterHeading") || "Get 10% off")), "\n            ", h("div", { "style": {"fontSize":"15px","lineHeight":"1.75","fontWeight":"300","color":"var(--auve-muted2)","maxWidth":"32ch","textWrap":"pretty"} }, X(R(v0, "newsletterText") || "New drops, restock alerts and early access to offers, straight to your inbox. 10% off your first order.")), "\n            ", h("div", { "style": {"width":"100%","display":"flex","alignItems":"center","border":"1px solid rgba(var(--auve-ink-rgb),0.2)","borderRadius":"var(--auve-btn-radius, 999px)","marginTop":"6px"} }, "\n              ", "\n              ", h("input", { "value": D(R(v0, "nlPhone"), ""), "onChange": R(v0, "onNlPhone"), "placeholder": R(v0, "newsletterPlaceholder") || "Your mobile number", "inputMode": "tel", "maxLength": "11", "style": {"flex":"1","minWidth":"0","fontSize":"16px","color":"var(--auve-ink)","padding":"16px 12px","border":"none","background":"none","outline":"none"} }), "\n            "), "\n            ", (R(v0, "hasNlErr") ? h(F, null, h("div", { "style": {"fontSize":"13px","color":"#A3352B"} }, X(R(v0, "nlErr")))) : null), "\n            ", h("button", { "onClick": R(v0, "submitNl"), "style": {"width":"100%","background":"var(--auve-btn)","color":"var(--auve-btn-ink)","border":"none","borderRadius":"var(--auve-btn-radius, 999px)","padding":"17px","fontSize":"14px","letterSpacing":"0.16em","textTransform":"uppercase","fontWeight":"500","cursor":"pointer"}, className: "au-h5" }, X(R(v0, "newsletterButton") || "Subscribe")), "\n          ") : null), "\n          ", (R(v0, "nlSent") ? h(F, null, "\n            ", h("div", { "style": {"fontSize":"15px","letterSpacing":"0.18em","textTransform":"uppercase","fontWeight":"500"} }, "You're on the list"), "\n            ", h("div", { "style": {"fontSize":"15px","lineHeight":"1.7","fontWeight":"300","color":"var(--auve-muted2)"} }, X(R(v0, "nlSummary"))), "\n            ", h("span", { "style": {"fontSize":"20px","letterSpacing":"0.2em","border":"1px dashed #B98E4F","padding":"12px 20px","borderRadius":"3px"} }, "WELCOME10"), "\n            ", h("a", { "href": "#/shop", "style": {"width":"100%","textAlign":"center","background":"var(--auve-btn)","color":"var(--auve-btn-ink)","padding":"16px","borderRadius":"999px","fontSize":"13px","letterSpacing":"0.14em","textTransform":"uppercase"}, className: "au-h6" }, "Start shopping"), "\n          ") : null), "\n        "), "\n      "), "\n    ") : null), "\n  ") : null), "\n\n  ", "\n  ", (R(v0, "isShop") ? h(F, null, "\n    ", h("section", { "data-screen-label": "Shop", "style": {"maxWidth":"1320px","margin":"0 auto","padding":"clamp(40px, 5vw, 72px) 22px clamp(60px, 8vw, 110px)"} }, "\n      ", h("div", { "style": {"display":"flex","flexDirection":"column","gap":"14px","marginBottom":"30px"} }, "\n        ", h("div", { "style": {"fontSize":"11.5px","letterSpacing":"0.24em","textTransform":"uppercase","color":"#A8743F"} }, X(R(v0, "shopEyebrow"))), "\n        ", h("h1", { "style": {"margin":"0","fontFamily":"Belleza, sans-serif","fontWeight":"400","fontSize":"clamp(34.4px, 4.8vw, 61.9px)","lineHeight":"1"} }, X(R(v0, "shopTitle"))), "\n        ", h("p", { "style": {"margin":"0","maxWidth":"52ch","fontSize":"15.5px","lineHeight":"1.7","fontWeight":"300","color":"var(--auve-muted2)"} }, X(R(v0, "shopBlurb"))), "\n      "), "\n      ", h("div", { "style": {"display":"flex","flexWrap":"wrap","gap":"14px 24px","alignItems":"center","justifyContent":"space-between","padding":"16px 0","borderTop":"1px solid rgba(var(--auve-ink-rgb),0.1)","borderBottom":"1px solid rgba(var(--auve-ink-rgb),0.1)","marginBottom":"30px"} }, "\n        ", h("div", { "style": {"display":"flex","flexWrap":"wrap","gap":"8px"} }, "\n          ", A(R(v0, "collChips")).map((it, i) => { const v1 = Object.assign({}, v0, { "f": it, $index: i }); return h(F, { key: i }, "\n            ", h("a", { "href": R(v1, "f.href"), "style": S(R(v1, "f.style")) }, X(R(v1, "f.label"))), "\n          "); }), "\n        "), "\n        ", h("div", { "style": {"display":"flex","flexWrap":"wrap","gap":"8px","alignItems":"center"} }, "\n          ", A(R(v0, "typeChips")).map((it, i) => { const v1 = Object.assign({}, v0, { "f": it, $index: i }); return h(F, { key: i }, "\n            ", h("button", { "onClick": R(v1, "f.onPick"), "style": S(R(v1, "f.style")) }, X(R(v1, "f.label"))), "\n          "); }), "\n          ", h("select", { "value": D(R(v0, "sort"), ""), "onChange": R(v0, "onSort"), "style": {"fontSize":"12.5px","letterSpacing":"0.06em","padding":"10px 14px","borderRadius":"999px","border":"1px solid rgba(var(--auve-ink-rgb),0.2)","background":"var(--auve-bg)","color":"var(--auve-ink)","cursor":"pointer"} }, "\n            ", h("option", { "value": "featured" }, "Featured"), "\n            ", h("option", { "value": "low" }, "Price: low to high"), "\n            ", h("option", { "value": "high" }, "Price: high to low"), "\n          "), "\n        "), "\n      "), "\n      ", h("div", { "style": {"fontSize":"12.5px","color":"var(--auve-muted)","marginBottom":"18px"} }, X(R(v0, "shopCount"))), "\n      ", h("div", { "style": S(R(v0, "shopGridStyle")) }, "\n        ", A(R(v0, "shopList")).map((it, i) => { const v1 = Object.assign({}, v0, { "p": it, $index: i }); return h(F, { key: i }, "\n            ", h("a", { "href": R(v1, "p.href"), "style": {"display":"block"} }, "\n              ", h("div", { "style": {"position":"relative","overflow":"hidden","borderRadius":"2px","aspectRatio":"4 / 5","background":"#F3EFEA"} }, "\n                ", h("img", { "src": R(v1, "p.img"), "alt": R(v1, "p.name"), "style": {"position":"absolute","inset":"0","width":"100%","height":"100%","objectFit":"cover"} }), "\n                ", h("img", { "src": R(v1, "p.img2"), "alt": "", "style": {"position":"absolute","inset":"0","width":"100%","height":"100%","objectFit":"cover","opacity":"0","transition":"opacity 0.6s ease"}, className: "au-h2" }), "\n              "), "\n              ", h("div", { "style": S(R(v1, "p.infoStyle")) }, "\n                ", h("div", { "style": {"fontSize":"14px","letterSpacing":"0.02em"} }, X(R(v1, "p.name"))), "\n                ", h("div", { "style": {"fontSize":"12px","color":"var(--auve-muted)"} }, X(R(v1, "p.sub"))), "\n                ", h("div", { "style": S(R(v1, "p.metaStyle")) }, "\n                  ", h("div", { "style": {"fontSize":"14px","fontWeight":"500"} }, X(R(v1, "p.price"))), "\n                  ", h("div", { "style": {"display":"flex","gap":"5px"} }, "\n                    ", A(R(v1, "p.swatches")).map((it, i) => { const v2 = Object.assign({}, v1, { "s": it, $index: i }); return h(F, { key: i }, h("span", { "title": R(v2, "s.name"), "style": S(R(v2, "s.style")) })); }), "\n                  "), "\n                "), "\n              "), "\n            "), "\n          "); }), "\n      "), "\n    "), "\n  ") : null), "\n\n  ", "\n  ", (R(v0, "isProduct") ? h(F, null, "\n    ", h("section", { "data-screen-label": "Product", "style": {"maxWidth":"1320px","margin":"0 auto","padding":"26px 22px clamp(50px, 6vw, 90px)"} }, "\n      ", h("button", { "onClick": R(v0, "pdp.goBack"), "aria-label": "Go back", className: "au-h7", "style": {"display":"inline-flex","alignItems":"center","gap":"8px","background":"none","border":"1px solid rgba(var(--auve-ink-rgb),0.2)","borderRadius":"999px","padding":"8px 16px","fontSize":"12px","letterSpacing":"0.14em","textTransform":"uppercase","color":"var(--auve-ink)","cursor":"pointer","marginBottom":"18px"} }, h("span", { "aria-hidden": "true", "style": {"fontSize":"15px","lineHeight":"1"} }, "←"), "Back"), h("div", { "style": {"display":"flex","flexWrap":"wrap","gap":"8px","fontSize":"12px","letterSpacing":"0.06em","color":"var(--auve-muted)","marginBottom":"24px"} }, "\n        ", h("a", { "href": "#/", "style": {"color":"var(--auve-muted)"} }, "Home"), h("span", null, "/"), "\n        ", h("a", { "href": R(v0, "pdp.collHref"), "style": {"color":"var(--auve-muted)"} }, X(R(v0, "pdp.collName"))), h("span", null, "/"), "\n        ", h("span", { "style": {"color":"var(--auve-ink)"} }, X(R(v0, "pdp.name"))), "\n      "), "\n      ", h("div", { "style": {"display":"grid","gridTemplateColumns":"repeat(auto-fit, minmax(320px, 1fr))","gap":"clamp(28px, 4vw, 64px)","alignItems":"start"} }, "\n        ", h("div", { "style": {"display":"flex","flexDirection":"column","gap":"10px"} }, "\n          ", h("div", { "style": {"position":"relative","overflow":"hidden","borderRadius":"3px","aspectRatio":"4 / 5","background":"#F3EFEA"} }, "\n            ", (R(v0, "pdp.isVideo") ? h("video", { key: R(v0, "pdp.mainVideo"), "src": R(v0, "pdp.mainVideo"), "poster": R(v0, "pdp.mainImg"), "autoPlay": true, "muted": true, "loop": true, "playsInline": true, "ref": R(v0, "videoRef"), "style": {"position":"absolute","inset":"0","width":"100%","height":"100%","objectFit":"cover","background":"#1B1A34"} }) : h("img", { "src": R(v0, "pdp.mainImg"), "alt": R(v0, "pdp.name"), "style": {"position":"absolute","inset":"0","width":"100%","height":"100%","objectFit":"cover"} })), "\n            ", (R(v0, "pdp.multi") ? h(F, null, "\n              ", h("button", { "onClick": R(v0, "pdp.prevImg"), "style": {"position":"absolute","left":"12px","top":"50%","transform":"translateY(-50%)","width":"44px","height":"44px","borderRadius":"50%","border":"none","background":"rgba(250,245,239,0.92)","color":"var(--auve-ink)","fontSize":"18px","cursor":"pointer"} }, "‹"), "\n              ", h("button", { "onClick": R(v0, "pdp.nextImg"), "style": {"position":"absolute","right":"12px","top":"50%","transform":"translateY(-50%)","width":"44px","height":"44px","borderRadius":"50%","border":"none","background":"rgba(250,245,239,0.92)","color":"var(--auve-ink)","fontSize":"18px","cursor":"pointer"} }, "›"), "\n              ", h("div", { "style": {"position":"absolute","bottom":"14px","right":"14px","background":"rgba(27,26,52,0.7)","color":"#FFF","fontSize":"11.5px","letterSpacing":"0.1em","padding":"6px 10px","borderRadius":"999px"} }, X(R(v0, "pdp.imgCount"))), "\n            ") : null), "\n          "), "\n          ", h("div", { "style": {"display":"grid","gridTemplateColumns":"repeat(6, minmax(0, 1fr))","gap":"10px"} }, "\n            ", A(R(v0, "pdp.thumbs")).map((it, i) => { const v1 = Object.assign({}, v0, { "t": it, $index: i }); return h(F, { key: i }, "\n              ", h("button", { "onClick": R(v1, "t.onPick"), "style": S(R(v1, "t.style")) }, "\n                ", h("img", { "src": R(v1, "t.src"), "alt": "", "style": {"width":"100%","height":"100%","objectFit":"cover","display":"block"} }), (R(v1, "t.isVideo") ? h("span", { "aria-label": "Video", "style": {"position":"absolute","inset":"0","display":"flex","alignItems":"center","justifyContent":"center","background":"rgba(27,26,52,0.18)"} }, h("span", { "style": {"width":"30px","height":"30px","borderRadius":"50%","background":"rgba(27,26,52,0.78)","display":"flex","alignItems":"center","justifyContent":"center"} }, h("span", { "style": {"width":"0","height":"0","borderTop":"6px solid transparent","borderBottom":"6px solid transparent","borderLeft":"9px solid #FFF","marginLeft":"3px"} }))) : null), "\n              "), "\n            "); }), "\n          "), "\n        "), "\n\n        ", h("div", { "style": {"display":"flex","flexDirection":"column","gap":"24px","position":"sticky","top":"96px"} }, "\n          ", h("div", { "style": {"display":"flex","flexDirection":"column","gap":"10px"} }, "\n            ", h("div", { "style": {"fontSize":"11.5px","letterSpacing":"0.24em","textTransform":"uppercase","color":"#A8743F"} }, X(R(v0, "pdp.collName"))), "\n            ", h("h1", { "style": {"margin":"0","fontFamily":"Belleza, sans-serif","fontWeight":"400","fontSize":"clamp(34.4px, 4vw, 51.6px)","lineHeight":"1"} }, X(R(v0, "pdp.name"))), "\n            ", h("div", { "style": {"display":"flex","alignItems":"baseline","gap":"12px"} }, "\n              ", h("div", { "style": {"fontSize":"21px"} }, X(R(v0, "pdp.unitPrice"))), "\n              ", h("div", { "style": {"fontSize":"12.5px","color":"var(--auve-muted)"} }, "incl. of all taxes"), "\n            "), "\n            ", h("p", { "style": {"margin":"6px 0 0","fontSize":"15.5px","lineHeight":"1.75","fontWeight":"300","color":"var(--auve-muted2)","maxWidth":"46ch","textWrap":"pretty"} }, X(R(v0, "pdp.desc"))), "\n          "), "\n\n          ", h("div", { "style": {"display":"flex","flexDirection":"column","gap":"12px"} }, "\n            ", h("div", { "style": {"fontSize":"11.5px","letterSpacing":"0.16em","textTransform":"uppercase","color":"var(--auve-muted)"} }, "Colour"), "\n            ", h("div", { "style": {"display":"flex","gap":"10px","flexWrap":"wrap"} }, "\n              ", A(R(v0, "pdp.swatches")).map((it, i) => { const v1 = Object.assign({}, v0, { "s": it, $index: i }); return h(F, { key: i }, "\n                ", h("button", { "onClick": R(v1, "s.onPick"), "title": R(v1, "s.name"), "style": S(R(v1, "s.style")) }, h("span", { "style": {"width":"12px","height":"12px","borderRadius":"50%","background": R(v1, "s.sw"),"boxShadow":"inset 0 0 0 1px rgba(27,26,52,0.18)","flexShrink":"0"} }), R(v1, "s.name")), "\n              "); }), "\n            "), "\n          "), "\n\n          ", h("div", { "style": {"display":"flex","flexDirection":"column","gap":"12px"} }, "\n            ", h("div", { "style": {"display":"flex","justifyContent":"space-between","alignItems":"center","flexWrap":"wrap","gap":"10px"} }, "\n              ", h("div", { "style": {"fontSize":"11.5px","letterSpacing":"0.16em","textTransform":"uppercase","color":"var(--auve-muted)"} }, "Size: ", h("span", { "style": {"color":"var(--auve-ink)"} }, X(R(v0, "pdp.sizeLabel")))), "\n              ", h("div", { "style": {"display":"flex","alignItems":"center","gap":"14px"} }, h("div", { "role": "group", "aria-label": "Size system", "style": {"display":"flex","border":"1px solid rgba(var(--auve-ink-rgb),0.2)","borderRadius":"999px","padding":"2px"} }, A(R(v0, "pdp.sysTabs")).map((t, i) => h("button", { key: i, "onClick": t.onPick, "style": S(t.style) }, t.label))), h("button", { "onClick": R(v0, "openSizeGuide"), "style": {"background":"none","border":"none","padding":"0","fontSize":"12.5px","color":"#A8743F","borderBottom":"1px solid rgba(168,116,63,0.45)","cursor":"pointer","whiteSpace":"nowrap"} }, "Size guide")), "\n            "), "\n            ", h("div", { "style": {"display":"grid","gridTemplateColumns":"repeat(7, minmax(0, 1fr))","gap":"8px"} }, "\n              ", A(R(v0, "pdp.sizes")).map((it, i) => { const v1 = Object.assign({}, v0, { "z": it, $index: i }); return h(F, { key: i }, "\n                ", h("button", { "onClick": R(v1, "z.onPick"), "style": S(R(v1, "z.style")) }, X(R(v1, "z.label"))), "\n              "); }), "\n            "), "\n            ", (R(v0, "pdp.hasErr") ? h(F, null, "\n              ", h("div", { "style": {"fontSize":"13px","color":"#A3352B"} }, X(R(v0, "pdp.err"))), "\n            ") : null), "\n          "), "\n\n          ", h("div", { "style": {"display":"flex","flexDirection":"column","gap":"12px"} }, "\n            ", h("div", { "style": {"fontSize":"11.5px","letterSpacing":"0.16em","textTransform":"uppercase","color":"var(--auve-muted)"} }, "Quantity"), "\n            ", h("div", { "style": {"display":"flex","gap":"12px","alignItems":"stretch","flexWrap":"wrap"} }, "\n              ", h("div", { "style": {"display":"flex","alignItems":"center","border":"1px solid rgba(var(--auve-ink-rgb),0.22)","borderRadius":"999px"} }, "\n                ", h("button", { "onClick": R(v0, "pdp.dec"), "style": {"width":"48px","height":"52px","background":"none","border":"none","fontSize":"18px","cursor":"pointer","color":"var(--auve-ink)"} }, "−"), "\n                ", h("div", { "style": {"minWidth":"28px","textAlign":"center","fontSize":"15px"} }, X(R(v0, "pdp.qty"))), "\n                ", h("button", { "onClick": R(v0, "pdp.inc"), "style": {"width":"48px","height":"52px","background":"none","border":"none","fontSize":"18px","cursor":"pointer","color":"var(--auve-ink)"} }, "+"), "\n              "), "\n              ", h("button", { "onClick": R(v0, "pdp.add"), "style": {"flex":"1","minWidth":"180px","background":"var(--auve-btn)","color":"var(--auve-btn-ink)","border":"none","borderRadius":"999px","padding":"17px 24px","fontSize":"13px","letterSpacing":"0.14em","textTransform":"uppercase","cursor":"pointer","transition":"background 0.25s ease"}, className: "au-h5" }, "Add to cart · ", X(R(v0, "pdp.lineTotal"))), "\n            "), "\n            ", h("button", { "onClick": R(v0, "pdp.buyNow"), "style": {"background":"none","color":"var(--auve-ink)","border":"1px solid rgba(var(--auve-ink-rgb),0.3)","borderRadius":"999px","padding":"16px 24px","fontSize":"13px","letterSpacing":"0.14em","textTransform":"uppercase","cursor":"pointer"}, className: "au-h7" }, "Buy now"), "\n          "), "\n\n          ", h("div", { "style": {"display":"flex","flexDirection":"column","borderTop":"1px solid rgba(var(--auve-ink-rgb),0.12)"} }, h("div", { "style": {"padding":"16px 0 6px","fontSize":"11.5px","letterSpacing":"0.16em","textTransform":"uppercase","color":"var(--auve-ink)"} }, "Details"), (R(v0, "pdp.details") || []).map((d, i) => h("div", { key: "d" + i, "style": {"display":"flex","justifyContent":"space-between","gap":"16px","padding":"15px 0","borderBottom":"1px solid rgba(var(--auve-ink-rgb),0.08)","fontSize":"14px"} }, h("span", { "style": {"color":"var(--auve-muted)"} }, d[0]), h("span", { "style": {"textAlign":"right"} }, d[1]))), "\n            ", h("div", { "style": {"display":"flex","justifyContent":"space-between","gap":"16px","padding":"15px 0","borderBottom":"1px solid rgba(var(--auve-ink-rgb),0.08)","fontSize":"14px"} }, h("span", { "style": {"color":"var(--auve-muted)"} }, "Shipping"), h("span", { "style": {"textAlign":"right"} }, X(R(v0, "freeShipLine")))), "\n            ", h("div", { "style": {"display":"flex","justifyContent":"space-between","gap":"16px","padding":"15px 0","borderBottom":"1px solid rgba(var(--auve-ink-rgb),0.08)","fontSize":"14px"} }, h("span", { "style": {"color":"var(--auve-muted)"} }, "Exchange"), h("span", { "style": {"textAlign":"right"} }, h("a", { "href": "exchange-policy.html", "style": {"color":"inherit","textDecoration":"underline"} }, "5-day size exchange"))), h("div", { "style": {"display":"flex","justifyContent":"space-between","gap":"16px","padding":"15px 0","borderBottom":"1px solid rgba(var(--auve-ink-rgb),0.08)","fontSize":"14px"} }, h("span", { "style": {"color":"var(--auve-muted)"} }, "Country of origin"), h("span", { "style": {"textAlign":"right"} }, "India · handmade in Surat")), "\n          "), "\n        "), "\n      "), "\n\n      ", h("div", { "style": {"marginTop":"clamp(60px, 8vw, 110px)"} }, "\n        ", h("h2", { "style": {"margin":"0 0 28px","fontFamily":"Belleza, sans-serif","fontWeight":"400","fontSize":"clamp(25.8px, 3.1vw, 37.8px)","lineHeight":"1"} }, "More from ", X(R(v0, "pdp.collName"))), "\n        ", h("div", { "style": {"display":"grid","gridTemplateColumns":"repeat(auto-fill, minmax(220px, 1fr))","gap":"32px 20px"} }, "\n          ", A(R(v0, "related")).map((it, i) => { const v1 = Object.assign({}, v0, { "p": it, $index: i }); return h(F, { key: i }, "\n            ", h("a", { "href": R(v1, "p.href"), "style": {"display":"block"} }, "\n              ", h("div", { "style": {"position":"relative","overflow":"hidden","borderRadius":"3px","aspectRatio":"4 / 5","background":"#F3EFEA"} }, "\n                ", h("img", { "src": R(v1, "p.img"), "alt": R(v1, "p.name"), "style": {"position":"absolute","inset":"0","width":"100%","height":"100%","objectFit":"cover"} }), "\n                ", h("img", { "src": R(v1, "p.img2"), "alt": "", "style": {"position":"absolute","inset":"0","width":"100%","height":"100%","objectFit":"cover","opacity":"0","transition":"opacity 0.6s ease"}, className: "au-h2" }), "\n              "), "\n              ", h("div", { "style": {"display":"flex","justifyContent":"space-between","gap":"12px","marginTop":"14px","alignItems":"baseline"} }, "\n                ", h("div", { "style": {"fontFamily":"Belleza, sans-serif","fontSize":"18.1px"} }, X(R(v1, "p.name"))), "\n                ", h("div", { "style": {"fontSize":"14px","whiteSpace":"nowrap"} }, X(R(v1, "p.price"))), "\n              "), "\n            "), "\n          "); }), "\n        "), "\n      "), "\n    "), "\n  ") : null), "\n\n  ", "\n  ", (R(v0, "isBag") ? h("section", { "data-screen-label": "Cart", "style": {"maxWidth":"1240px","margin":"0 auto","padding":"clamp(36px, 5vw, 64px) 22px clamp(60px, 8vw, 110px)"} },
  h("h1", { "style": {"margin":"0 0 22px","fontFamily":"Belleza, sans-serif","fontWeight":"400","fontSize":"clamp(32px, 3.8vw, 46px)","letterSpacing":"0.02em","lineHeight":"1.1"} }, "Your cart"),
  (R(v0, "cartEmpty") ? h("div", { "style": {"padding":"44px 0","borderTop":"1px solid rgba(var(--auve-ink-rgb),0.12)","display":"flex","flexDirection":"column","gap":"20px","alignItems":"start"} },
    h("div", { "style": {"fontSize":"15px","color":"var(--auve-muted2)"} }, "Your cart is empty."),
    h("a", { "href": "#/shop", className: "au-h6", "style": {"background":"var(--auve-btn)","color":"var(--auve-btn-ink)","padding":"16px 32px","borderRadius":"2px","fontSize":"12.5px","letterSpacing":"0.14em","textTransform":"uppercase"} }, "Shop all pairs")) : null),
  (R(v0, "cartFull") ? h(F, null,
    h("div", { "style": {"display":"grid","gridTemplateColumns": R(v0, "narrow") ? "1fr" : "minmax(0, 1fr) 340px","gap":"clamp(24px, 3vw, 44px)","alignItems":"start"} },
      h("div", { "style": {"display":"flex","flexDirection":"column","minWidth":"0"} },
        (R(v0, "wide") ? h("div", { "style": {"display":"grid","gridTemplateColumns":"minmax(0, 1fr) 100px 132px 100px 28px","gap":"16px","padding":"14px 18px","background":"var(--auve-card)","fontSize":"11px","letterSpacing":"0.16em","textTransform":"uppercase","color":"var(--auve-muted)"} },
          h("span", null, "Product"), h("span", { "style": {"textAlign":"right"} }, "Price"), h("span", { "style": {"textAlign":"center"} }, "Quantity"), h("span", { "style": {"textAlign":"right"} }, "Total"), h("span", null)) : null),
        A(R(v0, "cartLines")).map((c, i) => {
          const stepper = h("div", { "style": {"display":"inline-flex","alignItems":"center","border":"1px solid rgba(var(--auve-ink-rgb),0.25)","borderRadius":"2px","height":"40px"} },
            h("button", { "onClick": c.dec, "aria-label": "Decrease", "style": {"width":"38px","height":"100%","background":"none","border":"none","fontSize":"16px","cursor":"pointer","color":"var(--auve-ink)"} }, "−"),
            h("div", { "style": {"minWidth":"26px","textAlign":"center","fontSize":"14px"} }, c.qty),
            h("button", { "onClick": c.inc, "aria-label": "Increase", "style": {"width":"38px","height":"100%","background":"none","border":"none","fontSize":"16px","cursor":"pointer","color":"var(--auve-ink)"} }, "+"));
          const remove = h("button", { "onClick": c.remove, "aria-label": "Remove " + c.name, "style": {"background":"none","border":"none","padding":"0","width":"28px","height":"28px","fontSize":"18px","lineHeight":"1","color":"var(--auve-muted)","cursor":"pointer"} }, "×");
          const thumb = h("a", { "href": c.href, "style": {"width": R(v0, "narrow") ? "84px" : "72px","aspectRatio":"4 / 5","overflow":"hidden","background":"#F3EFEA","flexShrink":"0"} }, h("img", { "src": c.img, "alt": c.name, "style": {"width":"100%","height":"100%","objectFit":"cover","display":"block"} }));
          const info = h("div", { "style": {"display":"flex","flexDirection":"column","gap":"5px","minWidth":"0"} },
            h("a", { "href": c.href, "style": {"fontFamily":"Belleza, sans-serif","fontSize":"19px","lineHeight":"1.2"} }, c.name),
            h("div", { "style": {"fontSize":"12.5px","color":"var(--auve-muted)","lineHeight":"1.5"} }, c.meta),
            (R(v0, "narrow") ? h("div", { "style": {"fontSize":"13px","color":"var(--auve-muted2)"} }, c.unitPrice) : null));
          return R(v0, "narrow")
            ? h("div", { key: i, "style": {"display":"flex","gap":"14px","padding":"18px 0","borderBottom":"1px solid rgba(var(--auve-ink-rgb),0.12)","position":"relative"} }, thumb,
                h("div", { "style": {"flex":"1","display":"flex","flexDirection":"column","gap":"12px","minWidth":"0","paddingRight":"28px"} }, info,
                  h("div", { "style": {"display":"flex","alignItems":"center","justifyContent":"space-between","gap":"12px"} }, stepper, h("div", { "style": {"fontSize":"15px"} }, c.lineTotal))),
                h("div", { "style": {"position":"absolute","top":"14px","right":"0"} }, remove))
            : h("div", { key: i, "style": {"display":"grid","gridTemplateColumns":"minmax(0, 1fr) 100px 132px 100px 28px","gap":"16px","alignItems":"center","padding":"18px","borderBottom":"1px solid rgba(var(--auve-ink-rgb),0.12)"} },
                h("div", { "style": {"display":"flex","gap":"16px","alignItems":"center","minWidth":"0"} }, thumb, info),
                h("div", { "style": {"textAlign":"right","fontSize":"14px"} }, c.unitPrice),
                h("div", { "style": {"display":"flex","justifyContent":"center"} }, stepper),
                h("div", { "style": {"textAlign":"right","fontSize":"14.5px"} }, c.lineTotal),
                remove);
        }),
        h("a", { "href": "#/shop", "style": {"marginTop":"22px","alignSelf":"start","fontSize":"12px","letterSpacing":"0.14em","textTransform":"uppercase","borderBottom":"1px solid rgba(var(--auve-ink-rgb),0.35)","paddingBottom":"3px"} }, "← Continue shopping")),
      h("div", { "style": {"display":"flex","flexDirection":"column","gap":"14px","position": R(v0, "narrow") ? "static" : "sticky","top":"96px"} },
        h("div", { "style": {"fontSize":"12px","letterSpacing":"0.18em","textTransform":"uppercase","paddingBottom":"12px","borderBottom":"2px solid var(--auve-ink)"} }, "Order summary"),
        h("div", { "style": {"display":"flex","justifyContent":"space-between","fontSize":"14px","paddingBottom":"12px","borderBottom":"1px solid rgba(var(--auve-ink-rgb),0.12)"} }, h("span", { "style": {"color":"var(--auve-muted2)"} }, "Subtotal · ", X(R(v0, "pairsLabel"))), h("span", null, X(R(v0, "t.subtotal")))),
        (R(v0, "t.hasPromo") ? h("div", { "style": {"display":"flex","justifyContent":"space-between","fontSize":"14px","color":"#A8743F"} }, h("span", null, X(R(v0, "t.promoLabel"))), h("span", null, "− ", X(R(v0, "t.promo")))) : null),
        h("div", { "style": {"display":"flex","justifyContent":"space-between","fontSize":"14px","paddingBottom":"12px","borderBottom":"1px solid rgba(var(--auve-ink-rgb),0.12)"} }, h("span", { "style": {"color":"var(--auve-muted2)"} }, "Shipping"), h("span", null, X(R(v0, "t.shipping")))),
        (R(v0, "promoOff") ? h("div", { "style": {"display":"flex","flexDirection":"column","gap":"8px"} },
          h("div", { "style": {"fontSize":"13px"} }, "Coupon code"),
          h("div", { "style": {"display":"flex","gap":"8px"} },
            h("input", { "value": D(R(v0, "promoInput"), ""), "onChange": R(v0, "onPromoInput"), "placeholder": "Enter coupon code", className: "au-f8", "style": {"flex":"1","minWidth":"0","fontSize":"13.5px","color":"var(--auve-ink)","padding":"12px 14px","border":"1px solid rgba(var(--auve-ink-rgb),0.22)","borderRadius":"2px","background":"var(--auve-card)","outline":"none"} }),
            h("button", { "onClick": R(v0, "applyPromo"), className: "au-h1", "style": {"background":"none","border":"1px solid var(--auve-ink)","borderRadius":"2px","padding":"0 18px","fontSize":"11.5px","letterSpacing":"0.14em","textTransform":"uppercase","color":"var(--auve-ink)","cursor":"pointer"} }, "Apply")),
          (R(v0, "hasPromoErr") ? h("div", { "style": {"fontSize":"12.5px","color":"#A3352B"} }, X(R(v0, "promoErr"))) : null)) : null),
        (R(v0, "promoOn") ? h("div", { "style": {"display":"flex","justifyContent":"space-between","alignItems":"center","fontSize":"13px","color":"var(--auve-muted2)"} }, h("span", null, "Code ", X(R(v0, "promoCode")), " applied"), h("button", { "onClick": R(v0, "removePromo"), "style": {"background":"none","border":"none","padding":"0","fontSize":"12px","color":"#A8743F","cursor":"pointer"} }, "Remove")) : null),
        h("div", { "style": {"display":"flex","justifyContent":"space-between","alignItems":"baseline","fontSize":"15px","letterSpacing":"0.06em","textTransform":"uppercase","paddingTop":"14px","borderTop":"1px solid rgba(var(--auve-ink-rgb),0.12)"} }, h("span", null, "Total"), h("span", { "style": {"fontSize":"19px","letterSpacing":"0"} }, X(R(v0, "t.total")))),
        h("div", { "style": {"fontSize":"12.5px","color":"var(--auve-muted)","lineHeight":"1.6"} }, "Taxes included. Free shipping on every order."),
        h("a", { "href": "#/checkout", className: "au-h6", "style": {"textAlign":"center","background":"var(--auve-btn)","color":"var(--auve-btn-ink)","borderRadius":"2px","padding":"17px","fontSize":"12.5px","letterSpacing":"0.16em","textTransform":"uppercase"} }, "Proceed to checkout"),
        h("a", { "href": "#/shop", className: "au-h1", "style": {"textAlign":"center","border":"1px solid var(--auve-ink)","borderRadius":"2px","padding":"16px","fontSize":"12.5px","letterSpacing":"0.16em","textTransform":"uppercase"} }, "Continue shopping"),
        h("div", { "style": {"fontSize":"12px","color":"var(--auve-muted)","textAlign":"center"} }, "UPI · Cards · Cash on delivery")))) : null)) : null), "\n\n  ", "\n  ", (R(v0, "isCheckout") ? h(F, null, "\n    ", h("section", { "data-screen-label": "Checkout", "style": {"maxWidth":"1180px","margin":"0 auto","padding":"clamp(36px, 4vw, 60px) 22px clamp(60px, 8vw, 110px)"} }, "\n      ", h("div", { "style": {"display":"flex","flexWrap":"wrap","justifyContent":"space-between","alignItems":"end","gap":"16px","marginBottom":"30px"} }, "\n        ", h("h1", { "style": {"margin":"0","fontFamily":"Belleza, sans-serif","fontWeight":"400","fontSize":"clamp(34.4px, 4.3vw, 53.3px)","lineHeight":"1"} }, "Checkout"), "\n        ", h("a", { "href": "#/bag", "style": {"fontSize":"12.5px","letterSpacing":"0.1em","textTransform":"uppercase","color":"var(--auve-muted)"} }, "← Back to cart"), "\n      "), "\n      ", (R(v0, "cartEmpty") ? h(F, null, "\n        ", h("div", { "style": {"padding":"40px 0","fontSize":"16px","color":"var(--auve-muted2)"} }, "Nothing to check out yet. ", h("a", { "href": "#/shop", "style": {"color":"#A8743F","borderBottom":"1px solid rgba(168,116,63,0.45)"} }, "Shop all pairs")), "\n      ") : null), "\n      ", (R(v0, "cartFull") ? h(F, null, "\n        ", h("div", { "style": {"display":"grid","gridTemplateColumns":"repeat(auto-fit, minmax(330px, 1fr))","gap":"clamp(28px, 4vw, 56px)","alignItems":"start"} }, "\n          ", h("div", { "style": {"display":"flex","flexDirection":"column","gap":"34px"} }, "\n            ", h("div", { "style": {"display":"flex","flexDirection":"column","gap":"16px"} }, "\n              ", h("div", { "style": {"display":"flex","alignItems":"baseline","gap":"12px"} }, h("span", { "style": {"fontFamily":"Belleza, sans-serif","fontSize":"18.9px","color":"#B98E4F"} }, "01"), h("span", { "style": {"fontFamily":"Belleza, sans-serif","fontSize":"22.4px"} }, "Delivery address")), "\n              ", h("div", { "style": {"display":"grid","gridTemplateColumns":"repeat(auto-fit, minmax(200px, 1fr))","gap":"14px"} }, "\n                ", A(R(v0, "coFields")).map((it, i) => { const v1 = Object.assign({}, v0, { "f": it, $index: i }); return h(F, { key: i }, "\n                  ", h("label", { "style": {"display":"flex","flexDirection":"column","gap":"7px","fontSize":"11px","letterSpacing":"0.16em","textTransform":"uppercase","color":"var(--auve-muted)"} }, X(R(v1, "f.label")), "\n                    ", h("input", { "value": D(R(v1, "f.value"), ""), "onChange": R(v1, "f.onChange"), "placeholder": R(v1, "f.ph"), "inputMode": R(v1, "f.mode"), "style": {"fontSize":"15.5px","color":"var(--auve-ink)","padding":"13px 14px","border":"1px solid rgba(var(--auve-ink-rgb),0.18)","borderRadius":"3px","background":"var(--auve-card)","outline":"none","letterSpacing":"0","textTransform":"none","width":"100%"}, className: "au-f8" }), "\n                  "), "\n                "); }), "\n              "), "\n            "), "\n\n            ", h("div", { "style": {"display":"flex","flexDirection":"column","gap":"16px"} }, "\n              ", h("div", { "style": {"display":"flex","alignItems":"baseline","gap":"12px"} }, h("span", { "style": {"fontFamily":"Belleza, sans-serif","fontSize":"18.9px","color":"#B98E4F"} }, "02"), h("span", { "style": {"fontFamily":"Belleza, sans-serif","fontSize":"22.4px"} }, "Shipping")), "\n              ", h("div", { "style": {"display":"flex","flexDirection":"column","gap":"10px"} }, "\n                ", A(R(v0, "shipOpts")).map((it, i) => { const v1 = Object.assign({}, v0, { "o": it, $index: i }); return h(F, { key: i }, "\n                  ", h("button", { "onClick": R(v1, "o.onPick"), "style": S(R(v1, "o.style")) }, "\n                    ", h("span", { "style": S(R(v1, "o.dot")) }), "\n                    ", h("span", { "style": {"flex":"1","textAlign":"left","display":"flex","flexDirection":"column","gap":"3px"} }, h("span", { "style": {"fontSize":"15px"} }, X(R(v1, "o.label"))), h("span", { "style": {"fontSize":"12.5px","color":"var(--auve-muted)"} }, X(R(v1, "o.eta")))), "\n                    ", h("span", { "style": {"fontSize":"14.5px"} }, X(R(v1, "o.price"))), "\n                  "), "\n                "); }), "\n              "), "\n            "), "\n\n            ", h("div", { "style": {"display":"flex","flexDirection":"column","gap":"16px"} }, "\n              ", h("div", { "style": {"display":"flex","alignItems":"baseline","gap":"12px"} }, h("span", { "style": {"fontFamily":"Belleza, sans-serif","fontSize":"18.9px","color":"#B98E4F"} }, "03"), h("span", { "style": {"fontFamily":"Belleza, sans-serif","fontSize":"22.4px"} }, "Payment")), "\n              ", h("div", { "style": {"display":"grid","gridTemplateColumns":"repeat(3, minmax(0, 1fr))","gap":"8px"} }, "\n                ", A(R(v0, "payOpts")).map((it, i) => { const v1 = Object.assign({}, v0, { "o": it, $index: i }); return h(F, { key: i }, "\n                  ", h("button", { "onClick": R(v1, "o.onPick"), "style": S(R(v1, "o.style")) }, h("span", { "style": {"fontSize":"14.5px"} }, X(R(v1, "o.label"))), h("span", { "style": {"fontSize":"11.5px","color":"var(--auve-muted)"} }, X(R(v1, "o.sub")))), "\n                "); }), "\n              "), "\n              ", h("div", { "style": {"background":"var(--auve-card)","border":"1px solid rgba(var(--auve-ink-rgb),0.1)","borderRadius":"4px","padding":"20px","display":"flex","flexDirection":"column","gap":"14px"} }, "\n                ", (R(v0, "payUpi") ? h(F, null, "\n                  ", h("div", { "style": {"display":"flex","flexWrap":"wrap","gap":"8px"} }, "\n                    ", A(R(v0, "upiApps")).map((it, i) => { const v1 = Object.assign({}, v0, { "a": it, $index: i }); return h(F, { key: i }, "\n                      ", h("button", { "onClick": R(v1, "a.onPick"), "style": S(R(v1, "a.style")) }, X(R(v1, "a.label"))), "\n                    "); }), "\n                  "), "\n                  ", (R(v0, "upiIdOn") ? h("label", { "style": {"display":"flex","flexDirection":"column","gap":"7px","fontSize":"11px","letterSpacing":"0.16em","textTransform":"uppercase","color":"var(--auve-muted)"} }, "Or enter UPI ID\n                    ", h("input", { "value": D(R(v0, "upiId"), ""), "onChange": R(v0, "onUpiId"), "placeholder": "yourname@okhdfcbank", "style": {"fontSize":"15.5px","color":"var(--auve-ink)","padding":"13px 14px","border":"1px solid rgba(var(--auve-ink-rgb),0.18)","borderRadius":"3px","background":"var(--auve-bg)","outline":"none","letterSpacing":"0","textTransform":"none"}, className: "au-f8" }), "\n                  ") : null), "\n                  ", h("div", { "style": {"fontSize":"12.5px","color":"var(--auve-muted)"} }, X(R(v0, "upiNote"))), "\n                ") : null), "\n                ", (R(v0, "payCard") ? h(F, null, "\n                  ", (R(v0, "cardFieldsOn") ? h("div", { "style": {"display":"grid","gridTemplateColumns":"repeat(2, minmax(0, 1fr))","gap":"12px"} }, "\n                    ", A(R(v0, "cardFields")).map((it, i) => { const v1 = Object.assign({}, v0, { "f": it, $index: i }); return h(F, { key: i }, "\n                      ", h("label", { "style": S(R(v1, "f.wrap")) }, X(R(v1, "f.label")), "\n                        ", h("input", { "value": D(R(v1, "f.value"), ""), "onChange": R(v1, "f.onChange"), "placeholder": R(v1, "f.ph"), "inputMode": R(v1, "f.mode"), "style": {"fontSize":"15.5px","color":"var(--auve-ink)","padding":"13px 14px","border":"1px solid rgba(var(--auve-ink-rgb),0.18)","borderRadius":"3px","background":"var(--auve-bg)","outline":"none","letterSpacing":"0","textTransform":"none","width":"100%"}, className: "au-f8" }), "\n                      "), "\n                    "); }), "\n                  ") : null), "\n                  ", h("div", { "style": {"fontSize":"12.5px","color":"var(--auve-muted)"} }, X(R(v0, "cardNote"))), "\n                ") : null), "\n                ", (R(v0, "payCod") ? h(F, null, "\n                  ", h("div", { "style": {"fontSize":"14.5px","lineHeight":"1.7","color":"var(--auve-muted2)"} }, "Pay in cash or by UPI when the pair arrives, at no extra charge. We'll email you to confirm before dispatch."), "\n                ") : null), "\n              "), "\n            "), "\n          "), "\n\n          ", h("div", { "style": {"background":"var(--auve-card)","border":"1px solid rgba(var(--auve-ink-rgb),0.1)","borderRadius":"4px","padding":"26px","display":"flex","flexDirection":"column","gap":"14px","position":"sticky","top":"96px"} }, "\n            ", h("div", { "style": {"fontFamily":"Belleza, sans-serif","fontSize":"22.4px"} }, "Your order"), "\n            ", A(R(v0, "cartLines")).map((it, i) => { const v1 = Object.assign({}, v0, { "c": it, $index: i }); return h(F, { key: i }, "\n              ", h("div", { "style": {"display":"flex","gap":"14px","alignItems":"center"} }, "\n                ", h("div", { "style": {"position":"relative","width":"58px","height":"72px","borderRadius":"2px","overflow":"hidden","background":"#F3EFEA","flexShrink":"0"} }, "\n                  ", h("img", { "src": R(v1, "c.img"), "alt": R(v1, "c.name"), "style": {"width":"100%","height":"100%","objectFit":"cover","display":"block"} }), "\n                "), "\n                ", h("div", { "style": {"flex":"1","minWidth":"0"} }, "\n                  ", h("div", { "style": {"fontFamily":"Belleza, sans-serif","fontSize":"15.5px"} }, X(R(v1, "c.name")), " × ", X(R(v1, "c.qty"))), "\n                  ", h("div", { "style": {"fontSize":"12px","color":"var(--auve-muted)","marginTop":"2px"} }, X(R(v1, "c.meta"))), "\n                "), "\n                ", h("div", { "style": {"fontSize":"14px","whiteSpace":"nowrap"} }, X(R(v1, "c.lineTotal"))), "\n              "), "\n            "); }), "\n            ", h("div", { "style": {"height":"1px","background":"rgba(27,26,52,0.12)","marginTop":"4px"} }), "\n            ", h("div", { "style": {"display":"flex","justifyContent":"space-between","fontSize":"14px"} }, h("span", { "style": {"color":"var(--auve-muted)"} }, "Subtotal"), h("span", null, X(R(v0, "t.subtotal")))), "\n            ", (R(v0, "t.hasDiscount") ? h(F, null, "\n              ", h("div", { "style": {"display":"flex","justifyContent":"space-between","fontSize":"14px","color":"#A8743F"} }, h("span", null, X(R(v0, "t.discountLabel"))), h("span", null, "− ", X(R(v0, "t.discount")))), "\n            ") : null), "\n            ", (R(v0, "t.hasPromo") ? h(F, null, "\n              ", h("div", { "style": {"display":"flex","justifyContent":"space-between","fontSize":"14px","color":"#A8743F"} }, h("span", null, X(R(v0, "t.promoLabel"))), h("span", null, "− ", X(R(v0, "t.promo")))), "\n            ") : null), "\n            ", h("div", { "style": {"display":"flex","justifyContent":"space-between","fontSize":"14px"} }, h("span", { "style": {"color":"var(--auve-muted)"} }, "Shipping"), h("span", null, X(R(v0, "t.shipping")))), "\n            ", (R(v0, "t.hasCod") ? h(F, null, "\n              ", h("div", { "style": {"display":"flex","justifyContent":"space-between","fontSize":"14px"} }, h("span", { "style": {"color":"var(--auve-muted)"} }, "COD fee"), h("span", null, X(R(v0, "codFee")))), "\n            ") : null), "\n            ", h("div", { "style": {"height":"1px","background":"rgba(27,26,52,0.12)"} }), "\n            ", h("div", { "style": {"display":"flex","justifyContent":"space-between","fontSize":"19px"} }, h("span", null, "Total"), h("span", null, X(R(v0, "t.total")))), "\n            ", (R(v0, "hasCoErr") ? h(F, null, "\n              ", h("div", { "style": {"fontSize":"13px","color":"#A3352B","lineHeight":"1.5"} }, X(R(v0, "coErr"))), "\n            ") : null), "\n            ", (R(v0, "coWhatsApp") ? h(F, null, h("a", { "href": R(v0, "coWaLink"), "target": "_blank", "rel": "noopener", "style": {"display":"block","textAlign":"center","border":"1px solid var(--auve-ink)","color":"var(--auve-ink)","borderRadius":"999px","padding":"16px","fontSize":"13px","letterSpacing":"0.14em","textTransform":"uppercase"} }, "Send order on WhatsApp")) : null), "\n            ", h("button", { "onClick": R(v0, "placeOrder"), "style": {"background":"var(--auve-btn)","color":"var(--auve-btn-ink)","border":"none","borderRadius":"999px","padding":"18px","fontSize":"13px","letterSpacing":"0.14em","textTransform":"uppercase","cursor":"pointer","transition":"background 0.25s ease"}, className: "au-h5" }, X(R(v0, "placeLabel"))), "\n            ", h("div", { "style": {"fontSize":"12px","color":"var(--auve-muted)","textAlign":"center","lineHeight":"1.6"} }, "By placing this order you agree to our ", h("a", { "href": "terms.html", "style": {"color":"inherit","textDecoration":"underline"} }, "Terms & Conditions"), ", ", h("a", { "href": "privacy-policy.html", "style": {"color":"inherit","textDecoration":"underline"} }, "Privacy Policy"), " and ", h("a", { "href": "exchange-policy.html", "style": {"color":"inherit","textDecoration":"underline"} }, "Exchange & Cancellation Policy"), ". Need help? WhatsApp ", X(R(v0, "whatsappNumber"))), "\n          "), "\n        "), "\n      ") : null), "\n    "), "\n  ") : null), "\n\n  ", "\n  ", (R(v0, "isConfirm") ? h(F, null, "\n    ", h("section", { "data-screen-label": "Order confirmed", "style": {"maxWidth":"780px","margin":"0 auto","padding":"clamp(50px, 7vw, 100px) 22px clamp(60px, 8vw, 110px)"} }, "\n      ", (R(v0, "noOrder") ? h(F, null, "\n        ", h("div", { "style": {"fontSize":"16px","color":"var(--auve-muted2)"} }, "No recent order found. ", h("a", { "href": "#/shop", "style": {"color":"#A8743F"} }, "Shop all pairs")), "\n      ") : null), "\n      ", (R(v0, "hasOrder") ? h(F, null, "\n        ", h("div", { "style": {"display":"flex","flexDirection":"column","gap":"18px","alignItems":"start"} }, "\n          ", h("div", { "style": {"width":"56px","height":"56px","borderRadius":"50%","background":"#EEEDF5","display":"flex","alignItems":"center","justifyContent":"center","fontSize":"24px","color":"var(--auve-ink)"} }, "✓"), "\n          ", h("div", { "style": {"fontSize":"11.5px","letterSpacing":"0.24em","textTransform":"uppercase","color":"#A8743F"} }, "Order ", X(R(v0, "order.id"))), "\n          ", h("h1", { "style": {"margin":"0","fontFamily":"Belleza, sans-serif","fontWeight":"400","fontSize":"clamp(34.4px, 4.8vw, 55px)","lineHeight":"1"} }, "Thank you, ", X(R(v0, "order.first")), "."), "\n          ", h("p", { "style": {"margin":"0","fontSize":"16px","lineHeight":"1.75","fontWeight":"300","color":"var(--auve-muted2)","maxWidth":"52ch"} }, "Your order is confirmed. We'll send updates to ", X(R(v0, "order.email")), " by email. Expected delivery: ", h("strong", { "style": {"fontWeight":"500","color":"var(--auve-ink)"} }, X(R(v0, "order.eta"))), "."), "\n        "), "\n        ", h("div", { "style": {"marginTop":"36px","background":"var(--auve-card)","border":"1px solid rgba(var(--auve-ink-rgb),0.1)","borderRadius":"4px","padding":"26px","display":"flex","flexDirection":"column","gap":"14px"} }, "\n          ", A(R(v0, "order.lines")).map((it, i) => { const v1 = Object.assign({}, v0, { "c": it, $index: i }); return h(F, { key: i }, "\n            ", h("div", { "style": {"display":"flex","gap":"14px","alignItems":"center"} }, "\n              ", h("div", { "style": {"width":"58px","height":"72px","borderRadius":"2px","overflow":"hidden","background":"#F3EFEA","flexShrink":"0"} }, h("img", { "src": R(v1, "c.img"), "alt": R(v1, "c.name"), "style": {"width":"100%","height":"100%","objectFit":"cover","display":"block"} })), "\n              ", h("div", { "style": {"flex":"1"} }, h("div", { "style": {"fontFamily":"Belleza, sans-serif","fontSize":"16.3px"} }, X(R(v1, "c.name")), " × ", X(R(v1, "c.qty"))), h("div", { "style": {"fontSize":"12.5px","color":"var(--auve-muted)","marginTop":"2px"} }, X(R(v1, "c.meta")))), "\n              ", h("div", { "style": {"fontSize":"14px"} }, X(R(v1, "c.lineTotal"))), "\n            "), "\n          "); }), "\n          ", h("div", { "style": {"height":"1px","background":"rgba(27,26,52,0.12)"} }), "\n          ", h("div", { "style": {"display":"grid","gridTemplateColumns":"repeat(auto-fit, minmax(200px, 1fr))","gap":"18px","fontSize":"14px","lineHeight":"1.6"} }, "\n            ", h("div", null, h("div", { "style": {"fontSize":"11px","letterSpacing":"0.16em","textTransform":"uppercase","color":"var(--auve-muted)","marginBottom":"6px"} }, "Delivering to"), X(R(v0, "order.address"))), "\n            ", h("div", null, h("div", { "style": {"fontSize":"11px","letterSpacing":"0.16em","textTransform":"uppercase","color":"var(--auve-muted)","marginBottom":"6px"} }, "Payment"), X(R(v0, "order.method"))), "\n            ", h("div", null, h("div", { "style": {"fontSize":"11px","letterSpacing":"0.16em","textTransform":"uppercase","color":"var(--auve-muted)","marginBottom":"6px"} }, "Total"), h("span", { "style": {"fontSize":"18px"} }, X(R(v0, "order.total")))), "\n          "), "\n        "), "\n        ", h("div", { "style": {"display":"flex","flexWrap":"wrap","gap":"12px","marginTop":"28px"} }, "\n          ", h("a", { "href": R(v0, "order.trackHref"), "style": {"background":"var(--auve-btn)","color":"var(--auve-btn-ink)","padding":"16px 30px","borderRadius":"999px","fontSize":"13px","letterSpacing":"0.12em","textTransform":"uppercase"}, className: "au-h6" }, "Track this order"), "\n          ", h("a", { "href": "#/shop", "style": {"border":"1px solid rgba(var(--auve-ink-rgb),0.3)","padding":"16px 30px","borderRadius":"999px","fontSize":"13px","letterSpacing":"0.12em","textTransform":"uppercase"}, className: "au-h7" }, "Continue shopping"), "\n        "), "\n      ") : null), "\n    "), "\n  ") : null), "\n\n  ", "\n  ", (R(v0, "isAbout") ? h(F, null,
  h("section", { "data-screen-label": "About", "style": {"position":"relative","height":"clamp(460px, 82vh, 860px)","overflow":"hidden","background":"#1B1A34"} },
    h("video", { "ref": R(v0, "videoRef"), "src": "assets/reels/champagne.mp4", "poster": "assets/p/gd-champagne-1.jpg", "autoPlay": true, "muted": true, "loop": true, "playsInline": true, "preload": "auto", "style": {"position":"absolute","inset":"0","width":"100%","height":"100%","objectFit":"cover","objectPosition":"50% 75%"} }),
    h("div", { "style": {"position":"absolute","inset":"0","background":"linear-gradient(to top, rgba(27,26,52,0.72) 0%, rgba(27,26,52,0.2) 50%, rgba(27,26,52,0.05) 100%)"} }),
    h("div", { "style": {"position":"absolute","left":"0","right":"0","bottom":"0","padding":"0 16px clamp(18px, 3vh, 30px)","display":"flex","flexDirection":"column","alignItems":"center","textAlign":"center","gap":"16px","color":"#FFF"} },
      h("h1", { "style": {"margin":"0","fontFamily":"Belleza, sans-serif","fontWeight":"400","fontSize":"clamp(22px, 3vw, 40px)","lineHeight":"1.15","whiteSpace":"nowrap"} }, "The styles change with time.", h("br", null), h("span", { "style": {"color":"#E8CDB6"} }, "The feeling doesn't.")))),
  h("section", { "style": {"maxWidth":"760px","margin":"0 auto","padding":"clamp(56px, 7vw, 100px) 22px 0","textAlign":"center"} },
    h("h2", { "style": {"margin":"0 0 26px","fontFamily":"Belleza, sans-serif","fontWeight":"400","fontSize":"clamp(30px, 3.4vw, 42px)","lineHeight":"1.1"} }, "Our story"),
    h("div", { "style": {"display":"flex","flexDirection":"column","gap":"18px","fontSize":"clamp(15px, 1.2vw, 17px)","lineHeight":"1.85","color":"var(--auve-muted2)","textWrap":"pretty"} },
      h("p", { "style": {"margin":"0"} }, "AUVÉ, said ", h("em", null, "oh-way"), ", was born from a simple thought: everyday style can be special too."),
      h("p", { "style": {"margin":"0"} }, "With a love for thoughtful details and contemporary design, AUVÉ brings together handcrafted footwear, comfort and style. Every pair is designed with care, keeping in mind the little details that make all the difference."),
      h("p", { "style": {"margin":"0"} }, "We wanted to create pieces that fit effortlessly into your everyday life, yet feel special enough for the moments you want to stand out."),
      h("p", { "style": {"margin":"0"} }, "The name AUVÉ comes from ‘Au’, meaning gold, and ‘Vé’, meaning way. Together, ", h("em", null, "The Golden Way"), ". A reflection of our belief that style is not about following every trend, but finding your own way."),
      h("p", { "style": {"margin":"0"} }, "And that’s what AUVÉ is about: making every step feel a little more special."))),
  h("section", { "style": {"maxWidth":"1080px","margin":"0 auto","padding":"clamp(64px, 8vw, 120px) 22px","display":"grid","gridTemplateColumns":"repeat(auto-fit, minmax(min(100%, 300px), 1fr))","gap":"clamp(28px, 5vw, 64px)","alignItems":"center"} },
    h("div", { "style": {"aspectRatio":"4 / 5","background":"#E3CDB8","display":"flex","alignItems":"center","justifyContent":"center","fontSize":"11.5px","letterSpacing":"0.2em","textTransform":"uppercase","color":"#6B6257"} }, "Founder photo"),
    h("div", { "style": {"display":"flex","flexDirection":"column","gap":"16px"} },
      h("h2", { "style": {"margin":"0","fontFamily":"Belleza, sans-serif","fontWeight":"400","fontSize":"clamp(30px, 3.4vw, 42px)","lineHeight":"1.1"} }, "Meet our founder"),
      h("div", { "style": {"fontSize":"12px","letterSpacing":"0.2em","textTransform":"uppercase","color":"#A8743F"} }, "[Founder name]"),
      h("p", { "style": {"margin":"0","fontSize":"clamp(15px, 1.2vw, 17px)","lineHeight":"1.85","color":"var(--auve-muted2)","textWrap":"pretty"} }, "[Founder bio: a few lines on who she is, how AUVÉ started and what she cares about.]")))) : null), "\n\n  ", "\n  ", (R(v0, "isContact") ? h(F, null, "\n    ", h("section", { "data-screen-label": "Contact", "style": {"maxWidth":"1180px","margin":"0 auto","padding":"clamp(46px, 6vw, 90px) 22px clamp(60px, 8vw, 110px)","display":"grid","gridTemplateColumns":"repeat(auto-fit, minmax(300px, 1fr))","gap":"clamp(30px, 5vw, 62px)"} }, "\n      ", h("div", { "style": {"display":"flex","flexDirection":"column","gap":"20px"} }, "\n        ", h("div", { "style": {"fontSize":"11.5px","letterSpacing":"0.24em","textTransform":"uppercase","color":"#A8743F"} }, "Contact"), "\n        ", h("h1", { "style": {"margin":"0","fontFamily":"Belleza, sans-serif","fontWeight":"400","fontSize":"clamp(36.1px, 4.8vw, 61.9px)","lineHeight":"0.98"} }, "We reply the same day."), "\n        ", h("div", { "style": {"display":"flex","flexDirection":"column","borderTop":"1px solid rgba(var(--auve-ink-rgb),0.12)","marginTop":"10px"} }, "\n          ", h("a", { "href": R(v0, "waLink"), "target": "_blank", "rel": "noopener", "style": {"display":"flex","justifyContent":"space-between","gap":"16px","padding":"18px 0","borderBottom":"1px solid rgba(var(--auve-ink-rgb),0.1)","fontSize":"15px"} }, h("span", { "style": {"color":"var(--auve-muted)"} }, "WhatsApp"), h("span", null, X(R(v0, "whatsappNumber")), " →")), "\n          ", h("a", { "href": R(v0, "telLink"), "style": {"display":"flex","justifyContent":"space-between","gap":"16px","padding":"18px 0","borderBottom":"1px solid rgba(var(--auve-ink-rgb),0.1)","fontSize":"15px"} }, h("span", { "style": {"color":"var(--auve-muted)"} }, "Call"), h("span", null, "+91 97251 24422")), "\n          ", h("a", { "href": R(v0, "mailLink"), "style": {"display":"flex","justifyContent":"space-between","gap":"16px","padding":"18px 0","borderBottom":"1px solid rgba(var(--auve-ink-rgb),0.1)","fontSize":"15px"} }, h("span", { "style": {"color":"var(--auve-muted)"} }, "Email"), h("span", null, X(R(v0, "email")))), "\n          ", h("a", { "href": "https://www.instagram.com/stepwithauve/", "target": "_blank", "rel": "noopener", "style": {"display":"flex","justifyContent":"space-between","gap":"16px","padding":"18px 0","borderBottom":"1px solid rgba(var(--auve-ink-rgb),0.1)","fontSize":"15px"} }, h("span", { "style": {"color":"var(--auve-muted)"} }, "Instagram"), h("span", null, "@stepwithauve →")), "\n        "), "\n      "), "\n      ", h("div", { "style": {"background":"var(--auve-card)","border":"1px solid rgba(var(--auve-ink-rgb),0.1)","borderRadius":"4px","padding":"clamp(22px, 3vw, 36px)","alignSelf":"start"} }, "\n        ", (R(v0, "contactSent") ? h(F, null, "\n          ", h("div", { "style": {"display":"flex","flexDirection":"column","gap":"14px","alignItems":"start"} }, "\n            ", h("div", { "style": {"fontFamily":"Belleza, sans-serif","fontSize":"25.8px"} }, "Message sent."), "\n            ", h("div", { "style": {"fontSize":"15px","lineHeight":"1.7","color":"var(--auve-muted2)"} }, X(R(v0, "contactMsg"))), "\n            ", h("button", { "onClick": R(v0, "resetContact"), "style": {"background":"none","border":"1px solid rgba(var(--auve-ink-rgb),0.25)","borderRadius":"999px","padding":"12px 22px","fontSize":"13px","letterSpacing":"0.1em","cursor":"pointer","color":"var(--auve-ink)"} }, "Send another"), "\n          "), "\n        ") : null), "\n        ", (R(v0, "contactOpen") ? h(F, null, "\n          ", h("div", { "style": {"display":"flex","flexDirection":"column","gap":"16px"} }, "\n            ", h("div", { "style": {"fontFamily":"Belleza, sans-serif","fontSize":"22.4px"} }, "Send a message"), "\n            ", A(R(v0, "contactFields")).map((it, i) => { const v1 = Object.assign({}, v0, { "f": it, $index: i }); return h(F, { key: i }, "\n              ", h("label", { "style": {"display":"flex","flexDirection":"column","gap":"7px","fontSize":"11px","letterSpacing":"0.16em","textTransform":"uppercase","color":"var(--auve-muted)"} }, X(R(v1, "f.label")), "\n                ", h("input", { "value": D(R(v1, "f.value"), ""), "onChange": R(v1, "f.onChange"), "placeholder": R(v1, "f.ph"), "style": {"fontSize":"15.5px","color":"var(--auve-ink)","padding":"13px 14px","border":"1px solid rgba(var(--auve-ink-rgb),0.18)","borderRadius":"3px","background":"var(--auve-bg)","outline":"none","letterSpacing":"0","textTransform":"none"}, className: "au-f8" }), "\n              "), "\n            "); }), "\n            ", h("label", { "style": {"display":"flex","flexDirection":"column","gap":"7px","fontSize":"11px","letterSpacing":"0.16em","textTransform":"uppercase","color":"var(--auve-muted)"} }, "Message\n              ", h("textarea", { "value": D(R(v0, "contactNote"), ""), "onChange": R(v0, "onContactNote"), "rows": "4", "placeholder": "Size help, an order question…", "style": {"fontSize":"15px","color":"var(--auve-ink)","padding":"13px 14px","border":"1px solid rgba(var(--auve-ink-rgb),0.18)","borderRadius":"3px","background":"var(--auve-bg)","outline":"none","resize":"vertical","letterSpacing":"0","textTransform":"none"} }), "\n            "), "\n            ", h("button", { "onClick": R(v0, "submitContact"), "style": {"background":"var(--auve-btn)","color":"var(--auve-btn-ink)","border":"none","borderRadius":"999px","padding":"17px","fontSize":"13px","letterSpacing":"0.14em","textTransform":"uppercase","cursor":"pointer"}, className: "au-h5" }, "Send message"), "\n          "), "\n        ") : null), "\n      "), "\n    "), "\n  ") : null), "\n\n  ", "\n  ", (R(v0, "isLegal") ? h(F, null, h("section", { "data-screen-label": "Policy", "style": {"maxWidth":"860px","margin":"0 auto","padding":"clamp(46px, 6vw, 90px) 22px clamp(60px, 8vw, 110px)"} },
  h("div", { "style": {"fontSize":"11.5px","letterSpacing":"0.24em","textTransform":"uppercase","color":"#A8743F","marginBottom":"16px"} }, "Policies"),
  h("h1", { "style": {"margin":"0 0 18px","fontFamily":"Belleza, sans-serif","fontWeight":"400","fontSize":"clamp(34.4px, 4.6vw, 58.5px)","lineHeight":"1"} }, X(R(v0, "legal.title"))),
  h("p", { "style": {"margin":"0 0 10px","fontSize":"16px","lineHeight":"1.75","fontWeight":"300","color":"var(--auve-muted2)","maxWidth":"60ch","textWrap":"pretty"} }, X(R(v0, "legal.intro"))),
  h("div", { "style": {"marginBottom":"30px"} }),
  h("div", { "style": {"display":"flex","flexWrap":"wrap","gap":"8px","marginBottom":"44px"} }, A(R(v0, "legalTabs")).map((it, i) => h("a", { key: i, "href": it.href, "style": it.style }, it.label))),
  h("div", { "style": {"display":"flex","flexDirection":"column","borderTop":"1px solid rgba(var(--auve-ink-rgb),0.12)"} }, A(R(v0, "legalSections")).map((it, i) => h("div", { key: i, "style": {"display":"grid","gridTemplateColumns":"repeat(auto-fit, minmax(min(100%, 220px), 1fr))","gap":"8px 40px","padding":"26px 0","borderBottom":"1px solid rgba(var(--auve-ink-rgb),0.12)"} },
    h("h2", { "style": {"margin":"0","fontFamily":"Belleza, sans-serif","fontWeight":"400","fontSize":"20.6px","lineHeight":"1.2"} }, it.h),
    h("div", { "style": {"display":"flex","flexDirection":"column","gap":"12px","gridColumn":"span 2","minWidth":"0"} }, it.p.map((p, j) => h("p", { key: j, "style": {"margin":"0","fontSize":"15px","lineHeight":"1.75","fontWeight":"300","color":"var(--auve-muted2)","textWrap":"pretty"} }, p)))))),
  h("div", { "style": {"marginTop":"44px","padding":"26px 28px","background":"#EEEDF5","borderRadius":"4px","display":"flex","flexWrap":"wrap","gap":"14px","alignItems":"center","justifyContent":"space-between"} },
    h("div", { "style": {"fontFamily":"Belleza, sans-serif","fontSize":"20.6px"} }, "Questions about this policy?"),
    h("a", { "href": "#/contact", "style": {"padding":"12px 26px","borderRadius":"999px","background":"var(--auve-btn)","color":"var(--auve-btn-ink)","fontSize":"13px","letterSpacing":"0.08em"} }, "Contact Us")))) : null), "\n  ", (R(v0, "isFaq") ? h(F, null, "\n    ", h("section", { "data-screen-label": "FAQ", "style": {"maxWidth":"920px","margin":"0 auto","padding":"clamp(46px, 6vw, 90px) 22px clamp(60px, 8vw, 110px)"} }, "\n      ", h("div", { "style": {"fontSize":"11.5px","letterSpacing":"0.24em","textTransform":"uppercase","color":"#A8743F","marginBottom":"16px"} }, "Help"), "\n      ", h("h1", { "style": {"margin":"0 0 40px","fontFamily":"Belleza, sans-serif","fontWeight":"400","fontSize":"clamp(36.1px, 4.8vw, 61.9px)","lineHeight":"0.98"} }, "Your Questions, Answered."), "\n      ", h("div", { "style": {"display":"flex","flexDirection":"column","gap":"44px"} }, "\n        ", A(R(v0, "faqGroups")).map((it, i) => { const v1 = Object.assign({}, v0, { "g": it, $index: i }); return h(F, { key: i }, "\n          ", h("div", null, "\n            ", h("div", { "style": {"fontFamily":"Belleza, sans-serif","fontSize":"24.1px","marginBottom":"8px"} }, X(R(v1, "g.title"))), "\n            ", h("div", { "style": {"display":"flex","flexDirection":"column","borderTop":"1px solid rgba(var(--auve-ink-rgb),0.12)"} }, "\n              ", A(R(v1, "g.items")).map((it, i) => { const v2 = Object.assign({}, v1, { "q": it, $index: i }); return h(F, { key: i }, "\n                ", h("div", { "style": {"borderBottom":"1px solid rgba(var(--auve-ink-rgb),0.12)"} }, "\n                  ", h("button", { "onClick": R(v2, "q.toggle"), "style": {"width":"100%","display":"flex","justifyContent":"space-between","gap":"20px","alignItems":"center","padding":"20px 0","background":"none","border":"none","textAlign":"left","fontSize":"16px","color":"var(--auve-ink)","cursor":"pointer"} }, "\n                    ", h("span", null, X(R(v2, "q.q"))), h("span", { "style": {"fontSize":"20px","color":"#A8743F","flexShrink":"0"} }, X(R(v2, "q.sign"))), "\n                  "), "\n                  ", (R(v2, "q.open") ? h(F, null, "\n                    ", h("div", { "style": {"padding":"0 0 22px","fontSize":"15px","lineHeight":"1.75","fontWeight":"300","color":"var(--auve-muted2)","maxWidth":"64ch"} }, X(R(v2, "q.a"))), "\n                  ") : null), "\n                "), "\n              "); }), "\n            "), "\n          "), "\n        "); }), "\n      "), "\n      ", h("div", { "style": {"marginTop":"50px","padding":"28px","background":"#EEEDF5","borderRadius":"4px","display":"flex","flexWrap":"wrap","gap":"18px","alignItems":"center","justifyContent":"space-between"} }, "\n        ", h("div", { "style": {"fontFamily":"Belleza, sans-serif","fontSize":"22.4px"} }, "Still need help?"), "\n        ", h("a", { "href": R(v0, "waLink"), "target": "_blank", "rel": "noopener", "style": {"background":"var(--auve-btn)","color":"var(--auve-btn-ink)","padding":"15px 26px","borderRadius":"999px","fontSize":"12.5px","letterSpacing":"0.12em","textTransform":"uppercase"}, className: "au-h6" }, "WhatsApp us"), "\n      "), "\n    "), "\n  ") : null), "\n\n  ", "\n  ", (R(v0, "isAccount") ? h(F, null, "\n    ", h("section", { "data-screen-label": "Account", "style": {"maxWidth":"820px","margin":"0 auto","padding":"clamp(46px, 6vw, 90px) 22px clamp(60px, 8vw, 110px)"} }, "\n      ", h("h1", { "style": {"margin":"0 0 28px","fontFamily":"Belleza, sans-serif","fontWeight":"400","fontSize":"clamp(36.1px, 4.8vw, 58.5px)","lineHeight":"0.98"} }, X(R(v0, "accountTitle"))), "\n      ", h("div", { "style": {"display":"flex","gap":"8px","marginBottom":"26px"} }, "\n        ", A(R(v0, "accountTabs")).map((it, i) => { const v1 = Object.assign({}, v0, { "tb": it, $index: i }); return h(F, { key: i }, "\n          ", h("button", { "onClick": R(v1, "tb.onPick"), "style": S(R(v1, "tb.style")) }, X(R(v1, "tb.label"))), "\n        "); }), "\n      "), "\n\n      ", (R(v0, "tabTrack") ? h(F, null, "\n        ", h("div", { "style": {"background":"var(--auve-card)","border":"1px solid rgba(var(--auve-ink-rgb),0.1)","borderRadius":"4px","padding":"clamp(22px, 3vw, 34px)","display":"flex","flexDirection":"column","gap":"16px"} }, "\n          ", h("div", { "style": {"display":"grid","gridTemplateColumns":"repeat(auto-fit, minmax(200px, 1fr))","gap":"14px"} }, "\n            ", h("label", { "style": {"display":"flex","flexDirection":"column","gap":"7px","fontSize":"11px","letterSpacing":"0.16em","textTransform":"uppercase","color":"var(--auve-muted)"} }, "Order number\n              ", h("input", { "value": D(R(v0, "trackId"), ""), "onChange": R(v0, "onTrackId"), "placeholder": "AUV48213", "style": {"fontSize":"15.5px","color":"var(--auve-ink)","padding":"13px 14px","border":"1px solid rgba(var(--auve-ink-rgb),0.18)","borderRadius":"3px","background":"var(--auve-bg)","outline":"none","letterSpacing":"0","textTransform":"none"}, className: "au-f8" }), "\n            "), "\n            ", h("label", { "style": {"display":"flex","flexDirection":"column","gap":"7px","fontSize":"11px","letterSpacing":"0.16em","textTransform":"uppercase","color":"var(--auve-muted)"} }, "Phone used to order\n              ", h("input", { "value": D(R(v0, "trackPhone"), ""), "onChange": R(v0, "onTrackPhone"), "placeholder": "98XXX XXXXX", "inputMode": "tel", "style": {"fontSize":"15.5px","color":"var(--auve-ink)","padding":"13px 14px","border":"1px solid rgba(var(--auve-ink-rgb),0.18)","borderRadius":"3px","background":"var(--auve-bg)","outline":"none","letterSpacing":"0","textTransform":"none"}, className: "au-f8" }), "\n            "), "\n          "), "\n          ", (R(v0, "hasTrackErr") ? h(F, null, h("div", { "style": {"fontSize":"13px","color":"#A3352B"} }, X(R(v0, "trackErr")))) : null), "\n          ", h("button", { "onClick": R(v0, "doTrack"), "style": {"alignSelf":"start","background":"var(--auve-btn)","color":"var(--auve-btn-ink)","border":"none","borderRadius":"999px","padding":"16px 30px","fontSize":"13px","letterSpacing":"0.14em","textTransform":"uppercase","cursor":"pointer"}, className: "au-h5" }, "Track order"), "\n        "), "\n        ", (R(v0, "hasTrack") ? h(F, null, "\n          ", h("div", { "style": {"marginTop":"22px","background":"var(--auve-card)","border":"1px solid rgba(var(--auve-ink-rgb),0.1)","borderRadius":"4px","padding":"clamp(22px, 3vw, 34px)"} }, "\n            ", h("div", { "style": {"display":"flex","flexWrap":"wrap","justifyContent":"space-between","gap":"10px","marginBottom":"26px"} }, "\n              ", h("div", { "style": {"fontFamily":"Belleza, sans-serif","fontSize":"22.4px"} }, "Order ", X(R(v0, "track.id"))), "\n              ", h("div", { "style": {"fontSize":"13.5px","color":"var(--auve-muted)"} }, "Arriving ", X(R(v0, "track.eta"))), "\n            "), "\n            ", h("div", { "style": {"display":"flex","flexDirection":"column"} }, "\n              ", A(R(v0, "track.steps")).map((it, i) => { const v1 = Object.assign({}, v0, { "st": it, $index: i }); return h(F, { key: i }, "\n                ", h("div", { "style": {"display":"flex","gap":"16px"} }, "\n                  ", h("div", { "style": {"display":"flex","flexDirection":"column","alignItems":"center"} }, "\n                    ", h("span", { "style": S(R(v1, "st.dot")) }), "\n                    ", h("span", { "style": S(R(v1, "st.line")) }), "\n                  "), "\n                  ", h("div", { "style": {"paddingBottom":"22px"} }, "\n                    ", h("div", { "style": S(R(v1, "st.labelStyle")) }, X(R(v1, "st.label"))), "\n                    ", h("div", { "style": {"fontSize":"12.5px","color":"var(--auve-muted)","marginTop":"3px"} }, X(R(v1, "st.note"))), "\n                  "), "\n                "), "\n              "); }), "\n            "), "\n          "), "\n        ") : null), "\n      ") : null), "\n\n      ", (R(v0, "tabSignin") ? h(F, null, "\n        ", h("div", { "style": {"background":"var(--auve-card)","border":"1px solid rgba(var(--auve-ink-rgb),0.1)","borderRadius":"4px","padding":"clamp(22px, 3vw, 34px)","display":"flex","flexDirection":"column","gap":"16px"} }, "\n          ", (R(v0, "authPhone") ? h(F, null, "\n            ", h("div", { "style": {"fontSize":"15px","lineHeight":"1.7","color":"var(--auve-muted2)"} }, "Sign in with your mobile number. No password needed."), "\n            ", h("label", { "style": {"display":"flex","flexDirection":"column","gap":"7px","fontSize":"11px","letterSpacing":"0.16em","textTransform":"uppercase","color":"var(--auve-muted)"} }, "Mobile number\n              ", h("input", { "value": D(R(v0, "authNum"), ""), "onChange": R(v0, "onAuthNum"), "placeholder": "98XXX XXXXX", "inputMode": "tel", "style": {"fontSize":"15.5px","color":"var(--auve-ink)","padding":"13px 14px","border":"1px solid rgba(var(--auve-ink-rgb),0.18)","borderRadius":"3px","background":"var(--auve-bg)","outline":"none","letterSpacing":"0","textTransform":"none"}, className: "au-f8" }), "\n            "), "\n            ", (R(v0, "hasAuthErr") ? h(F, null, h("div", { "style": {"fontSize":"13px","color":"#A3352B"} }, X(R(v0, "authErr")))) : null), "\n            ", h("button", { "onClick": R(v0, "sendOtp"), "style": {"alignSelf":"start","background":"var(--auve-btn)","color":"var(--auve-btn-ink)","border":"none","borderRadius":"999px","padding":"16px 30px","fontSize":"13px","letterSpacing":"0.14em","textTransform":"uppercase","cursor":"pointer"}, className: "au-h5" }, "Send OTP"), "\n          ") : null), "\n          ", (R(v0, "authOtp") ? h(F, null, "\n            ", h("div", { "style": {"fontSize":"15px","lineHeight":"1.7","color":"var(--auve-muted2)"} }, "Enter the 4-digit code sent to ", X(R(v0, "authNum")), "."), "\n            ", h("label", { "style": {"display":"flex","flexDirection":"column","gap":"7px","fontSize":"11px","letterSpacing":"0.16em","textTransform":"uppercase","color":"var(--auve-muted)"} }, "OTP\n              ", h("input", { "value": D(R(v0, "otp"), ""), "onChange": R(v0, "onOtp"), "placeholder": "• • • •", "inputMode": "numeric", "style": {"fontSize":"22px","letterSpacing":"0.4em","color":"var(--auve-ink)","padding":"12px 14px","border":"1px solid rgba(var(--auve-ink-rgb),0.18)","borderRadius":"3px","background":"var(--auve-bg)","outline":"none","maxWidth":"200px"}, className: "au-f8" }), "\n            "), "\n            ", (R(v0, "hasAuthErr") ? h(F, null, h("div", { "style": {"fontSize":"13px","color":"#A3352B"} }, X(R(v0, "authErr")))) : null), "\n            ", h("div", { "style": {"display":"flex","gap":"16px","alignItems":"center"} }, "\n              ", h("button", { "onClick": R(v0, "verifyOtp"), "style": {"background":"var(--auve-btn)","color":"var(--auve-btn-ink)","border":"none","borderRadius":"999px","padding":"16px 30px","fontSize":"13px","letterSpacing":"0.14em","textTransform":"uppercase","cursor":"pointer"}, className: "au-h5" }, "Verify & sign in"), "\n              ", h("button", { "onClick": R(v0, "backToPhone"), "style": {"background":"none","border":"none","fontSize":"13px","color":"#A8743F","cursor":"pointer"} }, "Change number"), "\n            "), "\n          ") : null), "\n          ", (R(v0, "authIn") ? h(F, null, "\n            ", h("div", { "style": {"display":"flex","justifyContent":"space-between","alignItems":"center","gap":"12px","flexWrap":"wrap"} }, "\n              ", h("div", { "style": {"fontSize":"15px","color":"var(--auve-muted2)"} }, "Signed in as ", h("span", { "style": {"color":"var(--auve-ink)"} }, X(R(v0, "authNum")))), "\n              ", h("button", { "onClick": R(v0, "signOut"), "style": {"background":"none","border":"1px solid rgba(var(--auve-ink-rgb),0.25)","borderRadius":"999px","padding":"10px 18px","fontSize":"12.5px","cursor":"pointer","color":"var(--auve-ink)"} }, "Sign out"), "\n            "), "\n            ", h("div", { "style": {"fontFamily":"Belleza, sans-serif","fontSize":"22.4px","marginTop":"8px"} }, "My orders"), "\n            ", (R(v0, "noOrders") ? h(F, null, "\n              ", h("div", { "style": {"fontSize":"14.5px","color":"var(--auve-muted)"} }, "No orders yet. ", h("a", { "href": "#/shop", "style": {"color":"#A8743F"} }, "Find your first pair →")), "\n            ") : null), "\n            ", A(R(v0, "myOrders")).map((it, i) => { const v1 = Object.assign({}, v0, { "o": it, $index: i }); return h(F, { key: i }, "\n              ", h("div", { "style": {"display":"flex","flexWrap":"wrap","justifyContent":"space-between","gap":"12px","alignItems":"center","padding":"16px 0","borderTop":"1px solid rgba(var(--auve-ink-rgb),0.1)"} }, "\n                ", h("div", null, h("div", { "style": {"fontSize":"15px"} }, X(R(v1, "o.id")), " · ", X(R(v1, "o.count"))), h("div", { "style": {"fontSize":"12.5px","color":"var(--auve-muted)","marginTop":"3px"} }, X(R(v1, "o.date")), " · ", X(R(v1, "o.total")))), "\n                ", h("button", { "onClick": R(v1, "o.track"), "style": {"background":"none","border":"1px solid rgba(var(--auve-ink-rgb),0.25)","borderRadius":"999px","padding":"10px 18px","fontSize":"12.5px","cursor":"pointer","color":"var(--auve-ink)"} }, "Track"), "\n              "), "\n            "); }), "\n          ") : null), "\n        "), "\n      ") : null), "\n    "), "\n  ") : null), "\n\n  ", h("footer", { "style": {"background":"#1B1A34","color":"rgba(243,230,216,0.78)"} }, "\n    ", h("div", { "style": {"maxWidth":"1320px","margin":"0 auto","padding":"clamp(46px, 5vw, 72px) 22px 26px","display":"grid","gridTemplateColumns":"repeat(auto-fit, minmax(160px, 1fr))","gap":"34px"} }, "\n      ", h("div", { "style": {"display":"flex","flexDirection":"column","gap":"14px"} }, "\n        ", h("img", { "src": "assets/logo-cream.png", "alt": "AUVÉ", "style": {"height":"34px","width":"auto","display":"block","alignSelf":"flex-start"} }), "\n        ", h("div", { "style": {"fontSize":"13.5px","lineHeight":"1.7","maxWidth":"30ch","fontWeight":"300"} }, "Handmade Women's Footwear From Surat, Gujarat."), "\n        ", "\n      "), "\n      ", h("div", { "style": {"display":"flex","flexDirection":"column","gap":"11px","fontSize":"13.5px"} }, "\n        ", h("div", { "style": {"fontSize":"10.5px","letterSpacing":"0.2em","textTransform":"uppercase","color":"#B98E4F","marginBottom":"4px"} }, "Shop"), "\n        ", h("a", { "href": "#/shop", "style": {"color":"rgba(243,230,216,0.78)"}, className: "au-h9" }, "All Pairs"), "\n        ", h("a", { "href": "#/shop/barely", "style": {"color":"rgba(243,230,216,0.78)"}, className: "au-h9" }, "The Barely Edit"), "\n        ", h("a", { "href": "#/shop/gilded", "style": {"color":"rgba(243,230,216,0.78)"}, className: "au-h9" }, "Gilded"), "\n        ", h("a", { "href": "#/shop/veil", "style": {"color":"rgba(243,230,216,0.78)"}, className: "au-h9" }, "Veil & Vow"), "\n      "), "\n      ", h("div", { "style": {"display":"flex","flexDirection":"column","gap":"11px","fontSize":"13.5px"} }, "\n        ", h("div", { "style": {"fontSize":"10.5px","letterSpacing":"0.2em","textTransform":"uppercase","color":"#B98E4F","marginBottom":"4px"} }, "Help"), "\n        ", h("a", { "href": "#/faq", "style": {"color":"rgba(243,230,216,0.78)"}, className: "au-h9" }, "FAQ"), "\n        ", h("a", { "href": "#/faq", "style": {"color":"rgba(243,230,216,0.78)"}, className: "au-h9" }, "Shipping & Exchanges"), "\n        ", h("button", { "onClick": R(v0, "openSizeGuide"), "style": {"background":"none","border":"none","padding":"0","textAlign":"left","fontSize":"13.5px","color":"rgba(243,230,216,0.78)","cursor":"pointer"}, className: "au-h9" }, "Size Guide"), "\n        ", h("a", { "href": "#/account", "style": {"color":"rgba(243,230,216,0.78)"}, className: "au-h9" }, "Track Order"), "\n      "), "\n      ", h("div", { "style": {"display":"flex","flexDirection":"column","gap":"11px","fontSize":"13.5px"} }, "\n        ", h("div", { "style": {"fontSize":"10.5px","letterSpacing":"0.2em","textTransform":"uppercase","color":"#B98E4F","marginBottom":"4px"} }, "About"), "\n        ", h("a", { "href": "#/about", "style": {"color":"rgba(243,230,216,0.78)"}, className: "au-h9" }, "Our Story"), "\n        ", h("a", { "href": "#/contact", "style": {"color":"rgba(243,230,216,0.78)"}, className: "au-h9" }, "Contact"), "\n      "), h("div", { "style": {"display":"flex","flexDirection":"column","gap":"11px","fontSize":"13.5px"} }, h("div", { "style": {"fontSize":"10.5px","letterSpacing":"0.2em","textTransform":"uppercase","color":"#B98E4F","marginBottom":"4px"} }, "Policies"), h("a", { "href": "terms.html", "style": {"color":"rgba(243,230,216,0.78)"}, className: "au-h9" }, "Terms & Conditions"), h("a", { "href": "privacy-policy.html", "style": {"color":"rgba(243,230,216,0.78)"}, className: "au-h9" }, "Privacy Policy"), h("a", { "href": "exchange-policy.html", "style": {"color":"rgba(243,230,216,0.78)"}, className: "au-h9" }, "Exchange & Cancellation"), h("a", { "href": "shipping-policy.html", "style": {"color":"rgba(243,230,216,0.78)"}, className: "au-h9" }, "Shipping Policy")), "\n      ", h("div", { "style": {"display":"flex","flexDirection":"column","gap":"11px","fontSize":"13.5px"} }, "\n        ", h("div", { "style": {"fontSize":"10.5px","letterSpacing":"0.2em","textTransform":"uppercase","color":"#B98E4F","marginBottom":"4px"} }, "Talk To Us"), "\n        ", h("a", { "href": R(v0, "telLink"), "style": {"color":"rgba(243,230,216,0.78)"}, className: "au-h9" }, "Call: +91 9725124422"), "\n        ", h("a", { "href": R(v0, "mailLink"), "style": {"color":"rgba(243,230,216,0.78)"}, className: "au-h9" }, "Email: ", X(R(v0, "email"))), "\n        ", h("a", { "href": R(v0, "waLink"), "target": "_blank", "rel": "noopener", "style": {"color":"rgba(243,230,216,0.78)"}, className: "au-h9" }, "Order Via WhatsApp: +91 9725124422"), "\n        ", h("a", { "href": "https://www.instagram.com/stepwithauve/", "target": "_blank", "rel": "noopener", "style": {"color":"rgba(243,230,216,0.78)"}, className: "au-h9" }, "@stepwithauve"), "\n      "), "\n    "), "\n    ", h("div", { "style": {"maxWidth":"1320px","margin":"0 auto","padding":"18px 22px 30px","borderTop":"1px solid rgba(243,230,216,0.14)","display":"flex","flexWrap":"wrap","gap":"10px 20px","justifyContent":"space-between","fontSize":"11.5px","letterSpacing":"0.06em","color":"rgba(243,230,216,0.6)"} }, "\n      ", h("span", null, "© 2026 AUVÉ · All Rights Reserved"), "\n      ", h("span", null, "UPI · Cards · Cash On Delivery"), "\n    "), "\n  "), "\n\n\n  ", (R(v0, "hasToast") ? h(F, null, "\n    ", h("div", { "style": {"position":"fixed","left":"50%","bottom":"26px","transform":"translateX(-50%)","zIndex":"150","background":"var(--auve-btn)","color":"#F3E6D8","borderRadius":"999px","padding":"12px 12px 12px 22px","display":"flex","alignItems":"center","gap":"18px","fontSize":"14px","boxShadow":"0 16px 40px rgba(27,26,52,0.3)","animation":"auveFadeUp 0.35s ease both","whiteSpace":"nowrap","maxWidth":"calc(100vw - 32px)"} }, "\n      ", h("span", null, X(R(v0, "toast"))), "\n      ", h("a", { "href": "#/bag", "style": {"background":"#B98E4F","color":"#FFF","padding":"9px 16px","borderRadius":"999px","fontSize":"12px","letterSpacing":"0.1em","textTransform":"uppercase"}, className: "au-h6" }, "View cart"), "\n    "), "\n  ") : null), "\n\n  ", (R(v0, "popupOpen") ? h(F, null, "\n    ", h("div", { "style": {"position":"fixed","inset":"0","zIndex":"220","display":"flex","alignItems":"center","justifyContent":"center","padding":"20px"} }, "\n      ", h("div", { "onClick": R(v0, "closePopup"), "style": {"position":"absolute","inset":"0","background":"rgba(27,26,52,0.55)","animation":"auveFadeUp 0.3s ease both"} }), "\n      ", h("div", { "style": {"position":"relative","width":"min(420px, 100%)","background":"var(--auve-bg)","padding":"40px 28px 30px","textAlign":"center","display":"flex","flexDirection":"column","gap":"14px","alignItems":"center","animation":"auveFadeUp 0.4s ease both"} }, "\n        ", h("button", { "onClick": R(v0, "closePopup"), "aria-label": "Close", "style": {"position":"absolute","top":"6px","right":"6px","width":"44px","height":"44px","background":"none","border":"none","fontSize":"24px","color":"var(--auve-muted)","cursor":"pointer"} }, "×"), "\n        ", h("img", { "src": "assets/logo-navy.png", "alt": "AUVÉ", "style": {"height":"30px","width":"auto","display":"block","margin":"0 auto","alignSelf":"center"} }), "\n        ", (R(v0, "nlOpen") ? h(F, null, "\n          ", h("div", { "style": {"fontSize":"15px","letterSpacing":"0.18em","textTransform":"uppercase","fontWeight":"500","color":"var(--auve-ink)"} }, "Get 10% off"), "\n          ", h("div", { "style": {"fontSize":"14.5px","lineHeight":"1.7","fontWeight":"300","color":"var(--auve-muted2)","maxWidth":"30ch"} }, "Subscribe with your email for 10% off your first order, plus new drops in your inbox."), "\n          ", h("div", { "style": {"width":"100%","display":"flex","alignItems":"center","border":"1px solid rgba(var(--auve-ink-rgb),0.2)","borderRadius":"999px","marginTop":"4px"} }, "\n            ", "\n            ", h("input", { "value": D(R(v0, "nlPhone"), ""), "onChange": R(v0, "onNlPhone"), "placeholder": "Your email address", "type": "email", "inputMode": "email", "style": {"flex":"1","minWidth":"0","fontSize":"16px","color":"var(--auve-ink)","padding":"15px 22px","border":"none","background":"none","outline":"none"} }), "\n          "), "\n          ", (R(v0, "hasNlErr") ? h(F, null, h("div", { "style": {"fontSize":"13px","color":"#A3352B"} }, X(R(v0, "nlErr")))) : null), "\n          ", h("button", { "onClick": R(v0, "submitNl"), "style": {"width":"100%","background":"var(--auve-btn)","color":"var(--auve-btn-ink)","border":"none","borderRadius":"999px","padding":"16px","fontSize":"13.5px","letterSpacing":"0.16em","textTransform":"uppercase","fontWeight":"500","cursor":"pointer"}, className: "au-h5" }, "Subscribe"), "\n          ", h("button", { "onClick": R(v0, "closePopup"), "style": {"background":"none","border":"none","padding":"4px","fontSize":"12.5px","color":"var(--auve-muted)","cursor":"pointer","textDecoration":"underline"} }, "No thanks"), "\n        ") : null), "\n        ", (R(v0, "nlSent") ? h(F, null, "\n          ", h("div", { "style": {"fontSize":"15px","letterSpacing":"0.18em","textTransform":"uppercase","fontWeight":"500","color":"var(--auve-ink)"} }, "You're on the list"), "\n          ", h("div", { "style": {"fontSize":"14.5px","lineHeight":"1.7","fontWeight":"300","color":"var(--auve-muted2)"} }, X(R(v0, "nlSummary"))), "\n          ", h("span", { "style": {"fontSize":"20px","letterSpacing":"0.2em","border":"1px dashed #B98E4F","padding":"12px 20px","borderRadius":"3px","color":"var(--auve-ink)"} }, "WELCOME10"), "\n          ", h("a", { "href": "#/shop", "onClick": R(v0, "closePopup"), "style": {"width":"100%","textAlign":"center","background":"var(--auve-btn)","color":"var(--auve-btn-ink)","padding":"15px","borderRadius":"999px","fontSize":"13px","letterSpacing":"0.14em","textTransform":"uppercase"}, className: "au-h3" }, "Start shopping"), "\n        ") : null), "\n      "), "\n    "), "\n  ") : null), "\n\n  ", (R(v0, "quickOpen") ? h(F, null, "\n    ", h("div", { "style": {"position":"fixed","inset":"0","zIndex":"190","display":"flex","alignItems":"flex-end","justifyContent":"center"} }, "\n      ", h("div", { "onClick": R(v0, "closeQuick"), "style": {"position":"absolute","inset":"0","background":"rgba(27,26,52,0.45)"} }), "\n      ", h("div", { "style": {"position":"relative","width":"min(520px, 100%)","background":"var(--auve-card)","borderRadius":"12px 12px 0 0","padding":"22px 20px 26px","display":"flex","flexDirection":"column","gap":"18px","animation":"auveFadeUp 0.3s ease both"} }, "\n        ", h("div", { "style": {"display":"flex","gap":"14px","alignItems":"center"} }, "\n          ", h("img", { "src": R(v0, "quick.img"), "alt": R(v0, "quick.name"), "style": {"width":"64px","height":"80px","objectFit":"cover","borderRadius":"2px","background":"#F3EFEA"} }), "\n          ", h("div", { "style": {"flex":"1"} }, h("div", { "style": {"fontFamily":"Belleza, sans-serif","fontSize":"18.9px"} }, X(R(v0, "quick.name"))), h("div", { "style": {"fontSize":"13px","color":"var(--auve-muted)","marginTop":"3px"} }, X(R(v0, "quick.sub")), " · ", X(R(v0, "quick.price")))), "\n          ", h("button", { "onClick": R(v0, "closeQuick"), "style": {"width":"44px","height":"44px","background":"none","border":"none","fontSize":"24px","color":"var(--auve-muted)","cursor":"pointer"} }, "×"), "\n        "), "\n        ", h("div", { "style": {"display":"flex","justifyContent":"space-between","alignItems":"baseline"} }, "\n          ", h("div", { "style": {"fontSize":"11.5px","letterSpacing":"0.16em","textTransform":"uppercase","color":"var(--auve-muted)"} }, "Select size (EU)"), "\n          ", h("button", { "onClick": R(v0, "openSizeGuide"), "style": {"background":"none","border":"none","padding":"0","fontSize":"12.5px","color":"#A8743F","borderBottom":"1px solid rgba(168,116,63,0.45)","cursor":"pointer"} }, "Size guide"), "\n        "), "\n        ", h("div", { "style": {"display":"grid","gridTemplateColumns":"repeat(7, minmax(0, 1fr))","gap":"6px"} }, "\n          ", A(R(v0, "quick.sizes")).map((it, i) => { const v1 = Object.assign({}, v0, { "z": it, $index: i }); return h(F, { key: i }, h("button", { "onClick": R(v1, "z.onPick"), "style": S(R(v1, "z.style")) }, X(R(v1, "z.label")))); }), "\n        "), "\n        ", h("a", { "href": R(v0, "quick.href"), "style": {"textAlign":"center","fontSize":"12.5px","letterSpacing":"0.1em","textTransform":"uppercase","color":"var(--auve-muted)"} }, "View full details"), "\n      "), "\n    "), "\n  ") : null), "\n\n  ", (R(v0, "sizeGuide") ? h(F, null, "\n    ", h("div", { "style": {"position":"fixed","inset":"0","zIndex":"210","display":"flex","alignItems":"center","justifyContent":"center","padding":"20px"} }, "\n      ", h("div", { "onClick": R(v0, "closeSizeGuide"), "style": {"position":"absolute","inset":"0","background":"rgba(27,26,52,0.5)","backdropFilter":"blur(3px)"} }), "\n      ", h("div", { "style": {"position":"relative","width":"min(560px, 100%)","maxHeight":"90vh","overflowY":"auto","background":"var(--auve-bg)","borderRadius":"4px","padding":"clamp(22px, 4vw, 36px)","boxShadow":"0 30px 70px rgba(27,26,52,0.3)"} }, "\n        ", h("div", { "style": {"display":"flex","justifyContent":"space-between","alignItems":"center","marginBottom":"6px"} }, "\n          ", h("div", { "style": {"fontFamily":"Belleza, sans-serif","fontSize":"25.8px"} }, "Size guide"), "\n          ", h("button", { "onClick": R(v0, "closeSizeGuide"), "style": {"width":"44px","height":"44px","background":"none","border":"none","fontSize":"24px","cursor":"pointer","color":"var(--auve-muted)"} }, "×"), "\n        "), "\n        ", h("div", { "style": {"display":"grid","gridTemplateColumns":"repeat(4, minmax(0, 1fr))","fontSize":"14px"} }, "\n          ", h("div", { "style": {"padding":"10px 0","fontSize":"11px","letterSpacing":"0.14em","textTransform":"uppercase","color":"var(--auve-muted)","borderBottom":"1px solid rgba(var(--auve-ink-rgb),0.2)"} }, "EU"), "\n          ", h("div", { "style": {"padding":"10px 0","fontSize":"11px","letterSpacing":"0.14em","textTransform":"uppercase","color":"var(--auve-muted)","borderBottom":"1px solid rgba(var(--auve-ink-rgb),0.2)"} }, "IND / UK"), "\n          ", h("div", { "style": {"padding":"10px 0","fontSize":"11px","letterSpacing":"0.14em","textTransform":"uppercase","color":"var(--auve-muted)","borderBottom":"1px solid rgba(var(--auve-ink-rgb),0.2)"} }, "US"), "\n          ", h("div", { "style": {"padding":"10px 0","fontSize":"11px","letterSpacing":"0.14em","textTransform":"uppercase","color":"var(--auve-muted)","borderBottom":"1px solid rgba(var(--auve-ink-rgb),0.2)"} }, "Foot (cm)"), "\n          ", A(R(v0, "sizeRows")).map((it, i) => { const v1 = Object.assign({}, v0, { "r": it, $index: i }); return h(F, { key: i }, "\n            ", h("div", { "style": {"padding":"11px 0","borderBottom":"1px solid rgba(var(--auve-ink-rgb),0.08)"} }, X(R(v1, "r.eu"))), "\n            ", h("div", { "style": {"padding":"11px 0","borderBottom":"1px solid rgba(var(--auve-ink-rgb),0.08)"} }, X(R(v1, "r.ind"))), "\n            ", h("div", { "style": {"padding":"11px 0","borderBottom":"1px solid rgba(var(--auve-ink-rgb),0.08)"} }, X(R(v1, "r.us"))), "\n            ", h("div", { "style": {"padding":"11px 0","borderBottom":"1px solid rgba(var(--auve-ink-rgb),0.08)"} }, X(R(v1, "r.cm"))), "\n          "); }), "\n        "), "\n      "), "\n    "), "\n  ") : null))];
}

(function () { var c = (window.AUVE_SETTINGS || {}).content || {}; var props = Object.assign({}, SITE); if (c.announcementOn === false) props.announcementText = ''; else if (c.announcementText) props.announcementText = c.announcementText; ReactDOM.createRoot(document.getElementById('root')).render(h(Component, props)); })();
})();
