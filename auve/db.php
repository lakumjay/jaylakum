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
                $stmt = self::$pdo->prepare("
                    INSERT INTO auve_orders 
                        (id, customer_name, customer_phone, customer_email, customer_address, city, state, pincode, 
                         items_count, subtotal, discount, total, promo_code, shipping_type, payment_method, payment_status,
                         razorpay_order_id, razorpay_payment_id, shipment_provider, shipment_awb, items_json, order_json)
                    VALUES 
                        (:id, :name, :phone, :email, :address, :city, :state, :pincode, 
                         :items_count, :subtotal, :discount, :total, :promo, :shipping, :payment_method, :payment_status,
                         :rz_order, :rz_pay, :sr_provider, :sr_awb, :items_json, :order_json)
                    ON DUPLICATE KEY UPDATE
                        payment_status = VALUES(payment_status),
                        razorpay_payment_id = VALUES(razorpay_payment_id),
                        shipment_provider = VALUES(shipment_provider),
                        shipment_awb = VALUES(shipment_awb),
                        order_json = VALUES(order_json)
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
                    ':payment_status' => $order['payment']['status'] ?? 'cod',
                    ':rz_order' => $order['payment']['razorpayOrderId'] ?? null,
                    ':rz_pay' => $order['payment']['razorpayPaymentId'] ?? null,
                    ':sr_provider' => $order['shipment']['provider'] ?? null,
                    ':sr_awb' => $order['shipment']['awb'] ?? null,
                    ':items_json' => json_encode($order['items'] ?? []),
                    ':order_json' => json_encode($order, JSON_UNESCAPED_UNICODE)
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
    // AUTH & INTEGRATIONS
    // -------------------------------------------------------------
    public static function getAuth(): array {
        self::init();
        $file = self::$dataDir . '/admin-auth.json';
        if (file_exists($file)) {
            $arr = json_decode(file_get_contents($file), true);
            if (is_array($arr)) return $arr;
        }
        return [];
    }

    public static function saveAuth(array $auth): bool {
        self::init();
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
