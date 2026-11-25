<?php
$page_title = 'Home';
require_once __DIR__ . '/header.php';
$pdo = db();
$notices = $pdo->query("SELECT * FROM notices ORDER BY notice_date DESC, id DESC LIMIT 5")->fetchAll();
$events  = $pdo->query("SELECT * FROM events ORDER BY event_date DESC, id DESC LIMIT 3")->fetchAll();
$photos  = $pdo->query("SELECT * FROM gallery ORDER BY sort ASC, id ASC LIMIT 8")->fetchAll();
?>
<section class="hero">
  <div class="hero-slide active" style="background-image:url('assets/images/hero-school-group.jpg')"></div>
  <div class="hero-slide" style="background-image:url('assets/images/assembly-aerial-1.jpg')"></div>
  <div class="hero-slide" style="background-image:url('assets/images/school-group-board.jpg')"></div>
  <div class="hero-shade"></div>
  <div class="wrap hero-in">
    <span class="hero-badge">Govt. of Jharkhand · School of Excellence</span>
    <h1><?= e(setting('school_name')) ?></h1>
    <p><?= e(setting('tagline')) ?></p>
    <div class="hero-btns">
      <a class="btn btn-yellow" href="admissions.php">Admissions Open</a>
      <a class="btn btn-ghost" href="notices.php">Notice Board</a>
    </div>
    <div class="hero-chips">
      <span class="hero-chip"><b>✦</b> Class IX – XII</span>
      <span class="hero-chip"><b>✦</b> CM School of Excellence</span>
      <span class="hero-chip"><b>✦</b> Belkappi, Hazaribagh</span>
    </div>
  </div>
  <button class="hero-arrow left" id="heroPrev" aria-label="Previous">‹</button>
  <button class="hero-arrow right" id="heroNext" aria-label="Next">›</button>
</section>

<div class="ticker">
  <span class="ticker-label">Latest</span>
  <div class="ticker-track">
    <div class="ticker-move">
      <?php foreach ($notices as $n): ?>
        <a href="notices.php"><?= e($n['title']) ?> <?php if ($n['is_new']): ?><em class="new-badge">NEW</em><?php endif; ?></a><span class="tick-dot">•</span>
      <?php endforeach; ?>
    </div>
  </div>
</div>

<section class="section wrap reveal">
  <div class="two-col">
    <div class="img-frame tilt-sm">
      <img src="assets/images/campus-cycles.jpg" alt="School campus">
      <span class="img-tag">Since <?= e(setting('established')) ?></span>
    </div>
    <div>
      <span class="kicker">Welcome to Our School</span>
      <h2 class="sec-title left">Empowering Girls Through Quality Education</h2>
      <p>Located at Belkappi in Hazaribagh district, our school is a CM School of Excellence where girls from Class IX to XII learn, play and grow together. With trained teachers, smart classes and a safe campus, we focus on strong board results and all-round development of every student.</p>
      <p>From morning assembly and yoga to science learning, sports, cultural programmes and educational tours, every day at school is full of learning and confidence building.</p>
      <a class="btn btn-green" href="about.php">Know More About Us</a>
    </div>
  </div>
</section>

<section class="stats-band">
  <div class="wrap stats-grid">
    <div class="stat"><strong class="count" data-to="<?= e(setting('stat_students')) ?>">0</strong><span>Students</span></div>
    <div class="stat"><strong class="count" data-to="<?= e(setting('stat_teachers')) ?>">0</strong><span>Expert Teachers</span></div>
    <div class="stat"><strong class="count" data-to="<?= e(setting('stat_classrooms')) ?>">0</strong><span>Classrooms</span></div>
    <div class="stat"><strong class="count" data-to="<?= e(setting('stat_results')) ?>" data-suffix="%">0</strong><span>Board Results</span></div>
  </div>
</section>

<section class="section wrap reveal">
  <span class="kicker center">Our Facilities</span>
  <h2 class="sec-title center">Everything a Student Needs to Shine</h2>
  <div class="cards-3d">
    <?php
    $fac = [
      ['Smart Classes', 'Digital boards and audio-visual lessons make every concept easy to understand.', 'assets/images/classroom-3.jpg', '🖥️'],
      ['Science Learning', 'Practical based science teaching that builds curiosity and clear concepts.', 'assets/images/classroom-2.jpg', '🔬'],
      ['Library & Reading', 'Books beyond the syllabus to build knowledge, language and imagination.', 'assets/images/classroom-1.jpg', '📚'],
      ['Sports & Yoga', 'Daily assembly, yoga sessions and sports for a healthy body and mind.', 'assets/images/yoga-2.jpg', '🏅'],
      ['Art & Culture', 'Rangoli, dance, music and cultural programmes that bring out every talent.', 'assets/images/rangoli-art.jpg', '🎨'],
      ['Schemes & Support', 'Free cycles, scholarships, uniforms and textbooks under government schemes.', 'assets/images/campus-cycles.jpg', '🎁'],
    ];
    foreach ($fac as $f): ?>
    <article class="card3d">
      <img src="<?= e($f[2]) ?>" alt="<?= e($f[0]) ?>">
      <div class="card3d-body"><span class="card-ico"><?= $f[3] ?></span><h3><?= e($f[0]) ?></h3><p><?= e($f[1]) ?></p></div>
    </article>
    <?php endforeach; ?>
  </div>
  <div class="center mt"><a class="btn btn-navy" href="facilities.php">See All Facilities</a></div>
</section>

<section class="section principal-band reveal">
  <div class="wrap two-col">
    <div>
      <span class="kicker">From the Principal's Desk</span>
      <h2 class="sec-title left"><?= e(setting('principal_name')) ?></h2>
      <p class="principal-msg">"<?= e(setting('principal_msg')) ?>"</p>
      <p class="principal-sign"><strong><?= e(setting('principal_name')) ?></strong><br>Principal</p>
    </div>
    <div class="img-frame principal-photo">
      <img src="<?= e(setting('principal_photo')) ?>" alt="Principal">
    </div>
  </div>
</section>

<section class="section wrap reveal">
  <div class="two-col top">
    <div>
      <span class="kicker">Notice Board</span>
      <h2 class="sec-title left">Latest Notices</h2>
      <?php foreach (array_slice($notices, 0, 4) as $n): ?>
      <a class="notice-row" href="notices.php">
        <span class="notice-date"><b><?= date('d', strtotime($n['notice_date'])) ?></b><small><?= date('M Y', strtotime($n['notice_date'])) ?></small></span>
        <span class="notice-text"><strong><?= e($n['title']) ?></strong><?php if ($n['is_new']): ?> <em class="new-badge">NEW</em><?php endif; ?><small><?= e($n['category']) ?></small></span>
      </a>
      <?php endforeach; ?>
      <a class="btn btn-green" href="notices.php">All Notices</a>
    </div>
    <div>
      <span class="kicker">Events</span>
      <h2 class="sec-title left">School Events</h2>
      <?php foreach ($events as $ev): ?>
      <a class="event-row" href="events.php">
        <img src="<?= e($ev['image']) ?>" alt="<?= e($ev['title']) ?>">
        <span><strong><?= e($ev['title']) ?></strong><small><?= date('d M Y', strtotime($ev['event_date'])) ?> · <?= e($ev['location']) ?></small></span>
      </a>
      <?php endforeach; ?>
      <a class="btn btn-navy" href="events.php">All Events</a>
    </div>
  </div>
</section>

<section class="section gallery-band reveal">
  <div class="wrap">
    <span class="kicker center">Photo Gallery</span>
    <h2 class="sec-title center">Moments of Our School Life</h2>
    <div class="gallery-grid">
      <?php foreach ($photos as $p): ?>
      <a class="g-item" href="gallery.php"><img src="<?= e($p['image']) ?>" alt="<?= e($p['title']) ?>"><span><?= e($p['title']) ?></span></a>
      <?php endforeach; ?>
    </div>
    <div class="center mt"><a class="btn btn-yellow" href="gallery.php">View Full Gallery</a></div>
  </div>
</section>

<section class="cta-band">
  <div class="wrap cta-in">
    <div><h2>Admissions Open for the New Session</h2><p>Give your daughter the gift of quality education. Visit the school office or send an enquiry online.</p></div>
    <a class="btn btn-yellow big" href="admissions.php">Apply / Enquire Now</a>
  </div>
</section>
<?php require_once __DIR__ . '/footer.php'; ?>
