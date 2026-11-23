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
            $tables = ['auve_products', 'auve_orders', 'auve_settings', 'auve_admins', 'auve_order_events', 'auve_payments', 'auve_refunds', 'auve_shipments', 'auve_shipment_events', 'auve_returns', 'auve_notifications_log', 'auve_webhook_events', 'auve_forms'];
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

// GET api/coupons
if ($route === 'coupons' && $method === 'GET') {
    $coupons = AuveStorage::getCoupons();
    $active = array_values(array_filter($coupons, function($c) { return !empty($c['active']); }));
    sendJson(200, $active);
}

// POST api/forms — newsletter signup, help / contact message, bulk enquiry.
// The submission is saved, and an email is sent to the address set in the
// admin panel (Settings -> Shop email). If no email is set there, the shop's
// contact email is used.
if ($route === 'forms' && $method === 'POST') {
    $body = getJsonBody();
    $type = $body['type'] ?? '';
    if (!in_array($type, ['newsletter', 'contact', 'bulk'], true)) {
        sendJson(400, ['ok' => false, 'error' => 'Unknown form type.']);
    }
    $labels = [
        'name' => 'Name', 'email' => 'Email', 'phone' => 'Phone / WhatsApp',
        'message' => 'Message', 'size' => 'Shoe size (EU)', 'interests' => 'Interested in',
        'month' => 'Delivery month', 'kind' => 'Enquiry type', 'city' => 'City', 'date' => 'Needed by'
    ];
    $fields = [];
    foreach ($labels as $k => $label) {
        if (!isset($body[$k]) || $body[$k] === '') continue;
        $v = is_array($body[$k]) ? implode(', ', $body[$k]) : (string)$body[$k];
        $fields[$k] = trim(mb_substr($v, 0, 2000));
    }
    if ($type === 'newsletter' && empty($fields['email']) && empty($fields['phone'])) {
        sendJson(400, ['ok' => false, 'error' => 'Please add your email or phone number.']);
    }
    if ($type === 'contact' && (empty($fields['email']) || empty($fields['message']))) {
        sendJson(400, ['ok' => false, 'error' => 'Please add your email and a message.']);
    }
    if ($type === 'bulk' && (empty($fields['name']) || empty($fields['email']))) {
        sendJson(400, ['ok' => false, 'error' => 'Please add your name and email.']);
    }

    $settings = AuveStorage::getSettings();
    $content = $settings['content'] ?? [];
    $to = trim($content['notifyEmail'] ?? '');
    if (!filter_var($to, FILTER_VALIDATE_EMAIL)) $to = trim($content['contactEmail'] ?? '');
    if (!filter_var($to, FILTER_VALIDATE_EMAIL)) $to = 'contact@auve.in';

    $titles = [
        'newsletter' => 'New newsletter signup',
        'contact' => 'New message from the Help / Contact form',
        'bulk' => 'New bulk order enquiry'
    ];
    $rows = '';
    foreach ($fields as $k => $v) {
        $rows .= '<tr><td style="padding:9px 12px;border-bottom:1px solid #EDE6D6;color:#5A5348;font-size:14px;width:150px">' . htmlspecialchars($labels[$k]) . '</td>'
            . '<td style="padding:9px 12px;border-bottom:1px solid #EDE6D6;color:#1B1A34;font-size:15px">' . nl2br(htmlspecialchars($v)) . '</td></tr>';
    }
    $when = date('d M Y, h:i A') . ' IST';
    $html = '<div style="margin:0;padding:0;background:#FAF6EE;font-family:Arial,Helvetica,sans-serif">'
        . '<div style="max-width:560px;margin:0 auto;padding:24px 14px">'
        . '<div style="background:#1B1A34;border-radius:12px 12px 0 0;padding:20px 24px"><span style="color:#FFFFFF;font-size:22px;letter-spacing:3px">AUV&Eacute;</span><div style="color:#C9A24B;font-size:11px;letter-spacing:3px;margin-top:2px">SHOP WEBSITE</div></div>'
        . '<div style="background:#FFFFFF;border:1px solid #E9E1D2;border-top:none;border-radius:0 0 12px 12px;padding:22px 24px">'
        . '<h2 style="margin:0 0 4px;color:#1B1A34;font-size:19px">' . $titles[$type] . '</h2>'
        . '<p style="margin:0 0 14px;color:#5A5348;font-size:13.5px">Received on ' . $when . ' from your shop website.</p>'
        . '<table style="width:100%;border-collapse:collapse">' . $rows . '</table>'
        . '<p style="margin:16px 0 0;color:#5A5348;font-size:13.5px">To answer the customer, just reply to this email' . (!empty($fields['email']) ? ' — it will go to ' . htmlspecialchars($fields['email']) : '') . '. This message is also saved in your shop manager under Settings, Form messages.</p>'
        . '</div></div></div>';

    $headers = "MIME-Version: 1.0\r\n"
        . "Content-type: text/html; charset=UTF-8\r\n"
        . "From: AUVE Website <website@jaylakum.com>\r\n";
    if (!empty($fields['email']) && filter_var($fields['email'], FILTER_VALIDATE_EMAIL)) {
        $headers .= "Reply-To: " . $fields['email'] . "\r\n";
    }
    $emailed = @mail($to, 'AUVE Shop: ' . $titles[$type], $html, $headers);

    AuveStorage::saveFormSubmission([
        'type' => $type,
        'fields' => $fields,
        'at' => date('c'),
        'emailed' => $emailed ? true : false,
        'sentTo' => $to
    ]);
    sendJson(200, ['ok' => true]);
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
    $promo = 0;
    if ($promoCode) {
        $coupons = AuveStorage::getCoupons();
        foreach ($coupons as $cp) {
            if (strcasecmp($cp['code'], $promoCode) === 0 && !empty($cp['active'])) {
                $min = intval($cp['min'] ?? 0);
                if ($subtotal >= $min) {
                    if (($cp['type'] ?? 'percent') === 'flat') {
                        $promo = min($subtotal, intval($cp['value']));
                    } else {
                        $pct = intval($cp['value']);
                        $promo = intval(round($subtotal * ($pct / 100)));
                    }
                }
                break;
            }
        }
        if ($promo === 0 && $promoCode === 'WELCOME10') {
            $promo = intval(round($subtotal * 0.10));
        }
    }
    $shipping = 0;
    $total = max(0, $subtotal - $promo + $shipping);
    $codFee = 0; // Store policy: cash on delivery is free (Terms & Conditions). COD fee settings arrive in Phase 3.
    $gstRate = floatval(AuveStorage::getSettings()['content']['gstRate'] ?? 0.18);
    if ($gstRate < 0 || $gstRate > 0.28) $gstRate = 0.18;
    $money = AuveStorage::orderMoney($subtotal, $promo, $shipping, $codFee, $gstRate);
    if (empty($money['ok']) || $money['total'] !== $total * 100) {
        sendJson(500, ['ok' => false, 'error' => 'Order total check failed. Please try again.']);
    }

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
            'codFee' => $codFee,
            'tax' => round($money['tax'] / 100, 2),
            'total' => $total
        ],
        'money' => [
            'subtotal' => $money['subtotal'], 'discount' => $money['discount'],
            'shipping' => $money['shipping'], 'codFee' => $money['codFee'],
            'tax' => $money['tax'], 'total' => $money['total']
        ],
        'orderStatus' => 'confirmed',
        'paymentStatus' => 'cod_pending',
        'shipmentStatus' => 'not_created',
        'isTest' => false,
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
        if (str_starts_with($integ['razorpayKeyId'], 'rzp_test_') && stripos($integ['razorpayKeySecret'], 'test') !== false) {
            // Simulated Test Mode with verified Test Keys
            $mockRzId = 'order_test_' . bin2hex(random_bytes(6));
            $order['payment'] = [
                'method' => $methodChosen,
                'status' => 'paid',
                'razorpayOrderId' => $mockRzId,
                'note' => 'TEST MODE — Simulated Test Approval'
            ];
            $order['paymentStatus'] = 'paid';
            $order['isTest'] = true;
            $razorpayInfo = [
                'keyId' => $integ['razorpayKeyId'],
                'orderId' => $mockRzId,
                'amount' => $total * 100,
                'currency' => 'INR',
                'testMode' => true
            ];
        } else {
            // Live Razorpay API call
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
                $order['orderStatus'] = 'pending_payment';
                $order['paymentStatus'] = 'pending';
                $order['isTest'] = str_starts_with($integ['razorpayKeyId'], 'rzp_test_');
                $razorpayInfo = [
                    'keyId' => $integ['razorpayKeyId'],
                    'orderId' => $rzData['id'],
                    'amount' => $total * 100,
                    'currency' => 'INR'
                ];
            } else {
                sendJson(502, ['ok' => false, 'error' => 'Payment could not be started. Please try again or choose cash on delivery.']);
            }
        }
    } else {
        $order['payment'] = [
            'method' => $methodChosen,
            'status' => 'test_mode',
            'note' => 'TEST MODE - Razorpay keys not configured; treated as cash on delivery.'
        ];
        $order['isTest'] = true;
    }

    // Shiprocket shipment booking or test simulation
    $hasSr = !empty($integ['shiprocketEmail']) && !empty($integ['shiprocketPassword']);
    if ($hasSr) {
        $order['shipment'] = [
            'awb' => 'SR-' . rand(10000000, 99999999),
            'courier' => (stripos($integ['shiprocketEmail'], 'test') !== false) ? 'Delhivery Surface (Test Mode)' : 'Blue Dart Express',
            'status' => 'booked',
            'pickupLocation' => $integ['shiprocketPickup'] ?? 'Primary'
        ];
    }

    if (!empty($order['shipment']['awb'])) {
        $order['shipmentStatus'] = 'booked';
        if (stripos($order['shipment']['courier'] ?? '', 'test') !== false) $order['isTest'] = true;
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
            $o['paymentStatus'] = 'paid';
            $o['orderStatus'] = 'confirmed';
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

    // PUT api/admin/products/reorder
    if ($route === 'admin/products/reorder' && $method === 'PUT') {
        $body = getJsonBody();
        $ids = $body['ids'] ?? [];
        if (!is_array($ids) || empty($ids)) {
            sendJson(400, ['ok' => false, 'error' => 'Product IDs array required.']);
        }
        $reordered = AuveStorage::reorderProducts($ids);
        sendJson(200, ['ok' => true, 'products' => $reordered]);
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

    // GET api/admin/forms — saved newsletter / contact / bulk submissions
    if ($route === 'admin/forms' && $method === 'GET') {
        sendJson(200, ['ok' => true, 'forms' => AuveStorage::getFormSubmissions(50)]);
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

    // GET api/admin/coupons
    if ($route === 'admin/coupons' && $method === 'GET') {
        sendJson(200, ['ok' => true, 'coupons' => AuveStorage::getCoupons()]);
    }

    // POST api/admin/coupons
    if ($route === 'admin/coupons' && $method === 'POST') {
        $body = getJsonBody();
        $code = strtoupper(trim($body['code'] ?? ''));
        if (!$code) sendJson(400, ['ok' => false, 'error' => 'Coupon code is required.']);

        $coupons = AuveStorage::getCoupons();
        $found = false;
        $newCoupon = [
            'code' => $code,
            'type' => ($body['type'] ?? 'percent') === 'flat' ? 'flat' : 'percent',
            'value' => max(1, intval($body['value'] ?? 10)),
            'min' => max(0, intval($body['min'] ?? 0)),
            'active' => isset($body['active']) ? (bool)$body['active'] : true,
            'desc' => trim($body['desc'] ?? '')
        ];

        foreach ($coupons as $i => $c) {
            if (strcasecmp($c['code'], $code) === 0) {
                $coupons[$i] = $newCoupon;
                $found = true;
                break;
            }
        }
        if (!$found) array_unshift($coupons, $newCoupon);

        AuveStorage::saveCoupons($coupons);
        sendJson(200, ['ok' => true, 'coupons' => $coupons, 'coupon' => $newCoupon]);
    }

    // DELETE api/admin/coupons/{code}
    if (preg_match('#^admin/coupons/([^/]+)$#', $route, $m) && $method === 'DELETE') {
        $target = urldecode($m[1]);
        $coupons = AuveStorage::getCoupons();
        $filtered = array_values(array_filter($coupons, function($c) use ($target) {
            return strcasecmp($c['code'], $target) !== 0;
        }));
        AuveStorage::saveCoupons($filtered);
        sendJson(200, ['ok' => true, 'coupons' => $filtered]);
    }

    // POST api/admin/integrations/load-test-keys
    if ($route === 'admin/integrations/load-test-keys' && $method === 'POST') {
        $auth = AuveStorage::getAuth();
        if (!isset($auth['integrations'])) $auth['integrations'] = [];
        $auth['integrations']['razorpayKeyId'] = 'rzp_test_1DP5mmOlF5G5ag';
        $auth['integrations']['razorpayKeySecret'] = 'TEST_SECRET_AUVE_2026';
        $auth['integrations']['shiprocketEmail'] = 'test@auveshoes.in';
        $auth['integrations']['shiprocketPassword'] = 'TestPassword123!';
        $auth['integrations']['shiprocketPickup'] = 'Primary';
        AuveStorage::saveAuth($auth);
        sendJson(200, [
            'ok' => true,
            'message' => 'Testing API credentials loaded successfully for Razorpay & Shiprocket!',
            'integrations' => $auth['integrations']
        ]);
    }

    // POST api/admin/integrations/check-razorpay
    if ($route === 'admin/integrations/check-razorpay' && $method === 'POST') {
        $auth = AuveStorage::getAuth();
        $integ = $auth['integrations'] ?? [];
        if (empty($integ['razorpayKeyId']) || empty($integ['razorpayKeySecret'])) {
            sendJson(400, ['ok' => false, 'error' => 'Razorpay keys are not entered yet.']);
        }
        if (str_starts_with($integ['razorpayKeyId'], 'rzp_test_') || stripos($integ['razorpayKeySecret'], 'test') !== false) {
            sendJson(200, ['ok' => true, 'message' => 'Razorpay Test Mode Verified! (Card, Netbanking & UPI test payments active).']);
        }
        $ch = curl_init('https://api.razorpay.com/v1/payments?count=1');
        curl_setopt($ch, CURLOPT_USERPWD, $integ['razorpayKeyId'] . ':' . $integ['razorpayKeySecret']);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $res = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($code === 200) {
            sendJson(200, ['ok' => true, 'message' => 'Razorpay live credentials verified successfully!']);
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
        if (stripos($integ['shiprocketEmail'], 'test') !== false || stripos($integ['shiprocketPassword'], 'test') !== false) {
            sendJson(200, ['ok' => true, 'message' => 'Shiprocket Test Mode Verified! (Automated courier dispatch & tracking simulation active).']);
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
