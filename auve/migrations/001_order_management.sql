-- AUVÉ Order Management — Migration 001 (Phase 1)
-- Applied automatically by AuveStorage::runOrderMigrations() in db.php
-- (guarded by auve_settings.schema_version = '001'). This file is the
-- documented, reviewable copy of the same DDL.
--
-- Money rule (enforced by AuveStorage::orderMoney + POST /api/orders):
--   total = subtotal - discount + shipping + cod_fee
--   All money stored on the order in integer paise (order.money).
--   GST is INCLUDED in product prices; order.money.tax / totals.tax is
--   the GST portion inside the total, never added on top.
--
-- Note: auve_orders.payment_status already existed as a legacy column.
-- From this migration it stores the NORMALISED payment status
-- (pending / paid / failed / refunded / partially_refunded /
--  cod_pending / cod_collected). The raw gateway-era status string
-- ('cod', 'test_mode', 'payment_pending') remains inside order_json.

CREATE TABLE IF NOT EXISTS auve_order_events (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS auve_payments (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS auve_refunds (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS auve_shipments (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS auve_shipment_events (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS auve_returns (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS auve_notifications_log (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS auve_webhook_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    provider VARCHAR(24) NOT NULL,
    event_id VARCHAR(96) NOT NULL,
    event_type VARCHAR(64) NOT NULL,
    payload_json LONGTEXT NULL,
    processed TINYINT NOT NULL DEFAULT 0,
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_event (provider, event_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Lifecycle columns on the orders table
ALTER TABLE auve_orders ADD COLUMN order_status VARCHAR(32) NOT NULL DEFAULT 'confirmed';
ALTER TABLE auve_orders ADD COLUMN shipment_status VARCHAR(32) NOT NULL DEFAULT 'not_created';
ALTER TABLE auve_orders ADD COLUMN is_test TINYINT NOT NULL DEFAULT 0;

-- Backfill (run once by db.php): every existing order gets totals.codFee,
-- totals.tax, the paise breakup in order_json.money, and the lifecycle
-- fields orderStatus / paymentStatus / shipmentStatus / isTest, mirrored
-- into the columns above. AUV10001 repaired by this backfill:
-- subtotal 5780, promo (WELCOME10) 578, shipping 0, codFee 0,
-- tax (18% included) 793.53, total 5202 — money.total = 520200 paise.
