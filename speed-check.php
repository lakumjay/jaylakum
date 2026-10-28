<?php
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');

$url = trim($_GET['url'] ?? $_POST['url'] ?? '');
if (empty($url)) {
    http_response_code(400);
    echo json_encode(['error' => 'Please provide a valid webshop URL.']);
    exit;
}

if (!preg_match('~^https?://~i', $url)) {
    $url = 'https://' . $url;
}

$parsed = parse_url($url);
if (!$parsed || empty($parsed['host'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid webshop URL format.']);
    exit;
}

$host = $parsed['host'];

// Perform live measurement
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_MAXREDIRS, 4);
curl_setopt($ch, CURLOPT_TIMEOUT, 12);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1 GooglePageSpeed');

$start = microtime(true);
$html = curl_exec($ch);
$duration = microtime(true) - $start;

$info = curl_getinfo($ch);
$http_code = $info['http_code'] ?? 0;
$total_time = $info['total_time'] ?? $duration;
$namelookup_time = $info['namelookup_time'] ?? 0.05;
$connect_time = $info['connect_time'] ?? 0.1;
$starttransfer_time = $info['starttransfer_time'] ?? 0.4;
$size_download = $info['size_download'] ?? strlen((string)$html);
curl_close($ch);

if ($http_code < 200 || $http_code >= 400 || empty($html)) {
    http_response_code(422);
    echo json_encode(['error' => "Could not reach $host (HTTP $http_code). Please ensure the store is publicly accessible."]);
    exit;
}

// Analyze HTML complexity
$script_count = substr_count(strtolower($html), '<script');
$img_count = substr_count(strtolower($html), '<img');
$link_count = substr_count(strtolower($html), '<link');
$is_shopify = (stripos($html, 'cdn.shopify.com') !== false || stripos($html, 'Shopify.theme') !== false);
$is_woocommerce = (stripos($html, 'woocommerce') !== false || stripos($html, 'wc-ajax') !== false);

$platform = 'Custom E-Commerce';
if ($is_shopify) $platform = 'Shopify';
elseif ($is_woocommerce) $platform = 'WooCommerce / WordPress';

// Realistic Mobile LCP estimation based on TTFB, script density, and page payload
$simulated_mobile_network_factor = 2.4; // 4G throttling factor
$ttfb = round($starttransfer_time, 2);
$est_lcp = round(max(1.8, ($ttfb * 1.8) + ($script_count * 0.04) + ($size_download / 500000) * 1.2), 1);

// Score formula
$score = 100;
if ($est_lcp > 2.5) $score -= intval(($est_lcp - 2.5) * 16);
if ($script_count > 25) $score -= intval(($script_count - 25) * 0.7);
if ($ttfb > 0.8) $score -= intval(($ttfb - 0.8) * 15);
$score = max(28, min(94, $score));

$status_label = ($score >= 90) ? 'Good (Fast)' : (($score >= 50) ? 'Needs Improvement' : 'Poor (High Drop-off)');
$status_color = ($score >= 90) ? '#2ecc71' : (($score >= 50) ? '#e67e22' : '#e74c3c');

echo json_encode([
    'success' => true,
    'url' => $url,
    'host' => $host,
    'platform' => $platform,
    'score' => $score,
    'status_label' => $status_label,
    'status_color' => $status_color,
    'lcp' => $est_lcp . 's',
    'ttfb' => $ttfb . 's',
    'scripts' => $script_count,
    'images' => $img_count,
    'page_size_kb' => round($size_download / 1024),
    'share_text' => "My store ($host) scored $score/100 on mobile speed (LCP: {$est_lcp}s). Tested with Jay Lakum's speed checker: https://jaylakum.com/#speed-checker"
]);
exit;
