<?php
if (($_GET['k'] ?? '') !== 'mv7x9q2z') { http_response_code(403); exit('no'); }
$src = __DIR__ . '/_chano_update';
$dst = dirname(__DIR__) . '/cmsoeupghighschoolchano.org';
$map = [
  $src . '/header.php' => $dst . '/header.php',
  $src . '/about.php'  => $dst . '/about.php',
  $src . '/style.css'  => $dst . '/assets/css/style.css',
];
foreach ($map as $s => $d) {
  $ok = copy($s, $d);
  echo basename($d) . ' copy=' . ($ok ? 'OK' : 'FAIL') . ' md5=' . md5_file($d) . ' size=' . filesize($d) . "\n";
}
