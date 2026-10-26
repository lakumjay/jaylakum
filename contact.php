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
if ($form_time > 0 && ($now - $form_time >= 0) && ($now - $form_time < 1)) {
    // Submitted in less than 3 seconds (impossible for a human)
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Submission too fast. Please take your time to fill the form.']);
    exit;
}

// ==========================================
// 🛡️ ANTI-SPAM LAYER 3: Google reCAPTCHA / Cloudflare Turnstile Support
// ==========================================
$recaptcha_token  = trim($json['g-recaptcha-response'] ?? $_POST['g-recaptcha-response'] ?? '');
$recaptcha_secret = getenv('RECAPTCHA_SECRET_KEY') ?: '6LdWFgluAAAAAIWLGOoAQy_fRCviHgqDh1sYh1eS';

if (!empty($recaptcha_secret) && !empty($recaptcha_token)) {
    $verify_url = 'https://www.google.com/recaptcha/api/siteverify';
    $post_data = http_build_query([
        'secret' => $recaptcha_secret,
        'response' => $recaptcha_token,
        'remoteip' => $_SERVER['REMOTE_ADDR'] ?? ''
    ]);
    $verify_res = false;
    if (function_exists('curl_init')) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $verify_url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 6);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        $verify_res = curl_exec($ch);
        curl_close($ch);
    }
    if (!$verify_res) {
        $opts = ['http' => ['method' => 'POST', 'header' => "Content-type: application/x-www-form-urlencoded\r\n", 'content' => $post_data, 'timeout' => 5]];
        $ctx = stream_context_create($opts);
        $verify_res = @file_get_contents($verify_url, false, $ctx);
    }
    if ($verify_res) {
        $res_data = json_decode($verify_res, true);
        if (!$res_data['success']) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Google reCAPTCHA verification failed. Please try again.']);
            exit;
        }
    }
}

$turnstile_token  = trim($json['cf-turnstile-response'] ?? $_POST['cf-turnstile-response'] ?? '');
$turnstile_secret = getenv('TURNSTILE_SECRET_KEY') ?: '';

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

$lead_title  = ($lead_type === '3_minute_video_audit') ? '🎥 Nieuwe 3-Minuten Video Audit Aanvraag' : '🔥 Nieuwe Klantaanvraag (jaylakum.com)';
$badge_color = ($lead_type === '3_minute_video_audit') ? '#2e7d32' : '#dca10d';
$badge_bg    = ($lead_type === '3_minute_video_audit') ? '#e8f5e9' : '#fff8e7';

$html_content = '<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>' . htmlspecialchars($subject) . '</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,Helvetica,Arial,sans-serif;color:#1e293b;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f1f5f9;padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:600px;background-color:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 6px 24px rgba(0,0,0,0.06);border:1px solid #e2e8f0;">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg, #18181b 0%, #27272a 100%);padding:28px 32px;text-align:left;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="display:inline-block;background-color:' . $badge_bg . ';color:' . $badge_color . ';font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;padding:4px 10px;border-radius:20px;margin-bottom:8px;">
                      ' . htmlspecialchars($lead_title) . '
                    </span>
                    <h1 style="margin:6px 0 0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.4px;">
                      Lead van ' . htmlspecialchars($name) . '
                    </h1>
                  </td>
                  <td align="right" valign="middle" style="width:60px;">
                    <div style="background-color:#dca10d;color:#ffffff;font-size:18px;font-weight:800;width:44px;height:44px;border-radius:50%;text-align:center;line-height:44px;">JL</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Quick Action Buttons -->
          <tr>
            <td style="background-color:#fafafa;padding:14px 32px;border-bottom:1px solid #f0f0f0;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding-right:12px;">
                    <a href="mailto:' . htmlspecialchars($email) . '?subject=Re:%20Jouw%20aanvraag%20op%20jaylakum.com" style="display:inline-block;background-color:#dca10d;color:#ffffff;text-decoration:none;font-size:13px;font-weight:600;padding:9px 18px;border-radius:6px;">
                      ✉️ Reply Direct
                    </a>
                  </td>
                  ' . (!empty($website) ? '<td><a href="' . htmlspecialchars($website) . '" target="_blank" style="display:inline-block;background-color:#ffffff;color:#475569;border:1px solid #cbd5e1;text-decoration:none;font-size:13px;font-weight:600;padding:9px 15px;border-radius:6px;">🌐 Open Webshop</a></td>' : '') . '
                </tr>
              </table>
            </td>
          </tr>

          <!-- Lead Details Table -->
          <tr>
            <td style="padding:28px 32px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:24px;">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;width:35%;color:#475569;font-size:13.5px;font-weight:600;">👤 Naam:</td>
                  <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#0f172a;font-size:14.5px;font-weight:700;">' . htmlspecialchars($name) . '</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#475569;font-size:13.5px;font-weight:600;">✉️ E-mailadres:</td>
                  <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;"><a href="mailto:' . htmlspecialchars($email) . '" style="color:#2563eb;text-decoration:underline;font-size:14px;font-weight:600;">' . htmlspecialchars($email) . '</a></td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#475569;font-size:13.5px;font-weight:600;">🌐 Webshop Link:</td>
                  <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;"><a href="' . htmlspecialchars($website) . '" target="_blank" style="color:#dca10d;text-decoration:underline;font-size:14px;font-weight:600;">' . htmlspecialchars($website) . '</a></td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#475569;font-size:13.5px;font-weight:600;">⚡ Dienst / Vraag:</td>
                  <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;"><span style="background-color:#e0f2fe;color:#0369a1;padding:3px 8px;border-radius:4px;font-size:13px;font-weight:600;">' . htmlspecialchars($problem_type) . '</span></td>
                </tr>
                ' . ($lead_type !== '3_minute_video_audit' ? '
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#475569;font-size:13.5px;font-weight:600;">💰 Indicatie Budget:</td>
                  <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;"><span style="background-color:#fef3c7;color:#92400e;padding:3px 8px;border-radius:4px;font-size:13px;font-weight:700;">' . htmlspecialchars($budget) . '</span></td>
                </tr>' : '') . '
              </table>

              <!-- Message Box -->
              <div style="background-color:#f8fafc;border-left:4px solid #dca10d;border-radius:0 8px 8px 0;padding:18px 20px;margin-bottom:16px;">
                <div style="font-size:12px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">
                  💬 Omschrijving van het probleem:
                </div>
                <div style="font-size:14.5px;line-height:1.65;color:#1e293b;white-space:pre-wrap;">' . (!empty($message) ? nl2br(htmlspecialchars($message)) : '<em>(Geen extra opmerkingen ingevuld — URL ingediend voor audit)</em>') . '</div>
              </div>

            </td>
          </tr>

          <!-- Footer Info -->
          <tr>
            <td style="background-color:#f8fafc;padding:16px 32px;font-size:11.5px;color:#94a3b8;line-height:1.6;border-top:1px solid #e2e8f0;">
              Ontvangen: ' . date('d M Y, H:i:s T') . ' · IP: ' . htmlspecialchars($_SERVER['REMOTE_ADDR'] ?? 'Unknown') . '<br>
              Browser: ' . htmlspecialchars(substr($_SERVER['HTTP_USER_AGENT'] ?? 'Unknown', 0, 100)) . '<br>
              Bron: <a href="https://jaylakum.com" style="color:#475569;text-decoration:none;">jaylakum.com</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>';

$headers  = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";
$headers .= "From: Jay Lakum Website <leads@jaylakum.com>\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

$sent = @mail($to, $subject, $html_content, $headers);

// ==========================================
// 📨 Auto-Reply Email to Client (Confirmation)
// ==========================================
if (!empty($email) && filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $client_subject = ($lead_type === '3_minute_video_audit')
        ? "Bevestiging: Je gratis 3-minuten video audit aanvraag — Jay Lakum"
        : "Ontvangstbevestiging: Je aanvraag op jaylakum.com";

    $client_html = '<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>' . htmlspecialchars($client_subject) . '</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,Helvetica,Arial,sans-serif;color:#334155;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f8fafc;padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:580px;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 4px 14px rgba(0,0,0,0.04);">
          
          <tr>
            <td style="background-color:#18181b;padding:24px 30px;text-align:left;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="font-family:Georgia,serif;font-size:20px;font-weight:700;color:#ffffff;">Jay <span style="color:#dca10d;">Lakum</span></span>
                    <span style="display:block;font-size:12px;color:#94a3b8;margin-top:2px;">Shopify &amp; WooCommerce Performance Developer</span>
                  </td>
                  <td align="right">
                    <span style="background-color:#2e7d32;color:#ffffff;font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;text-transform:uppercase;">✓ Ontvangen</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:28px 30px;line-height:1.65;font-size:15px;color:#334155;">
              <h2 style="font-size:19px;color:#0f172a;margin:0 0 14px;">Beste ' . htmlspecialchars($name) . ',</h2>
              
              <p style="margin:0 0 14px;">
                Bedankt voor je bericht! Ik heb je aanvraag voor ' . (!empty($website) ? '<strong>' . htmlspecialchars($website) . '</strong>' : 'jouw webwinkel') . ' in goede orde ontvangen.
              </p>

              <div style="background-color:#f1f5f9;border-left:4px solid #dca10d;padding:14px 18px;border-radius:0 8px 8px 0;margin:18px 0;">
                <p style="margin:0 0 6px;font-weight:700;color:#0f172a;font-size:14px;">Wat gebeurt er nu?</p>
                <p style="margin:0;font-size:14px;color:#475569;">
                  Ik neem je webshop persoonlijk onder de loep en stuur je <strong>binnen 24 uur</strong> een ' . ($lead_type === '3_minute_video_audit' ? 'persoonlijke 3-minuten Loom video audit' : 'gratis mini-audit en vaste prijsopgave vooraf') . '.
                </p>
              </div>

              <p style="margin:0 0 16px;">
                Geen vage nacalculatie of uurtje-factuurtje: je weet altijd exact waar je aan toe bent voordat er code wordt gewijzigd.
              </p>

              <p style="margin:0 0 20px;">
                Heb je in de tussentijd alvast een dringende vraag of screenshots? Je kunt direct antwoorden op deze e-mail.
              </p>

              <hr style="border:0;border-top:1px solid #f1f5f9;margin:22px 0;" />

              <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="width:48px;vertical-align:top;padding-right:12px;">
                    <div style="background-color:#dca10d;color:#ffffff;font-size:16px;font-weight:700;width:42px;height:42px;border-radius:50%;text-align:center;line-height:42px;">JL</div>
                  </td>
                  <td style="vertical-align:top;line-height:1.45;">
                    <strong style="color:#0f172a;font-size:15px;display:block;">Jay Lakum</strong>
                    <span style="font-size:13px;color:#475569;">Senior E-Commerce &amp; Speed Specialist</span><br>
                    <a href="https://jaylakum.com/nl/" style="font-size:13px;color:#dca10d;text-decoration:none;font-weight:600;">jaylakum.com/nl/</a> &middot; <a href="mailto:jay@jaylakum.com" style="font-size:13px;color:#475569;text-decoration:none;">jay@jaylakum.com</a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <tr>
            <td style="background-color:#f8fafc;padding:14px 30px;font-size:11.5px;color:#94a3b8;border-top:1px solid #e2e8f0;text-align:center;">
              Dit is een geautomatiseerde ontvangstbevestiging van je aanvraag op jaylakum.com.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>';

    $client_headers  = "MIME-Version: 1.0\r\n";
    $client_headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $client_headers .= "From: Jay Lakum <jay@jaylakum.com>\r\n";
    $client_headers .= "Reply-To: jay@jaylakum.com\r\n";
    $client_headers .= "X-Mailer: PHP/" . phpversion();

    @mail($email, $client_subject, $client_html, $client_headers);
}

// Determine if request is AJAX/fetch or native browser form POST
$is_ajax = !empty($json) || 
           (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') ||
           (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false);

if ($is_ajax) {
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode([
        'success' => true,
        'message' => 'Your requirement has been sent successfully! Jay will review your store and reply within 24 hours with an audit & quote.'
    ]);
    exit;
}

// Native browser POST response (clean responsive confirmation page)
$referer = $_SERVER['HTTP_REFERER'] ?? '/';
?>
<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Aanvraag Ontvangen | Jay Lakum</title>
<style>
  body { margin:0; padding:20px; background:#0e1013; color:#f5f2eb; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; display:flex; align-items:center; justify-content:center; min-height:100vh; box-sizing:border-box; }
  .box { max-width:520px; width:100%; background:#16181d; border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:38px 28px; text-align:center; box-shadow:0 12px 40px rgba(0,0,0,0.5); }
  .badge { display:inline-block; background:rgba(46,204,113,0.15); color:#2ecc71; border:1px solid rgba(46,204,113,0.3); padding:6px 14px; border-radius:20px; font-size:12.5px; font-weight:700; margin-bottom:18px; text-transform:uppercase; letter-spacing:0.5px; }
  h1 { font-size:24px; margin:0 0 14px; font-family:Georgia,serif; color:#fff; }
  p { color:#9c9485; font-size:15px; line-height:1.65; margin:0 0 24px; }
  .btn { display:inline-block; background:#dca10d; color:#fff; text-decoration:none; padding:13px 26px; border-radius:8px; font-weight:700; font-size:15px; transition:opacity .2s; }
  .btn:hover { opacity:0.9; }
</style>
</head>
<body>
  <div class="box">
    <div class="badge">✓ Aanvraag Succesvol Ontvangen</div>
    <h1>Bedankt voor je aanvraag!</h1>
    <p>Ik heb je gegevens ontvangen en stuur je <strong>binnen 24 uur</strong> een persoonlijke analyse en/of video-audit van je webwinkel.</p>
    <a href="<?php echo htmlspecialchars($referer); ?>" class="btn">← Terug naar website</a>
  </div>
</body>
</html>
<?php
exit;


