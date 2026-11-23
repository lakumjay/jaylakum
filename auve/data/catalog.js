/* AUVÉ: product catalogue (frontend data).
 * Shape: { id, name, coll, type, price, desc, cover? (card photo), details?:[[label, value]], variants:[{ name, sw, imgs[], desc? }], soldOut:[sizes], tag? }
 * Colour is shown automatically in the details list from the selected variant.
 */
(function () {
const V = (name, sw, imgs, extra) => Object.assign({ name, sw, imgs: imgs.map(i => 'assets/p/' + i + '.jpg') }, extra || {});
const D = (toe, heelHeight, heelType) => ({ details: [['Toe', toe], ['Heel height', heelHeight], ['Heel type', heelType]] });
const FLAT = toe => D(toe, 'Flat', 'Flat');
const P = (id, name, coll, type, price, desc, variants, extra) => { const o = Object.assign({ id, name, coll, type, price, desc, variants, soldOut: [] }, extra || {}); if (!o.soldOut.includes(35)) o.soldOut = [35].concat(o.soldOut); return o; };
window.AUVE_CATALOG = [
  P('whisper', 'Whisper', 'barely', 'Flats', 2190, 'A soft brown pair made to keep things simple. Whisper is easy to wear and style, and goes with just about everything.', [V('Brown', '#7A4A2E', ['bn-whisper-1', 'bn-whisper-2', 'bn-whisper-3']), V('Beige', '#E8DFD2', ['bn-whisperivory-1', 'bn-whisperivory-2'], { desc: 'A soft white pair made to keep things simple. Whisper is easy to wear and style, and goes with just about everything.' })], Object.assign({ tag: 'Bestseller' }, FLAT('Round toe'))),
  P('muse', 'Muse', 'barely', 'Heels', 2590, 'A soft blue pair with delicate straps in pastel shades. The slim, layered straps add just enough colour and detail while keeping the overall look clean and understated.', [V('Soft blue', '#BFC6DE', ['bn-muse-1', 'bn-muse-2', 'bn-muse-3'])], Object.assign({ tag: 'New' }, D('Square toe', '1 inch', 'Block heel'))),
  P('soft-focus', 'Soft Focus', 'barely', 'Slides', 2290, 'A soft beige pair with a simple bow detail at the front. The thin straps add a delicate touch while keeping the look clean and easy to wear.', [V('Beige', '#E9DCC2', ['bn-softfocus-1', 'bn-softfocus-2', 'bn-softfocus-3'])], Object.assign({ cover: 'assets/p/bn-softfocus-2.jpg' }, FLAT('Square toe'))),
  P('dune', 'Dune', 'barely', 'Slides', 2290, 'A beige pair that keeps things simple, with a little extra. The knotted straps bring texture and detail to an otherwise effortless everyday sandal.', [V('Beige', '#CDB088', ['bn-dune-1', 'bn-dune-2', 'bn-dune-3'])], Object.assign({ soldOut: [35], cover: 'assets/p/bn-dune-2.jpg' }, FLAT('Square toe'))),
  P('daydream-b', 'Day Dream', 'barely', 'Slides', 2290, 'A soft pink pair with a simple bow detail at the front. The thin straps add a delicate touch while keeping the look clean and easy to wear.', [V('Pink', '#E2C6C4', ['bn-daydream-1', 'bn-daydream-2']), V('Lilac', '#CFC3D6', ['bn-daydream-3'], { desc: 'A soft lilac pair with a simple bow detail at the front. The thin straps add a delicate touch while keeping the look clean and easy to wear.' })], Object.assign({ cover: 'assets/p/bn-daydream-2.jpg' }, FLAT('Square toe'))),
  P('trace', 'Trace', 'barely', 'Heels', 2590, 'A sleek black pair with delicate straps and a 1.5-inch block heel. Trace keeps the look minimal, with just enough structure to make it stand out.', [V('Black', '#1C1B1D', ['bn-trace-1', 'bn-trace-2', 'bn-trace-3'])], D('Square toe', '1.5 inch', 'Block heel')),
  P('twine', 'Twine', 'barely', 'Slides', 2290, 'Fine knotted tubular straps on a square-toe flat slide.', [V('Pink', '#E4B7AE', ['bn-twine-1', 'bn-twine-2', 'bn-twine-3']), V('Silver', '#C8CACE', ['bn-twinesilver-1', 'bn-twinesilver-2', 'bn-twinesilver-3'])], Object.assign({ tag: 'New', cover: 'assets/p/bn-twinesilver-1.jpg' }, FLAT('Square toe'))),
  P('desert-sand', 'Desert Sand', 'gilded', 'Flats', 2490, 'Tan flat with a gold chain running from toe to ankle.', [V('Tan & gold', '#C46A3C', ['gd-desertsand-1', 'gd-desertsand-2'])], { details: [['Heel type', 'Flat']] }),
  P('eclipse', 'Eclipse', 'gilded', 'Flats', 2490, 'The gold-chain flat in deep black, sharp enough for evenings.', [V('Black & gold', '#1E1B1E', ['gd-eclipse-1', 'gd-eclipse-2', 'gd-eclipse-3'])], { details: [['Heel type', 'Flat']] }),
  P('poise', 'Poise', 'gilded', 'Heels', 2890, 'Ivory block heel with a gold chain at the ankle.', [V('Ivory & gold', '#F1EBDF', ['gd-poise-2', 'gd-poise-3', 'poise-hd'])], { tag: 'New', details: [['Heel type', 'Block heel']] }),
  P('solace', 'Solace', 'gilded', 'Flats', 2490, 'Black flat, oxblood ankle strap and a polished gold disc at the toe.', [V('Black & oxblood', '#2A1A1E', ['gd-solace-1', 'gd-solace-2', 'gd-solace-3'])], { details: [['Heel type', 'Flat']] }),
  P('champagne', 'Champagne', 'gilded', 'Heels', 2890, 'Champagne-gold block heel with soft knotted straps.', [V('Champagne', '#E6D3B0', ['gd-champagne-1', 'gd-champagne-2', 'gd-champagne-3'])], { details: [['Heel type', 'Block heel']] }),
  P('heirloom', 'Heirloom', 'veil', 'Heels', 3290, "Emerald brocade, a gold bloom and a gold block heel. Born from wanting to wear your mother's footwear.", [V('Emerald brocade', '#1F8F7A', ['s-heirloom', 'v-04', 'v-02', 'v-16'])], { tag: 'Bestseller', cover: 'assets/p/v-16.jpg', details: [['Heel type', 'Block heel']] }),
  P('daydream-v', 'Day Dream', 'veil', 'Heels', 3190, 'Rose-shimmer double-band mule on a slim heel.', [V('Rose shimmer', '#E7BFAE', ['s-daydreamv', 'v-06', 'v-07']), V('Ivory & tan', '#1B1A1C', ['s-daydreamv-ivory'])], { cover: 'assets/p/v-06.jpg', details: [['Heel type', 'Slim heel']] }),
  P('first-look', 'First Look', 'veil', 'Wedges', 3490, 'Red-and-gold brocade knot on a gold wedge. Made for the long day.', [V('Red & gold', '#B3262E', ['s-firstlook', 'v-09', 'v-08'])], { tag: 'New', soldOut: [41], cover: 'assets/p/v-08.jpg', details: [['Heel type', 'Wedge']] }),
  P('ever-after', 'Ever After (Round Toe)', 'veil', 'Heels', 2690, 'Maroon velvet thong sandal with a round toe, on a kitten heel.', [V('Maroon', '#7C1B2A', ['s-everafter', 's-everafter-2'])], { cover: 'assets/p/s-everafter-2.jpg', details: [['Toe', 'Round toe'], ['Heel type', 'Kitten heel']] }),
  P('ever-after-square', 'Ever After (Square Toe)', 'veil', 'Heels', 2690, 'Maroon velvet thong sandal with a square toe, on a kitten heel.', [V('Maroon', '#7C1B2A', ['s-everafter-red', 'v-12'])], { details: [['Toe', 'Square toe'], ['Heel type', 'Kitten heel']] }),
  P('after-glow', 'After Glow', 'veil', 'Heels', 2690, 'Champagne metallic thong on a low block heel.', [V('Champagne gold', '#CDB58C', ['s-goldenhour']), V('Black', '#1B1A1C', ['s-goldenhour-black'])], { details: [['Heel type', 'Block heel']] }),
  P('golden-hour', 'Golden Hour', 'veil', 'Heels', 2690, 'Antique gold thong on a low heel. The pair to dance in.', [V('Antique gold', '#C9B188', ['gh-top', 'gh-held', 'gh-model'])], { cover: 'assets/p/gh-model.jpg', details: [['Heel type', 'Low heel']] })
];
/* Card photos: model / in-hand shots on the warm studio backdrop, so every featured card shares one background.
 * cover = card photo, cover2 = photo shown on hover. Each model photo is used once. */
const COV = {
  'heirloom': ['heirloom-right', 'v-05'], 'first-look': ['firstlook-feet-right', 'v-08'], 'golden-hour': ['gh-model', 'gh-held'], 'after-glow': ['afterglow-peach'], 'daydream-v': ['daydreamv-peach', 'v-06'],
  'champagne': ['gd-champagne-1', 'champagne-feet'], 'poise': ['poise-hd', 'poise-wear'], 'solace': ['gd-solace-2', 'gd-solace-1'],
  'soft-focus': ['bn-softfocus-2'], 'muse': ['bn-muse-1'], 'daydream-b': ['bn-daydream-2'],
  'twine': ['bn-twinesilver-1', 'bn-twinesilver-3'], 'whisper': ['bn-whisperivory-1', 'bn-whisperivory-2']
};
window.AUVE_CATALOG.forEach(p => { const c = COV[p.id]; if (c) { p.cover = 'assets/p/' + c[0] + '.jpg'; if (c[1]) p.cover2 = 'assets/p/' + c[1] + '.jpg'; } });
})();
