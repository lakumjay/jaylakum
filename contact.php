<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit;
}

// Receive form-data or JSON payload
$raw = file_get_contents('php://input');
$json = json_decode($raw, true);

// ==========================================
// 🛡️ ANTI-SPAM LAYER 1: Honeypot Trap
// ==========================================
$honeypot = trim($json['_hp_company_website_verify'] ?? $_POST['_hp_company_website_verify'] ?? '');
if (!empty($honeypot)) {
    // Silently reject bot submissions pretending success to trick scraper
    echo json_encode(['success' => true, 'message' => 'Your requirement has been received.']);
    exit;
}

// ==========================================
// 🛡️ ANTI-SPAM LAYER 2: Timestamp Verification
// ==========================================
$form_time = intval($json['_ts_token'] ?? $_POST['_ts_token'] ?? 0);
$now = time();
if ($form_time > 0 && ($now - $form_time < 3)) {
    // Submitted in less than 3 seconds (impossible for a human)
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Submission too fast. Please take your time to fill the form.']);
    exit;
}

// ==========================================
// 🛡️ ANTI-SPAM LAYER 3: Cloudflare Turnstile / reCAPTCHA Support (Optional Free API Key)
// ==========================================
$turnstile_token = trim($json['cf-turnstile-response'] ?? $_POST['cf-turnstile-response'] ?? '');
$turnstile_secret = getenv('TURNSTILE_SECRET_KEY') ?: ''; // Optional: set in cPanel environment if Turnstile used

if (!empty($turnstile_secret) && !empty($turnstile_token)) {
    $verify_url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
    $post_data = http_build_query([
        'secret' => $turnstile_secret,
        'response' => $turnstile_token,
        'remoteip' => $_SERVER['REMOTE_ADDR'] ?? ''
    ]);
    $opts = ['http' => ['method' => 'POST', 'header' => "Content-type: application/x-www-form-urlencoded\r\n", 'content' => $post_data, 'timeout' => 5]];
    $ctx = stream_context_create($opts);
    $verify_res = @file_get_contents($verify_url, false, $ctx);
    if ($verify_res) {
        $res_data = json_decode($verify_res, true);
        if (!$res_data['success']) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Security challenge failed. Please refresh and try again.']);
            exit;
        }
    }
}

// ==========================================
// Form Data Sanitization
// ==========================================
$lead_type    = strip_tags(trim($json['lead_type'] ?? $_POST['lead_type'] ?? 'contact_form'));
$name         = strip_tags(trim($json['name'] ?? $_POST['name'] ?? ''));
if (empty($name) && $lead_type === '3_minute_video_audit') {
    $name = 'Webshop Eigenaar (Video Audit)';
}
$email        = filter_var(trim($json['email'] ?? $_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL);
$website      = filter_var(trim($json['website'] ?? $_POST['website'] ?? ''), FILTER_SANITIZE_URL);
$platform     = strip_tags(trim($json['platform'] ?? $_POST['platform'] ?? ''));
$problem_type = strip_tags(trim($json['problem_type'] ?? $_POST['problem_type'] ?? ($lead_type === '3_minute_video_audit' ? "Gratis 3-Minuten Video Audit ($platform)" : 'General Inquiry')));
$budget       = strip_tags(trim($json['budget'] ?? $_POST['budget'] ?? 'Not Specified'));
$message      = strip_tags(trim($json['message'] ?? $_POST['message'] ?? ''));

// ==========================================
// 🛡️ ANTI-SPAM LAYER 4: Spam Heuristic / Blacklist Filter
// ==========================================
$combined_text = strtolower($name . ' ' . $message . ' ' . $website);
$spam_keywords = [
    'casino', 'poker', 'viagra', 'cialis', 'crypto', 'bitcoin', 'binance',
    'telegram.me', 't.me/', 'whatsapp +', 'seo service guaranteed',
    'backlink service', 'guest post outreach', 'adult', 'loan', 'dating'
];

foreach ($spam_keywords as $kw) {
    if (strpos($combined_text, $kw) !== false) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Your message contains prohibited spam keywords.']);
        exit;
    }
}

// Block Cyrillic/Russian spam bots often hitting EU forms
if (preg_match('/[\x{0400}-\x{04FF}]/u', $name . $message)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Non-Latin characters are not allowed.']);
    exit;
}

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Please provide a valid email address.']);
    exit;
}

if (empty($name)) {
    $name = 'Webshop Owner';
}

// ==========================================
// Dispatch Lead Email to Jay
// ==========================================
$to = 'lakumjay2000@gmail.com';
if ($lead_type === '3_minute_video_audit') {
    $subject = "🎥 [Video Audit Request] $platform: $website ($email)";
} else {
    $subject = "🔥 [Webshop Lead] $problem_type — Budget: $budget ($name)";
}

$email_content = "Hello Jay,\n\n"
               . "You have received a new verified client requirement from your website (jaylakum.com):\n\n"
               . "==================================================\n"
               . "Client Name:   $name\n"
               . "Client Email:  $email\n"
               . "Website URL:   $website\n"
               . "Service Need:  $problem_type\n"
               . "Client Budget: $budget\n"
               . "==================================================\n\n"
               . "Client Message / Store Problem:\n$message\n\n"
               . "--------------------------------------------------\n"
               . "Date:       " . date('r') . "\n"
               . "Client IP:  " . ($_SERVER['REMOTE_ADDR'] ?? 'Unknown') . "\n"
               . "User Agent: " . ($_SERVER['HTTP_USER_AGENT'] ?? 'Unknown') . "\n";

$headers  = "From: Jay Lakum Website <leads@jaylakum.com>\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

$sent = @mail($to, $subject, $email_content, $headers);

echo json_encode([
    'success' => true,
    'message' => 'Your requirement has been sent successfully! Jay will review your store and reply within 24 hours with an audit & quote.'
]);
