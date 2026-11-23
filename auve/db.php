<?php
/**
 * AUVÉ Dynamic Footwear Store — Database & Storage Layer
 * Supports MySQL (via PDO) with seamless fallback to JSON file storage.
 */

require_once __DIR__ . '/db_config.php';

class AuveStorage {
    private static ?PDO $pdo = null;
    private static bool $usingDatabase = false;
    private static string $dataDir = __DIR__ . '/data';

    public static function init(): void {
        if (self::$pdo !== null || self::$usingDatabase) {
            return;
        }

        if (!is_dir(self::$dataDir)) {
            @mkdir(self::$dataDir, 0755, true);
        }

        try {
            $dsn = "mysql:host=" . AUVE_DB_HOST . ";dbname=" . AUVE_DB_NAME . ";charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4",
                PDO::MYSQL_ATTR_MULTI_STATEMENTS => true
            ];
            self::$pdo = new PDO($dsn, AUVE_DB_USER, AUVE_DB_PASS, $options);
            self::$usingDatabase = true;
            self::ensureTablesExist();
            self::runOrderMigrations();
        } catch (Throwable $e) {
            // MySQL not connected/configured yet — gracefully use JSON files
            self::$usingDatabase = false;
            self::$pdo = null;
        }
    }

    public static function isDatabaseActive(): bool {
        self::init();
        return self::$usingDatabase;
    }

    public static function getPdo(): ?PDO {
        self::init();
        return self::$pdo;
    }

    private static function ensureTablesExist(): void {
        if (!self::$pdo) return;
        try {
            $stmt = self::$pdo->query("SHOW TABLES LIKE 'auve_products'");
            if ($stmt->rowCount() === 0) {
                // Auto-create schema from SQL file if available
                $sqlFile = __DIR__ . '/auve_database.sql';
                if (file_exists($sqlFile)) {
                    $sql = file_get_contents($sqlFile);
                    self::$pdo->exec($sql);
                }
            }
        } catch (Throwable $e) {
            // Ignore error
        }
    }

    // -------------------------------------------------------------
    // PRODUCTS
    // -------------------------------------------------------------
    public static function getProducts(): array {
        self::init();
        if (self::$usingDatabase && self::$pdo) {
            try {
                $stmt = self::$pdo->query("SELECT raw_json FROM auve_products ORDER BY sort_order ASC, id ASC");
                $rows = $stmt->fetchAll();
                if (!empty($rows)) {
                    $list = [];
                    foreach ($rows as $r) {
                        $p = json_decode($r['raw_json'], true);
                        if ($p) $list[] = $p;
                    }
                    return $list;
                }
            } catch (Throwable $e) {}
        }

        // JSON file read
        $file = self::$dataDir . '/products.json';
        if (file_exists($file)) {
            $content = file_get_contents($file);
            $arr = json_decode($content, true);
            if (is_array($arr)) return $arr;
        }
        return [];
    }

    public static function saveProduct(array $product, ?string $existingId = null): bool {
        self::init();
        $id = $product['id'];
        $raw = json_encode($product, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        // Update database if connected
        if (self::$usingDatabase && self::$pdo) {
            try {
                $stmt = self::$pdo->prepare("
                    INSERT INTO auve_products 
                        (id, name, coll, type, price, description, tag, cover, cover2, sold_out, details, variants, raw_json)
                    VALUES 
                        (:id, :name, :coll, :type, :price, :description, :tag, :cover, :cover2, :sold_out, :details, :variants, :raw_json)
                    ON DUPLICATE KEY UPDATE
                        name = VALUES(name),
                        coll = VALUES(coll),
                        type = VALUES(type),
                        price = VALUES(price),
                        description = VALUES(description),
                        tag = VALUES(tag),
                        cover = VALUES(cover),
                        cover2 = VALUES(cover2),
                        sold_out = VALUES(sold_out),
                        details = VALUES(details),
                        variants = VALUES(variants),
                        raw_json = VALUES(raw_json)
                ");
                $stmt->execute([
                    ':id' => $id,
                    ':name' => $product['name'] ?? '',
                    ':coll' => $product['coll'] ?? 'barely',
                    ':type' => $product['type'] ?? 'Flats',
                    ':price' => intval($product['price'] ?? 0),
                    ':description' => $product['desc'] ?? '',
                    ':tag' => $product['tag'] ?? null,
                    ':cover' => $product['cover'] ?? null,
                    ':cover2' => $product['cover2'] ?? null,
                    ':sold_out' => json_encode($product['soldOut'] ?? []),
                    ':details' => json_encode($product['details'] ?? []),
                    ':variants' => json_encode($product['variants'] ?? []),
                    ':raw_json' => $raw
                ]);
            } catch (Throwable $e) {}
        }

        // Always sync JSON file as well for instant static speed
        $products = self::getProducts();
        $found = false;
        $targetId = $existingId ?: $id;
        foreach ($products as $i => $p) {
            if ($p['id'] === $targetId) {
                $products[$i] = $product;
                $found = true;
                break;
            }
        }
        if (!$found) {
            $products[] = $product;
        }

        self::writeJsonAtomic(self::$dataDir . '/products.json', $products);
        return true;
    }

    public static function deleteProduct(string $id): bool {
        self::init();
        if (self::$usingDatabase && self::$pdo) {
            try {
                $stmt = self::$pdo->prepare("DELETE FROM auve_products WHERE id = :id");
                $stmt->execute([':id' => $id]);
            } catch (Throwable $e) {}
        }

        $products = self::getProducts();
        $filtered = array_values(array_filter($products, fn($p) => $p['id'] !== $id));
        self::writeJsonAtomic(self::$dataDir . '/products.json', $filtered);
        return true;
    }

    public static function reorderProducts(array $orderedIds): array {
        self::init();
        $products = self::getProducts();
        $byId = [];
        foreach ($products as $p) $byId[$p['id']] = $p;

        $newOrder = [];
        $sortOrder = 1;

        foreach ($orderedIds as $id) {
            if (isset($byId[$id])) {
                $newOrder[] = $byId[$id];
                if (self::$usingDatabase && self::$pdo) {
                    try {
                        $st = self::$pdo->prepare("UPDATE auve_products SET sort_order = :ord WHERE id = :id");
                        $st->execute([':ord' => $sortOrder++, ':id' => $id]);
                    } catch (Throwable $e) {}
                }
                unset($byId[$id]);
            }
        }
        foreach ($byId as $id => $p) {
            $newOrder[] = $p;
            if (self::$usingDatabase && self::$pdo) {
                try {
                    $st = self::$pdo->prepare("UPDATE auve_products SET sort_order = :ord WHERE id = :id");
                    $st->execute([':ord' => $sortOrder++, ':id' => $id]);
                } catch (Throwable $e) {}
            }
        }

        self::writeJsonAtomic(self::$dataDir . '/products.json', $newOrder);
        return $newOrder;
    }

    // -------------------------------------------------------------
    // SETTINGS
    // -------------------------------------------------------------
    public static function getSettings(): array {
        self::init();
        $settings = ['design' => [], 'content' => [], 'sections' => []];

        if (self::$usingDatabase && self::$pdo) {
            try {
                $stmt = self::$pdo->query("SELECT setting_key, setting_value FROM auve_settings");
                $rows = $stmt->fetchAll();
                if (!empty($rows)) {
                    foreach ($rows as $r) {
                        $val = json_decode($r['setting_value'], true);
                        if ($val !== null) {
                            $settings[$r['setting_key']] = $val;
                        }
                    }
                    return $settings;
                }
            } catch (Throwable $e) {}
        }

        $file = self::$dataDir . '/settings.json';
        if (file_exists($file)) {
            $arr = json_decode(file_get_contents($file), true);
            if (is_array($arr)) return $arr;
        }
        return $settings;
    }

    public static function saveSettings(array $newSettings): array {
        self::init();
        $current = self::getSettings();
        $merged = array_replace_recursive($current, $newSettings);
        // List-style content must replace wholesale, not merge recursively:
        // array_replace_recursive can never shrink a list, so an admin save
        // with fewer rows (or an empty list) would leave deleted rows live.
        if (isset($newSettings['content']) && is_array($newSettings['content']) && isset($merged['content']) && is_array($merged['content'])) {
            foreach (['pagesList', 'reelsList', 'collectionsList'] as $listKey) {
                if (array_key_exists($listKey, $newSettings['content'])) {
                    $merged['content'][$listKey] = $newSettings['content'][$listKey];
                }
            }
        }

        if (self::$usingDatabase && self::$pdo) {
            try {
                $stmt = self::$pdo->prepare("
                    INSERT INTO auve_settings (setting_key, setting_value)
                    VALUES (:key, :value)
                    ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
                ");
                foreach ($merged as $k => $v) {
                    $stmt->execute([':key' => $k, ':value' => json_encode($v, JSON_UNESCAPED_UNICODE)]);
                }
            } catch (Throwable $e) {}
        }

        self::writeJsonAtomic(self::$dataDir . '/settings.json', $merged);
        // Also keep root api-settings.json synced if present
        $rootSettings = dirname(__DIR__) . '/auve/api-settings.json';
        if (is_dir(dirname($rootSettings))) {
            @file_put_contents($rootSettings, json_encode($merged, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        }
        return $merged;
    }

    // -------------------------------------------------------------
    // ORDERS
    // -------------------------------------------------------------
    public static function getOrders(): array {
        self::init();
        if (self::$usingDatabase && self::$pdo) {
            try {
                $stmt = self::$pdo->query("SELECT order_json FROM auve_orders ORDER BY created_at DESC");
                $rows = $stmt->fetchAll();
                if (!empty($rows)) {
                    $list = [];
                    foreach ($rows as $r) {
                        $o = json_decode($r['order_json'], true);
                        if ($o) $list[] = $o;
                    }
                    return $list;
                }
            } catch (Throwable $e) {}
        }

        $file = self::$dataDir . '/orders.json';
        if (file_exists($file)) {
            $arr = json_decode(file_get_contents($file), true);
            if (is_array($arr)) return $arr;
        }
        return [];
    }

    public static function saveOrder(array $order): bool {
        self::init();
        if (self::$usingDatabase && self::$pdo) {
            try {
                $pstatusNorm = $order['paymentStatus'] ?? (($order['payment']['status'] ?? '') === 'paid' ? 'paid' : (($order['payment']['status'] ?? '') === 'payment_pending' ? 'pending' : 'cod_pending'));
                $stmt = self::$pdo->prepare("
                    INSERT INTO auve_orders 
                        (id, customer_name, customer_phone, customer_email, customer_address, city, state, pincode, 
                         items_count, subtotal, discount, total, promo_code, shipping_type, payment_method, payment_status,
                         razorpay_order_id, razorpay_payment_id, shipment_provider, shipment_awb, items_json, order_json, order_status, shipment_status, is_test)
                    VALUES 
                        (:id, :name, :phone, :email, :address, :city, :state, :pincode, 
                         :items_count, :subtotal, :discount, :total, :promo, :shipping, :payment_method, :payment_status,
                         :rz_order, :rz_pay, :sr_provider, :sr_awb, :items_json, :order_json, :ostatus, :sstatus, :istest)
                    ON DUPLICATE KEY UPDATE
                        payment_status = VALUES(payment_status),
                        razorpay_payment_id = VALUES(razorpay_payment_id),
                        shipment_provider = VALUES(shipment_provider),
                        shipment_awb = VALUES(shipment_awb),
                        order_json = VALUES(order_json),
                        order_status = VALUES(order_status),
                        shipment_status = VALUES(shipment_status),
                        is_test = VALUES(is_test)
                ");
                $stmt->execute([
                    ':id' => $order['id'],
                    ':name' => $order['customer']['name'] ?? '',
                    ':phone' => $order['customer']['phone'] ?? '',
                    ':email' => $order['customer']['email'] ?? '',
                    ':address' => $order['customer']['address'] ?? '',
                    ':city' => $order['customer']['city'] ?? '',
                    ':state' => $order['customer']['state'] ?? '',
                    ':pincode' => $order['customer']['pincode'] ?? '',
                    ':items_count' => intval($order['totals']['pairs'] ?? 1),
                    ':subtotal' => floatval($order['totals']['subtotal'] ?? 0),
                    ':discount' => floatval($order['totals']['promo'] ?? 0),
                    ':total' => floatval($order['totals']['total'] ?? 0),
                    ':promo' => $order['promoCode'] ?? null,
                    ':shipping' => $order['shipping'] ?? 'standard',
                    ':payment_method' => $order['payment']['method'] ?? 'cod',
                    ':payment_status' => $pstatusNorm,
                    ':rz_order' => $order['payment']['razorpayOrderId'] ?? null,
                    ':rz_pay' => $order['payment']['razorpayPaymentId'] ?? null,
                    ':sr_provider' => $order['shipment']['provider'] ?? null,
                    ':sr_awb' => $order['shipment']['awb'] ?? null,
                    ':items_json' => json_encode($order['items'] ?? []),
                    ':order_json' => json_encode($order, JSON_UNESCAPED_UNICODE),
                    ':ostatus' => $order['orderStatus'] ?? 'confirmed',
                    ':sstatus' => $order['shipmentStatus'] ?? 'not_created',
                    ':istest' => !empty($order['isTest']) ? 1 : 0
                ]);
            } catch (Throwable $e) {}
        }

        // Always sync orders.json file
        $orders = self::getOrders();
        // Insert at beginning or update existing
        $found = false;
        foreach ($orders as $i => $o) {
            if ($o['id'] === $order['id']) {
                $orders[$i] = $order;
                $found = true;
                break;
            }
        }
        if (!$found) {
            array_unshift($orders, $order);
        }
        self::writeJsonAtomic(self::$dataDir . '/orders.json', $orders);
        return true;
    }

    // -------------------------------------------------------------
    // ORDER MONEY (integer paise). Invariant:
    // total = subtotal - discount + shipping + codFee.
    // GST (tax) is INCLUDED in the prices, so it is reported as the
    // GST portion inside the total, never added on top.
    // -------------------------------------------------------------
    public static function orderMoney(int $subtotal, int $discount, int $shipping, int $codFee, float $gstRate = 0.18): array {
        $subP = $subtotal * 100;
        $discP = $discount * 100;
        $shipP = $shipping * 100;
        $codP = $codFee * 100;
        $taxableP = max(0, $subP - $discP);
        $taxP = (int) round($taxableP * $gstRate / (1 + $gstRate));
        $totalP = $subP - $discP + $shipP + $codP;
        return [
            'subtotal' => $subP, 'discount' => $discP, 'shipping' => $shipP,
            'codFee' => $codP, 'tax' => $taxP, 'total' => $totalP,
            'ok' => ($totalP === $subP - $discP + $shipP + $codP)
        ];
    }

    // -------------------------------------------------------------
    // ORDER MANAGEMENT SCHEMA (migration 001, idempotent).
    // New tables for payments, refunds, shipments, returns, events,
    // notifications and webhooks + lifecycle columns on auve_orders.
    // The legacy auve_orders.payment_status column is repurposed as
    // the normalised payment_status (raw status stays in order_json).
    // -------------------------------------------------------------
    private static $orderMigrated = false;

    private static function runOrderMigrations(): void {
        if (self::$orderMigrated || !self::$usingDatabase || !self::$pdo) return;
        self::$orderMigrated = true;
        try {
            $ver = null;
            try {
                $st = self::$pdo->prepare("SELECT setting_value FROM auve_settings WHERE setting_key = 'schema_version'");
                $st->execute();
                $ver = $st->fetchColumn();
            } catch (Throwable $e) {}
            if ($ver === '001') return;

            $ddl = [
                "CREATE TABLE IF NOT EXISTS auve_order_events (
                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                    order_id VARCHAR(20) NOT NULL,
                    event VARCHAR(48) NOT NULL,
                    from_status VARCHAR(32) NULL,
                    to_status VARCHAR(32) NULL,
                    actor VARCHAR(16) NOT NULL DEFAULT 'system',
                    note TEXT NULL,
                    meta_json LONGTEXT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_order (order_id), INDEX idx_created (created_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
                "CREATE TABLE IF NOT EXISTS auve_payments (
                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                    order_id VARCHAR(20) NOT NULL,
                    gateway VARCHAR(24) NOT NULL DEFAULT 'razorpay',
                    gateway_order_id VARCHAR(64) NULL,
                    gateway_payment_id VARCHAR(64) NULL,
                    method VARCHAR(24) NULL,
                    amount_paise BIGINT NOT NULL DEFAULT 0,
                    status VARCHAR(32) NOT NULL DEFAULT 'pending',
                    signature_verified TINYINT NOT NULL DEFAULT 0,
                    raw_json LONGTEXT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_order (order_id), INDEX idx_gpay (gateway_payment_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
                "CREATE TABLE IF NOT EXISTS auve_refunds (
                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                    order_id VARCHAR(20) NOT NULL,
                    payment_id BIGINT NULL,
                    gateway_refund_id VARCHAR(64) NULL,
                    amount_paise BIGINT NOT NULL DEFAULT 0,
                    reason VARCHAR(255) NULL,
                    speed VARCHAR(16) NOT NULL DEFAULT 'normal',
                    status VARCHAR(32) NOT NULL DEFAULT 'initiated',
                    raw_json LONGTEXT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_order (order_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
                "CREATE TABLE IF NOT EXISTS auve_shipments (
                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                    order_id VARCHAR(20) NOT NULL,
                    provider VARCHAR(24) NOT NULL DEFAULT 'shiprocket',
                    awb VARCHAR(64) NULL,
                    courier VARCHAR(96) NULL,
                    status VARCHAR(32) NOT NULL DEFAULT 'not_created',
                    pickup_date DATE NULL,
                    expected_delivery DATE NULL,
                    label_url VARCHAR(512) NULL,
                    charges_paise BIGINT NOT NULL DEFAULT 0,
                    raw_json LONGTEXT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_order (order_id), INDEX idx_awb (awb)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
                "CREATE TABLE IF NOT EXISTS auve_shipment_events (
                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                    shipment_id BIGINT NULL,
                    awb VARCHAR(64) NULL,
                    status VARCHAR(48) NOT NULL,
                    location VARCHAR(128) NULL,
                    remark TEXT NULL,
                    event_time DATETIME NULL,
                    raw_json LONGTEXT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_awb (awb)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
                "CREATE TABLE IF NOT EXISTS auve_returns (
                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                    order_id VARCHAR(20) NOT NULL,
                    type VARCHAR(16) NOT NULL DEFAULT 'return',
                    reason VARCHAR(255) NULL,
                    status VARCHAR(32) NOT NULL DEFAULT 'requested',
                    qc_status VARCHAR(32) NULL,
                    refund_mode VARCHAR(24) NULL,
                    raw_json LONGTEXT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_order (order_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
                "CREATE TABLE IF NOT EXISTS auve_notifications_log (
                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                    order_id VARCHAR(20) NULL,
                    channel VARCHAR(16) NOT NULL,
                    template VARCHAR(48) NOT NULL,
                    to_address VARCHAR(191) NULL,
                    status VARCHAR(24) NOT NULL DEFAULT 'queued',
                    provider_id VARCHAR(96) NULL,
                    error TEXT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_order (order_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
                "CREATE TABLE IF NOT EXISTS auve_webhook_events (
                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                    provider VARCHAR(24) NOT NULL,
                    event_id VARCHAR(96) NOT NULL,
                    event_type VARCHAR(64) NOT NULL,
                    payload_json LONGTEXT NULL,
                    processed TINYINT NOT NULL DEFAULT 0,
                    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE KEY uq_event (provider, event_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
            ];
            foreach ($ddl as $sql) { try { self::$pdo->exec($sql); } catch (Throwable $e) {} }

            $cols = [
                'order_status' => "VARCHAR(32) NOT NULL DEFAULT 'confirmed'",
                'shipment_status' => "VARCHAR(32) NOT NULL DEFAULT 'not_created'",
                'is_test' => "TINYINT NOT NULL DEFAULT 0"
            ];
            foreach ($cols as $col => $def) {
                try {
                    $st = self::$pdo->prepare("SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'auve_orders' AND COLUMN_NAME = ?");
                    $st->execute([$col]);
                    if (intval($st->fetchColumn()) === 0) {
                        self::$pdo->exec("ALTER TABLE auve_orders ADD COLUMN $col $def");
                    }
                } catch (Throwable $e) {}
            }

            self::backfillLegacyOrders();

            try {
                $st = self::$pdo->prepare("INSERT INTO auve_settings (setting_key, setting_value) VALUES ('schema_version', '001') ON DUPLICATE KEY UPDATE setting_value = '001'");
                $st->execute();
            } catch (Throwable $e) {}
        } catch (Throwable $e) {}
    }

    // One-time repair: give every stored order the full money breakup
    // (paise), the tax/codFee fields and the lifecycle statuses.
    private static function backfillLegacyOrders(): void {
        try {
            $rows = self::$pdo->query("SELECT id, order_json FROM auve_orders")->fetchAll();
            foreach ($rows as $r) {
                $o = json_decode($r['order_json'], true);
                if (!is_array($o) || isset($o['money'])) continue;
                $t = $o['totals'] ?? [];
                $codFee = intval($t['codFee'] ?? 0);
                $money = self::orderMoney(intval($t['subtotal'] ?? 0), intval($t['promo'] ?? 0), intval($t['shipping'] ?? 0), $codFee, 0.18);
                unset($money['ok']);
                $o['totals']['codFee'] = $codFee;
                $o['totals']['tax'] = round($money['tax'] / 100, 2);
                $o['money'] = $money;
                $payStatus = $o['payment']['status'] ?? 'cod';
                $isTest = ($payStatus === 'test_mode') || (isset($o['shipment']['courier']) && stripos($o['shipment']['courier'], 'test') !== false);
                $o['isTest'] = $isTest;
                $o['orderStatus'] = ($payStatus === 'payment_pending') ? 'pending_payment' : 'confirmed';
                $o['paymentStatus'] = $payStatus === 'paid' ? 'paid' : ($payStatus === 'payment_pending' ? 'pending' : 'cod_pending');
                $o['shipmentStatus'] = !empty($o['shipment']['awb']) ? 'booked' : 'not_created';
                $st = self::$pdo->prepare("UPDATE auve_orders SET order_json = :j, order_status = :os, payment_status = :ps, shipment_status = :ss, is_test = :it WHERE id = :id");
                $st->execute([':j' => json_encode($o, JSON_UNESCAPED_UNICODE), ':os' => $o['orderStatus'], ':ps' => $o['paymentStatus'], ':ss' => $o['shipmentStatus'], ':it' => $isTest ? 1 : 0, ':id' => $r['id']]);
            }
        } catch (Throwable $e) {}
    }

    // -------------------------------------------------------------
    // FORM SUBMISSIONS (newsletter, contact / help, bulk)
    // -------------------------------------------------------------
    public static function saveFormSubmission(array $sub): bool {
        self::init();
        if (self::$usingDatabase && self::$pdo) {
            try {
                self::$pdo->exec("CREATE TABLE IF NOT EXISTS auve_forms (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    type VARCHAR(32) NOT NULL,
                    raw_json LONGTEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_type (type)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
                $stmt = self::$pdo->prepare("INSERT INTO auve_forms (type, raw_json) VALUES (:t, :j)");
                $stmt->execute([':t' => $sub['type'] ?? 'form', ':j' => json_encode($sub)]);
                return true;
            } catch (Throwable $e) {}
        }
        $file = self::$dataDir . '/forms.json';
        $list = [];
        if (file_exists($file)) {
            $arr = json_decode(file_get_contents($file), true);
            if (is_array($arr)) $list = $arr;
        }
        array_unshift($list, $sub);
        self::writeJsonAtomic($file, $list);
        return true;
    }

    public static function getFormSubmissions(int $limit = 50): array {
        self::init();
        if (self::$usingDatabase && self::$pdo) {
            try {
                $stmt = self::$pdo->query("SELECT raw_json FROM auve_forms ORDER BY id DESC LIMIT " . intval($limit));
                $rows = $stmt->fetchAll();
                $list = [];
                foreach ($rows as $r) {
                    $s = json_decode($r['raw_json'], true);
                    if ($s) $list[] = $s;
                }
                return $list;
            } catch (Throwable $e) {}
        }
        $file = self::$dataDir . '/forms.json';
        if (file_exists($file)) {
            $arr = json_decode(file_get_contents($file), true);
            if (is_array($arr)) return array_slice($arr, 0, $limit);
        }
        return [];
    }

    // -------------------------------------------------------------
    // COUPONS & DISCOUNTS
    // -------------------------------------------------------------
    public static function getCoupons(): array {
        self::init();
        if (self::$usingDatabase && self::$pdo) {
            try {
                $st = self::$pdo->prepare("SELECT setting_value FROM auve_settings WHERE setting_key = 'coupons'");
                $st->execute();
                $val = $st->fetchColumn();
                if ($val) {
                    $arr = json_decode($val, true);
                    if (is_array($arr)) return $arr;
                }
            } catch (Throwable $e) {}
        }
        $file = self::$dataDir . '/coupons.json';
        if (file_exists($file)) {
            $arr = json_decode(file_get_contents($file), true);
            if (is_array($arr)) return $arr;
        }
        return [
            [
                'code' => 'WELCOME10',
                'type' => 'percent',
                'value' => 10,
                'min' => 0,
                'active' => true,
                'desc' => '10% discount on first order'
            ],
            [
                'code' => 'AUVE20',
                'type' => 'percent',
                'value' => 20,
                'min' => 1500,
                'active' => true,
                'desc' => '20% off on orders above ₹1,500'
            ],
            [
                'code' => 'FLAT500',
                'type' => 'flat',
                'value' => 500,
                'min' => 2500,
                'active' => true,
                'desc' => '₹500 flat discount on orders above ₹2,500'
            ]
        ];
    }

    public static function saveCoupons(array $coupons): bool {
        self::init();
        if (self::$usingDatabase && self::$pdo) {
            try {
                $json = json_encode($coupons, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
                $st = self::$pdo->prepare("
                    INSERT INTO auve_settings (setting_key, setting_value)
                    VALUES ('coupons', :val)
                    ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
                ");
                $st->execute([':val' => $json]);
            } catch (Throwable $e) {}
        }
        return self::writeJsonAtomic(self::$dataDir . '/coupons.json', $coupons);
    }

    // -------------------------------------------------------------
    // AUTH & INTEGRATIONS
    // -------------------------------------------------------------
    public static function getAuth(): array {
        self::init();
        $auth = [];
        $file = self::$dataDir . '/admin-auth.json';
        if (file_exists($file)) {
            $arr = json_decode(file_get_contents($file), true);
            if (is_array($arr)) $auth = $arr;
        }

        // Merge integrations from MySQL auve_settings if present
        if (self::$usingDatabase && self::$pdo) {
            try {
                $st = self::$pdo->prepare("SELECT setting_value FROM auve_settings WHERE setting_key = 'integrations'");
                $st->execute();
                $val = $st->fetchColumn();
                if ($val) {
                    $integ = json_decode($val, true);
                    if (is_array($integ) && !empty($integ)) {
                        $auth['integrations'] = array_merge($auth['integrations'] ?? [], $integ);
                    }
                }
            } catch (Throwable $e) {}
        }

        return $auth;
    }

    public static function saveAuth(array $auth): bool {
        self::init();
        if (self::$usingDatabase && self::$pdo && isset($auth['integrations'])) {
            try {
                $json = json_encode($auth['integrations'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
                $st = self::$pdo->prepare("
                    INSERT INTO auve_settings (setting_key, setting_value)
                    VALUES ('integrations', :val)
                    ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
                ");
                $st->execute([':val' => $json]);
            } catch (Throwable $e) {}
        }
        return self::writeJsonAtomic(self::$dataDir . '/admin-auth.json', $auth);
    }

    private static function writeJsonAtomic(string $file, $data): bool {
        $tmp = $file . '.tmp.' . bin2hex(random_bytes(6));
        $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        if (@file_put_contents($tmp, $json) !== false) {
            return @rename($tmp, $file);
        }
        return false;
    }
}
