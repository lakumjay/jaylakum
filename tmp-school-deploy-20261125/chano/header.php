<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';
try { db_init(); } catch (Exception $ex) {
    echo '<div style="font-family:sans-serif;max-width:640px;margin:60px auto;padding:30px;border:2px solid #17a43b;border-radius:12px;text-align:center">'
       . '<h2 style="color:#1b305c">Website Setup Pending</h2>'
       . '<p>Database abhi connect nahi hua hai. cPanel me database banakar uski details '
       . '<b>config.php</b> file me dalen, phir page refresh karen.</p></div>';
    exit;
}
$sn = setting('school_name');
$cur = basename($_SERVER['PHP_SELF'] ?? 'index.php');
function nav_active($file, $cur) { return $file === $cur ? ' class="active"' : ''; }
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title><?= e($page_title ?? $sn) ?> | <?= e($sn) ?></title>
<meta name="description" content="<?= e($page_desc ?? setting('tagline')) ?>">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/style.css?v=4">
</head>
<body>
<div class="topbar">
  <div class="wrap topbar-in">
    <span>📞 <?= e(setting('phone')) ?></span>
    <span class="tb-mail">✉️ <?= e(setting('email')) ?></span>
    <span class="tb-addr">📍 <?= e(setting('address')) ?></span>
  </div>
</div>
<header class="site-head">
  <div class="wrap head-in">
    <a class="brand" href="index.php">
      <span class="crest"><svg viewBox="0 0 24 24" width="30" height="30" fill="#fff" aria-hidden="true"><path d="M12 3L1 8l11 5 9-4.1V15h2V8L12 3zm-5 7.6V16c0 1.7 2.2 3 5 3s5-1.3 5-3v-5.4l-5 2.3-5-2.3z"/></svg></span>
      <span class="brand-text">
        <strong><?= e($sn) ?></strong>
        <small><?= e(setting('school_name_hi')) ?></small>
      </span>
    </a>
    <button class="nav-toggle" id="navToggle" aria-label="Menu">☰</button>
    <nav class="mainnav" id="mainNav">
      <a href="index.php"<?= nav_active('index.php', $cur) ?>>Home</a>
      <a href="about.php"<?= nav_active('about.php', $cur) ?>>About</a>
      <a href="academics.php"<?= nav_active('academics.php', $cur) ?>>Academics</a>
      <a href="admissions.php"<?= nav_active('admissions.php', $cur) ?>>Admissions</a>
      <a href="notices.php"<?= nav_active('notices.php', $cur) ?>>Notices</a>
      <a href="results.php"<?= nav_active('results.php', $cur) ?>>Results</a>
      <a href="faculty.php"<?= nav_active('faculty.php', $cur) ?>>Faculty</a>
      <a href="facilities.php"<?= nav_active('facilities.php', $cur) ?>>Facilities</a>
      <a href="gallery.php"<?= nav_active('gallery.php', $cur) ?>>Gallery</a>
      <a href="events.php"<?= nav_active('events.php', $cur) ?>>Events</a>
      <a href="contact.php"<?= nav_active('contact.php', $cur) ?>>Contact</a>
      <a class="nav-cta" href="contact.php">Enquire</a>
    </nav>
  </div>
</header>
