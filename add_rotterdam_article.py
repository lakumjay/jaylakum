import json
import base64

svg_content = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#16181D"/>
      <stop offset="100%" stop-color="#0E1013"/>
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#D4AF67"/>
      <stop offset="100%" stop-color="#A98548"/>
    </linearGradient>
  </defs>
  <rect width="800" height="450" fill="url(#bg)"/>
  <g stroke="rgba(255,255,255,0.05)" stroke-width="1">
    <line x1="0" y1="90" x2="800" y2="90"/>
    <line x1="0" y1="180" x2="800" y2="180"/>
    <line x1="0" y1="270" x2="800" y2="270"/>
    <line x1="0" y1="360" x2="800" y2="360"/>
    <line x1="160" y1="0" x2="160" y2="450"/>
    <line x1="320" y1="0" x2="320" y2="450"/>
    <line x1="480" y1="0" x2="480" y2="450"/>
    <line x1="640" y1="0" x2="640" y2="450"/>
  </g>
  <rect x="70" y="70" width="660" height="310" rx="14" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.08)" stroke-width="1.5"/>
  <rect x="110" y="120" width="195" height="36" rx="6" fill="rgba(212,175,103,0.12)" stroke="rgba(212,175,103,0.3)" stroke-width="1"/>
  <text x="125" y="143" fill="#D4AF67" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-size="12" font-weight="700" letter-spacing="1">LOGISTIEK &amp; ERP</text>
  <rect x="315" y="120" width="220" height="36" rx="6" fill="rgba(16,185,129,0.12)" stroke="rgba(16,185,129,0.3)" stroke-width="1"/>
  <text x="330" y="143" fill="#10B981" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-size="12" font-weight="700" letter-spacing="0.5">✓ POSTNL &amp; EXACT ONLINE</text>
  <text x="110" y="210" fill="#F5F2EB" font-family="Georgia,serif" font-size="25" font-weight="700">Trage WooCommerce Winkelwagen Fixen</text>
  <text x="110" y="250" fill="#9C9485" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-size="15">PostNL &amp; Exact Online knelpunten in Rotterdam e-commerce · Jay Lakum</text>
  <line x1="110" y1="290" x2="690" y2="290" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
  <text x="110" y="330" fill="url(#goldGrad)" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-size="13" font-weight="600">✓ Vaste prijs vooraf &middot; Direct contact met developer &middot; Geen uurtje-factuurtje</text>
</svg>"""

b64_svg = "data:image/svg+xml;base64," + base64.b64encode(svg_content.encode("utf-8")).decode("utf-8")

article = {
    "slug": "trage-woocommerce-winkelwagen-postnl-exact-online",
    "title": "Trage WooCommerce Winkelwagen Oplossen: PostNL &amp; Exact Online Knelpunten in Rotterdam &amp; Rijnmond",
    "category": "WooCommerce &middot; PostNL &amp; ERP Integraties",
    "date": "October 2026",
    "read": "5 min leestijd",
    "image": b64_svg,
    "imageAlt": "Trage WooCommerce winkelwagen versnellen met PostNL en Exact Online koppelingen",
    "excerpt": "Blijft je WooCommerce winkelwagen hangen bij het berekenen van verzendkosten of voorraad? Zo los je PostNL API latency en Exact Online synchronisatievertraging op.",
    "body": """<h2>Het Probleem: Haperende Winkelwagen bij Nederlandse Webshops</h2>
<p>In de e-commerce regio Rotterdam en Rijnmond (van de Spaanse Polder tot het havengebied) beheren veel webshops substantiële productcatalogi en verwerken zij dagelijks honderden bestellingen. Om dit logistiek in goede banen te leiden, koppelen winkeliers hun WooCommerce webshop aan <strong>PostNL</strong> voor pakketlabels en verzendopties, en aan <strong>Exact Online</strong> of <strong>AFAS</strong> voor voorraadbeheer en boekhouding.</p>
<p>Maar zodra het verkeer toeneemt — zoals tijdens marketingacties of de feestdagen — gebeurt er iets frustrerends: potentiële klanten klikken op <em>'In winkelmand'</em> of wijzigen een aantal, en de pagina bevriest 3 tot 5 seconden met een draaiend wieltje. Voor mobiele shoppers is dit hét moment om af te haken naar een snellere concurrent.</p>

<h2>De Echte Boosdoener: wc-ajax=get_refreshed_fragments</h2>
<p>Standaard verstuurt WooCommerce bij vrijwel elke interactie op de site een Ajax-verzoek naar <code>/?wc-ajax=get_refreshed_fragments</code>. Hiermee wordt het winkelwagen-icoon in de menubalk bijgewerkt.</p>
<p>Het probleem? Dit verzoek laadt de complete WordPress core, alle geïnstalleerde plugins en voert actieve filters uit. Wanneer externe ERP- of verzendkoppelingen inhaken op dit proces, verandert een eenvoudige pagina-interactie in een zware server-operatie die caching volledig omzeilt.</p>

<h2>Knelpunt 1: Synchrone PostNL API Requests in de Checkout Flow</h2>
<p>Veel PostNL WooCommerce plugins valideren bij elke verandering van postcode of huisnummer direct via een externe REST API call het adres en halen realtime bezorgopties (zoals avondlevering of PostNL afhaallocaties) op.</p>
<p>Als de externe API-verbinding ook maar 800ms vertraging heeft of tijdelijk tegen rate limits aanloopt, moet de bezoeker letterlijk wachten tot de server antwoord krijgt voordat de winkelwagen reageert.</p>
<h3>De Oplossing: Transient Caching voor Verzendtarieven</h3>
<p>In plaats van bij elke klik een live request te sturen, cachen we de tarieven en opties tijdelijk in de WordPress database met behulp van de Transients API:</p>
<pre style="background:var(--bg-soft);padding:16px;border-radius:8px;overflow-x:auto;font-size:14px;border:1px solid var(--line);color:var(--ink)"><code>// Voorbeeld: Cache PostNL tarieven per postcodegebied voor 1 uur
function jl_cache_postnl_shipping_rates($rates, $package) {
    $destination_zip = sanitize_text_field($package['destination']['postcode'] ?? '');
    if (empty($destination_zip)) {
        return $rates;
    }
    
    $cache_key = 'jl_postnl_' . md5($destination_zip . serialize($package['contents_cost']));
    $cached = get_transient($cache_key);
    
    if (false !== $cached) {
        return $cached;
    }
    
    // Voer externe berekening uit en sla 3600 seconden op
    set_transient($cache_key, $rates, HOUR_IN_SECONDS);
    return $rates;
}
add_filter('woocommerce_package_rates', 'jl_cache_postnl_shipping_rates', 20, 2);</code></pre>

<h2>Knelpunt 2: Realtime Exact Online Synchronisatie Blokkeert Klantensessies</h2>
<p>Een andere veelgemaakte fout in maatwerkkoppelingen is het synchroon synchroniseren van debiteuren en voorraadmutaties met Exact Online tijdens het toevoegen van een item of het afronden van de kassa. Als het ERP-systeem traag reageert of een webhook timeout optreedt, krijgt de bezoeker een haperende checkout of een foutmelding.</p>
<h3>De Oplossing: Asynchrone Background Queue (Action Scheduler)</h3>
<p>Koppel het ERP-proces los van de klantervaring. Zodra de bestelling is geplaatst of gereserveerd, plannen we de synchronisatie in via de WooCommerce <strong>Action Scheduler</strong>:</p>
<pre style="background:var(--bg-soft);padding:16px;border-radius:8px;overflow-x:auto;font-size:14px;border:1px solid var(--line);color:var(--ink)"><code>// Plaats Exact Online synchronisatie direct in een achtergrond-queue
add_action('woocommerce_checkout_order_processed', function($order_id) {
    if (function_exists('as_schedule_single_action')) {
        as_schedule_single_action(
            time() + 5,
            'jl_sync_order_to_exact_online',
            array('order_id' => $order_id),
            'exact_online_sync'
        );
    }
});</code></pre>
<p>Hierdoor merkt de bezoeker <strong>nul seconden vertraging</strong>: de bedankpagina laadt onmiddellijk in minder dan 1 seconde, terwijl de zware ERP-koppeling op de achtergrond feilloos wordt afgehandeld.</p>

<h2>Knelpunt 3: Vervuilde wp_options &amp; Sessietabellen</h2>
<p>WooCommerce slaat tijdelijke winkelwagens op in de <code>wp_options</code> tabel als transients of in <code>wp_woocommerce_sessions</code>. Bij webshops met duizenden maandelijkse bezoekers kunnen honderdduizenden verlopen rijen ontstaan. Hierdoor duurt elke database query naar de winkelwagen merkbaar langer.</p>
<p>Door periodiek verlopen sessies op te ruimen via WP-CLI of een geautomatiseerde cronjob en de database te optimaliseren (of over te stappen op HPOS — High-Performance Order Storage), wordt de winkelwagen direct vlotter en responsiever.</p>

<h2>Conclusie &amp; Directe Aanpak in Rotterdam</h2>
<p>Een trage winkelwagen hoort niet bij professionele e-commerce. Door synchrone externe koppelingen met PostNL en Exact Online om te bouwen naar gecachte en asynchrone processen, blijft je webwinkel ook tijdens extreme piekbelasting razendsnel presteren.</p>
<p>Wil je dat ik jouw WooCommerce webshop en logistieke koppelingen grondig doorlicht? Vraag een <a href="/nl/#gratis-audit">gratis 3-minuten video audit</a> aan of neem direct contact op. Ik werk op basis van vaste deliverables, veilige staging tests en betaling bij tevreden oplevering.</p>"""
}

with open("articles_data.json", "r", encoding="utf-8") as f:
    articles = json.load(f)

existing = [i for i, a in enumerate(articles) if a["slug"] == article["slug"]]
if existing:
    articles[existing[0]] = article
    print("Updated existing article in articles_data.json")
else:
    articles.insert(0, article)
    print("Inserted new article into articles_data.json")

with open("articles_data.json", "w", encoding="utf-8") as f:
    json.dump(articles, f, indent=2, ensure_ascii=False)

print(f"Total articles now: {len(articles)}")
