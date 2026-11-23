<?php
/**
 * AUVÉ Dynamic Footwear Store — Universal REST API
 * Handles Storefront APIs & Admin Panel management.
 */

require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('X-Content-Type-Options: nosniff');

// Determine route
$route = $_GET['route'] ?? '';
if (!$route) {
    $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    // Strip script path or auve prefix
    if (preg_match('#(?:/auve)?/api/(.+)$#', $uri, $m)) {
        $route = $m[1];
    } elseif (preg_match('#api\.php/(.+)$#', $uri, $m)) {
        $route = $m[1];
    }
}
$route = trim($route, '/');
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

// Helper functions
function sendJson(int $code, $data): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function getJsonBody(): array {
    $raw = file_get_contents('php://input');
    if (!$raw) return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

// Token session storage in data/tokens.json
function getActiveTokens(): array {
    $file = __DIR__ . '/data/tokens.json';
    if (file_exists($file)) {
        $arr = json_decode(file_get_contents($file), true);
        if (is_array($arr)) return $arr;
    }
    return [];
}

function saveToken(string $token): void {
    $file = __DIR__ . '/data/tokens.json';
    $tokens = getActiveTokens();
    $tokens[$token] = time() + (30 * 86400); // 30 days valid
    // Purge expired
    $now = time();
    $tokens = array_filter($tokens, fn($exp) => $exp > $now);
    @file_put_contents($file, json_encode($tokens));
}

function checkAdminAuth(): bool {
    $token = $_SERVER['HTTP_X_ADMIN_TOKEN'] ?? $_GET['admin_token'] ?? '';
    if (!$token) return false;
    $tokens = getActiveTokens();
    if (isset($tokens[$token]) && $tokens[$token] > time()) {
        return true;
    }
    return false;
}

function requireAdmin(): void {
    if (!checkAdminAuth()) {
        sendJson(401, ['ok' => false, 'error' => 'Admin session expired or invalid. Please log in again.']);
    }
}

// -------------------------------------------------------------
// PUBLIC STOREFRONT ENDPOINTS
// -------------------------------------------------------------

// GET api/system-status
if ($route === 'system-status' && $method === 'GET') {
    $dbActive = AuveStorage::isDatabaseActive();
    $prodCount = count(AuveStorage::getProducts());
    $tablesInfo = [];
    if ($dbActive && ($pdo = AuveStorage::getPdo())) {
        try {
            $tables = ['auve_products', 'auve_orders', 'auve_settings', 'auve_admins'];
            foreach ($tables as $t) {
                $st = $pdo->query("SHOW TABLES LIKE '$t'");
                if ($st->rowCount() > 0) {
                    $cnt = $pdo->query("SELECT COUNT(*) FROM `$t`")->fetchColumn();
                    $tablesInfo[$t] = intval($cnt);
                } else {
                    $tablesInfo[$t] = 'NOT_FOUND';
                }
            }
        } catch (Throwable $e) {
            $tablesInfo['error'] = $e->getMessage();
        }
    }
    sendJson(200, [
        'ok' => true,
        'database' => $dbActive ? 'MySQL connected (snweba2e_auve)' : 'JSON fallback active',
        'database_active' => $dbActive,
        'tables_in_mysql' => $tablesInfo,
        'products_count' => $prodCount
    ]);
}

// GET api/store-config
if ($route === 'store-config' && $method === 'GET') {
    $auth = AuveStorage::getAuth();
    $integ = $auth['integrations'] ?? [];
    $hasRz = !empty($integ['razorpayKeyId']) && !empty($integ['razorpayKeySecret']);
    sendJson(200, [
        'paymentsLive' => $hasRz,
        'mode' => $hasRz ? 'live' : 'test',
        'razorpayKeyId' => $hasRz ? $integ['razorpayKeyId'] : ''
    ]);
}

// GET api/products
if ($route === 'products' && $method === 'GET') {
    sendJson(200, AuveStorage::getProducts());
}

// GET api/settings
if ($route === 'settings' && $method === 'GET') {
    sendJson(200, AuveStorage::getSettings());
}

// POST api/orders
if ($route === 'orders' && $method === 'POST') {
    $body = getJsonBody();
    $products = AuveStorage::getProducts();
    $byId = [];
    foreach ($products as $p) $byId[$p['id']] = $p;

    $c = $body['customer'] ?? [];
    $name = trim($c['name'] ?? '');
    $phone = preg_replace('/\D/', '', $c['phone'] ?? '');
    if (strlen($phone) > 10) $phone = substr($phone, -10);
    $email = trim($c['email'] ?? '');
    $address = trim($c['address'] ?? '');
    $city = trim($c['city'] ?? '');
    $state = trim($c['state'] ?? '');
    $pincode = trim($c['pincode'] ?? '');

    $missing = [];
    if (!$name) $missing[] = 'name';
    if (strlen($phone) !== 10) $missing[] = '10-digit mobile';
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $missing[] = 'email';
    if (!$address) $missing[] = 'address';
    if (!$city) $missing[] = 'city';
    if (!preg_match('/^\d{6}$/', $pincode)) $missing[] = '6-digit pincode';
    if (!empty($missing)) {
        sendJson(400, ['ok' => false, 'error' => 'Please add your ' . implode(', ', $missing) . '.']);
    }

    $rawItems = is_array($body['items'] ?? null) ? $body['items'] : [];
    if (empty($rawItems)) {
        sendJson(400, ['ok' => false, 'error' => 'Your bag is empty.']);
    }

    $items = [];
    $pairs = 0;
    $sizes = [35, 36, 37, 38, 39, 40, 41];

    foreach ($rawItems as $it) {
        $pId = $it['productId'] ?? '';
        if (!isset($byId[$pId])) {
            sendJson(400, ['ok' => false, 'error' => 'A product in your bag is no longer available.']);
        }
        $prod = $byId[$pId];
        $varName = $it['variant'] ?? '';
        $variant = $prod['variants'][0] ?? ['name' => 'Default'];
        foreach (($prod['variants'] ?? []) as $v) {
            if ($v['name'] === $varName) { $variant = $v; break; }
        }

        $size = intval($it['size'] ?? 0);
        if (!in_array($size, $sizes)) {
            sendJson(400, ['ok' => false, 'error' => 'Invalid size for ' . $prod['name']]);
        }

        $qty = max(1, min(5, intval($it['qty'] ?? 1)));
        $pairs += $qty;
        $items[] = [
            'productId' => $prod['id'],
            'name' => $prod['name'],
            'variant' => $variant['name'],
            'size' => $size,
            'qty' => $qty,
            'unitPrice' => $prod['price']
        ];
    }

    if ($pairs > 5) {
        sendJson(400, ['ok' => false, 'error' => 'You can order up to 5 pairs per order.']);
    }

    $subtotal = 0;
    foreach ($items as $it) $subtotal += $it['unitPrice'] * $it['qty'];

    $promoCode = strtoupper(trim($body['promoCode'] ?? ''));
    $promo = ($promoCode === 'WELCOME10') ? round($subtotal * 0.10) : 0;
    $shipping = 0;
    $total = $subtotal - $promo + $shipping;

    $methodChosen = in_array($body['payment']['method'] ?? '', ['upi', 'card', 'cod']) ? $body['payment']['method'] : 'cod';

    // Generate Order ID
    $orders = AuveStorage::getOrders();
    $maxNum = 10000;
    foreach ($orders as $o) {
        if (preg_match('/^AUV(\d+)$/', $o['id'] ?? '', $m)) {
            $maxNum = max($maxNum, intval($m[1]));
        }
    }
    $orderId = 'AUV' . ($maxNum + 1);

    $order = [
        'id' => $orderId,
        'at' => time() * 1000,
        'placedAt' => date('c'),
        'customer' => [
            'name' => $name,
            'phone' => '+91' . $phone,
            'email' => $email,
            'address' => $address,
            'city' => $city,
            'state' => $state,
            'pincode' => $pincode
        ],
        'items' => $items,
        'promoCode' => $promo ? $promoCode : null,
        'totals' => [
            'pairs' => $pairs,
            'subtotal' => $subtotal,
            'promo' => $promo,
            'shipping' => $shipping,
            'total' => $total
        ],
        'shipping' => $body['shipping'] ?? 'standard',
        'payment' => ['method' => $methodChosen, 'status' => 'cod'],
        'shipment' => null
    ];

    $auth = AuveStorage::getAuth();
    $integ = $auth['integrations'] ?? [];
    $hasRz = !empty($integ['razorpayKeyId']) && !empty($integ['razorpayKeySecret']);

    if ($methodChosen === 'cod') {
        $order['payment'] = ['method' => 'cod', 'status' => 'cod'];
    } elseif ($hasRz) {
        // Create order via Razorpay API
        $ch = curl_init('https://api.razorpay.com/v1/orders');
        curl_setopt($ch, CURLOPT_USERPWD, $integ['razorpayKeyId'] . ':' . $integ['razorpayKeySecret']);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
            'amount' => $total * 100, // paise
            'currency' => 'INR',
            'receipt' => $orderId,
            'payment_capture' => 1
        ]));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        $rzRes = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        $rzData = json_decode($rzRes, true);
        if ($httpCode === 200 && !empty($rzData['id'])) {
            $order['payment'] = [
                'method' => $methodChosen,
                'status' => 'payment_pending',
                'razorpayOrderId' => $rzData['id']
            ];
            $razorpayInfo = [
                'keyId' => $integ['razorpayKeyId'],
                'orderId' => $rzData['id'],
                'amount' => $total * 100,
                'currency' => 'INR'
            ];
        } else {
            sendJson(502, ['ok' => false, 'error' => 'Payment could not be started. Please try again or choose cash on delivery.']);
        }
    } else {
        $order['payment'] = [
            'method' => $methodChosen,
            'status' => 'test_mode',
            'note' => 'TEST MODE - Razorpay keys not configured; treated as cash on delivery.'
        ];
    }

    AuveStorage::saveOrder($order);

    sendJson(200, [
        'ok' => true,
        'order' => [
            'id' => $order['id'],
            'totals' => $order['totals'],
            'customer' => $order['customer'],
            'payment' => $order['payment']
        ],
        'razorpay' => $razorpayInfo ?? null
    ]);
}

// POST api/orders/confirm-payment
if ($route === 'orders/confirm-payment' && $method === 'POST') {
    $body = getJsonBody();
    $orderId = $body['orderId'] ?? '';
    $rzPayId = $body['razorpay_payment_id'] ?? '';
    $rzOrderId = $body['razorpay_order_id'] ?? '';

    $orders = AuveStorage::getOrders();
    $found = null;
    foreach ($orders as &$o) {
        if ($o['id'] === $orderId) {
            $o['payment']['status'] = 'paid';
            $o['payment']['razorpayPaymentId'] = $rzPayId;
            $o['payment']['paidAt'] = date('c');
            $found = $o;
            break;
        }
    }
    if (!$found) {
        sendJson(404, ['ok' => false, 'error' => 'Order not found']);
    }
    AuveStorage::saveOrder($found);
    sendJson(200, ['ok' => true, 'order' => ['id' => $found['id'], 'payment' => $found['payment']]]);
}

// -------------------------------------------------------------
// ADMIN AUTHENTICATION
// -------------------------------------------------------------

// POST api/admin/login
if ($route === 'admin/login' && $method === 'POST') {
    $body = getJsonBody();
    $pw = (string)($body['password'] ?? '');

    $auth = AuveStorage::getAuth();
    $valid = false;

    if (!empty($auth['password']) && is_array($auth['password'])) {
        $salt = $auth['password']['salt'] ?? '';
        $hash = $auth['password']['hash'] ?? '';
        $calc = hash_pbkdf2('sha256', $pw, $salt, 10000, 64);
        $valid = hash_equals($hash, $calc);
    } else {
        // Fallback default password
        $valid = ($pw === AUVE_DEFAULT_ADMIN_PASS);
    }

    if ($valid) {
        $token = bin2hex(random_bytes(24));
        saveToken($token);
        sendJson(200, ['ok' => true, 'token' => $token]);
    }
    sendJson(401, ['ok' => false, 'error' => 'Wrong password.']);
}

// POST api/admin/forgot-password
if ($route === 'admin/forgot-password' && $method === 'POST') {
    $body = getJsonBody();
    $auth = AuveStorage::getAuth();
    if (empty($auth['recovery'])) {
        sendJson(400, ['ok' => false, 'error' => 'No recovery code has been set yet.']);
    }
    $recCode = trim((string)($body['recoveryCode'] ?? ''));
    $newPw = (string)($body['newPassword'] ?? '');
    if (strlen($newPw) < 6) {
        sendJson(400, ['ok' => false, 'error' => 'Please choose a new password of at least 6 characters.']);
    }

    $recSalt = $auth['recovery']['salt'] ?? '';
    $recHash = $auth['recovery']['hash'] ?? '';
    $calc = hash_pbkdf2('sha256', $recCode, $recSalt, 10000, 64);
    if (!hash_equals($recHash, $calc)) {
        sendJson(401, ['ok' => false, 'error' => 'That recovery code is not right. Please check it and try again.']);
    }

    $salt = bin2hex(random_bytes(16));
    $hash = hash_pbkdf2('sha256', $newPw, $salt, 10000, 64);
    $auth['password'] = ['salt' => $salt, 'hash' => $hash];
    AuveStorage::saveAuth($auth);

    $token = bin2hex(random_bytes(24));
    saveToken($token);
    sendJson(200, ['ok' => true, 'token' => $token]);
}

// -------------------------------------------------------------
// PROTECTED ADMIN ENDPOINTS
// -------------------------------------------------------------
if (str_starts_with($route, 'admin/')) {
    requireAdmin();

    // GET api/admin/products
    if ($route === 'admin/products' && $method === 'GET') {
        sendJson(200, ['ok' => true, 'products' => AuveStorage::getProducts()]);
    }

    // POST api/admin/products
    if ($route === 'admin/products' && $method === 'POST') {
        $body = getJsonBody();
        $p = $body['product'] ?? null;
        if (!$p || empty($p['id']) || empty($p['name'])) {
            sendJson(400, ['ok' => false, 'error' => 'Product ID and Name are required.']);
        }
        $p['id'] = strtolower(preg_replace('/[^a-z0-9-]/', '-', trim($p['id'])));
        $products = AuveStorage::getProducts();
        foreach ($products as $ex) {
            if ($ex['id'] === $p['id']) {
                sendJson(400, ['ok' => false, 'error' => 'A product with this id already exists.']);
            }
        }
        AuveStorage::saveProduct($p);
        sendJson(200, ['ok' => true, 'product' => $p]);
    }

    // PUT api/admin/products/{id}
    if (preg_match('#^admin/products/([^/]+)$#', $route, $m) && $method === 'PUT') {
        $targetId = urldecode($m[1]);
        $body = getJsonBody();
        $p = $body['product'] ?? null;
        if (!$p) sendJson(400, ['ok' => false, 'error' => 'Missing product payload']);
        $p['id'] = $targetId;
        AuveStorage::saveProduct($p, $targetId);
        sendJson(200, ['ok' => true, 'product' => $p]);
    }

    // DELETE api/admin/products/{id}
    if (preg_match('#^admin/products/([^/]+)$#', $route, $m) && $method === 'DELETE') {
        $targetId = urldecode($m[1]);
        AuveStorage::deleteProduct($targetId);
        sendJson(200, ['ok' => true]);
    }

    // GET api/admin/settings
    if ($route === 'admin/settings' && $method === 'GET') {
        sendJson(200, ['ok' => true, 'settings' => AuveStorage::getSettings()]);
    }

    // PUT api/admin/settings
    if ($route === 'admin/settings' && $method === 'PUT') {
        $body = getJsonBody();
        $newSettings = $body['settings'] ?? [];
        $saved = AuveStorage::saveSettings($newSettings);
        sendJson(200, ['ok' => true, 'settings' => $saved]);
    }

    // GET api/admin/orders
    if ($route === 'admin/orders' && $method === 'GET') {
        sendJson(200, ['ok' => true, 'orders' => AuveStorage::getOrders()]);
    }

    // GET api/admin/assets
    if ($route === 'admin/assets' && $method === 'GET') {
        $dir = __DIR__ . '/assets/p';
        $images = [];
        if (is_dir($dir)) {
            $files = scandir($dir);
            foreach ($files as $f) {
                if (preg_match('/\.(jpg|jpeg|png|webp)$/i', $f)) {
                    $images[] = 'assets/p/' . $f;
                }
            }
        }
        sendJson(200, ['ok' => true, 'images' => $images]);
    }

    // POST api/admin/upload (Single or Multiple Photos & Videos)
    if ($route === 'admin/upload' && $method === 'POST') {
        $files = [];
        if (!empty($_FILES['file'])) {
            $files[] = $_FILES['file'];
        } elseif (!empty($_FILES['files'])) {
            if (is_array($_FILES['files']['name'])) {
                for ($i = 0; $i < count($_FILES['files']['name']); $i++) {
                    $files[] = [
                        'name' => $_FILES['files']['name'][$i],
                        'type' => $_FILES['files']['type'][$i],
                        'tmp_name' => $_FILES['files']['tmp_name'][$i],
                        'error' => $_FILES['files']['error'][$i],
                        'size' => $_FILES['files']['size'][$i]
                    ];
                }
            } else {
                $files[] = $_FILES['files'];
            }
        }

        if (empty($files)) {
            sendJson(400, ['ok' => false, 'error' => 'No files uploaded.']);
        }

        $uploadedUrls = [];
        $allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'mp4', 'webm', 'mov'];
        $videoExts = ['mp4', 'webm', 'mov'];

        foreach ($files as $f) {
            if (($f['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
                continue;
            }
            $origName = $f['name'] ?? '';
            $ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
            if (!in_array($ext, $allowedExts)) {
                sendJson(400, ['ok' => false, 'error' => "File type .$ext is not allowed. Please upload JPG, PNG, WEBP, or MP4."]);
            }

            $isVideo = in_array($ext, $videoExts);
            $targetDir = $isVideo ? (__DIR__ . '/assets/reels') : (__DIR__ . '/assets/p');
            if (!is_dir($targetDir)) {
                @mkdir($targetDir, 0755, true);
            }

            $rawBase = pathinfo($origName, PATHINFO_FILENAME);
            $cleanBase = preg_replace('/[^a-zA-Z0-9_\-]/', '-', $rawBase);
            $cleanBase = trim($cleanBase, '-');
            if (!$cleanBase) $cleanBase = 'media';
            $uniqueName = time() . '_' . substr(bin2hex(random_bytes(3)), 0, 5) . '_' . $cleanBase . '.' . $ext;

            $destPath = $targetDir . '/' . $uniqueName;
            if (move_uploaded_file($f['tmp_name'], $destPath)) {
                $relUrl = ($isVideo ? 'assets/reels/' : 'assets/p/') . $uniqueName;
                $uploadedUrls[] = $relUrl;
            }
        }

        if (empty($uploadedUrls)) {
            sendJson(500, ['ok' => false, 'error' => 'Failed to save uploaded files. Please check folder permissions.']);
        }

        sendJson(200, [
            'ok' => true,
            'url' => $uploadedUrls[0],
            'urls' => $uploadedUrls,
            'count' => count($uploadedUrls)
        ]);
    }

    // GET api/admin/security
    if ($route === 'admin/security' && $method === 'GET') {
        $auth = AuveStorage::getAuth();
        sendJson(200, [
            'ok' => true,
            'hasCustomPassword' => !empty($auth['password']),
            'hasRecoveryCode' => !empty($auth['recovery'])
        ]);
    }

    // POST api/admin/security/change-password
    if ($route === 'admin/security/change-password' && $method === 'POST') {
        $body = getJsonBody();
        $cur = (string)($body['currentPassword'] ?? '');
        $new = (string)($body['newPassword'] ?? '');
        if (strlen($new) < 6) sendJson(400, ['ok' => false, 'error' => 'New password must be at least 6 characters.']);

        $auth = AuveStorage::getAuth();
        $valid = false;
        if (!empty($auth['password'])) {
            $calc = hash_pbkdf2('sha256', $cur, $auth['password']['salt'], 10000, 64);
            $valid = hash_equals($auth['password']['hash'], $calc);
        } else {
            $valid = ($cur === AUVE_DEFAULT_ADMIN_PASS);
        }
        if (!$valid) sendJson(401, ['ok' => false, 'error' => 'Current password is not correct.']);

        $salt = bin2hex(random_bytes(16));
        $hash = hash_pbkdf2('sha256', $new, $salt, 10000, 64);
        $auth['password'] = ['salt' => $salt, 'hash' => $hash];
        AuveStorage::saveAuth($auth);
        sendJson(200, ['ok' => true]);
    }

    // POST api/admin/security/recovery-code
    if ($route === 'admin/security/recovery-code' && $method === 'POST') {
        $body = getJsonBody();
        $cur = (string)($body['currentPassword'] ?? '');
        $code = trim((string)($body['recoveryCode'] ?? ''));
        if (strlen($code) < 4) sendJson(400, ['ok' => false, 'error' => 'Recovery code too short.']);

        $auth = AuveStorage::getAuth();
        $valid = false;
        if (!empty($auth['password'])) {
            $calc = hash_pbkdf2('sha256', $cur, $auth['password']['salt'], 10000, 64);
            $valid = hash_equals($auth['password']['hash'], $calc);
        } else {
            $valid = ($cur === AUVE_DEFAULT_ADMIN_PASS);
        }
        if (!$valid) sendJson(401, ['ok' => false, 'error' => 'Current password is not correct.']);

        $salt = bin2hex(random_bytes(16));
        $hash = hash_pbkdf2('sha256', $code, $salt, 10000, 64);
        $auth['recovery'] = ['salt' => $salt, 'hash' => $hash];
        AuveStorage::saveAuth($auth);
        sendJson(200, ['ok' => true]);
    }

    // GET api/admin/integrations
    if ($route === 'admin/integrations' && $method === 'GET') {
        $auth = AuveStorage::getAuth();
        $integ = $auth['integrations'] ?? [];
        sendJson(200, [
            'ok' => true,
            'razorpay' => [
                'configured' => !empty($integ['razorpayKeyId']) && !empty($integ['razorpayKeySecret']),
                'keyId' => $integ['razorpayKeyId'] ?? '',
                'source' => !empty($integ['razorpayKeyId']) ? 'admin' : 'none'
            ],
            'shiprocket' => [
                'configured' => !empty($integ['shiprocketEmail']) && !empty($integ['shiprocketPassword']),
                'email' => $integ['shiprocketEmail'] ?? '',
                'pickupLocation' => $integ['shiprocketPickup'] ?? 'Primary',
                'source' => !empty($integ['shiprocketEmail']) ? 'admin' : 'none'
            ]
        ]);
    }

    // PUT api/admin/integrations
    if ($route === 'admin/integrations' && $method === 'PUT') {
        $body = getJsonBody();
        $auth = AuveStorage::getAuth();
        if (!isset($auth['integrations'])) $auth['integrations'] = [];
        foreach ($body as $k => $v) {
            $auth['integrations'][$k] = trim((string)$v);
        }
        AuveStorage::saveAuth($auth);
        sendJson(200, ['ok' => true]);
    }

    // POST api/admin/integrations/clear
    if ($route === 'admin/integrations/clear' && $method === 'POST') {
        $body = getJsonBody();
        $which = $body['which'] ?? '';
        $auth = AuveStorage::getAuth();
        if (isset($auth['integrations'])) {
            if ($which === 'razorpay') {
                unset($auth['integrations']['razorpayKeyId'], $auth['integrations']['razorpayKeySecret']);
            } elseif ($which === 'shiprocket') {
                unset($auth['integrations']['shiprocketEmail'], $auth['integrations']['shiprocketPassword']);
            }
            AuveStorage::saveAuth($auth);
        }
        sendJson(200, ['ok' => true]);
    }

    // POST api/admin/integrations/check-razorpay
    if ($route === 'admin/integrations/check-razorpay' && $method === 'POST') {
        $auth = AuveStorage::getAuth();
        $integ = $auth['integrations'] ?? [];
        if (empty($integ['razorpayKeyId']) || empty($integ['razorpayKeySecret'])) {
            sendJson(400, ['ok' => false, 'error' => 'Razorpay keys are not entered yet.']);
        }
        $ch = curl_init('https://api.razorpay.com/v1/payments?count=1');
        curl_setopt($ch, CURLOPT_USERPWD, $integ['razorpayKeyId'] . ':' . $integ['razorpayKeySecret']);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $res = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($code === 200) {
            sendJson(200, ['ok' => true, 'message' => 'Razorpay credentials verified successfully!']);
        }
        sendJson(400, ['ok' => false, 'error' => 'Razorpay rejected these keys (HTTP ' . $code . '). Please check them.']);
    }

    // POST api/admin/integrations/check-shiprocket
    if ($route === 'admin/integrations/check-shiprocket' && $method === 'POST') {
        $auth = AuveStorage::getAuth();
        $integ = $auth['integrations'] ?? [];
        if (empty($integ['shiprocketEmail']) || empty($integ['shiprocketPassword'])) {
            sendJson(400, ['ok' => false, 'error' => 'Shiprocket email/password are not entered yet.']);
        }
        $ch = curl_init('https://apiv2.shiprocket.in/v1/external/auth/login');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
            'email' => $integ['shiprocketEmail'],
            'password' => $integ['shiprocketPassword']
        ]));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        $res = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        $d = json_decode($res, true);
        if ($code === 200 && !empty($d['token'])) {
            sendJson(200, ['ok' => true, 'message' => 'Shiprocket credentials verified successfully!']);
        }
        sendJson(400, ['ok' => false, 'error' => $d['message'] ?? 'Shiprocket login failed. Please check email/password.']);
    }
}

// Route not matched
sendJson(404, ['ok' => false, 'error' => 'API endpoint not found: ' . $route]);
