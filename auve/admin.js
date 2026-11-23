/* AUVÉ Shop Manager — admin.js
 * Talks to server.js: /api/admin/login, /api/admin/products,
 * /api/admin/settings, /api/admin/orders. The login token is kept in
 * sessionStorage (it disappears when the browser tab is closed). */
'use strict';

var SIZES = [35, 36, 37, 38, 39, 40, 41];
var COLL_NAMES = { barely: 'The Barely Edit', gilded: 'Gilded', veil: 'Veil & Vow' };
var SECTION_INFO = [
  ['hero', 'Top photo banner', 'The big photo and heading at the very top of the homepage.'],
  ['craftBanner', 'Craft video banner', 'The "Handcrafted. Comfort first." part with the video.'],
  ['festive', 'Festive collection row', 'The row with the festive heading and pairs.'],
  ['collections', 'Shop by collection', 'The three collection boxes: The Barely Edit, Gilded, Veil & Vow.'],
  ['bestsellers', 'Bestsellers row', 'The row of best-selling pairs.'],
  ['reels', 'Video reels', 'The "Moments in motion" video part.'],
  ['newsletter', 'Newsletter box', 'The email signup box near the bottom of the homepage.']
];

var token = sessionStorage.getItem('auve_admin_token') || '';
var products = [];
var settings = {};
var editingId = null; /* null = adding a new product */
var editorReturnToVisual = false; /* product editor was opened from the visual view */

function $(id) { return document.getElementById(id); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function inr(n) { return '₹' + Number(n || 0).toLocaleString('en-IN'); }

function apiPath(p) {
  if (p.indexOf('/api/') === 0) return 'api/' + p.slice(5);
  if (p.indexOf('api/') === 0) return p;
  return p;
}

function api(method, path, body) {
  return fetch(apiPath(path), {
    method: method,
    headers: Object.assign({ 'Content-Type': 'application/json' }, token ? { 'x-admin-token': token } : {}),
    body: body ? JSON.stringify(body) : undefined
  }).then(function (r) {
    return r.json().catch(function () { return {}; }).then(function (data) {
      if (r.status === 401 && token) { logout(); throw new Error('Your login has ended. Please log in again.'); }
      if (!r.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
      return data;
    });
  });
}
function showMsg(el, text, ok) {
  el.innerHTML = text ? '<div class="' + (ok ? 'msg-ok' : 'msg-err') + '">' + esc(text) + '</div>' : '';
  if (text) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ---------------- login ---------------- */
function logout() {
  token = '';
  sessionStorage.removeItem('auve_admin_token');
  $('mainView').classList.add('hidden');
  $('loginView').classList.remove('hidden');
}
function doLogin() {
  var pw = $('pw').value;
  if (!pw) { showMsg($('loginErr'), 'Please type the password.', false); $('loginErr').classList.remove('hidden'); return; }
  fetch(apiPath('/api/admin/login'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pw }) })
    .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
    .then(function (res) {
      if (!res.ok) { var e = $('loginErr'); e.textContent = 'That password is not right. Please check and try again.'; e.classList.remove('hidden'); return; }
      token = res.d.token;
      sessionStorage.setItem('auve_admin_token', token);
      $('loginErr').classList.add('hidden');
      startApp();
    })
    .catch(function () { var e = $('loginErr'); e.textContent = 'Could not reach the server. Please try again.'; e.classList.remove('hidden'); });
}
function startApp() {
  $('loginView').classList.add('hidden');
  $('mainView').classList.remove('hidden');
  loadProducts();
  loadSettings();
  loadOrders();
  switchTab('dashboard');
  loadSecurity();
}

/* ---------------- tabs ---------------- */
function switchTab(name) {
  document.querySelectorAll('.tab').forEach(function (b) {
    b.classList.toggle('on', b.dataset.tab === name);
    var panel = $('tab-' + b.dataset.tab);
    if (panel) panel.classList.toggle('hidden', b.dataset.tab !== name);
  });
  var wrap = document.querySelector('.wrap');
  if (wrap) wrap.classList.toggle('wide', name === 'visual' || name === 'orders');
  if (name === 'visual') { initVisual(); setTimeout(positionBadges, 120); }
  if (name === 'dashboard') loadDashboard();
  if (name === 'settings') { loadIntegrations(); loadSecurity(); fillStoreSettings(); loadFormMessages(); }
  if (name === 'coupons') loadCoupons();
  if (name === 'pages') renderPagesEditor();
}
document.querySelectorAll('.tab').forEach(function (btn) {
  btn.addEventListener('click', function () { switchTab(btn.dataset.tab); });
});

/* ---------------- products ---------------- */
function loadProducts() {
  api('GET', '/api/admin/products').then(function (d) {
    products = d.products || [];
    renderProductList();
  }).catch(function (e) { showMsg($('prodMsg'), e.message, false); });
}
function renderProductList() {
  var el = $('productList');
  if (!products.length) { el.innerHTML = '<p class="help">No products yet. Press the green button above to add your first product.</p>'; return; }
  
  el.innerHTML = products.map(function (p, idx) {
    var img = p.cover || (p.variants[0] && p.variants[0].imgs[0]) || '';
    var isTop = idx === 0;
    var isLast = idx === products.length - 1;
    return '<div class="prod-row draggable" draggable="true" data-id="' + esc(p.id) + '" data-idx="' + idx + '">' +
      '<div class="drag-handle" title="Drag and drop to reorder">⋮⋮</div>' +
      '<span class="pos-badge ' + (isTop ? 'top-one' : '') + '">#' + (idx + 1) + '</span>' +
      (img ? '<img src="' + esc(img) + '" alt="">' : '') +
      '<div class="grow"><div class="prod-name">' + esc(p.name) + (p.tag ? ' <span style="font-size:12px; font-weight:normal; background:#FAF5EB; border:1px solid #D8CDB4; padding:2px 6px; border-radius:3px; margin-left:6px">' + esc(p.tag) + '</span>' : '') + '</div>' +
      '<div class="prod-meta">' + esc(COLL_NAMES[p.coll] || p.coll) + ' · ' + esc(p.type) + ' · ' + inr(p.price) + '</div></div>' +
      '<div class="order-btn-group">' +
        (isTop ? '' : '<button type="button" class="btn-order btn-top" data-move-top="' + esc(p.id) + '" title="Make this the 1st product on homepage">🔝 Top</button>') +
        (idx > 0 ? '<button type="button" class="btn-order btn-up" data-move-up="' + esc(p.id) + '" title="Move Up">▲</button>' : '') +
        (!isLast ? '<button type="button" class="btn-order btn-down" data-move-down="' + esc(p.id) + '" title="Move Down">▼</button>' : '') +
        (!isLast ? '<button type="button" class="btn-order btn-bottom" data-move-bottom="' + esc(p.id) + '" title="Move to Bottom">🔻</button>' : '') +
      '</div>' +
      '<button class="btn btn-light btn-small" data-edit="' + esc(p.id) + '">Edit</button>' +
      '<button class="btn btn-danger btn-small" data-del="' + esc(p.id) + '">Delete</button>' +
      '</div>';
  }).join('');

  // Wire edit and delete
  el.querySelectorAll('[data-edit]').forEach(function (b) { b.addEventListener('click', function () { openEditor(b.dataset.edit); }); });
  el.querySelectorAll('[data-del]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (b.dataset.confirm) { deleteProduct(b.dataset.del); }
      else { b.dataset.confirm = '1'; b.textContent = 'Really delete? Press again to confirm'; setTimeout(function () { delete b.dataset.confirm; b.textContent = 'Delete'; }, 4000); }
    });
  });

  // Wire instant reorder buttons
  el.querySelectorAll('[data-move-top]').forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      var id = b.dataset.moveTop;
      var curIdx = products.findIndex(function (x) { return x.id === id; });
      if (curIdx > 0) {
        var item = products.splice(curIdx, 1)[0];
        products.unshift(item);
        persistProductOrder('Moved "' + item.name + '" to position #1 (Top of shop)!');
      }
    });
  });

  el.querySelectorAll('[data-move-up]').forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      var id = b.dataset.moveUp;
      var curIdx = products.findIndex(function (x) { return x.id === id; });
      if (curIdx > 0) {
        var temp = products[curIdx];
        products[curIdx] = products[curIdx - 1];
        products[curIdx - 1] = temp;
        persistProductOrder('Moved "' + temp.name + '" up to #' + curIdx);
      }
    });
  });

  el.querySelectorAll('[data-move-down]').forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      var id = b.dataset.moveDown;
      var curIdx = products.findIndex(function (x) { return x.id === id; });
      if (curIdx !== -1 && curIdx < products.length - 1) {
        var temp = products[curIdx];
        products[curIdx] = products[curIdx + 1];
        products[curIdx + 1] = temp;
        persistProductOrder('Moved "' + temp.name + '" down to #' + (curIdx + 2));
      }
    });
  });

  el.querySelectorAll('[data-move-bottom]').forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      var id = b.dataset.moveBottom;
      var curIdx = products.findIndex(function (x) { return x.id === id; });
      if (curIdx !== -1 && curIdx < products.length - 1) {
        var item = products.splice(curIdx, 1)[0];
        products.push(item);
        persistProductOrder('Moved "' + item.name + '" to bottom of shop.');
      }
    });
  });

  // Wire HTML5 Drag & Drop
  var draggedRow = null;
  var rows = el.querySelectorAll('.prod-row.draggable');
  rows.forEach(function (row) {
    row.addEventListener('dragstart', function (e) {
      draggedRow = row;
      row.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', row.dataset.id);
    });
    row.addEventListener('dragover', function (e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (draggedRow && draggedRow !== row) {
        row.classList.add('drag-over');
      }
    });
    row.addEventListener('dragleave', function () {
      row.classList.remove('drag-over');
    });
    row.addEventListener('drop', function (e) {
      e.preventDefault();
      row.classList.remove('drag-over');
      if (draggedRow && draggedRow !== row) {
        var fromId = draggedRow.dataset.id;
        var toId = row.dataset.id;
        var fromIdx = products.findIndex(function (x) { return x.id === fromId; });
        var toIdx = products.findIndex(function (x) { return x.id === toId; });
        if (fromIdx !== -1 && toIdx !== -1) {
          var item = products.splice(fromIdx, 1)[0];
          products.splice(toIdx, 0, item);
          persistProductOrder('Moved "' + item.name + '" to position #' + (toIdx + 1));
        }
      }
    });
    row.addEventListener('dragend', function () {
      row.classList.remove('dragging');
      rows.forEach(function (r) { r.classList.remove('drag-over'); });
      draggedRow = null;
    });
  });
}

function persistProductOrder(successMsg) {
  var ids = products.map(function (p) { return p.id; });
  renderProductList();
  showMsg($('prodMsg'), 'Saving new order to database...', true);
  api('PUT', '/api/admin/products/reorder', { ids: ids }).then(function (d) {
    if (d.products) products = d.products;
    renderProductList();
    showMsg($('prodMsg'), successMsg || 'New product order saved in database!', true);
    refreshVisualPreview();
  }).catch(function (err) {
    showMsg($('prodMsg'), 'Failed to save order: ' + err.message, false);
    loadProducts();
  });
}
function deleteProduct(id) {
  api('DELETE', '/api/admin/products/' + encodeURIComponent(id)).then(function () {
    showMsg($('prodMsg'), 'Product deleted. It is no longer in the shop.', true);
    loadProducts();
    refreshVisualPreview();
  }).catch(function (e) { showMsg($('prodMsg'), e.message, false); });
}

/* ================= MEDIA & PHOTO UPLOADS ================= */
var mediaModalCallback = null;

function uploadFiles(fileList) {
  var fd = new FormData();
  for (var i = 0; i < fileList.length; i++) {
    fd.append('files[]', fileList[i]);
  }
  return fetch(apiPath('/api/admin/upload'), {
    method: 'POST',
    headers: Object.assign({}, token ? { 'x-admin-token': token } : {}),
    body: fd
  }).then(function (r) {
    return r.json().then(function (d) {
      if (!r.ok || !d.ok) throw new Error(d.error || 'Upload failed');
      return d;
    });
  });
}

function updateMediaPreview(inputEl, imgEl, emptyEl, delBtn, nameEl) {
  if (!inputEl) return;
  var val = (inputEl.value || '').trim();
  if (nameEl) {
    if (val) {
      var fn = val.split('/').pop();
      nameEl.textContent = 'Selected: ' + (fn || val);
      nameEl.style.color = '#2d7a46';
    } else {
      nameEl.textContent = 'No photo uploaded';
      nameEl.style.color = '#8C827A';
    }
  }
  if (imgEl) {
    if (val) {
      imgEl.src = val;
      imgEl.style.display = 'block';
      if (emptyEl) emptyEl.style.display = 'none';
      if (delBtn) delBtn.style.display = 'inline-block';
      imgEl.onerror = function () {
        imgEl.style.display = 'none';
        if (emptyEl) emptyEl.style.display = 'block';
      };
    } else {
      imgEl.src = '';
      imgEl.style.display = 'none';
      if (emptyEl) emptyEl.style.display = 'block';
      if (delBtn) delBtn.style.display = 'none';
    }
  }
}

function openMediaLibrary(callback) {
  mediaModalCallback = callback;
  var modal = $('mediaModal');
  var grid = $('mediaGrid');
  grid.innerHTML = '<p class="help">Loading library photos...</p>';
  modal.classList.remove('hidden');

  api('GET', '/api/admin/assets').then(function (d) {
    assetImages = d.images || [];
    if (!assetImages.length) {
      grid.innerHTML = '<p class="help">No photos in library yet. Use the Upload button to upload new photos.</p>';
      return;
    }
    grid.innerHTML = assetImages.map(function (src) {
      var isVideo = /\.(mp4|webm|mov)$/i.test(src);
      return '<div class="media-grid-item" data-src="' + esc(src) + '">' +
        (isVideo ? '<video src="' + esc(src) + '"></video>' : '<img src="' + esc(src) + '" alt="" loading="lazy">') +
        '</div>';
    }).join('');

    grid.querySelectorAll('.media-grid-item').forEach(function (item) {
      item.addEventListener('click', function () {
        var src = item.dataset.src;
        if (mediaModalCallback) mediaModalCallback(src);
        closeMediaLibrary();
      });
    });
  }).catch(function (e) {
    grid.innerHTML = '<p class="msg-err">Failed to load library: ' + esc(e.message) + '</p>';
  });
}

function closeMediaLibrary() {
  $('mediaModal').classList.add('hidden');
  mediaModalCallback = null;
}

function setupMediaField(inputId, prevImgId, emptyId, uploadId, libBtnId, delBtnId, nameId) {
  var input = $(inputId), img = prevImgId ? $(prevImgId) : null, empty = emptyId ? $(emptyId) : null;
  var upload = uploadId ? $(uploadId) : null, libBtn = libBtnId ? $(libBtnId) : null, delBtn = delBtnId ? $(delBtnId) : null;
  var nameEl = nameId ? $(nameId) : null;
  if (!input) return;

  var sync = function () { updateMediaPreview(input, img, empty, delBtn, nameEl); };
  input.addEventListener('input', sync);
  input.addEventListener('change', sync);

  if (upload) {
    upload.addEventListener('change', function () {
      if (!upload.files || !upload.files.length) return;
      var lbl = upload.parentElement;
      var origText = lbl ? lbl.innerHTML : '';
      if (lbl) lbl.innerHTML = '⏳ Uploading...';
      uploadFiles(upload.files).then(function (res) {
        input.value = res.url;
        sync();
        if (lbl) lbl.innerHTML = origText;
        upload.value = '';
      }).catch(function (e) {
        alert('Upload failed: ' + e.message);
        if (lbl) lbl.innerHTML = origText;
        upload.value = '';
      });
    });
  }

  if (libBtn) {
    libBtn.addEventListener('click', function () {
      openMediaLibrary(function (src) {
        input.value = src;
        sync();
      });
    });
  }

  if (delBtn) {
    delBtn.addEventListener('click', function () {
      input.value = '';
      sync();
    });
  }
}

/* ----- product editor ----- */
function variantCard(v) {
  v = v || { name: '', sw: '#EEEEEE', imgs: [], desc: '' };
  if (!Array.isArray(v.imgs)) v.imgs = [];
  var div = document.createElement('div');
  div.className = 'variant';

  var renderGallery = function () {
    var gal = div.querySelector('.variant-gallery');
    if (!gal) return;
    gal.innerHTML = '';
    v.imgs.forEach(function (src, idx) {
      var isVideo = /\.(mp4|webm|mov)$/i.test(src);
      var card = document.createElement('div');
      card.className = 'gallery-card';
      card.innerHTML =
        (isVideo ? '<video src="' + esc(src) + '"></video>' : '<img src="' + esc(src) + '" alt="">') +
        '<button type="button" class="del-img" title="Remove photo">✕</button>';
      card.querySelector('.del-img').addEventListener('click', function () {
        v.imgs.splice(idx, 1);
        sync();
      });
      gal.appendChild(card);
    });

    // Add upload dropzone card
    var addCard = document.createElement('label');
    addCard.className = 'gallery-add-card';
    addCard.innerHTML = '<span>📷<br>+ Add Photos</span><input type="file" multiple accept="image/*,video/mp4">';
    addCard.querySelector('input').addEventListener('change', function (e) {
      if (!e.target.files || !e.target.files.length) return;
      addCard.innerHTML = '<span>⏳<br>Uploading...</span>';
      uploadFiles(e.target.files).then(function (res) {
        (res.urls || [res.url]).forEach(function (u) { if (!v.imgs.includes(u)) v.imgs.push(u); });
        sync();
      }).catch(function (err) {
        alert('Upload error: ' + err.message);
        renderGallery();
      });
    });
    gal.appendChild(addCard);
  };

  var sync = function () {
    var ta = div.querySelector('.v-imgs');
    if (ta) ta.value = v.imgs.join('\n');
    var countLab = div.querySelector('.v-count-label');
    if (countLab) countLab.textContent = 'Photos of this colour (' + v.imgs.length + ' photos)';
    renderGallery();
  };

  div.innerHTML =
    '<label>Colour name</label>' +
    '<input type="text" class="v-name" placeholder="Example: Brown" value="' + esc(v.name) + '">' +
    '<label>Colour dot</label>' +
    '<div class="color-row"><input type="color" class="v-sw" value="' + esc(v.sw || '#EEEEEE') + '"><div><input type="text" class="v-swtext" value="' + esc(v.sw || '#EEEEEE') + '"></div></div>' +
    '<p class="field-help">The small round colour dot customers see next to the colour name.</p>' +
    '<div style="display:flex; justify-content:space-between; align-items:center; margin-top:14px;">' +
      '<label class="v-count-label" style="margin:0">Photos of this colour (' + v.imgs.length + ' photos)</label>' +
      '<button type="button" class="btn btn-light btn-small v-lib-btn">+ Pick from Library</button>' +
    '</div>' +
    '<div class="variant-gallery"></div>' +
    '<textarea class="v-imgs" style="display:none">' + esc(v.imgs.join('\n')) + '</textarea>' +
    '<p class="field-help">Click "+ Add Photos" to select multiple photos or videos from your computer/phone, or "Pick from Library" for existing ones.</p>' +
    '<label>About this colour (not needed)</label>' +
    '<textarea class="v-desc" placeholder="Only if this colour needs its own words">' + esc(v.desc || '') + '</textarea>' +
    '<p style="margin:12px 0 0"><button class="btn btn-danger btn-small v-remove">Remove this colour</button></p>';

  div.querySelector('.v-remove').addEventListener('click', function () { div.remove(); });
  var picker = div.querySelector('.v-sw'), text = div.querySelector('.v-swtext');
  picker.addEventListener('input', function () { text.value = picker.value; });
  text.addEventListener('change', function () { if (/^#[0-9a-fA-F]{6}$/.test(text.value)) picker.value = text.value; });

  div.querySelector('.v-lib-btn').addEventListener('click', function () {
    openMediaLibrary(function (src) {
      if (!v.imgs.includes(src)) v.imgs.push(src);
      sync();
    });
  });

  renderGallery();
  return div;
}
function detailRow(d) {
  d = d || ['', ''];
  var div = document.createElement('div');
  div.className = 'detail-row';
  div.style.marginBottom = '10px';
  div.innerHTML =
    '<div><label style="margin-top:0">Detail name</label><input type="text" class="d-label" placeholder="Example: Heel type" value="' + esc(d[0]) + '"></div>' +
    '<div><label style="margin-top:0">Detail answer</label><input type="text" class="d-value" placeholder="Example: Block heel" value="' + esc(d[1] || '') + '"></div>' +
    '<button class="btn btn-danger btn-small d-remove">Remove</button>';
  div.querySelector('.d-remove').addEventListener('click', function () { div.remove(); });
  return div;
}
function openEditor(id) {
  var p = id ? products.find(function (x) { return x.id === id; }) : null;
  editingId = id || null;
  $('formTitle').textContent = p ? 'Edit product: ' + p.name : 'Add a new product';
  $('idBlock').style.display = p ? 'none' : 'block';
  showMsg($('formMsg'), '', true);
  $('f-name').value = p ? p.name : '';
  $('f-id').value = p ? p.id : '';
  $('f-coll').value = p ? p.coll : 'barely';
  $('f-type').value = p ? p.type : '';
  $('f-price').value = p ? p.price : '';
  $('f-desc').value = p ? p.desc : '';
  $('f-tag').value = p ? (p.tag || '') : '';
  $('f-cover').value = p ? (p.cover || '') : '';
  $('f-cover2').value = p ? (p.cover2 || '') : '';

  // Synchronize cover previews
  updateMediaPreview($('f-cover'), $('prev-cover'), $('empty-cover'), $('del-cover'), $('name-cover'));
  updateMediaPreview($('f-cover2'), $('prev-cover2'), $('empty-cover2'), $('del-cover2'), $('name-cover2'));

  var vWrap = $('variants'); vWrap.innerHTML = '';
  (p ? p.variants : [null]).forEach(function (v) { vWrap.appendChild(variantCard(v)); });
  var sWrap = $('soldOutSizes'); sWrap.innerHTML = '';
  SIZES.forEach(function (z) {
    var on = p ? (p.soldOut || []).includes(z) : z === 35;
    var lab = document.createElement('label');
    lab.className = 'size-box';
    lab.innerHTML = '<input type="checkbox" value="' + z + '"' + (on ? ' checked' : '') + '> EU ' + z;
    sWrap.appendChild(lab);
  });
  var dWrap = $('details'); dWrap.innerHTML = '';
  (p && p.details ? p.details : []).forEach(function (d) { dWrap.appendChild(detailRow(d)); });
  $('productListCard').classList.add('hidden');
  $('productFormCard').classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function closeEditor() {
  $('productFormCard').classList.add('hidden');
  $('productListCard').classList.remove('hidden');
  if (editorReturnToVisual) { editorReturnToVisual = false; switchTab('visual'); }
}
function saveProduct() {
  var variants = Array.prototype.map.call(document.querySelectorAll('#variants .variant'), function (div) {
    var v = {
      name: div.querySelector('.v-name').value.trim(),
      sw: div.querySelector('.v-swtext').value.trim() || '#EEEEEE',
      imgs: div.querySelector('.v-imgs').value.split(/[\n,]+/).map(function (s) { return s.trim(); }).filter(Boolean)
    };
    var desc = div.querySelector('.v-desc').value.trim();
    if (desc) v.desc = desc;
    return v;
  }).filter(function (v) { return v.name && v.imgs.length; });
  var details = Array.prototype.map.call(document.querySelectorAll('#details .detail-row'), function (div) {
    return [div.querySelector('.d-label').value.trim(), div.querySelector('.d-value').value.trim()];
  }).filter(function (d) { return d[0]; });
  var soldOut = Array.prototype.filter.call(document.querySelectorAll('#soldOutSizes input:checked'), function () { return true; })
    .map(function (cb) { return Number(cb.value); });
  var product = {
    name: $('f-name').value.trim(),
    coll: $('f-coll').value,
    type: $('f-type').value.trim(),
    price: Number($('f-price').value),
    desc: $('f-desc').value.trim(),
    tag: $('f-tag').value.trim(),
    cover: $('f-cover').value.trim(),
    cover2: $('f-cover2').value.trim(),
    variants: variants,
    soldOut: soldOut,
    details: details
  };
  if (!product.name) { showMsg($('formMsg'), 'Please write the product name.', false); return; }
  if (!variants.length) { showMsg($('formMsg'), 'Please add at least one colour with at least one photo.', false); return; }
  var done = function () {
    var backToVisual = editorReturnToVisual;
    closeEditor();
    showMsg($('prodMsg'), 'Saved! "' + product.name + '" is updated in your shop.', true);
    loadProducts();
    refreshVisualPreview();
    if (backToVisual) showMsg($('visualMsg'), 'Saved! "' + product.name + '" is updated in your shop. The picture above shows the change.', true);
  };
  if (editingId) {
    api('PUT', '/api/admin/products/' + encodeURIComponent(editingId), { product: product }).then(done)
      .catch(function (e) { showMsg($('formMsg'), e.message, false); });
  } else {
    product.id = $('f-id').value.trim();
    if (!product.id) { showMsg($('formMsg'), 'Please write the web address name (small letters, no spaces).', false); return; }
    api('POST', '/api/admin/products', { product: product }).then(done)
      .catch(function (e) { showMsg($('formMsg'), e.message, false); });
  }
}

/* ---------------- settings ---------------- */
function loadSettings() {
  api('GET', '/api/admin/settings').then(function (d) {
    settings = d.settings || {};
    fillLook(); fillWriting(); buildSectionToggles();
  }).catch(function (e) { showMsg($('lookMsg'), e.message, false); });
}
function syncColor(pickerId, textId) {
  var picker = $(pickerId), text = $(textId);
  picker.addEventListener('input', function () { text.value = picker.value; });
  text.addEventListener('change', function () { if (/^#[0-9a-fA-F]{6}$/.test(text.value)) picker.value = text.value; });
}
function setColor(pickerId, textId, val) { $(textId).value = val || ''; if (/^#[0-9a-fA-F]{6}$/.test(val || '')) $(pickerId).value = val; }
function fillLook() {
  var d = settings.design || {};
  var c = settings.content || {};
  setColor('d-bg-picker', 'd-bg', d.backgroundColor);
  setColor('d-ink-picker', 'd-ink', d.primaryColor);
  setColor('d-btn-picker', 'd-btn', d.buttonColor);
  setColor('d-btnink-picker', 'd-btnink', d.buttonTextColor);
  if ($('d-btnshape')) $('d-btnshape').value = d.buttonShape || 'pill';
  if ($('d-btnsize')) $('d-btnsize').value = d.buttonSize || 'normal';
  if ($('d-btn-shopall')) $('d-btn-shopall').value = c.btnShopAllText || 'Shop all pairs';
  if ($('d-btn-addbag')) $('d-btn-addbag').value = c.btnAddToBagText || 'Add to cart';
  if ($('d-btn-buynow')) $('d-btn-buynow').value = c.btnBuyNowText || 'Buy now';
  $('d-font').value = d.fontPreset || 'classic';
  $('d-hsize').value = d.headingSize == null ? '' : d.headingSize;
  $('d-bsize').value = d.bodySize == null ? '' : d.bodySize;
}
function saveLook() {
  var design = {
    backgroundColor: $('d-bg').value.trim(),
    primaryColor: $('d-ink').value.trim(),
    buttonColor: $('d-btn').value.trim(),
    buttonTextColor: $('d-btnink').value.trim(),
    buttonShape: $('d-btnshape') ? $('d-btnshape').value : 'pill',
    buttonSize: $('d-btnsize') ? $('d-btnsize').value : 'normal',
    fontPreset: $('d-font').value,
    headingSize: $('d-hsize').value === '' ? null : Number($('d-hsize').value),
    bodySize: $('d-bsize').value === '' ? null : Number($('d-bsize').value)
  };
  var content = {
    btnShopAllText: $('d-btn-shopall') ? $('d-btn-shopall').value.trim() : 'Shop all pairs',
    btnAddToBagText: $('d-btn-addbag') ? $('d-btn-addbag').value.trim() : 'Add to cart',
    btnBuyNowText: $('d-btn-buynow') ? $('d-btn-buynow').value.trim() : 'Buy now'
  };
  api('PUT', '/api/admin/settings', { settings: { design: design, content: content } }).then(function (d) {
    settings = d.settings;
    showMsg($('lookMsg'), 'Saved! Your shop now uses the new look and button styling.', true);
    refreshVisualPreview();
  }).catch(function (e) { showMsg($('lookMsg'), e.message, false); });
}
function fillWriting() {
  var c = settings.content || {};
  var s = settings.sections || {};
  $('c-ann-on').checked = c.announcementOn !== false;
  $('c-ann').value = c.announcementText || '';
  if ($('c-ann-link')) $('c-ann-link').value = c.announcementLink || '';
  if ($('c-ann-bg')) setColor('c-ann-bg-picker', 'c-ann-bg', c.announcementBg || '#1B1A34');
  if ($('c-ann-color')) setColor('c-ann-color-picker', 'c-ann-color', c.announcementColor || '#FFFFFF');
  if ($('c-ann-code')) $('c-ann-code').value = c.announcementPromoCode || 'WELCOME10';

  $('c-h1').value = c.heroHeading1 || '';
  $('c-h2').value = c.heroHeading2 || '';
  $('c-hdesk').value = c.heroDesktopImage || '';
  $('c-hmob').value = c.heroMobileImage || '';
  $('c-fest').value = c.festiveHeading || '';
  $('c-best').value = c.bestsellersHeading || '';

  // Newsletter
  if ($('c-nl-on')) $('c-nl-on').checked = s.newsletter !== false;
  if ($('c-nl-h')) $('c-nl-h').value = c.newsletterHeading || 'Get 10% off';
  if ($('c-nl-p')) $('c-nl-p').value = c.newsletterText || 'New drops, restock alerts and early access to offers, straight to your inbox. 10% off your first order.';
  if ($('c-nl-place')) $('c-nl-place').value = c.newsletterPlaceholder || 'Your mobile number';
  if ($('c-nl-btn')) $('c-nl-btn').value = c.newsletterButton || 'Subscribe';
  if ($('c-nl-code')) $('c-nl-code').value = c.newsletterCode || 'WELCOME10';

  // Craft video banner
  if ($('c-craft-on')) $('c-craft-on').checked = s.craftBanner !== false;
  if ($('c-craft-h')) $('c-craft-h').value = c.craftHeading || 'Handcrafted. Comfort first.';
  if ($('c-craft-sub')) $('c-craft-sub').value = c.craftSubheading || 'From our hands, to your feet';
  if ($('c-craft-btn')) $('c-craft-btn').value = c.craftBtnText || 'Shop all pairs';
  if ($('c-craft-link')) $('c-craft-link').value = c.craftBtnLink || '#/shop';
  if ($('c-craft-vid')) $('c-craft-vid').value = c.craftVideo || 'assets/banner2.mp4';

  // Reels
  if ($('c-reels-on')) $('c-reels-on').checked = s.reels !== false;
  if ($('c-reels-h')) $('c-reels-h').value = c.reelsHeading || 'Moments in motion';

  // Menu, shop page & checkout words
  if ($('c-nav-shopall')) $('c-nav-shopall').value = c.navShopAll || '';
  if ($('c-nav-collections')) $('c-nav-collections').value = c.navCollections || '';
  if ($('c-nav-story')) $('c-nav-story').value = c.navOurStory || '';
  if ($('c-nav-account')) $('c-nav-account').value = c.navAccount || '';
  if ($('c-shop-title')) $('c-shop-title').value = c.shopTitle || '';
  if ($('c-shop-blurb')) $('c-shop-blurb').value = c.shopBlurb || '';
  if ($('c-checkout-title')) $('c-checkout-title').value = c.checkoutTitle || '';
  if ($('c-btn-place')) $('c-btn-place').value = c.btnPlaceOrderText || '';
  if ($('c-btn-pay')) $('c-btn-pay').value = c.btnPayText || '';
  if ($('c-link-continue')) $('c-link-continue').value = c.linkContinue || '';

  updateMediaPreview($('c-hdesk'), $('prev-hdesk'), $('empty-hdesk'));
  updateMediaPreview($('c-hmob'), $('prev-hmob'), $('empty-hmob'));
}
function saveWriting() {
  var content = {
    announcementOn: $('c-ann-on').checked,
    announcementText: $('c-ann').value.trim(),
    announcementLink: $('c-ann-link') ? $('c-ann-link').value.trim() : '',
    announcementBg: $('c-ann-bg') ? $('c-ann-bg').value.trim() : '',
    announcementColor: $('c-ann-color') ? $('c-ann-color').value.trim() : '',
    announcementPromoCode: $('c-ann-code') ? $('c-ann-code').value.trim() : '',
    heroHeading1: $('c-h1').value.trim(),
    heroHeading2: $('c-h2').value.trim(),
    heroDesktopImage: $('c-hdesk').value.trim(),
    heroMobileImage: $('c-hmob').value.trim(),
    festiveHeading: $('c-fest').value.trim(),
    bestsellersHeading: $('c-best').value.trim(),
    newsletterHeading: $('c-nl-h') ? $('c-nl-h').value.trim() : 'Get 10% off',
    newsletterText: $('c-nl-p') ? $('c-nl-p').value.trim() : '',
    newsletterPlaceholder: $('c-nl-place') ? $('c-nl-place').value.trim() : '',
    newsletterButton: $('c-nl-btn') ? $('c-nl-btn').value.trim() : 'Subscribe',
    newsletterCode: $('c-nl-code') ? $('c-nl-code').value.trim() : 'WELCOME10',
    craftHeading: $('c-craft-h') ? $('c-craft-h').value.trim() : 'Handcrafted. Comfort first.',
    craftSubheading: $('c-craft-sub') ? $('c-craft-sub').value.trim() : 'From our hands, to your feet',
    craftBtnText: $('c-craft-btn') ? $('c-craft-btn').value.trim() : 'Shop all pairs',
    craftBtnLink: $('c-craft-link') ? $('c-craft-link').value.trim() : '#/shop',
    craftVideo: $('c-craft-vid') ? $('c-craft-vid').value.trim() : 'assets/banner2.mp4',
    reelsHeading: $('c-reels-h') ? $('c-reels-h').value.trim() : 'Moments in motion',
    navShopAll: $('c-nav-shopall') ? $('c-nav-shopall').value.trim() : '',
    navCollections: $('c-nav-collections') ? $('c-nav-collections').value.trim() : '',
    navOurStory: $('c-nav-story') ? $('c-nav-story').value.trim() : '',
    navAccount: $('c-nav-account') ? $('c-nav-account').value.trim() : '',
    shopTitle: $('c-shop-title') ? $('c-shop-title').value.trim() : '',
    shopBlurb: $('c-shop-blurb') ? $('c-shop-blurb').value.trim() : '',
    checkoutTitle: $('c-checkout-title') ? $('c-checkout-title').value.trim() : '',
    btnPlaceOrderText: $('c-btn-place') ? $('c-btn-place').value.trim() : '',
    btnPayText: $('c-btn-pay') ? $('c-btn-pay').value.trim() : '',
    linkContinue: $('c-link-continue') ? $('c-link-continue').value.trim() : ''
  };
  var sections = {};
  if ($('c-nl-on')) sections.newsletter = $('c-nl-on').checked;
  if ($('c-craft-on')) sections.craftBanner = $('c-craft-on').checked;
  if ($('c-reels-on')) sections.reels = $('c-reels-on').checked;

  api('PUT', '/api/admin/settings', { settings: { content: content, sections: sections } }).then(function (d) {
    settings = d.settings;
    showMsg($('writingMsg'), 'Saved! The new words and sections are now updated in your shop and database.', true);
    refreshVisualPreview();
  }).catch(function (e) { showMsg($('writingMsg'), e.message, false); });
}
function buildSectionToggles() {
  var sec = settings.sections || {};
  $('sectionToggles').innerHTML = SECTION_INFO.map(function (row) {
    var on = sec[row[0]] !== false;
    return '<div class="toggle-row"><div class="grow"><b>' + esc(row[1]) + '</b><br><span class="field-help" style="margin:0">' + esc(row[2]) + '</span></div>' +
      '<label class="switch"><input type="checkbox" data-section="' + row[0] + '"' + (on ? ' checked' : '') + '><span class="track"></span></label></div>';
  }).join('');
}
function saveSections() {
  var sections = {};
  document.querySelectorAll('[data-section]').forEach(function (cb) { sections[cb.dataset.section] = cb.checked; });
  api('PUT', '/api/admin/settings', { settings: { sections: sections } }).then(function (d) {
    settings = d.settings;
    showMsg($('sectionsMsg'), 'Saved! The homepage now shows only the parts you kept on.', true);
    refreshVisualPreview();
  }).catch(function (e) { showMsg($('sectionsMsg'), e.message, false); });
}

/* ---------------- orders ---------------- */
function loadOrders() {
  api('GET', '/api/admin/orders').then(function (d) { renderOrders(d.orders || []); })
    .catch(function () { $('orderList').innerHTML = '<p class="help">Could not load orders. Press Refresh.</p>'; });
}
function renderOrders(orders) {
  var el = $('orderList');
  if (!orders.length) { el.innerHTML = '<p class="help">No orders yet. When a customer buys something, the order will appear here.</p>'; return; }
  el.innerHTML = orders.map(function (o) {
    var pay = o.payment || {};
    var pill = pay.status === 'paid' ? '<span class="pill paid">Paid online</span>'
      : pay.status === 'test_mode' ? '<span class="pill cod">TEST — no money taken</span>'
      : pay.status === 'payment_pending' ? '<span class="pill">Payment not finished</span>'
      : '<span class="pill cod">Cash on delivery</span>';
    var items = (o.items || []).map(function (it) {
      return '<tr><td>' + esc(it.name) + ' — ' + esc(it.variant) + ', EU ' + esc(it.size) + '</td><td>× ' + it.qty + '</td><td>' + inr(it.unitPrice * it.qty) + '</td></tr>';
    }).join('');
    var awb = o.shipment && o.shipment.awb ? '<br>Shipment AWB: <b>' + esc(o.shipment.awb) + '</b>' + (o.shipment.courier ? ' (' + esc(o.shipment.courier) + ')' : '') : '';
    var t = o.totals || {};
    var breakup = '<tr><td colspan="2">Subtotal</td><td>' + inr(t.subtotal || 0) + '</td></tr>'
      + (t.promo ? '<tr><td colspan="2">Discount' + (o.promoCode ? ' (' + esc(o.promoCode) + ')' : '') + '</td><td>\u2212 ' + inr(t.promo) + '</td></tr>' : '')
      + '<tr><td colspan="2">Shipping</td><td>' + (t.shipping ? inr(t.shipping) : 'Free') + '</td></tr>'
      + (t.codFee ? '<tr><td colspan="2">COD fee</td><td>' + inr(t.codFee) + '</td></tr>' : '')
      + '<tr><td colspan="2"><b>Total</b></td><td><b>' + inr(t.total || 0) + '</b></td></tr>';
    var badges = (o.isTest ? ' <span class="pill test">TEST ORDER</span>' : '')
      + (o.orderStatus ? ' <span class="pill status">' + esc(String(o.orderStatus).replace(/_/g, ' ')) + '</span>' : '');
    return '<div class="order"><b>Order ' + esc(o.id) + '</b> · ' + new Date(o.at).toLocaleString('en-IN') + ' &nbsp;' + pill + badges +
      '<br><b>' + esc(o.customer.name) + '</b> · ' + esc(o.customer.phone) + ' · ' + esc(o.customer.email) +
      '<br>' + esc([o.customer.address, o.customer.city, o.customer.state, o.customer.pincode].filter(Boolean).join(', ')) + awb +
      '<table>' + items + breakup + '</table></div>';
  }).join('');
}

/* ---------------- password and safety ---------------- */
function loadSecurity() {
  if (!$('recoveryStatus')) return;
  api('GET', '/api/admin/security').then(function (d) {
    $('recoveryStatus').textContent = d.recoverySet
      ? 'Recovery code: set. If you forget your password, the login page will ask for this code.'
      : 'Recovery code: not set yet. Set one below, so you can get back in if you forget your password.';
  }).catch(function () { $('recoveryStatus').textContent = ''; });
}
function doChangePassword() {
  api('POST', '/api/admin/security/change-password', { currentPassword: $('sec-cur').value, newPassword: $('sec-new').value })
    .then(function (d) {
      if (d.token) { token = d.token; sessionStorage.setItem('auve_admin_token', token); }
      $('sec-cur').value = ''; $('sec-new').value = '';
      showMsg($('changePwMsg'), 'Saved! Your new password is working. Use it the next time you log in.', true);
    })
    .catch(function (e) { showMsg($('changePwMsg'), e.message, false); });
}
function doSaveRecovery() {
  api('POST', '/api/admin/security/recovery-code', { currentPassword: $('rec-cur').value, recoveryCode: $('rec-code').value })
    .then(function () {
      $('rec-cur').value = ''; $('rec-code').value = '';
      showMsg($('recoveryMsg'), 'Saved! Your recovery code is set. Keep it written down somewhere safe.', true);
      loadSecurity();
    })
    .catch(function (e) { showMsg($('recoveryMsg'), e.message, false); });
}
function doForgot() {
  fetch(apiPath('/api/admin/forgot-password'), {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recoveryCode: $('fg-code').value, newPassword: $('fg-new').value })
  })
    .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
    .then(function (res) {
      if (!res.ok) { showMsg($('forgotMsg'), res.d.error || 'Something went wrong. Please try again.', false); return; }
      token = res.d.token;
      sessionStorage.setItem('auve_admin_token', token);
      startApp();
    })
    .catch(function () { showMsg($('forgotMsg'), 'Could not reach the server. Please try again.', false); });
}
function wireEye(btn, input) {
  if (!btn || !input) return;
  btn.addEventListener('click', function () {
    var show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    btn.textContent = show ? 'Hide' : 'Show';
  });
}

/* ---------------- payments and delivery keys ---------------- */
function loadIntegrations() {
  if (!$('rzStatus')) return;
  api('GET', '/api/admin/integrations').then(function (d) {
    var rz = d.razorpay || {}, sr = d.shiprocket || {};
    $('rzStatus').textContent = rz.live
      ? 'Razorpay: ON. Online payments are live' + (rz.source === 'admin' ? ' with the keys saved on this page.' : ' with keys from the server file.')
      : 'Razorpay: OFF. The shop is in test mode, no real money is taken.';
    $('rz-id').value = rz.adminKeyId || rz.keyId || '';
    $('rz-secret').value = '';
    $('rz-secret').placeholder = rz.adminSecretSet ? 'A secret is saved (hidden). Type only to replace it.' : 'Paste the Key Secret';
    $('srStatus').textContent = sr.configured
      ? 'Shiprocket: ON. Shipments will be created on their own' + (sr.source === 'admin' ? ' with the login saved on this page.' : ' with the login from the server file.')
      : 'Shiprocket: OFF. Orders will not get a courier booking on their own.';
    $('sr-email').value = sr.adminEmail || sr.email || '';
    $('sr-pass').value = '';
    $('sr-pass').placeholder = sr.adminPasswordSet ? 'A password is saved (hidden). Type only to replace it.' : 'Your Shiprocket password';
    $('sr-pickup').value = sr.adminPickup || sr.pickupLocation || 'Primary';
  }).catch(function () {});
}
function doSaveRazorpay() {
  api('PUT', '/api/admin/integrations', { razorpayKeyId: $('rz-id').value.trim(), razorpayKeySecret: $('rz-secret').value })
    .then(function () {
      showMsg($('rzMsg'), 'Saved! If both the Key ID and the Key Secret are in, online payments are live right away. Use the Check button to test the format.', true);
      loadIntegrations();
    })
    .catch(function (e) { showMsg($('rzMsg'), e.message, false); });
}
function doSaveShiprocket() {
  api('PUT', '/api/admin/integrations', { shiprocketEmail: $('sr-email').value.trim(), shiprocketPassword: $('sr-pass').value, shiprocketPickup: $('sr-pickup').value.trim() })
    .then(function () {
      showMsg($('srMsg'), 'Saved! Use the Check button to try the login with Shiprocket.', true);
      loadIntegrations();
    })
    .catch(function (e) { showMsg($('srMsg'), e.message, false); });
}
function doCheckRazorpay() {
  showMsg($('rzMsg'), 'Checking...', true);
  api('POST', '/api/admin/integrations/check-razorpay', {})
    .then(function (d) { showMsg($('rzMsg'), d.message || d.error, !!d.ok); })
    .catch(function (e) { showMsg($('rzMsg'), e.message, false); });
}
function doCheckShiprocket() {
  showMsg($('srMsg'), 'Trying to log in to Shiprocket...', true);
  api('POST', '/api/admin/integrations/check-shiprocket', {})
    .then(function (d) { showMsg($('srMsg'), d.message || d.error, !!d.ok); })
    .catch(function (e) { showMsg($('srMsg'), e.message, false); });
}
function doClearIntegration(which, msgEl) {
  api('POST', '/api/admin/integrations/clear', { which: which })
    .then(function () {
      showMsg($(msgEl), 'Removed. The keys saved on this page are deleted.', true);
      loadIntegrations();
    })
    .catch(function (e) { showMsg($(msgEl), e.message, false); });
}

/* ---------------- visual editor ----------------
 * The visual view embeds the real homepage in an iframe (same site, so
 * this page is allowed to look inside it). After the shop renders, we
 * find each part on the page (the top strip, the hero photo, the rows,
 * the footer, and every product card) and float a labelled button over
 * it. Tapping a button, or tapping the part itself, opens the boxes for
 * just that part under the picture. */
var visualStarted = false;
var visualRegions = [];
var assetImages = [];
var visualAllowClick = false;
var VISUAL_SECTION_NAMES = {
  hero: 'Top photo banner', craftBanner: 'Craft video banner', festive: 'Festive collection row',
  collections: 'Shop by collection', bestsellers: 'Bestsellers row', reels: 'Video reels', newsletter: 'Newsletter box'
};

function previewDoc() {
  var f = $('shopPreview');
  if (!f) return null;
  try { return f.contentDocument || null; } catch (e) { return null; }
}
function initVisual() {
  if (visualStarted) return;
  visualStarted = true;
  api('GET', '/api/admin/assets').then(function (d) { assetImages = d.images || []; }).catch(function () {});
  var f = $('shopPreview');
  f.addEventListener('load', function () { setTimeout(setupPreview, 500); });
  f.src = './';
  var tick = 0;
  setInterval(function () {
    positionBadges();
    tick++;
    if (tick % 4 === 0) { var doc = previewDoc(); if (doc) closeShopPopup(doc); }
  }, 450);
}
function refreshVisualPreview() {
  if (!visualStarted) return;
  var f = $('shopPreview');
  try { f.contentWindow.location.reload(); } catch (e) { f.src = './'; }
}
function setupPreview() {
  var doc = previewDoc();
  if (!doc || !doc.body) { setTimeout(setupPreview, 800); return; }
  attachPreviewClicks(doc);
  closeShopPopup(doc);
  scanRegions(8);
}
function closeShopPopup(doc) {
  try {
    var els = doc.querySelectorAll('body *');
    for (var i = 0; i < els.length; i++) {
      var e = els[i];
      if (e.children.length === 0 && (e.textContent || '').trim() === '×') {
        var cur = e, fixed = false;
        while (cur && cur !== doc.body) { if (doc.defaultView.getComputedStyle(cur).position === 'fixed') { fixed = true; break; } cur = cur.parentElement; }
        if (fixed) { visualAllowClick = true; e.click(); setTimeout(function () { visualAllowClick = false; }, 300); return; }
      }
    }
  } catch (err) {}
}
function attachPreviewClicks(doc) {
  if (doc.__auveVisual) return;
  doc.__auveVisual = true;
  doc.addEventListener('click', function (e) {
    if (visualAllowClick) return;
    e.preventDefault();
    e.stopPropagation();
    handlePreviewClick(e.target);
  }, true);
  doc.addEventListener('scroll', positionBadges, true);
}
function handlePreviewClick(target) {
  var doc = previewDoc();
  if (!doc || !target) return;
  var a = target.closest ? target.closest('a[href^="#/product/"]') : null;
  if (a) {
    var id = (a.getAttribute('href') || '').replace('#/product/', '');
    if (id && products.some(function (p) { return p.id === id; })) { openProductFromVisual(id); return; }
  }
  var sorted = visualRegions.slice().sort(function (x, y) { return depthOf(y.el) - depthOf(x.el); });
  for (var i = 0; i < sorted.length; i++) {
    var r = sorted[i];
    if (!r.productId && r.el && r.el.isConnected && r.el.contains(target)) { openVisualEditor(r.key); return; }
  }
}
function depthOf(el) { var d = 0, c = el; while (c && c.parentElement) { d++; c = c.parentElement; } return d; }

function scanRegions(retries) {
  var doc = previewDoc();
  var overlay = $('visualOverlay');
  if (!doc || !overlay) return;
  overlay.innerHTML = '';
  visualRegions = [];
  var c = (settings && settings.content) || {};
  function leafByText(t) {
    if (!t) return null;
    var els = doc.querySelectorAll('body *');
    for (var i = 0; i < els.length; i++) {
      if (els[i].children.length === 0 && (els[i].textContent || '').trim() === t) return els[i];
    }
    return null;
  }
  function sectionOf(el) {
    var cur = el;
    while (cur && cur.tagName !== 'SECTION' && cur !== doc.body) cur = cur.parentElement;
    return (cur && cur.tagName === 'SECTION') ? cur : el;
  }
  function addRegion(key, label, el, productId) {
    if (!el) return;
    var outline = document.createElement('div');
    outline.className = 'v-outline';
    var badge = document.createElement('button');
    badge.type = 'button';
    badge.className = 'v-badge' + (productId ? ' prod' : '');
    badge.textContent = label;
    (function (k, pid) {
      badge.addEventListener('click', function () { if (pid) openProductFromVisual(pid); else openVisualEditor(k); });
    })(key, productId);
    badge.addEventListener('mouseenter', function () { outline.classList.add('hot'); });
    badge.addEventListener('mouseleave', function () { outline.classList.remove('hot'); });
    overlay.appendChild(outline);
    overlay.appendChild(badge);
    visualRegions.push({ key: key, el: el, badge: badge, outline: outline, productId: productId || null });
  }

  var annLeaf = leafByText(c.announcementText);
  if (annLeaf) addRegion('announcement', 'Top strip: Edit', annLeaf.parentElement);
  var hero = doc.querySelector('section[data-screen-label="Home"]');
  if (hero) {
    addRegion('hero', 'Top photo: Edit', hero);
    var h1 = hero.querySelector('h1');
    if (h1) addRegion('heroHeading', 'Big heading: Edit', h1);
  }
  var craftVid = null;
  Array.prototype.forEach.call(doc.querySelectorAll('video'), function (v) {
    if ((v.getAttribute('src') || '').indexOf('banner2') >= 0) craftVid = v;
  });
  if (craftVid) addRegion('craftBanner', 'Video banner: Edit', sectionOf(craftVid));
  else { var craftH = leafByText('Handcrafted. Comfort first.'); if (craftH) addRegion('craftBanner', 'Video banner: Edit', sectionOf(craftH)); }
  var festLeaf = leafByText(c.festiveHeading);
  if (festLeaf) addRegion('festive', 'Festive row: Edit', sectionOf(festLeaf));
  var collCard = null;
  Array.prototype.forEach.call(doc.querySelectorAll('a[href^="#/shop/"]'), function (a) {
    if (!collCard && a.getBoundingClientRect().height > 100) collCard = a;
  });
  if (collCard) addRegion('collections', 'Collections: Edit', sectionOf(collCard));
  var bestLeaf = leafByText(c.bestsellersHeading);
  if (bestLeaf) addRegion('bestsellers', 'Bestsellers: Edit', sectionOf(bestLeaf));
  var reelsH = leafByText('Moments in motion');
  if (reelsH) addRegion('reels', 'Video reels: Edit', sectionOf(reelsH));
  var newsSection = null;
  Array.prototype.forEach.call(doc.querySelectorAll('section'), function (s) {
    if (s !== hero && s.querySelector('input')) newsSection = s;
  });
  if (newsSection) addRegion('newsletter', 'Newsletter box: Edit', newsSection);
  var footer = doc.querySelector('footer');
  if (footer) addRegion('footer', 'Footer and colours: Edit', footer);
  Array.prototype.forEach.call(doc.querySelectorAll('a[href^="#/product/"]'), function (a) {
    if (a.getBoundingClientRect().height > 150) {
      addRegion('product', 'Edit', a, (a.getAttribute('href') || '').replace('#/product/', ''));
    }
  });

  renderHiddenParts();
  positionBadges();
  if (!hero && retries > 0) setTimeout(function () { scanRegions(retries - 1); }, 900);
}
function positionBadges() {
  if (!visualStarted) return;
  var tab = $('tab-visual');
  if (!tab || tab.classList.contains('hidden')) return;
  var f = $('shopPreview');
  var overlay = $('visualOverlay');
  if (!f || !overlay) return;
  var fRect = f.getBoundingClientRect();
  var oRect = overlay.getBoundingClientRect();
  var needRescan = false;
  visualRegions.forEach(function (r) {
    if (!r.el || !r.el.isConnected) { needRescan = true; r.badge.style.display = 'none'; r.outline.style.display = 'none'; return; }
    var rect = r.el.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > fRect.height || rect.width === 0) { r.badge.style.display = 'none'; r.outline.style.display = 'none'; return; }
    var x = fRect.left - oRect.left + rect.left;
    var y = fRect.top - oRect.top + rect.top;
    r.outline.style.display = '';
    r.outline.style.left = x + 'px';
    r.outline.style.top = y + 'px';
    r.outline.style.width = rect.width + 'px';
    r.outline.style.height = rect.height + 'px';
    r.badge.style.display = '';
    if (r.productId) {
      r.badge.style.left = (x + rect.width) + 'px';
      r.badge.style.top = (y + 10) + 'px';
      r.badge.style.transform = 'translateX(-100%) translateX(-10px)';
    } else {
      r.badge.style.left = (x + 12) + 'px';
      r.badge.style.top = (y + 12) + 'px';
      r.badge.style.transform = '';
    }
  });
  if (needRescan) scanRegions(0);
}
function renderHiddenParts() {
  var box = $('hiddenParts');
  if (!box) return;
  var sec = (settings && settings.sections) || {};
  var c = (settings && settings.content) || {};
  var hidden = [];
  Object.keys(VISUAL_SECTION_NAMES).forEach(function (k) { if (sec[k] === false) hidden.push([k, VISUAL_SECTION_NAMES[k]]); });
  if (c.announcementOn === false) hidden.push(['announcement', 'Top strip']);
  if (!hidden.length) { box.innerHTML = ''; return; }
  box.innerHTML = '<div class="hidden-parts"><b>Hidden parts:</b>' + hidden.map(function (h) {
    return '<button class="btn btn-light btn-small" data-showpart="' + h[0] + '">' + esc(h[1]) + ' is off. Turn it on</button>';
  }).join('') + '</div>';
  box.querySelectorAll('[data-showpart]').forEach(function (b) {
    b.addEventListener('click', function () { openVisualEditor(b.dataset.showpart); });
  });
}
function openProductFromVisual(id) {
  editorReturnToVisual = true;
  switchTab('products');
  openEditor(id);
}

/* ----- visual editor panels ----- */
function vHead(title, help) {
  return '<h2>' + esc(title) + '</h2><p class="help">' + help + '</p><div id="vMsg"></div>';
}
function vSaveRow(label) {
  return '<p style="margin-top:22px; display:flex; gap:12px; flex-wrap:wrap"><button class="btn btn-green" id="vSave" style="font-size:19px; padding:16px 38px">' + esc(label) + '</button>' +
    '<button class="btn btn-light" id="vClose">Close</button></p>';
}
function vSectionToggle(key) {
  var on = !settings.sections || settings.sections[key] !== false;
  return '<div class="toggle-row"><div class="grow"><b>Show this part on the homepage</b><br><span class="field-help" style="margin:0">Turning it off only hides the part. Nothing is deleted, and you can turn it back on any time.</span></div>' +
    '<label class="switch"><input type="checkbox" id="v-sec"' + (on ? ' checked' : '') + '><span class="track"></span></label></div>';
}
function vSaveSettings(part, okText) {
  api('PUT', '/api/admin/settings', { settings: part }).then(function (d) {
    settings = d.settings;
    fillLook(); fillWriting(); buildSectionToggles();
    showMsg($('vMsg'), okText, true);
    renderHiddenParts();
    refreshVisualPreview();
  }).catch(function (e) { showMsg($('vMsg'), e.message, false); });
}
var DEFAULT_REELS_ADMIN = [
  { video: 'assets/reels/first-look.mp4', poster: 'assets/p/v-09.jpg', caption: 'First Look, brocade on a gold wedge', pid: 'first-look' },
  { video: 'assets/reels/muse.mp4', poster: 'assets/p/bn-muse-1.jpg', caption: 'Muse, in pastel', pid: 'muse' },
  { video: 'assets/reels/after-glow.mp4', poster: 'assets/p/gh-top.jpg', caption: 'Golden Hour', pid: 'golden-hour' },
  { video: 'assets/reels/desertsand.mp4', poster: 'assets/p/bn-softfocus-2.jpg', caption: 'Soft Focus, all day', pid: 'soft-focus' },
  { video: 'assets/reels/daydream-pink.mp4', poster: 'assets/p/bn-daydream-2.jpg', caption: 'Day Dream, barely there', pid: 'daydream-b' },
  { video: 'assets/reels/champagne.mp4', poster: 'assets/p/bn-whisper-1.jpg', caption: 'Step in. Stand out.', pid: 'whisper' },
  { video: 'assets/reels/dune.mp4', poster: 'assets/p/bn-dune-2.jpg', caption: 'The Barely Edit 2026', pid: 'dune' }
];
function reelRowHtml(r) {
  r = r || {};
  var opts = '<option value="">No product link</option>' + (products || []).map(function (p) {
    return '<option value="' + esc(p.id) + '"' + (r.pid === p.id ? ' selected' : '') + '>' + esc(p.name) + '</option>';
  }).join('');
  return '<div class="reel-row">'
    + '<div class="reel-head"><b class="r-title">Reel</b><span>'
    + '<button type="button" class="btn btn-light btn-sm r-up">Move up</button> '
    + '<button type="button" class="btn btn-light btn-sm r-down">Move down</button> '
    + '<button type="button" class="btn btn-light btn-sm r-del">Remove</button></span></div>'
    + '<label>Video file (mp4)</label>'
    + '<input type="text" class="r-video" value="' + esc(r.video || '') + '" placeholder="assets/reels/my-video.mp4">'
    + '<p class="reel-btns"><button type="button" class="btn btn-light btn-sm r-up-video">Upload video</button> <button type="button" class="btn btn-light btn-sm r-lib-video">Choose from library</button></p>'
    + '<label>Poster photo (shows before the video plays)</label>'
    + '<input type="text" class="r-poster" value="' + esc(r.poster || '') + '" placeholder="assets/p/photo.jpg">'
    + '<p class="reel-btns"><button type="button" class="btn btn-light btn-sm r-up-poster">Upload photo</button> <button type="button" class="btn btn-light btn-sm r-lib-poster">Choose from library</button></p>'
    + '<label>Caption</label>'
    + '<input type="text" class="r-caption" value="' + esc(r.caption || '') + '" placeholder="Text shown with the video">'
    + '<label>When a customer taps the reel, open this product</label>'
    + '<select class="r-pid">' + opts + '</select>'
    + '</div>';
}
function renumberReelRows() {
  Array.prototype.forEach.call(document.querySelectorAll('#vReelsList .reel-row'), function (row, i) {
    row.querySelector('.r-title').textContent = 'Reel ' + (i + 1);
  });
}
function pickReelFile(inputEl, accept) {
  var f = document.createElement('input');
  f.type = 'file'; f.accept = accept;
  f.addEventListener('change', function () {
    if (!f.files || !f.files.length) return;
    var old = inputEl.value;
    inputEl.value = 'Uploading...';
    uploadFiles(f.files).then(function (res) {
      inputEl.value = res.url || (res.files && res.files[0] && (res.files[0].url || res.files[0].path)) || old;
    }).catch(function (e) { inputEl.value = old; alert('Upload failed: ' + e.message); });
  });
  f.click();
}
function wireReelsPanel() {
  renumberReelRows();
  var list = $('vReelsList');
  if (!list) return;
  list.addEventListener('click', function (e) {
    var btn = e.target.closest('button'); if (!btn) return;
    var row = e.target.closest('.reel-row'); if (!row) return;
    if (btn.classList.contains('r-up')) { var prev = row.previousElementSibling; if (prev) list.insertBefore(row, prev); renumberReelRows(); }
    else if (btn.classList.contains('r-down')) { var next = row.nextElementSibling; if (next) list.insertBefore(next, row); renumberReelRows(); }
    else if (btn.classList.contains('r-del')) { row.remove(); renumberReelRows(); }
    else if (btn.classList.contains('r-up-video')) pickReelFile(row.querySelector('.r-video'), 'video/mp4,video/webm,video/quicktime');
    else if (btn.classList.contains('r-lib-video')) openMediaLibrary(function (src) { row.querySelector('.r-video').value = src; });
    else if (btn.classList.contains('r-up-poster')) pickReelFile(row.querySelector('.r-poster'), 'image/*');
    else if (btn.classList.contains('r-lib-poster')) openMediaLibrary(function (src) { row.querySelector('.r-poster').value = src; });
  });
  $('vReelAdd').addEventListener('click', function () {
    var div = document.createElement('div');
    div.innerHTML = reelRowHtml({});
    list.appendChild(div.firstChild);
    renumberReelRows();
  });
}
function imgPickHtml(prefix, label, value, help) {
  var opts = '';
  if (value && assetImages.indexOf(value) < 0) opts += '<option value="' + esc(value) + '" selected>' + esc(value) + '</option>';
  opts += assetImages.map(function (p) {
    return '<option value="' + esc(p) + '"' + (p === value ? ' selected' : '') + '>' + esc(p.replace('assets/', '')) + '</option>';
  }).join('');
  return '<label>' + esc(label) + '</label>' +
    '<div class="imgpick"><img id="' + prefix + '-thumb" src="' + esc(value || '') + '" alt="">' +
    '<div class="grow"><select id="' + prefix + '-sel"><option value="">Choose a photo from your shop files...</option>' + opts + '</select>' +
    '<input type="text" id="' + prefix + '-path" value="' + esc(value || '') + '" placeholder="Example: assets/hero-desktop.jpg">' +
    '<p class="field-help">' + help + '</p></div></div>';
}
function wireImgPick(prefix) {
  var sel = $(prefix + '-sel'), path = $(prefix + '-path'), thumb = $(prefix + '-thumb');
  if (!sel || !path || !thumb) return;
  sel.addEventListener('change', function () { if (sel.value) { path.value = sel.value; thumb.src = sel.value; } });
  path.addEventListener('change', function () { thumb.src = path.value; });
}
function vColorRow(prefix, label, value, help) {
  return '<label>' + esc(label) + '</label><div class="color-row"><input type="color" id="' + prefix + '-picker">' +
    '<div><input type="text" id="' + prefix + '" value="' + esc(value || '') + '"></div></div><p class="field-help">' + help + '</p>';
}

function openVisualEditor(key) {
  var card = $('visualEditorCard');
  var box = $('visualEditor');
  var c = (settings && settings.content) || {};
  var d = (settings && settings.design) || {};
  var html = '';
  var wire = function () {};

  if (key === 'announcement') {
    html = vHead('The thin strip at the very top (Offer & Announcement Bar)', 'This strip sits above everything and shows on every page of your shop.') +
      '<label for="v-ann">Words on the top strip (Offer text)</label><input type="text" id="v-ann" value="' + esc(c.announcementText || '') + '">' +
      '<label for="v-ann-link">Banner link (optional)</label><input type="text" id="v-ann-link" value="' + esc(c.announcementLink || '') + '" placeholder="Example: #/shop">' +
      vColorRow('v-ann-bg', 'Banner background colour', c.announcementBg || '#1B1A34', 'Background colour for the offer bar.') +
      vColorRow('v-ann-color', 'Banner text colour', c.announcementColor || '#FFFFFF', 'Text colour for the offer bar.') +
      '<label for="v-ann-code">Offer / Coupon Code</label><input type="text" id="v-ann-code" value="' + esc(c.announcementPromoCode || 'WELCOME10') + '">' +
      '<div class="toggle-row"><div class="grow"><b>Show the top strip</b><br><span class="field-help" style="margin:0">Turn this off to hide the strip completely.</span></div>' +
      '<label class="switch"><input type="checkbox" id="v-ann-on"' + (c.announcementOn !== false ? ' checked' : '') + '><span class="track"></span></label></div>' +
      vSaveRow('SAVE');
    wire = function () {
      [['v-ann-bg-picker', 'v-ann-bg'], ['v-ann-color-picker', 'v-ann-color']].forEach(function (pair) {
        setColor(pair[0], pair[1], $(pair[1]).value);
        syncColor(pair[0], pair[1]);
      });
      $('vSave').addEventListener('click', function () {
        vSaveSettings({
          content: {
            announcementText: $('v-ann').value.trim(),
            announcementLink: $('v-ann-link').value.trim(),
            announcementBg: $('v-ann-bg').value.trim(),
            announcementColor: $('v-ann-color').value.trim(),
            announcementPromoCode: $('v-ann-code').value.trim(),
            announcementOn: $('v-ann-on').checked
          }
        }, 'Saved! The top offer banner is updated in your shop.');
      });
    };
  } else if (key === 'hero' || key === 'heroHeading') {
    html = vHead('The big photo and heading', 'This is the first thing every customer sees. The big words sit on top of the photo.') +
      '<label for="v-h1">Big heading, first line</label><input type="text" id="v-h1" value="' + esc(c.heroHeading1 || '') + '">' +
      '<label for="v-h2">Big heading, second line</label><input type="text" id="v-h2" value="' + esc(c.heroHeading2 || '') + '">' +
      imgPickHtml('v-hdesk', 'Big photo, for computers', c.heroDesktopImage || 'assets/hero-desktop.jpg', 'Pick from the list, or type the file name. The small picture shows the photo you picked.') +
      imgPickHtml('v-hmob', 'Big photo, for phones', c.heroMobileImage || 'assets/hero-mobile.jpg', 'Most customers visit on a phone, so this photo matters most.') +
      vSectionToggle('hero') + vSaveRow('SAVE');
    wire = function () {
      wireImgPick('v-hdesk'); wireImgPick('v-hmob');
      $('vSave').addEventListener('click', function () {
        vSaveSettings({
          content: {
            heroHeading1: $('v-h1').value.trim(), heroHeading2: $('v-h2').value.trim(),
            heroDesktopImage: $('v-hdesk-path').value.trim(), heroMobileImage: $('v-hmob-path').value.trim()
          },
          sections: { hero: $('v-sec').checked }
        }, 'Saved! Your homepage now starts with the new photo and heading.');
      });
    };
  } else if (key === 'festive' || key === 'bestsellers') {
    var isFest = key === 'festive';
    html = vHead(isFest ? 'Festive collection row' : 'Bestsellers row',
      isFest ? 'This row shows your newest pairs under its heading.' : 'This row shows the pairs your developer picked as your best sellers.') +
      '<label for="v-rowhead">Row heading</label><input type="text" id="v-rowhead" value="' + esc(isFest ? (c.festiveHeading || '') : (c.bestsellersHeading || '')) + '">' +
      '<p class="help">To change a pair in this row, tap its Edit button in the picture above, or use the Products page.</p>' +
      vSectionToggle(key) + vSaveRow('SAVE');
    wire = function () {
      $('vSave').addEventListener('click', function () {
        var content = {};
        content[isFest ? 'festiveHeading' : 'bestsellersHeading'] = $('v-rowhead').value.trim();
        var part = { content: content, sections: {} };
        part.sections[key] = $('v-sec').checked;
        vSaveSettings(part, 'Saved! The row heading is updated in your shop.');
      });
    };
  } else if (key === 'collections') {
    var collDefs = [['barely', 'The Barely Edit', 'Everyday \u00B7 2026', 'Soft, barely-there flats, slides and low heels for every ordinary day.', 'assets/p/bn-trace-1.jpg', 'assets/reels/muse.mp4'],
      ['gilded', 'Gilded', 'The way we wear \u00B7 2026', 'Covered with gold. Chain-detail flats and block heels that dress up anything.', 'assets/p/gd-poise-1.jpg', 'assets/reels/poise.mp4'],
      ['veil', 'Veil & Vow', 'Rooted in tradition \u00B7 2026', 'Brocade, velvet and heirloom gold for the days everyone remembers.', 'assets/p/v-08.jpg', 'assets/reels/first-look.mp4']];
    var savedColl = c.collectionsList || {};
    var fields = collDefs.map(function (g) {
      var o = savedColl[g[0]] || {};
      var v = function (f, dflt) { return o[f] || dflt; };
      return '<h3>' + esc(v('name', g[1])) + '</h3>'
        + '<label>Collection name</label><input type="text" id="v-coll-' + g[0] + '-name" value="' + esc(v('name', g[1])) + '">'
        + '<label>Small line under the name (tagline)</label><input type="text" id="v-coll-' + g[0] + '-tag" value="' + esc(v('tag', g[2])) + '">'
        + '<label>Description (shown on the shop page)</label><textarea id="v-coll-' + g[0] + '-blurb">' + esc(v('blurb', g[3])) + '</textarea>'
        + '<label>Box photo</label><input type="text" id="v-coll-' + g[0] + '-img" value="' + esc(v('img', g[4])) + '">'
        + '<label>Box video (optional, plays instead of the photo)</label><input type="text" id="v-coll-' + g[0] + '-video" value="' + esc(v('video', g[5])) + '">';
    }).join('');
    var groups = [['barely', 'The Barely Edit'], ['gilded', 'Gilded'], ['veil', 'Veil & Vow']].map(function (g) {
      var items = products.filter(function (p) { return p.coll === g[0]; }).map(function (p) {
        return '<div class="prod-row"><div class="grow"><div class="prod-name" style="font-size:16.5px">' + esc(p.name) + '</div>' +
          '<div class="prod-meta">' + inr(p.price) + '</div></div>' +
          '<button class="btn btn-light btn-small" data-vprod="' + esc(p.id) + '">Edit</button></div>';
      }).join('');
      return '<h4 style="margin:18px 0 6px">' + esc(g[1]) + ' — pairs</h4>' + (items || '<p class="help">No pairs in this collection yet.</p>');
    }).join('');
    html = vHead('Shop by collection', 'These three boxes take customers to each collection. Change the name, tagline, description, photo or video of each collection here. To change a pair, tap its Edit button in the list below.') +
      fields + '<h3 style="margin-top:26px">Pairs in each collection</h3>' + groups +
      vSectionToggle('collections') + vSaveRow('SAVE COLLECTIONS');
    wire = function () {
      box.querySelectorAll('[data-vprod]').forEach(function (b) {
        b.addEventListener('click', function () { openProductFromVisual(b.dataset.vprod); });
      });
      $('vSave').addEventListener('click', function () {
        var list = {};
        collDefs.forEach(function (g) {
          list[g[0]] = {
            name: $('v-coll-' + g[0] + '-name').value.trim(),
            tag: $('v-coll-' + g[0] + '-tag').value.trim(),
            blurb: $('v-coll-' + g[0] + '-blurb').value.trim(),
            img: $('v-coll-' + g[0] + '-img').value.trim(),
            video: $('v-coll-' + g[0] + '-video').value.trim()
          };
        });
        vSaveSettings({ content: { collectionsList: list }, sections: { collections: $('v-sec').checked } }, 'Saved! Your collections are updated in your shop.');
      });
    };
  } else if (key === 'craftBanner') {
    html = vHead('Craft video banner', 'This section plays your brand craft video next to your headline and "Shop all" button.') +
      '<label for="v-craft-h">Big headline</label><input type="text" id="v-craft-h" value="' + esc(c.craftHeading || 'Handcrafted. Comfort first.') + '">' +
      '<label for="v-craft-sub">Subheading</label><input type="text" id="v-craft-sub" value="' + esc(c.craftSubheading || 'From our hands, to your feet') + '">' +
      '<label for="v-craft-btn">Button label</label><input type="text" id="v-craft-btn" value="' + esc(c.craftBtnText || 'Shop all pairs') + '">' +
      '<label for="v-craft-link">Button link</label><input type="text" id="v-craft-link" value="' + esc(c.craftBtnLink || '#/shop') + '">' +
      '<label for="v-craft-vid">Craft video file</label><input type="text" id="v-craft-vid" value="' + esc(c.craftVideo || 'assets/banner2.mp4') + '">' +
      vSectionToggle('craftBanner') + vSaveRow('SAVE CRAFT BANNER');
    wire = function () {
      $('vSave').addEventListener('click', function () {
        vSaveSettings({
          content: {
            craftHeading: $('v-craft-h').value.trim(),
            craftSubheading: $('v-craft-sub').value.trim(),
            craftBtnText: $('v-craft-btn').value.trim(),
            craftBtnLink: $('v-craft-link').value.trim(),
            craftVideo: $('v-craft-vid').value.trim()
          },
          sections: { craftBanner: $('v-sec').checked }
        }, 'Saved! Craft video banner is updated in your shop.');
      });
    };
  } else if (key === 'reels') {
    var startReels = (c.reelsList && c.reelsList.length) ? c.reelsList : DEFAULT_REELS_ADMIN;
    html = vHead('Video reels', 'This section shows your "Moments in motion" vertical videos. Add a new video, remove one, change the order or edit the words here. Your shop updates when you save.') +
      '<label for="v-reels-h">Reels section heading</label><input type="text" id="v-reels-h" value="' + esc(c.reelsHeading || 'Moments in motion') + '">' +
      '<div id="vReelsList">' + startReels.map(reelRowHtml).join('') + '</div>' +
      '<p style="margin:14px 0 4px"><button type="button" class="btn btn-light" id="vReelAdd">+ Add a reel</button></p>' +
      vSectionToggle('reels') + vSaveRow('SAVE REELS');
    wire = function () {
      wireReelsPanel();
      $('vSave').addEventListener('click', function () {
        var list = Array.prototype.map.call(document.querySelectorAll('#vReelsList .reel-row'), function (row) {
          return {
            video: row.querySelector('.r-video').value.trim(),
            poster: row.querySelector('.r-poster').value.trim(),
            caption: row.querySelector('.r-caption').value.trim(),
            pid: row.querySelector('.r-pid').value
          };
        }).filter(function (r) { return r.video || r.poster; });
        vSaveSettings({
          content: { reelsHeading: $('v-reels-h').value.trim(), reelsList: list },
          sections: { reels: $('v-sec').checked }
        }, 'Saved! Your video reels are updated in your shop.');
      });
    };
  } else if (key === 'newsletter') {
    html = vHead('Newsletter & Discount Box', 'Customers enter their mobile number or email here to receive their 10% first-order discount code.') +
      '<label for="v-nl-h">Headline</label><input type="text" id="v-nl-h" value="' + esc(c.newsletterHeading || 'Get 10% off') + '">' +
      '<label for="v-nl-p">Description text</label><textarea id="v-nl-p">' + esc(c.newsletterText || 'New drops, restock alerts and early access to offers, straight to your inbox. 10% off your first order.') + '</textarea>' +
      '<label for="v-nl-place">Input box placeholder text</label><input type="text" id="v-nl-place" value="' + esc(c.newsletterPlaceholder || 'Your mobile number') + '">' +
      '<label for="v-nl-btn">Button text</label><input type="text" id="v-nl-btn" value="' + esc(c.newsletterButton || 'Subscribe') + '">' +
      '<label for="v-nl-code">Promo coupon code</label><input type="text" id="v-nl-code" value="' + esc(c.newsletterCode || 'WELCOME10') + '">' +
      vSectionToggle('newsletter') + vSaveRow('SAVE NEWSLETTER');
    wire = function () {
      $('vSave').addEventListener('click', function () {
        vSaveSettings({
          content: {
            newsletterHeading: $('v-nl-h').value.trim(),
            newsletterText: $('v-nl-p').value.trim(),
            newsletterPlaceholder: $('v-nl-place').value.trim(),
            newsletterButton: $('v-nl-btn').value.trim(),
            newsletterCode: $('v-nl-code').value.trim()
          },
          sections: { newsletter: $('v-sec').checked }
        }, 'Saved! Newsletter box is updated in your shop.');
      });
    };
  } else if (key === 'footer') {
    html = vHead('Footer and shop colours', 'The footer is the part at the very bottom of every page, with your contact details and links. Its words are part of the shop design. The colours below change the whole shop at once, just like the Shop Look page.') +
      vColorRow('v-d-bg', 'Background colour', d.backgroundColor, 'The main colour behind everything in the shop.') +
      vColorRow('v-d-ink', 'Text colour', d.primaryColor, 'The colour of headings and most writing.') +
      vColorRow('v-d-btn', 'Button colour', d.buttonColor, 'The round buttons customers tap.') +
      vColorRow('v-d-btnink', 'Button text colour', d.buttonTextColor, 'The writing on those buttons.') +
      '<label for="v-d-font">Writing style</label><select id="v-d-font">' +
      '<option value="classic">Classic, the current AUVÉ look</option><option value="modern">Modern clean</option>' +
      '<option value="serif">Old-style book letters</option><option value="simple">Simple</option></select>' +
      '<p class="field-help">Changes the letter style of headings and reading text across the shop.</p>' +
      '<label for="v-d-hsize">Section heading size (not needed)</label><input type="number" id="v-d-hsize" min="10" max="120" value="' + (d.headingSize == null ? '' : d.headingSize) + '" placeholder="Leave empty to keep the original">' +
      '<label for="v-d-bsize">Reading text size (not needed)</label><input type="number" id="v-d-bsize" min="10" max="40" value="' + (d.bodySize == null ? '' : d.bodySize) + '" placeholder="Leave empty to keep the original">' +
      vSaveRow('SAVE COLOURS');
    wire = function () {
      $('v-d-font').value = d.fontPreset || 'classic';
      [['v-d-bg-picker', 'v-d-bg'], ['v-d-ink-picker', 'v-d-ink'], ['v-d-btn-picker', 'v-d-btn'], ['v-d-btnink-picker', 'v-d-btnink']].forEach(function (pair) {
        setColor(pair[0], pair[1], $(pair[1]).value);
        syncColor(pair[0], pair[1]);
      });
      $('vSave').addEventListener('click', function () {
        vSaveSettings({
          design: {
            backgroundColor: $('v-d-bg').value.trim(), primaryColor: $('v-d-ink').value.trim(),
            buttonColor: $('v-d-btn').value.trim(), buttonTextColor: $('v-d-btnink').value.trim(),
            fontPreset: $('v-d-font').value,
            headingSize: $('v-d-hsize').value === '' ? null : Number($('v-d-hsize').value),
            bodySize: $('v-d-bsize').value === '' ? null : Number($('v-d-bsize').value)
          }
        }, 'Saved! Your shop now uses the new colours.');
      });
    };
  } else {
    return;
  }

  box.innerHTML = html;
  card.classList.remove('hidden');
  wire();
  $('vClose').addEventListener('click', function () { card.classList.add('hidden'); });
  card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ---------------- coupons ---------------- */
var coupons = [];

function loadCoupons() {
  api('GET', '/api/admin/coupons').then(function (d) {
    coupons = d.coupons || [];
    renderCouponList();
  }).catch(function (e) {
    showMsg($('couponMsg'), 'Could not load coupons: ' + e.message, false);
  });
}

function renderCouponList() {
  var el = $('couponList');
  if (!el) return;
  if (!coupons.length) {
    el.innerHTML = '<p class="help">No coupons created yet. Use the form above to create your first coupon (e.g. WELCOME10 for 10% off).</p>';
    return;
  }
  el.innerHTML = coupons.map(function (c) {
    var discText = (c.type === 'flat' ? ('₹' + c.value + ' OFF') : (c.value + '% OFF'));
    var minText = c.min ? ('Min order ₹' + c.min) : 'No minimum';
    var statusPill = c.active ? '<span class="pill paid">Active</span>' : '<span class="pill">Inactive</span>';
    return '<div class="prod-row" style="align-items:center">' +
      '<div style="font-size:22px; padding:0 8px">🎟️</div>' +
      '<div class="grow">' +
        '<div style="display:flex; align-items:center; gap:8px">' +
          '<b style="font-size:16px; letter-spacing:0.06em; color:#1B1A34">' + esc(c.code) + '</b> ' + statusPill +
        '</div>' +
        '<div class="prod-meta" style="margin-top:2px"><b>' + esc(discText) + '</b> · ' + esc(minText) + (c.desc ? ' · ' + esc(c.desc) : '') + '</div>' +
      '</div>' +
      '<button type="button" class="btn btn-light btn-small" data-cp-toggle="' + esc(c.code) + '">' + (c.active ? 'Deactivate' : 'Activate') + '</button>' +
      '<button type="button" class="btn btn-danger btn-small" data-cp-del="' + esc(c.code) + '">Delete</button>' +
    '</div>';
  }).join('');

  el.querySelectorAll('[data-cp-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var code = btn.dataset.cpToggle;
      var cp = coupons.find(function (x) { return x.code === code; });
      if (cp) {
        cp.active = !cp.active;
        api('POST', '/api/admin/coupons', cp).then(function (d) {
          coupons = d.coupons || coupons;
          renderCouponList();
          showMsg($('couponMsg'), 'Coupon "' + code + '" ' + (cp.active ? 'activated' : 'deactivated') + ' successfully!', true);
        }).catch(function (e) { showMsg($('couponMsg'), e.message, false); });
      }
    });
  });

  el.querySelectorAll('[data-cp-del]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var code = btn.dataset.cpDel;
      if (confirm('Delete coupon code "' + code + '"?')) {
        api('DELETE', '/api/admin/coupons/' + encodeURIComponent(code)).then(function (d) {
          coupons = d.coupons || [];
          renderCouponList();
          showMsg($('couponMsg'), 'Coupon "' + code + '" deleted.', true);
        }).catch(function (e) { showMsg($('couponMsg'), e.message, false); });
      }
    });
  });
}

function saveNewCoupon() {
  var code = ($('cp-code').value || '').trim().toUpperCase();
  var type = $('cp-type').value;
  var val = Number($('cp-value').value);
  var min = Number($('cp-min').value || 0);
  var desc = ($('cp-desc').value || '').trim();
  var active = $('cp-active').checked;

  if (!code) { showMsg($('couponMsg'), 'Please enter a coupon code.', false); return; }
  if (!val || val <= 0) { showMsg($('couponMsg'), 'Please enter a valid discount amount.', false); return; }

  showMsg($('couponMsg'), 'Saving coupon...', true);
  api('POST', '/api/admin/coupons', {
    code: code,
    type: type,
    value: val,
    min: min,
    desc: desc,
    active: active
  }).then(function (d) {
    coupons = d.coupons || [];
    renderCouponList();
    $('cp-code').value = '';
    $('cp-value').value = '';
    $('cp-min').value = '';
    $('cp-desc').value = '';
    showMsg($('couponMsg'), 'Coupon "' + code + '" saved and ready to use in shop!', true);
  }).catch(function (e) {
    showMsg($('couponMsg'), 'Failed to save coupon: ' + e.message, false);
  });
}

function loadTestingKeys() {
  var msg = $('rzMsg');
  showMsg(msg, 'Loading sandbox testing credentials...', true);
  api('POST', '/api/admin/integrations/load-test-keys').then(function (d) {
    var integ = d.integrations || {};
    $('rz-id').value = integ.razorpayKeyId || '';
    $('rz-secret').value = integ.razorpayKeySecret || '';
    $('sr-email').value = integ.shiprocketEmail || '';
    $('sr-pass').value = integ.shiprocketPassword || '';
    $('sr-pickup').value = integ.shiprocketPickup || 'Primary';
    showMsg(msg, '⚡ Testing API keys loaded! Checking connections...', true);
    loadIntegrations();
    doCheckRazorpay();
    doCheckShiprocket();
  }).catch(function (e) {
    showMsg(msg, 'Failed to load test keys: ' + e.message, false);
  });
}

/* ---------------- wire up ---------------- */
$('loginBtn').addEventListener('click', doLogin);
$('pw').addEventListener('keydown', function (e) { if (e.key === 'Enter') doLogin(); });
wireEye($('pwEye'), $('pw'));
wireEye($('fgEye'), $('fg-new'));
document.querySelectorAll('[data-eye]').forEach(function (b) { wireEye(b, $(b.dataset.eye)); });
$('forgotLink').addEventListener('click', function () { $('forgotBox').classList.toggle('hidden'); });
$('forgotBtn').addEventListener('click', doForgot);
$('changePwBtn').addEventListener('click', doChangePassword);
$('saveRecoveryBtn').addEventListener('click', doSaveRecovery);
$('saveRzBtn').addEventListener('click', doSaveRazorpay);
$('checkRzBtn').addEventListener('click', doCheckRazorpay);
$('clearRzBtn').addEventListener('click', function () { doClearIntegration('razorpay', 'rzMsg'); });
$('saveSrBtn').addEventListener('click', doSaveShiprocket);
$('checkSrBtn').addEventListener('click', doCheckShiprocket);
$('clearSrBtn').addEventListener('click', function () { doClearIntegration('shiprocket', 'srMsg'); });
$('logoutBtn').addEventListener('click', logout);
$('addProductBtn').addEventListener('click', function () { openEditor(null); });
$('addVariantBtn').addEventListener('click', function () { $('variants').appendChild(variantCard(null)); });
$('addDetailBtn').addEventListener('click', function () { $('details').appendChild(detailRow(null)); });
$('saveProductBtn').addEventListener('click', saveProduct);
$('cancelProductBtn').addEventListener('click', closeEditor);
$('saveLookBtn').addEventListener('click', saveLook);
$('saveWritingBtn').addEventListener('click', saveWriting);
$('saveSectionsBtn').addEventListener('click', saveSections);
$('refreshOrdersBtn').addEventListener('click', loadOrders);
if ($('saveCouponBtn')) $('saveCouponBtn').addEventListener('click', saveNewCoupon);
if ($('loadTestKeysBtn')) $('loadTestKeysBtn').addEventListener('click', loadTestingKeys);
[['d-bg-picker', 'd-bg'], ['d-ink-picker', 'd-ink'], ['d-btn-picker', 'd-btn'], ['d-btnink-picker', 'd-btnink'], ['c-ann-bg-picker', 'c-ann-bg'], ['c-ann-color-picker', 'c-ann-color']].forEach(function (pair) { if ($(pair[0]) && $(pair[1])) syncColor(pair[0], pair[1]); });

/* Setup Photo & Video Controls */
setupMediaField('f-cover', 'prev-cover', 'empty-cover', 'up-cover', 'lib-cover', 'del-cover', 'name-cover');
setupMediaField('f-cover2', 'prev-cover2', 'empty-cover2', 'up-cover2', 'lib-cover2', 'del-cover2', 'name-cover2');
setupMediaField('c-hdesk', 'prev-hdesk', 'empty-hdesk', 'up-hdesk', 'lib-hdesk', null, 'name-hdesk');
setupMediaField('c-hmob', 'prev-hmob', 'empty-hmob', 'up-hmob', 'lib-hmob', null, 'name-hmob');
setupMediaField('c-craft-vid', null, null, 'up-craftvid', 'lib-craftvid', null, 'name-craftvid');
$('closeMediaModal').addEventListener('click', closeMediaLibrary);
$('cancelMediaModal').addEventListener('click', closeMediaLibrary);

if (token) startApp();

/* ---------------- dashboard ---------------- */
function inrShort(n) {
  n = Math.round(Number(n) || 0);
  if (n >= 100000) return '₹' + (Math.round(n / 1000) / 10) + 'L';
  if (n >= 1000) return '₹' + (Math.round(n / 100) / 10) + 'k';
  return '₹' + n;
}
var dashOrdersCache = [];
var dashRangeDays = 14;

function renderDashChart() {
  var days = [], byDay = {}, cnt = {}, i, d;
  for (i = dashRangeDays - 1; i >= 0; i--) { d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i); days.push(d); byDay[d.toDateString()] = 0; cnt[d.toDateString()] = 0; }
  dashOrdersCache.forEach(function (o) { if (!o.at) return; var k = new Date(o.at).toDateString(); if (k in byDay) { byDay[k] += Number((o.totals && o.totals.total) || 0); cnt[k]++; } });
  var max = 0, sum = 0, n = 0;
  days.forEach(function (dd) { var v = byDay[dd.toDateString()]; max = Math.max(max, v); sum += v; n += cnt[dd.toDateString()]; });
  $('dashChart').innerHTML = '<div class="chart">' + days.map(function (dd, idx) {
    var v = byDay[dd.toDateString()]; var hgt = max > 0 ? Math.max(2, Math.round(v / max * 100)) : 2;
    return '<div class="bar-col"><div class="bar-val">' + (v ? inrShort(v) : '') + '</div><div class="bar' + (idx === days.length - 1 ? ' today' : '') + '" style="height:' + hgt + '%"></div><div class="bar-day">' + dd.getDate() + ' ' + dd.toLocaleDateString('en-IN', { month: 'short' }) + '</div><div class="bar-orders">' + (cnt[dd.toDateString()] ? cnt[dd.toDateString()] + ' order' + (cnt[dd.toDateString()] > 1 ? 's' : '') : '') + '</div></div>';
  }).join('') + '</div>' + (max === 0 ? '<p class="dash-empty">No sales in this period yet.</p>' : '');
  $('dashLegend').innerHTML = '<span>Total <b>' + inr(sum) + '</b></span><span>Orders <b>' + n + '</b></span><span>Average per day <b>' + inr(Math.round(sum / dashRangeDays)) + '</b></span>';
  var rb = $('dashRange');
  if (rb) Array.prototype.forEach.call(rb.querySelectorAll('button'), function (b) {
    b.classList.toggle('on', Number(b.getAttribute('data-days')) === dashRangeDays);
    b.onclick = function () { dashRangeDays = Number(b.getAttribute('data-days')); renderDashChart(); };
  });
}

function loadDashboard() {
  Promise.all([
    api('GET', '/api/admin/orders').catch(function () { return { orders: [] }; }),
    api('GET', '/api/admin/products').catch(function () { return { products: products || [] }; })
  ]).then(function (res) {
    var orders = (res[0] && res[0].orders) || [];
    var prods = (res[1] && res[1].products) || [];
    products = prods;
    dashOrdersCache = orders;
    var income = 0, todayCount = 0, todayStr = new Date().toDateString(), codDue = 0, codCount = 0, testCount = 0, testMoney = 0;
    orders.forEach(function (o) {
      var tot = Number((o.totals && o.totals.total) || 0);
      income += tot;
      if (o.at && new Date(o.at).toDateString() === todayStr) todayCount++;
      if (o.paymentStatus === 'cod_pending' || (!o.paymentStatus && o.payment && o.payment.status === 'cod')) { codDue += tot; codCount++; }
      if (o.isTest) { testCount++; testMoney += tot; }
    });
    var stats = [
      { num: inr(income), label: 'Total revenue', gold: true },
      { num: orders.length, label: 'Total orders' },
      { num: todayCount, label: 'Orders today' },
      { num: inr(codDue), label: 'COD to collect (' + codCount + ' order' + (codCount === 1 ? '' : 's') + ')' }
    ];
    $('dashStats').innerHTML = stats.map(function (s) {
      return '<div class="stat-card' + (s.gold ? ' gold' : '') + '"><div class="stat-num">' + s.num + '</div><div class="stat-label">' + s.label + '</div></div>';
    }).join('');
    $('dashNote').textContent = testCount ? 'Includes ' + testCount + ' test order' + (testCount === 1 ? '' : 's') + ' (' + inr(testMoney) + '). Once live payment keys are added, only real sales will count here.' : '';
    renderDashChart();
    var toShip = orders.filter(function (o) { return o.orderStatus === 'confirmed' && o.shipmentStatus === 'not_created'; }).length;
    var toPay = orders.filter(function (o) { return o.orderStatus === 'pending_payment'; }).length;
    var attn = '';
    if (toShip) attn += '<div class="attn">' + toShip + ' order' + (toShip === 1 ? '' : 's') + ' confirmed but the shipment is not created yet. Open the Orders tab to create the AWB.</div>';
    if (toPay) attn += '<div class="attn red">' + toPay + ' order' + (toPay === 1 ? '' : 's') + ' waiting for payment.</div>';
    $('dashAttention').innerHTML = attn;
    $('dashRecent').innerHTML = orders.length ? orders.slice(0, 6).map(function (o) {
      var pill = o.paymentStatus === 'paid' ? '<span class="pill paid">Paid online</span>'
        : o.paymentStatus === 'cod_pending' ? '<span class="pill cod">Cash on delivery</span>'
        : o.isTest ? '<span class="pill test">TEST</span>' : '<span class="pill">Pending</span>';
      var count = (o.totals && o.totals.pairs) || (o.items ? o.items.length : 0);
      return '<div class="dash-row"><div class="grow"><b>' + esc(o.id || '') + '</b><div class="prod-meta">' + (o.at ? new Date(o.at).toLocaleString('en-IN') : '') + ' \u00B7 ' + count + ' item(s)</div></div>' + pill + '<b>' + inr((o.totals && o.totals.total) || 0) + '</b></div>';
    }).join('') : '<p class="dash-empty">No orders yet.</p>';
    var byStatus = {};
    orders.forEach(function (o) {
      var s = o.shipmentStatus === 'booked' || o.shipmentStatus === 'shipped' ? 'shipped' : (o.orderStatus || 'confirmed');
      byStatus[s] = (byStatus[s] || 0) + 1;
    });
    var sKeys = Object.keys(byStatus).sort(function (a, b) { return byStatus[b] - byStatus[a]; });
    var sMax = sKeys.length ? byStatus[sKeys[0]] : 0;
    $('dashStatus').innerHTML = sKeys.length ? sKeys.map(function (k) {
      return '<div class="hbar-row"><div class="hbar-label">' + esc(k.replace(/_/g, ' ')) + '</div><div class="hbar-track"><div class="hbar-fill" style="width:' + Math.round(byStatus[k] / sMax * 100) + '%"></div></div><div class="hbar-num">' + byStatus[k] + '</div></div>';
    }).join('') : '<p class="dash-empty">No orders yet.</p>';
    var codN = 0, codR = 0, onN = 0, onR = 0, teN = 0, teR = 0;
    orders.forEach(function (o) {
      var tot = Number((o.totals && o.totals.total) || 0);
      if (o.isTest) { teN++; teR += tot; }
      else if (o.paymentStatus === 'paid') { onN++; onR += tot; }
      else { codN++; codR += tot; }
    });
    var totAll = codR + onR + teR;
    if (totAll > 0) {
      $('dashPaySplit').innerHTML = '<div class="split-bar">'
        + (codR ? '<div class="seg-cod" style="width:' + (codR / totAll * 100) + '%"></div>' : '')
        + (onR ? '<div class="seg-online" style="width:' + (onR / totAll * 100) + '%"></div>' : '')
        + (teR ? '<div class="seg-test" style="width:' + (teR / totAll * 100) + '%"></div>' : '')
        + '</div><div class="split-legend">'
        + '<span><span class="dot" style="background:var(--au-gold)"></span>COD \u00B7 ' + codN + ' \u00B7 ' + inr(codR) + '</span>'
        + '<span><span class="dot" style="background:var(--au-navy)"></span>Online paid \u00B7 ' + onN + ' \u00B7 ' + inr(onR) + '</span>'
        + (teN ? '<span><span class="dot" style="background:#CFC9BB"></span>Test \u00B7 ' + teN + ' \u00B7 ' + inr(teR) + '</span>' : '')
        + '</div>';
    } else {
      $('dashPaySplit').innerHTML = '<p class="dash-empty">No payments yet.</p>';
    }
    var byName = {};
    orders.forEach(function (o) { (o.items || []).forEach(function (it) { var n = it.name || it.id || 'Product'; byName[n] = (byName[n] || 0) + (Number(it.qty) || 1); }); });
    var top = Object.keys(byName).map(function (n) { return { name: n, qty: byName[n] }; }).sort(function (a, b) { return b.qty - a.qty; }).slice(0, 5);
    $('dashTopCard').style.display = top.length ? '' : 'none';
    $('dashTop').innerHTML = top.map(function (t, i) { return '<div class="dash-row"><div class="grow"><b>' + (i + 1) + '. ' + esc(t.name) + '</b></div><span class="pill">' + t.qty + ' sold</span></div>'; }).join('');
  }).catch(function (e) { showMsg($('dashMsg'), e.message, false); });
}

/* ---------------- custom pages ---------------- */
function slugifyPage(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
function pageRowHtml(p) {
  p = p || {};
  return '<div class="page-row">'
    + '<div class="reel-head"><b class="pg-title">Page</b><span><button type="button" class="btn btn-light btn-sm pg-del">Remove</button></span></div>'
    + '<label>Page title</label><input type="text" class="pg-name" value="' + esc(p.title || '') + '" placeholder="Size guide">'
    + '<label>Link name (slug). The page opens at #/page/this-name</label><input type="text" class="pg-slug" value="' + esc(p.slug || '') + '" placeholder="size-guide">'
    + '<label>Menu label (shown in the top menu)</label><input type="text" class="pg-menu" value="' + esc(p.menuLabel || '') + '" placeholder="Size guide">'
    + '<div class="toggle-row"><div class="grow"><b>Show in top menu</b></div><label class="switch"><input type="checkbox" class="pg-show"' + (p.showInMenu ? ' checked' : '') + '><span class="track"></span></label></div>'
    + '<label>Page text (blank line = new paragraph)</label><textarea class="pg-body" placeholder="Write your page here...">' + esc(p.body || '') + '</textarea>'
    + '</div>';
}
function renumberPageRows() {
  Array.prototype.forEach.call(document.querySelectorAll('#pagesList .page-row'), function (row, i) {
    row.querySelector('.pg-title').textContent = 'Page ' + (i + 1);
  });
}
function renderPagesEditor() {
  var list = (settings.content && settings.content.pagesList) || [];
  $('pagesList').innerHTML = list.length ? list.map(pageRowHtml).join('') : '<p class="help">No pages yet. Tap "+ Add a page" to create your first one.</p>';
  renumberPageRows();
  var add = $('pageAdd'), save = $('pageSave');
  if (add && !add.dataset.wired) {
    add.dataset.wired = '1';
    add.addEventListener('click', function () {
      if ($('pagesList').querySelector('.help')) $('pagesList').innerHTML = '';
      var div = document.createElement('div');
      div.innerHTML = pageRowHtml({});
      $('pagesList').appendChild(div.firstChild);
      renumberPageRows();
    });
    $('pagesList').addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (btn && btn.classList.contains('pg-del')) { btn.closest('.page-row').remove(); renumberPageRows(); }
    });
  }
  if (save && !save.dataset.wired) {
    save.dataset.wired = '1';
    save.addEventListener('click', savePages);
  }
}
function savePages() {
  var list = Array.prototype.map.call(document.querySelectorAll('#pagesList .page-row'), function (row) {
    var title = row.querySelector('.pg-name').value.trim();
    var slug = slugifyPage(row.querySelector('.pg-slug').value.trim() || title);
    return {
      title: title,
      slug: slug,
      menuLabel: row.querySelector('.pg-menu').value.trim(),
      showInMenu: row.querySelector('.pg-show').checked,
      body: row.querySelector('.pg-body').value.trim()
    };
  }).filter(function (p) { return p.slug && (p.title || p.body); });
  api('PUT', '/api/admin/settings', { settings: { content: { pagesList: list } } }).then(function (d) {
    settings = d.settings || settings;
    renderPagesEditor();
    showMsg($('pagesMsg'), 'Saved! ' + list.length + ' page' + (list.length === 1 ? '' : 's') + ' live in your shop. Links look like #/page/' + (list.length ? list[0].slug : 'your-page') + '.', true);
  }).catch(function (e) { showMsg($('pagesMsg'), e.message, false); });
}

/* ---------------- settings: store email + legal + form messages ---------------- */
function fillStoreSettings() {
  api('GET', '/api/admin/settings').then(function (d) {
    settings = d.settings || settings;
    var c = settings.content || {};
    if ($('set-notify')) $('set-notify').value = c.notifyEmail || '';
    if ($('set-contact')) $('set-contact').value = c.contactEmail || '';
    if ($('set-wa')) $('set-wa').value = c.whatsappNumber || '';
    if ($('set-bizname')) $('set-bizname').value = c.bizName || '';
    if ($('set-bizaddr')) $('set-bizaddr').value = c.bizAddress || '';
    if ($('set-bizgst')) $('set-bizgst').value = c.bizGst || '';
    if ($('set-bizgrievance')) $('set-bizgrievance').value = c.bizGrievance || '';
    if ($('set-bizphone')) $('set-bizphone').value = c.bizPhone || '';
    if ($('set-bizemail')) $('set-bizemail').value = c.bizEmail || '';
  }).catch(function () {});
}
function saveStoreSettings() {
  var content = { notifyEmail: $('set-notify').value.trim(), contactEmail: $('set-contact').value.trim(), whatsappNumber: $('set-wa').value.trim() };
  api('PUT', '/api/admin/settings', { settings: { content: content } }).then(function (d) {
    settings = d.settings || settings;
    showMsg($('storeMsg'), 'Saved! Form messages will now be emailed to ' + (content.notifyEmail || content.contactEmail || 'contact@auve.in') + '.', true);
  }).catch(function (e) { showMsg($('storeMsg'), e.message, false); });
}
function saveLegalSettings() {
  var content = { bizName: $('set-bizname').value.trim(), bizAddress: $('set-bizaddr').value.trim(), bizGst: $('set-bizgst').value.trim(), bizGrievance: $('set-bizgrievance').value.trim(), bizPhone: $('set-bizphone').value.trim(), bizEmail: $('set-bizemail').value.trim() };
  api('PUT', '/api/admin/settings', { settings: { content: content } }).then(function (d) {
    settings = d.settings || settings;
    showMsg($('legalMsg'), 'Saved! Your legal pages now show these details.', true);
  }).catch(function (e) { showMsg($('legalMsg'), e.message, false); });
}
function loadFormMessages() {
  api('GET', '/api/admin/forms').then(function (d) {
    var forms = d.forms || [];
    if (!forms.length) { $('formList').innerHTML = '<p class="dash-empty">No form messages yet. Newsletter signups, help form messages and bulk enquiries will appear here.</p>'; return; }
    var titles = { newsletter: 'Newsletter signup', contact: 'Help / Contact message', bulk: 'Bulk enquiry' };
    $('formList').innerHTML = forms.map(function (f) {
      var rows = Object.keys(f.fields || {}).map(function (k) { return '<tr><td>' + esc(k) + '</td><td>' + esc(String(f.fields[k])) + '</td></tr>'; }).join('');
      return '<div class="form-item"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap"><b>' + (titles[f.type] || 'Form') + '</b><span class="prod-meta">' + (f.at ? new Date(f.at).toLocaleString('en-IN') : '') + '</span></div>'
        + '<table>' + rows + '</table>'
        + '<div class="prod-meta" style="margin-top:6px">' + (f.emailed ? 'Emailed to ' + esc(f.sentTo || '') : 'Saved here (email could not be sent)') + '</div></div>';
    }).join('');
  }).catch(function (e) { $('formList').innerHTML = '<p class="dash-empty">' + esc(e.message) + '</p>'; });
}
if ($('saveStoreBtn')) $('saveStoreBtn').addEventListener('click', saveStoreSettings);
if ($('saveLegalBtn')) $('saveLegalBtn').addEventListener('click', saveLegalSettings);
if ($('refreshFormsBtn')) $('refreshFormsBtn').addEventListener('click', loadFormMessages);
