<?php
$page_title = 'About Us';
require_once __DIR__ . '/header.php';
require_once __DIR__ . '/pageview.php';
render_db_page('about', 'assets/images/morning-assembly.jpg');
?>
<section class="section wrap reveal">
  <div class="cards-3d">
    <article class="card3d plain"><div class="card3d-body"><h3>🎯 Our Vision</h3><p>To empower every child with knowledge, confidence and values for a bright future.</p></div></article>
    <article class="card3d plain"><div class="card3d-body"><h3>📚 Our Mission</h3><p>Free, quality and inclusive education in a safe, caring and modern environment.</p></div></article>
    <article class="card3d plain"><div class="card3d-body"><h3>💚 Our Values</h3><p>Discipline, honesty, hard work, respect for all and pride in our culture.</p></div></article>
  </div>
</section>
<section class="section principal-band reveal">
  <div class="wrap two-col">
    <div>
      <span class="kicker">Principal's Message</span>
      <h2 class="sec-title left"><?= e(setting('principal_name')) ?></h2>
      <p class="principal-msg">"<?= e(setting('principal_msg')) ?>"</p>
    </div>
    <div class="principal-visual">
      <?php if (setting('principal_photo')): ?>
      <div class="img-frame principal-photo"><img src="<?= e(setting('principal_photo')) ?>" alt="Principal"></div>
      <?php else:
        $ini = '';
        foreach (explode(' ', trim(setting('principal_name'))) as $w) { if ($w && $w[0] >= 'A' && $w[0] <= 'Z') $ini .= $w[0]; }
      ?>
      <div class="principal-avatar"><?= e(substr($ini ?: 'P', 0, 2)) ?></div>
      <?php endif; ?>
    </div>
  </div>
</section>
<?php require_once __DIR__ . '/footer.php'; ?>
