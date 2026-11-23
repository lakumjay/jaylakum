<?php
// AUVÉ totals invariant test (CLI only).
// Run on the server:  php tests/totals_test.php
// Verifies AuveStorage::orderMoney against fixed cases (including the
// AUV10001 audit case) and, when the database is reachable, verifies
// every stored order's breakup:
//   money.total == money.subtotal - money.discount + money.shipping + money.codFee
//   totals.total * 100 == money.total
if (php_sapi_name() !== 'cli') { http_response_code(403); exit("CLI only\n"); }

require_once __DIR__ . '/../db.php';

$fail = 0;
function check($label, $cond) {
    global $fail;
    echo ($cond ? "PASS" : "FAIL") . "  $label\n";
    if (!$cond) $fail++;
}

// Case 1: the AUV10001 audit case. Poise x2 @ 2890 = 5780, WELCOME10 10% = 578.
$m = AuveStorage::orderMoney(5780, 578, 0, 0, 0.18);
check('AUV10001 total = 520200 paise (Rs 5,202)', $m['total'] === 520200);
check('AUV10001 tax (18% included) = 79353 paise (Rs 793.53)', $m['tax'] === 79353);
check('AUV10001 invariant ok', $m['ok'] === true);

// Case 2: plain COD order, no discount (AUV10002 shape).
$m = AuveStorage::orderMoney(2190, 0, 0, 0, 0.18);
check('COD order total = 219000 paise', $m['total'] === 219000 && $m['ok'] === true);

// Case 3: flat coupon + shipping + COD fee.
$m = AuveStorage::orderMoney(3000, 500, 99, 49, 0.18);
check('flat+ship+codfee total = 264800 paise', $m['total'] === 264800 && $m['ok'] === true);

// Case 4: discount can never push the total below zero in the caller;
// orderMoney itself stays arithmetically consistent.
$m = AuveStorage::orderMoney(1000, 1000, 0, 0, 0.18);
check('full discount total = 0, tax = 0', $m['total'] === 0 && $m['tax'] === 0 && $m['ok'] === true);

// Stored orders (only when the DB is reachable from this CLI).
try {
    $orders = AuveStorage::getOrders();
    $checked = 0;
    foreach ($orders as $o) {
        if (!isset($o['money'])) continue;
        $mm = $o['money'];
        $ok = $mm['total'] === $mm['subtotal'] - $mm['discount'] + $mm['shipping'] + $mm['codFee']
            && intval(round(($o['totals']['total'] ?? -1) * 100)) === $mm['total'];
        check('stored order ' . ($o['id'] ?? '?') . ' breakup reconciles', $ok);
        $checked++;
    }
    if ($checked === 0) echo "SKIP  no stored orders with a money breakup visible from here\n";
} catch (Throwable $e) {
    echo "SKIP  stored-order check (" . $e->getMessage() . ")\n";
}

echo $fail === 0 ? "ALL TESTS PASSED\n" : "$fail TEST(S) FAILED\n";
exit($fail === 0 ? 0 : 1);
