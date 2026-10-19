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

$name         = strip_tags(trim($json['name'] ?? $_POST['name'] ?? ''));
$email        = filter_var(trim($json['email'] ?? $_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL);
$website      = filter_var(trim($json['website'] ?? $_POST['website'] ?? ''), FILTER_SANITIZE_URL);
$problem_type = strip_tags(trim($json['problem_type'] ?? $_POST['problem_type'] ?? 'General Inquiry'));
$message      = strip_tags(trim($json['message'] ?? $_POST['message'] ?? ''));

if (empty($name) || empty($email) || empty($message)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Please fill in your name, email, and message.']);
    exit;
}

$to = 'lakumjay2000@gmail.com';
$subject = "🔥 New Webshop Lead from jaylakum.com: $problem_type ($name)";

$email_content = "Hello Jay,\n\n"
               . "You have received a new client requirement from your website (jaylakum.com):\n\n"
               . "--------------------------------------------------\n"
               . "Client Name:  $name\n"
               . "Client Email: $email\n"
               . "Website URL:  $website\n"
               . "Service Type: $problem_type\n"
               . "--------------------------------------------------\n\n"
               . "Problem Description:\n$message\n\n"
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
    'message' => 'Your requirement has been sent successfully! Jay will review your store and reply within 24 hours.'
]);
