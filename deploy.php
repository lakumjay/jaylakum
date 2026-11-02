<?php
/**
 * Instant GitHub Webhook Auto-Deployment for jaylakum.com
 * Triggers a secure git pull whenever commits are pushed to GitHub.
 */

// 1. Define Secret Key (Only GitHub or Jay can trigger this)
$SECRET_KEY = 'JayLakumDeploy2026';

// 2. Authenticate Request
$provided_key = $_GET['key'] ?? $_POST['key'] ?? '';

// Check header secret if using GitHub webhook secret token
$hub_signature = $_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? '';
$is_authenticated = false;

if (!empty($provided_key) && hash_equals($SECRET_KEY, $provided_key)) {
    $is_authenticated = true;
} elseif (!empty($hub_signature)) {
    $payload = file_get_contents('php://input');
    $expected_sig = 'sha256=' . hash_hmac('sha256', $payload, $SECRET_KEY);
    if (hash_equals($expected_sig, $hub_signature)) {
        $is_authenticated = true;
    }
}

if (!$is_authenticated) {
    http_response_code(403);
    header('Content-Type: application/json');
    die(json_encode([
        'status' => 'error',
        'message' => 'Unauthorized: Invalid secret key or signature.'
    ]));
}

header('Content-Type: application/json');

// 3. Execute Git Pull
$output = [];
$return_code = 0;

// Execute git pull in repository directory
exec('git pull origin main 2>&1', $output, $return_code);

if ($return_code !== 0) {
    // Fallback to explicit /usr/bin/git if standard path is restricted in apache environment
    $output_fallback = [];
    exec('/usr/bin/git pull origin main 2>&1', $output_fallback, $return_code_fallback);
    if ($return_code_fallback === 0) {
        $output = $output_fallback;
        $return_code = 0;
    }
}

$response = [
    'status' => ($return_code === 0) ? 'success' : 'warning',
    'return_code' => $return_code,
    'message' => ($return_code === 0) ? 'Website auto-updated successfully from GitHub main branch!' : 'Git pull returned a non-zero exit code.',
    'output' => $output,
    'server_time' => date('Y-m-d H:i:s T')
];

echo json_encode($response, JSON_PRETTY_PRINT);
