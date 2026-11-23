-- ============================================================================
-- AUVÉ Dynamic Footwear Store — Database Schema & Initial Data
-- phpMyAdmin / MySQL Import File
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- ----------------------------------------------------------------------------
-- Table: auve_products
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `auve_products`;
CREATE TABLE `auve_products` (
  `id` varchar(100) NOT NULL,
  `name` varchar(255) NOT NULL,
  `coll` varchar(50) NOT NULL DEFAULT 'barely',
  `type` varchar(100) NOT NULL DEFAULT 'Flats',
  `price` int(11) NOT NULL DEFAULT 0,
  `description` text DEFAULT NULL,
  `tag` varchar(100) DEFAULT NULL,
  `cover` varchar(255) DEFAULT NULL,
  `cover2` varchar(255) DEFAULT NULL,
  `sold_out` text DEFAULT NULL,
  `details` text DEFAULT NULL,
  `variants` longtext DEFAULT NULL,
  `raw_json` longtext NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_coll` (`coll`),
  KEY `idx_sort` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: auve_orders
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `auve_orders`;
CREATE TABLE `auve_orders` (
  `id` varchar(50) NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `customer_phone` varchar(50) NOT NULL,
  `customer_email` varchar(255) NOT NULL,
  `customer_address` text NOT NULL,
  `city` varchar(100) NOT NULL,
  `state` varchar(100) NOT NULL,
  `pincode` varchar(20) NOT NULL,
  `items_count` int(11) NOT NULL DEFAULT 1,
  `subtotal` decimal(10,2) NOT NULL DEFAULT 0.00,
  `discount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `promo_code` varchar(50) DEFAULT NULL,
  `shipping_type` varchar(50) NOT NULL DEFAULT 'standard',
  `payment_method` varchar(50) NOT NULL DEFAULT 'cod',
  `payment_status` varchar(50) NOT NULL DEFAULT 'cod',
  `razorpay_order_id` varchar(100) DEFAULT NULL,
  `razorpay_payment_id` varchar(100) DEFAULT NULL,
  `shipment_provider` varchar(50) DEFAULT NULL,
  `shipment_awb` varchar(100) DEFAULT NULL,
  `items_json` longtext DEFAULT NULL,
  `order_json` longtext NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_created` (`created_at`),
  KEY `idx_payment_status` (`payment_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: auve_settings
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `auve_settings`;
CREATE TABLE `auve_settings` (
  `setting_key` varchar(100) NOT NULL,
  `setting_value` longtext NOT NULL,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: auve_admins
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `auve_admins`;
CREATE TABLE `auve_admins` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `recovery_hash` varchar(255) DEFAULT NULL,
  `token` varchar(255) DEFAULT NULL,
  `token_expires` datetime DEFAULT NULL,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Initial Admin Record (Default password: CHANGE-ME-auve-admin)
-- ----------------------------------------------------------------------------
INSERT INTO `auve_admins` (`username`, `password_hash`) VALUES ('admin', 'CHANGE-ME-auve-admin');

-- ----------------------------------------------------------------------------
-- Initial Settings
-- ----------------------------------------------------------------------------
INSERT INTO `auve_settings` (`setting_key`, `setting_value`) VALUES
('design', '{"backgroundColor":"#1B1A34","bodySize":null,"buttonColor":"#F3E6D8","buttonTextColor":"#1B1A34","fontPreset":"classic","headingSize":null,"primaryColor":"#F3E6D8"}'),
('content', '{"announcementOn":true,"announcementText":"Free shipping across India on all orders","bestsellersHeading":"Bestsellers","festiveHeading":"Festive collection","heroDesktopImage":"assets/hero-desktop.jpg","heroHeading1":"Step In.","heroHeading2":"Stand Out.","heroMobileImage":"assets/hero-mobile.jpg"}'),
('sections', '{"bestsellers":true,"collections":true,"craftBanner":true,"festive":true,"hero":true,"newsletter":true,"reels":true}'),
('integrations', '{}');

-- ----------------------------------------------------------------------------
-- Initial Products (19 catalogue products)
-- ----------------------------------------------------------------------------
INSERT INTO `auve_products` (`id`, `name`, `coll`, `type`, `price`, `description`, `tag`, `cover`, `cover2`, `sold_out`, `details`, `variants`, `raw_json`, `sort_order`) VALUES
('whisper', 'Whisper', 'barely', 'Flats', 2190, 'A soft brown pair made to keep things simple. Whisper is easy to wear and style, and goes with just about everything.', 'Bestseller', 'assets/p/bn-whisperivory-1.jpg', 'assets/p/bn-whisperivory-2.jpg', '[35]', '[["Toe","Round toe"],["Heel height","Flat"],["Heel type","Flat"]]', '[{"name":"Brown","sw":"#7A4A2E","imgs":["assets/p/bn-whisper-1.jpg","assets/p/bn-whisper-2.jpg","assets/p/bn-whisper-3.jpg"]},{"name":"Beige","sw":"#E8DFD2","imgs":["assets/p/bn-whisperivory-1.jpg","assets/p/bn-whisperivory-2.jpg"],"desc":"A soft white pair made to keep things simple. Whisper is easy to wear and style, and goes with just about everything."}]', '{"id":"whisper","name":"Whisper","coll":"barely","type":"Flats","price":2190,"desc":"A soft brown pair made to keep things simple. Whisper is easy to wear and style, and goes with just about everything.","variants":[{"name":"Brown","sw":"#7A4A2E","imgs":["assets/p/bn-whisper-1.jpg","assets/p/bn-whisper-2.jpg","assets/p/bn-whisper-3.jpg"]},{"name":"Beige","sw":"#E8DFD2","imgs":["assets/p/bn-whisperivory-1.jpg","assets/p/bn-whisperivory-2.jpg"],"desc":"A soft white pair made to keep things simple. Whisper is easy to wear and style, and goes with just about everything."}],"soldOut":[35],"tag":"Bestseller","details":[["Toe","Round toe"],["Heel height","Flat"],["Heel type","Flat"]],"cover":"assets/p/bn-whisperivory-1.jpg","cover2":"assets/p/bn-whisperivory-2.jpg"}', 1),
('muse', 'Muse', 'barely', 'Heels', 2590, 'A soft blue pair with delicate straps in pastel shades. The slim, layered straps add just enough colour and detail while keeping the overall look clean and understated.', 'New', 'assets/p/bn-muse-1.jpg', NULL, '[35]', '[["Toe","Square toe"],["Heel height","1 inch"],["Heel type","Block heel"]]', '[{"name":"Soft blue","sw":"#BFC6DE","imgs":["assets/p/bn-muse-1.jpg","assets/p/bn-muse-2.jpg","assets/p/bn-muse-3.jpg"]}]', '{"id":"muse","name":"Muse","coll":"barely","type":"Heels","price":2590,"desc":"A soft blue pair with delicate straps in pastel shades. The slim, layered straps add just enough colour and detail while keeping the overall look clean and understated.","variants":[{"name":"Soft blue","sw":"#BFC6DE","imgs":["assets/p/bn-muse-1.jpg","assets/p/bn-muse-2.jpg","assets/p/bn-muse-3.jpg"]}],"soldOut":[35],"tag":"New","details":[["Toe","Square toe"],["Heel height","1 inch"],["Heel type","Block heel"]],"cover":"assets/p/bn-muse-1.jpg"}', 2),
('soft-focus', 'Soft Focus', 'barely', 'Slides', 2290, 'A soft beige pair with a simple bow detail at the front. The thin straps add a delicate touch while keeping the look clean and easy to wear.', NULL, 'assets/p/bn-softfocus-2.jpg', NULL, '[35]', '[["Toe","Square toe"],["Heel height","Flat"],["Heel type","Flat"]]', '[{"name":"Beige","sw":"#E9DCC2","imgs":["assets/p/bn-softfocus-1.jpg","assets/p/bn-softfocus-2.jpg","assets/p/bn-softfocus-3.jpg"]}]', '{"id":"soft-focus","name":"Soft Focus","coll":"barely","type":"Slides","price":2290,"desc":"A soft beige pair with a simple bow detail at the front. The thin straps add a delicate touch while keeping the look clean and easy to wear.","variants":[{"name":"Beige","sw":"#E9DCC2","imgs":["assets/p/bn-softfocus-1.jpg","assets/p/bn-softfocus-2.jpg","assets/p/bn-softfocus-3.jpg"]}],"soldOut":[35],"cover":"assets/p/bn-softfocus-2.jpg","details":[["Toe","Square toe"],["Heel height","Flat"],["Heel type","Flat"]]}', 3),
('dune', 'Dune', 'barely', 'Slides', 2290, 'A beige pair that keeps things simple, with a little extra. The knotted straps bring texture and detail to an otherwise effortless everyday sandal.', NULL, 'assets/p/bn-dune-2.jpg', NULL, '[35]', '[["Toe","Square toe"],["Heel height","Flat"],["Heel type","Flat"]]', '[{"name":"Beige","sw":"#CDB088","imgs":["assets/p/bn-dune-1.jpg","assets/p/bn-dune-2.jpg","assets/p/bn-dune-3.jpg"]}]', '{"id":"dune","name":"Dune","coll":"barely","type":"Slides","price":2290,"desc":"A beige pair that keeps things simple, with a little extra. The knotted straps bring texture and detail to an otherwise effortless everyday sandal.","variants":[{"name":"Beige","sw":"#CDB088","imgs":["assets/p/bn-dune-1.jpg","assets/p/bn-dune-2.jpg","assets/p/bn-dune-3.jpg"]}],"soldOut":[35],"cover":"assets/p/bn-dune-2.jpg","details":[["Toe","Square toe"],["Heel height","Flat"],["Heel type","Flat"]]}', 4),
('daydream-b', 'Day Dream', 'barely', 'Slides', 2290, 'A soft pink pair with a simple bow detail at the front. The thin straps add a delicate touch while keeping the look clean and easy to wear.', NULL, 'assets/p/bn-daydream-2.jpg', NULL, '[35]', '[["Toe","Square toe"],["Heel height","Flat"],["Heel type","Flat"]]', '[{"name":"Pink","sw":"#E2C6C4","imgs":["assets/p/bn-daydream-1.jpg","assets/p/bn-daydream-2.jpg"]},{"name":"Lilac","sw":"#CFC3D6","imgs":["assets/p/bn-daydream-3.jpg"],"desc":"A soft lilac pair with a simple bow detail at the front. The thin straps add a delicate touch while keeping the look clean and easy to wear."}]', '{"id":"daydream-b","name":"Day Dream","coll":"barely","type":"Slides","price":2290,"desc":"A soft pink pair with a simple bow detail at the front. The thin straps add a delicate touch while keeping the look clean and easy to wear.","variants":[{"name":"Pink","sw":"#E2C6C4","imgs":["assets/p/bn-daydream-1.jpg","assets/p/bn-daydream-2.jpg"]},{"name":"Lilac","sw":"#CFC3D6","imgs":["assets/p/bn-daydream-3.jpg"],"desc":"A soft lilac pair with a simple bow detail at the front. The thin straps add a delicate touch while keeping the look clean and easy to wear."}],"soldOut":[35],"cover":"assets/p/bn-daydream-2.jpg","details":[["Toe","Square toe"],["Heel height","Flat"],["Heel type","Flat"]]}', 5),
('trace', 'Trace', 'barely', 'Heels', 2590, 'A sleek black pair with delicate straps and a 1.5-inch block heel. Trace keeps the look minimal, with just enough structure to make it stand out.', NULL, NULL, NULL, '[35]', '[["Toe","Square toe"],["Heel height","1.5 inch"],["Heel type","Block heel"]]', '[{"name":"Black","sw":"#1C1B1D","imgs":["assets/p/bn-trace-1.jpg","assets/p/bn-trace-2.jpg","assets/p/bn-trace-3.jpg"]}]', '{"id":"trace","name":"Trace","coll":"barely","type":"Heels","price":2590,"desc":"A sleek black pair with delicate straps and a 1.5-inch block heel. Trace keeps the look minimal, with just enough structure to make it stand out.","variants":[{"name":"Black","sw":"#1C1B1D","imgs":["assets/p/bn-trace-1.jpg","assets/p/bn-trace-2.jpg","assets/p/bn-trace-3.jpg"]}],"soldOut":[35],"details":[["Toe","Square toe"],["Heel height","1.5 inch"],["Heel type","Block heel"]]}', 6),
('twine', 'Twine', 'barely', 'Slides', 2290, 'Fine knotted tubular straps on a square-toe flat slide.', 'New', 'assets/p/bn-twinesilver-1.jpg', 'assets/p/bn-twinesilver-3.jpg', '[35]', '[["Toe","Square toe"],["Heel height","Flat"],["Heel type","Flat"]]', '[{"name":"Pink","sw":"#E4B7AE","imgs":["assets/p/bn-twine-1.jpg","assets/p/bn-twine-2.jpg","assets/p/bn-twine-3.jpg"]},{"name":"Silver","sw":"#C8CACE","imgs":["assets/p/bn-twinesilver-1.jpg","assets/p/bn-twinesilver-2.jpg","assets/p/bn-twinesilver-3.jpg"]}]', '{"id":"twine","name":"Twine","coll":"barely","type":"Slides","price":2290,"desc":"Fine knotted tubular straps on a square-toe flat slide.","variants":[{"name":"Pink","sw":"#E4B7AE","imgs":["assets/p/bn-twine-1.jpg","assets/p/bn-twine-2.jpg","assets/p/bn-twine-3.jpg"]},{"name":"Silver","sw":"#C8CACE","imgs":["assets/p/bn-twinesilver-1.jpg","assets/p/bn-twinesilver-2.jpg","assets/p/bn-twinesilver-3.jpg"]}],"soldOut":[35],"tag":"New","cover":"assets/p/bn-twinesilver-1.jpg","details":[["Toe","Square toe"],["Heel height","Flat"],["Heel type","Flat"]],"cover2":"assets/p/bn-twinesilver-3.jpg"}', 7),
('desert-sand', 'Desert Sand', 'gilded', 'Flats', 2490, 'Tan flat with a gold chain running from toe to ankle.', NULL, NULL, NULL, '[35]', '[["Heel type","Flat"]]', '[{"name":"Tan & gold","sw":"#C46A3C","imgs":["assets/p/gd-desertsand-1.jpg","assets/p/gd-desertsand-2.jpg"]}]', '{"id":"desert-sand","name":"Desert Sand","coll":"gilded","type":"Flats","price":2490,"desc":"Tan flat with a gold chain running from toe to ankle.","variants":[{"name":"Tan & gold","sw":"#C46A3C","imgs":["assets/p/gd-desertsand-1.jpg","assets/p/gd-desertsand-2.jpg"]}],"soldOut":[35],"details":[["Heel type","Flat"]]}', 8),
('eclipse', 'Eclipse', 'gilded', 'Flats', 2490, 'The gold-chain flat in deep black, sharp enough for evenings.', NULL, NULL, NULL, '[35]', '[["Heel type","Flat"]]', '[{"name":"Black & gold","sw":"#1E1B1E","imgs":["assets/p/gd-eclipse-1.jpg","assets/p/gd-eclipse-2.jpg","assets/p/gd-eclipse-3.jpg"]}]', '{"id":"eclipse","name":"Eclipse","coll":"gilded","type":"Flats","price":2490,"desc":"The gold-chain flat in deep black, sharp enough for evenings.","variants":[{"name":"Black & gold","sw":"#1E1B1E","imgs":["assets/p/gd-eclipse-1.jpg","assets/p/gd-eclipse-2.jpg","assets/p/gd-eclipse-3.jpg"]}],"soldOut":[35],"details":[["Heel type","Flat"]]}', 9),
('poise', 'Poise', 'gilded', 'Heels', 2890, 'Ivory block heel with a gold chain at the ankle.', 'New', 'assets/p/poise-hd.jpg', 'assets/p/poise-wear.jpg', '[35]', '[["Heel type","Block heel"]]', '[{"name":"Ivory & gold","sw":"#F1EBDF","imgs":["assets/p/gd-poise-2.jpg","assets/p/gd-poise-3.jpg","assets/p/poise-hd.jpg"]}]', '{"id":"poise","name":"Poise","coll":"gilded","type":"Heels","price":2890,"desc":"Ivory block heel with a gold chain at the ankle.","variants":[{"name":"Ivory & gold","sw":"#F1EBDF","imgs":["assets/p/gd-poise-2.jpg","assets/p/gd-poise-3.jpg","assets/p/poise-hd.jpg"]}],"soldOut":[35],"tag":"New","details":[["Heel type","Block heel"]],"cover":"assets/p/poise-hd.jpg","cover2":"assets/p/poise-wear.jpg"}', 10),
('solace', 'Solace', 'gilded', 'Flats', 2490, 'Black flat, oxblood ankle strap and a polished gold disc at the toe.', NULL, 'assets/p/gd-solace-2.jpg', 'assets/p/gd-solace-1.jpg', '[35]', '[["Heel type","Flat"]]', '[{"name":"Black & oxblood","sw":"#2A1A1E","imgs":["assets/p/gd-solace-1.jpg","assets/p/gd-solace-2.jpg","assets/p/gd-solace-3.jpg"]}]', '{"id":"solace","name":"Solace","coll":"gilded","type":"Flats","price":2490,"desc":"Black flat, oxblood ankle strap and a polished gold disc at the toe.","variants":[{"name":"Black & oxblood","sw":"#2A1A1E","imgs":["assets/p/gd-solace-1.jpg","assets/p/gd-solace-2.jpg","assets/p/gd-solace-3.jpg"]}],"soldOut":[35],"details":[["Heel type","Flat"]],"cover":"assets/p/gd-solace-2.jpg","cover2":"assets/p/gd-solace-1.jpg"}', 11),
('champagne', 'Champagne', 'gilded', 'Heels', 2890, 'Champagne-gold block heel with soft knotted straps.', NULL, 'assets/p/gd-champagne-1.jpg', 'assets/p/champagne-feet.jpg', '[35]', '[["Heel type","Block heel"]]', '[{"name":"Champagne","sw":"#E6D3B0","imgs":["assets/p/gd-champagne-1.jpg","assets/p/gd-champagne-2.jpg","assets/p/gd-champagne-3.jpg"]}]', '{"id":"champagne","name":"Champagne","coll":"gilded","type":"Heels","price":2890,"desc":"Champagne-gold block heel with soft knotted straps.","variants":[{"name":"Champagne","sw":"#E6D3B0","imgs":["assets/p/gd-champagne-1.jpg","assets/p/gd-champagne-2.jpg","assets/p/gd-champagne-3.jpg"]}],"soldOut":[35],"details":[["Heel type","Block heel"]],"cover":"assets/p/gd-champagne-1.jpg","cover2":"assets/p/champagne-feet.jpg"}', 12),
('heirloom', 'Heirloom', 'veil', 'Heels', 3290, 'Emerald brocade, a gold bloom and a gold block heel. Born from wanting to wear your mother\'s footwear.', 'Bestseller', 'assets/p/heirloom-right.jpg', 'assets/p/v-05.jpg', '[35]', '[["Heel type","Block heel"]]', '[{"name":"Emerald brocade","sw":"#1F8F7A","imgs":["assets/p/s-heirloom.jpg","assets/p/v-04.jpg","assets/p/v-02.jpg","assets/p/v-16.jpg"]}]', '{"id":"heirloom","name":"Heirloom","coll":"veil","type":"Heels","price":3290,"desc":"Emerald brocade, a gold bloom and a gold block heel. Born from wanting to wear your mother\'s footwear.","variants":[{"name":"Emerald brocade","sw":"#1F8F7A","imgs":["assets/p/s-heirloom.jpg","assets/p/v-04.jpg","assets/p/v-02.jpg","assets/p/v-16.jpg"]}],"soldOut":[35],"tag":"Bestseller","cover":"assets/p/heirloom-right.jpg","details":[["Heel type","Block heel"]],"cover2":"assets/p/v-05.jpg"}', 13),
('daydream-v', 'Day Dream', 'veil', 'Heels', 3190, 'Rose-shimmer double-band mule on a slim heel.', NULL, 'assets/p/daydreamv-peach.jpg', 'assets/p/v-06.jpg', '[35]', '[["Heel type","Slim heel"]]', '[{"name":"Rose shimmer","sw":"#E7BFAE","imgs":["assets/p/s-daydreamv.jpg","assets/p/v-06.jpg","assets/p/v-07.jpg"]},{"name":"Ivory & tan","sw":"#1B1A1C","imgs":["assets/p/s-daydreamv-ivory.jpg"]}]', '{"id":"daydream-v","name":"Day Dream","coll":"veil","type":"Heels","price":3190,"desc":"Rose-shimmer double-band mule on a slim heel.","variants":[{"name":"Rose shimmer","sw":"#E7BFAE","imgs":["assets/p/s-daydreamv.jpg","assets/p/v-06.jpg","assets/p/v-07.jpg"]},{"name":"Ivory & tan","sw":"#1B1A1C","imgs":["assets/p/s-daydreamv-ivory.jpg"]}],"soldOut":[35],"cover":"assets/p/daydreamv-peach.jpg","details":[["Heel type","Slim heel"]],"cover2":"assets/p/v-06.jpg"}', 14),
('first-look', 'First Look', 'veil', 'Wedges', 3490, 'Red-and-gold brocade knot on a gold wedge. Made for the long day.', 'New', 'assets/p/firstlook-feet-right.jpg', 'assets/p/v-08.jpg', '[35,41]', '[["Heel type","Wedge"]]', '[{"name":"Red & gold","sw":"#B3262E","imgs":["assets/p/s-firstlook.jpg","assets/p/v-09.jpg","assets/p/v-08.jpg"]}]', '{"id":"first-look","name":"First Look","coll":"veil","type":"Wedges","price":3490,"desc":"Red-and-gold brocade knot on a gold wedge. Made for the long day.","variants":[{"name":"Red & gold","sw":"#B3262E","imgs":["assets/p/s-firstlook.jpg","assets/p/v-09.jpg","assets/p/v-08.jpg"]}],"soldOut":[35,41],"tag":"New","cover":"assets/p/firstlook-feet-right.jpg","details":[["Heel type","Wedge"]],"cover2":"assets/p/v-08.jpg"}', 15),
('ever-after', 'Ever After (Round Toe)', 'veil', 'Heels', 2690, 'Maroon velvet thong sandal with a round toe, on a kitten heel.', NULL, 'assets/p/s-everafter-2.jpg', NULL, '[35]', '[["Toe","Round toe"],["Heel type","Kitten heel"]]', '[{"name":"Maroon","sw":"#7C1B2A","imgs":["assets/p/s-everafter.jpg","assets/p/s-everafter-2.jpg"]}]', '{"id":"ever-after","name":"Ever After (Round Toe)","coll":"veil","type":"Heels","price":2690,"desc":"Maroon velvet thong sandal with a round toe, on a kitten heel.","variants":[{"name":"Maroon","sw":"#7C1B2A","imgs":["assets/p/s-everafter.jpg","assets/p/s-everafter-2.jpg"]}],"soldOut":[35],"cover":"assets/p/s-everafter-2.jpg","details":[["Toe","Round toe"],["Heel type","Kitten heel"]]}', 16),
('ever-after-square', 'Ever After (Square Toe)', 'veil', 'Heels', 2690, 'Maroon velvet thong sandal with a square toe, on a kitten heel.', NULL, NULL, NULL, '[35]', '[["Toe","Square toe"],["Heel type","Kitten heel"]]', '[{"name":"Maroon","sw":"#7C1B2A","imgs":["assets/p/s-everafter-red.jpg","assets/p/v-12.jpg"]}]', '{"id":"ever-after-square","name":"Ever After (Square Toe)","coll":"veil","type":"Heels","price":2690,"desc":"Maroon velvet thong sandal with a square toe, on a kitten heel.","variants":[{"name":"Maroon","sw":"#7C1B2A","imgs":["assets/p/s-everafter-red.jpg","assets/p/v-12.jpg"]}],"soldOut":[35],"details":[["Toe","Square toe"],["Heel type","Kitten heel"]]}', 17),
('after-glow', 'After Glow', 'veil', 'Heels', 2690, 'Champagne metallic thong on a low block heel.', NULL, 'assets/p/afterglow-peach.jpg', NULL, '[35]', '[["Heel type","Block heel"]]', '[{"name":"Champagne gold","sw":"#CDB58C","imgs":["assets/p/s-goldenhour.jpg"]},{"name":"Black","sw":"#1B1A1C","imgs":["assets/p/s-goldenhour-black.jpg"]}]', '{"id":"after-glow","name":"After Glow","coll":"veil","type":"Heels","price":2690,"desc":"Champagne metallic thong on a low block heel.","variants":[{"name":"Champagne gold","sw":"#CDB58C","imgs":["assets/p/s-goldenhour.jpg"]},{"name":"Black","sw":"#1B1A1C","imgs":["assets/p/s-goldenhour-black.jpg"]}],"soldOut":[35],"details":[["Heel type","Block heel"]],"cover":"assets/p/afterglow-peach.jpg"}', 18),
('golden-hour', 'Golden Hour', 'veil', 'Heels', 2690, 'Antique gold thong on a low heel. The pair to dance in.', NULL, 'assets/p/gh-model.jpg', 'assets/p/gh-held.jpg', '[35]', '[["Heel type","Low heel"]]', '[{"name":"Antique gold","sw":"#C9B188","imgs":["assets/p/gh-top.jpg","assets/p/gh-held.jpg","assets/p/gh-model.jpg"]}]', '{"id":"golden-hour","name":"Golden Hour","coll":"veil","type":"Heels","price":2690,"desc":"Antique gold thong on a low heel. The pair to dance in.","variants":[{"name":"Antique gold","sw":"#C9B188","imgs":["assets/p/gh-top.jpg","assets/p/gh-held.jpg","assets/p/gh-model.jpg"]}],"soldOut":[35],"cover":"assets/p/gh-model.jpg","details":[["Heel type","Low heel"]],"cover2":"assets/p/gh-held.jpg"}', 19);

SET FOREIGN_KEY_CHECKS = 1;
