/* build-products.js
 * One-time / re-runnable converter: reads the ORIGINAL static catalogue
 * (data/catalog.js, which sets window.AUVE_CATALOG) and writes the dynamic
 * data layer file data/products.json with exactly the same resolved data
 * (same products, prices, images, cover photos and sold-out sizes).
 *
 * Run:  node tools/build-products.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'data', 'catalog.js'), 'utf8');

const sandbox = { window: {}, console };
vm.createContext(sandbox);
vm.runInContext(src, sandbox, { filename: 'catalog.js' });

const catalog = sandbox.window.AUVE_CATALOG;
if (!Array.isArray(catalog) || !catalog.length) {
  console.error('ERROR: window.AUVE_CATALOG not found or empty in data/catalog.js');
  process.exit(1);
}

const out = path.join(root, 'data', 'products.json');
fs.writeFileSync(out, JSON.stringify(catalog, null, 2) + '\n');
console.log('Wrote ' + out + ' with ' + catalog.length + ' products:');
catalog.forEach(p => console.log('  - ' + p.id + ' | ' + p.name + ' | ' + p.coll + ' | INR ' + p.price + ' | variants: ' + p.variants.length + ' | soldOut: [' + p.soldOut.join(',') + ']'));
