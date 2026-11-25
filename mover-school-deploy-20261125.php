<?php
// TEMP mover: copies redesigned school files from the temp payload into the
// two school docroots, fixes permissions, then reports. DELETE after use.
header('Content-Type: text/plain; charset=utf-8');
$home = dirname(__DIR__);
$src  = __DIR__ . '/tmp-school-deploy-20261125';
$jobs = [
  ['belkappi/style.css', 'cmsoeupggirlsplustwohighschoolbelkappi.org/assets/css/style.css'],
  ['belkappi/index.php', 'cmsoeupggirlsplustwohighschoolbelkappi.org/index.php'],
  ['belkappi/header.php', 'cmsoeupggirlsplustwohighschoolbelkappi.org/header.php'],
  ['chano/style.css',    'cmsoeupghighschoolchano.org/assets/css/style.css'],
  ['chano/header.php',   'cmsoeupghighschoolchano.org/header.php'],
];
foreach ($jobs as $j) {
  $s = $src . '/' . $j[0];
  $d = $home . '/' . $j[1];
  if (!file_exists($s)) { echo "MISSING SOURCE: {$j[0]}\n"; continue; }
  if (!is_dir(dirname($d))) { echo "MISSING DIR: " . dirname($d) . "\n"; continue; }
  $ok = copy($s, $d);
  $match = $ok && file_exists($d) && (md5_file($s) === md5_file($d));
  @chmod($d, 0644);
  echo ($match ? "OK " : "FAIL ") . $j[1] . " md5=" . ($ok ? md5_file($d) : 'n/a') . "\n";
}
// Readable permissions on both docroots (zip-deploy trap: 770/660 -> Apache 403 on CSS).
foreach (['cmsoeupggirlsplustwohighschoolbelkappi.org', 'cmsoeupghighschoolchano.org'] as $dir) {
  $out = [];
  $rc = 0;
  @exec('chmod -R a+rX ' . escapeshellarg($home . '/' . $dir) . ' 2>&1', $out, $rc);
  echo "CHMOD $dir rc=$rc " . implode(' ', $out) . "\n";
}
echo "DONE\n";
