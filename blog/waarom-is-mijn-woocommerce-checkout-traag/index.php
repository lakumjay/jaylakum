<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="color-scheme" content="light dark" />

<title>Waarom Is Mijn WooCommerce Checkout Traag? 7 Oorzaken & Snelle Oplossingen | Jay Lakum</title>
<meta name="description" content="Wanneer een klant op 'Afrekenen' klikt en 4 tot 8 seconden moet wachten, haakt 40% geruisloos af. Dit zijn de 7 meest voorkomende technische oorzaken in WooCommerce en hoe je ze binnen 24 uur oplost." />
<meta name="author" content="Jay Lakum" />
<link rel="canonical" href="https://jaylakum.com/blog/waarom-is-mijn-woocommerce-checkout-traag/" />
<link rel="alternate" hreflang="en" href="https://jaylakum.com/blog/waarom-is-mijn-woocommerce-checkout-traag/" />
<link rel="alternate" hreflang="x-default" href="https://jaylakum.com/blog/waarom-is-mijn-woocommerce-checkout-traag/" />

<!-- Favicon -->
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="alternate icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="apple-touch-icon" href="/favicon.svg" />

<!-- Open Graph / Social -->
<meta property="og:type" content="article" />
<meta property="og:url" content="https://jaylakum.com/blog/waarom-is-mijn-woocommerce-checkout-traag/" />
<meta property="og:site_name" content="Jay Lakum — Webshop Performance & Development" />
<meta property="og:title" content="Waarom Is Mijn WooCommerce Checkout Traag? 7 Oorzaken & Snelle Oplossingen" />
<meta property="og:description" content="Wanneer een klant op 'Afrekenen' klikt en 4 tot 8 seconden moet wachten, haakt 40% geruisloos af. Dit zijn de 7 meest voorkomende technische oorzaken in WooCommerce en hoe je ze binnen 24 uur oplost." />
<meta property="og:image" content="https://jaylakum.com/og-image.svg" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Waarom Is Mijn WooCommerce Checkout Traag? 7 Oorzaken & Snelle Oplossingen" />
<meta name="twitter:description" content="Wanneer een klant op 'Afrekenen' klikt en 4 tot 8 seconden moet wachten, haakt 40% geruisloos af. Dit zijn de 7 meest voorkomende technische oorzaken in WooCommerce en hoe je ze binnen 24 uur oplost." />
<meta name="twitter:image" content="https://jaylakum.com/og-image.svg" />

<!-- Structured Data (JSON-LD) -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BlogPosting",
      "@id": "https://jaylakum.com/blog/waarom-is-mijn-woocommerce-checkout-traag/#article",
      "headline": "Waarom Is Mijn WooCommerce Checkout Traag? 7 Oorzaken & Snelle Oplossingen",
      "description": "Wanneer een klant op 'Afrekenen' klikt en 4 tot 8 seconden moet wachten, haakt 40% geruisloos af. Dit zijn de 7 meest voorkomende technische oorzaken in WooCommerce en hoe je ze binnen 24 uur oplost.",
      "datePublished": "2026-10-26T10:00:00+01:00",
      "dateModified": "2026-10-26T18:00:00+01:00",
      "inLanguage": "en",
      "mainEntityOfPage": "https://jaylakum.com/blog/waarom-is-mijn-woocommerce-checkout-traag/",
      "author": {
        "@type": "Person",
        "name": "Jay Lakum",
        "url": "https://jaylakum.com/",
        "jobTitle": "Senior Webshop & Performance Developer"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Jay Lakum",
        "url": "https://jaylakum.com/",
        "logo": {
          "@type": "ImageObject",
          "url": "https://jaylakum.com/favicon.svg"
        }
      }
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://jaylakum.com/" },
        { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://jaylakum.com/blog/" },
        { "@type": "ListItem", "position": 3, "name": "Waarom Is Mijn WooCommerce Checkout Traag? 7 Oorzaken & Snelle Oplossingen" }
      ]
    }
  ]
}
</script>

<style>
  :root{
    --bg:#FAF7F1;
    --bg-soft:#F3EEE3;
    --card:#FFFFFF;
    --ink:#1C1A17;
    --ink-soft:#423E37;
    --gold-btn:#745218;
    --gold-btn-text:#FFFFFF;
    --ink-faint:#595347;
    --gold:#684B1B;
    --gold-deep:#553D16;
    --gold-soft:#EFE6D2;
    --line:#E3DCCB;
    --line-strong:#CFC4A6;
    --shadow:0 10px 30px rgba(28,26,23,.08);
    --radius:10px;
    --serif:Georgia,'Iowan Old Style','Times New Roman',serif;
    --sans:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  }
  @media(prefers-color-scheme:dark){
    :root{
      --bg:#171410;
      --bg-soft:#1F1B15;
      --card:#211C16;
      --ink:#EDE6D6;
      --ink-soft:#D4CBBC;
      --gold-btn:#E5BE72;
      --gold-btn-text:#171410;
      --ink-faint:#B5A894;
      --gold:#E5BE72;
      --gold-deep:#F0CE8A;
      --gold-soft:#2E2718;
      --line:#37301F;
      --line-strong:#4A4028;
      --shadow:0 10px 30px rgba(0,0,0,.45);
    }
  }
  *{box-sizing:border-box}
  html{scroll-behavior:smooth}
  body{
    margin:0;
    font-family:var(--sans);
    background:var(--bg);
    color:var(--ink);
    line-height:1.65;
    -webkit-font-smoothing:antialiased;
  }
  a{color:inherit;text-decoration:none}
  .wrap{max-width:1120px;margin:0 auto;padding:0 24px}
  header.site{
    position:sticky;
    top:0;
    z-index:100;
    backdrop-filter:blur(14px);
    -webkit-backdrop-filter:blur(14px);
    background:rgba(250,247,241,.88);
    border-bottom:1px solid var(--line);
  }
  @media(prefers-color-scheme:dark){
    header.site{background:rgba(18,17,15,.88)}
  }
  .head-row{display:flex;align-items:center;justify-content:space-between;height:72px}
  .brand{font-family:var(--serif);font-size:22px;font-weight:700;letter-spacing:-.02em}
  .brand span{color:var(--gold)}
  .nav-links{display:flex;gap:22px;align-items:center;font-size:15px}
  .nav-links a:hover{color:var(--gold)}
  .nav-links a.btn{color:var(--gold-btn-text)!important;background:var(--gold-btn)}
  .btn{
    display:inline-flex;
    align-items:center;
    justify-content:center;
    gap:8px;
    padding:10px 22px;
    border-radius:999px;
    border:1.5px solid var(--gold);
    background:var(--gold-btn, #E5BE72);
    color:var(--gold-btn-text, #171410)!important;
    font-weight:700;
    font-size:14.5px;
    text-decoration:none!important;
    cursor:pointer;
    box-shadow:0 4px 14px rgba(0,0,0,0.12);
    transition:transform .15s cubic-bezier(0.4,0,0.2,1),box-shadow .2s ease,background .2s ease,border-color .2s ease;
    -webkit-tap-highlight-color:transparent;
    user-select:none;
  }
  .btn:hover{
    transform:translateY(-2px);
    background:var(--gold-deep, #F0CE8A)!important;
    border-color:var(--gold-deep, #F0CE8A)!important;
    color:var(--gold-btn-text, #171410)!important;
    box-shadow:0 8px 24px rgba(229,190,114,0.4)!important;
    text-decoration:none!important;
  }
  .btn:active{
    transform:translateY(1.5px) scale(0.98)!important;
    box-shadow:0 2px 6px rgba(0,0,0,0.3)!important;
    transition-duration:0.04s!important;
  }
  .btn-ghost, .btn-outline{
    background:transparent!important;
    border:1.5px solid var(--line-strong, #4A4028)!important;
    color:var(--ink, #EDE6D6)!important;
    box-shadow:none!important;
  }
  .btn-ghost:hover, .btn-outline:hover{
    background:var(--gold-soft, #2C2517)!important;
    border-color:var(--gold, #E5BE72)!important;
    color:var(--gold, #E5BE72)!important;
    box-shadow:0 6px 20px rgba(229,190,114,0.25)!important;
    transform:translateY(-2px);
  }
  .btn-ghost:active, .btn-outline:active{
    transform:translateY(1.5px) scale(0.98)!important;
    box-shadow:0 1px 4px rgba(0,0,0,0.2)!important;
    transition-duration:0.04s!important;
  }
  
  /* Article Container */
  .article-wrap{max-width:820px;margin:0 auto;padding:48px 24px 80px}
  .breadcrumb{font-size:14px;color:var(--ink-faint);margin-bottom:24px}
  .breadcrumb a{color:var(--ink-soft);text-decoration:underline;text-underline-offset:3px}
  .p-cat{
    display:inline-block;
    font-size:12px;
    text-transform:uppercase;
    letter-spacing:.08em;
    font-weight:700;
    color:var(--gold);
    background:var(--gold-soft);
    padding:4px 10px;
    border-radius:6px;
    margin-bottom:14px;
  }
  h1{font-family:var(--serif);font-size:clamp(28px,4.5vw,42px);line-height:1.2;margin:0 0 16px;letter-spacing:-.02em}
  .article-meta{color:var(--ink-faint);font-size:15px;margin-bottom:28px;padding-bottom:18px;border-bottom:1px solid var(--line)}
  .article-hero{display:block;width:100%;aspect-ratio:16/9;object-fit:cover;border:1px solid var(--line);border-radius:12px;margin:0 0 36px;background:var(--bg-soft)}
  .article-body{font-size:18px;line-height:1.75;color:var(--ink-soft)}
  .article-body h2{font-family:var(--serif);font-size:26px;color:var(--ink);margin:42px 0 14px;line-height:1.3;letter-spacing:-.01em}
  .article-body h3{font-family:var(--serif);font-size:21px;color:var(--ink);margin:30px 0 10px}
  .article-body p{margin:0 0 20px}
  .article-body ul,.article-body ol{margin:0 0 22px;padding-left:24px}
  .article-body li{margin-bottom:10px}
  .article-body code{background:var(--bg-soft);padding:3px 7px;border-radius:5px;font-size:.9em;border:1px solid var(--line)}
  .article-body a{color:var(--gold);text-decoration:underline;text-underline-offset:3px;font-weight:600}
  .article-body a:hover{color:var(--gold-deep)}
  
  /* CTA Box */
  .article-cta{
    margin:50px 0;
    padding:36px;
    background:var(--card);
    border:1px solid var(--line-strong);
    border-left:5px solid var(--gold);
    border-radius:12px;
    box-shadow:var(--shadow);
  }
  .article-cta h3{font-family:var(--serif);font-size:24px;margin:0 0 8px}
  .article-cta p{font-size:16px;color:var(--ink-soft);margin:0 0 20px}
  
  /* Related Grid */
  .related-sect{border-top:1px solid var(--line);padding-top:40px;margin-top:50px}
  .blog-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:24px;margin-top:20px}
  .card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:24px;transition:transform .2s,box-shadow .2s}
  .card:hover{transform:translateY(-3px);box-shadow:var(--shadow)}
  
  /* Footer */
  footer.site{background:var(--bg-soft);border-top:1px solid var(--line);padding:40px 0 60px;font-size:14px;color:var(--ink-faint)}
  .foot-nav{display:flex;flex-wrap:wrap;gap:16px 24px;margin-top:16px}
  .foot-nav a:hover{color:var(--gold)}

  /* Mobile Navigation Fit (Zero Horizontal Overflow) */
  @media (max-width: 768px) {
    .nav, .head-row { gap: 8px !important; }
    .nav-links { gap: 8px !important; }
    .nav-links a:not(.lang-toggle-btn):not(.nav-cta):not([href*="audit"]):not([href*="contact"]) { display: none !important; }
    .nav-links .btn, .nav-links .nav-cta { padding: 6px 12px !important; font-size: 12.5px !important; white-space: nowrap !important; }
    .lang-toggle-btn { padding: 4px 10px !important; font-size: 12px !important; }
  }

</style>
</head>
<body>

<header class="site">
  <div class="wrap head-row">
    <a class="brand" href="/">Jay <span>Lakum</span></a>
    <nav class="nav-links">
      <a href="/#home">Home</a>
      <a href="/#services">Services</a>
      <a href="/#work">Work</a>
      <a href="/blog/" style="color:var(--gold);font-weight:600">Blog</a>
      <a href="/nl/" style="color:var(--gold);font-weight:600" title="Nederlandse versie">🇳🇱 NL</a>
      <a href="mailto:jay@jaylakum.com" class="btn">Email me</a>
    </nav>
  </div>
</header>

<main>
  <article class="article-wrap">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="/">Home</a> › <a href="/blog/">Blog</a> › <span>Waarom Is Mijn WooCommerce Checkout Traag? 7 Oorzaken & Snelle Oplossingen</span>
    </nav>

    <span class="p-cat">WooCommerce · Checkout</span>
    <h1>Waarom Is Mijn WooCommerce Checkout Traag? 7 Oorzaken & Snelle Oplossingen</h1>
    <p class="article-meta">October 2026 · 6 min leestijd · by Jay Lakum, Senior Webshop & Performance Specialist</p>

    <img class="article-hero" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MDAgNDUwIiB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzE2MTgxRCIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMwRTEwMTMiLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImdvbGQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI0U1QzA3QiIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNENEFGMzciLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNDUwIiBmaWxsPSJ1cmwoI2JnKSIvPgogIDxyZWN0IHg9IjMwIiB5PSIzMCIgd2lkdGg9Ijc0MCIgaGVpZ2h0PSIzOTAiIHJ4PSIxNiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDIxMiwxNzUsNTUsMC4yKSIgc3Ryb2tlLXdpZHRoPSIxLjUiLz4KICA8cmVjdCB4PSI2MCIgeT0iNzAiIHdpZHRoPSIyNjAiIGhlaWdodD0iMzQiIHJ4PSIxNyIgZmlsbD0icmdiYSgyMTIsMTc1LDU1LDAuMTIpIiBzdHJva2U9InJnYmEoMjEyLDE3NSw1NSwwLjM1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgPHRleHQgeD0iODAiIHk9IjkyIiBmb250LWZhbWlseT0iLWFwcGxlLXN5c3RlbSxCbGlua01hY1N5c3RlbUZvbnQsJ1NlZ29lIFVJJyxSb2JvdG8sc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZm9udC13ZWlnaHQ9IjcwMCIgZmlsbD0iI0U1QzA3QiIgbGV0dGVyLXNwYWNpbmc9IjEiPldPT0NPTU1FUkNFIMK3IFNORUxIRUlEPC90ZXh0PgogIDx0ZXh0IHg9IjYwIiB5PSIxNzAiIGZvbnQtZmFtaWx5PSJHZW9yZ2lhLHNlcmlmIiBmb250LXNpemU9IjM0IiBmb250LXdlaWdodD0iNzAwIiBmaWxsPSIjRkFGN0YxIj5XYWFyb20gSXMgTWlqbiBDaGVja291dCBUcmFhZz88L3RleHQ+CiAgPHRleHQgeD0iNjAiIHk9IjIxNSIgZm9udC1mYW1pbHk9Ikdlb3JnaWEsc2VyaWYiIGZvbnQtc2l6ZT0iMzQiIGZvbnQtd2VpZ2h0PSI3MDAiIGZpbGw9InVybCgjZ29sZCkiPjcgVGVjaG5pc2NoZSBPb3J6YWtlbiAmYW1wOyBGaXhlczwvdGV4dD4KICA8cmVjdCB4PSI2MCIgeT0iMjcwIiB3aWR0aD0iNjgwIiBoZWlnaHQ9IjgwIiByeD0iMTAiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMikiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA4KSIvPgogIDx0ZXh0IHg9Ijg1IiB5PSIzMTgiIGZvbnQtZmFtaWx5PSItYXBwbGUtc3lzdGVtLEJsaW5rTWFjU3lzdGVtRm9udCwnU2Vnb2UgVUknLFJvYm90byxzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmb250LXdlaWdodD0iNjAwIiBmaWxsPSIjRTVDMDdCIj7imqEgVmFuIDYuNHMgbmFhciAxLjhzIG1vYmllbGUgY2hlY2tvdXQgbGFhZHRpamQ8L3RleHQ+Cjwvc3ZnPg==" alt="Waarom is mijn WooCommerce checkout traag? 7 technische oorzaken en directe oplossingen" width="800" height="450" style="aspect-ratio:16/9;width:100%;height:auto;" loading="eager" />

    <div class="article-body">
      <p class="lead">Je potentiële klant heeft een product gekozen, de winkelmand geopend en klikt vol verwachting op <em>'Doorgaan naar afrekenen'</em>. Vervolgens begint het laad-icoontje te draaien. Drie seconden... vijf seconden... zeven seconden.</p>

<p>Voor een bezoeker op een smartphone op een 4G-verbinding voelt zeven seconden als een eeuwigheid. De klant vraagt zich af of de site wel betrouwbaar is, tikt op het kruisje en koopt hetzelfde product bij een concurrent. Niemand stuurt een e-mail om te zeggen: <em>"Hey, je kassa laadt traag."</em> Ze vertrekken gewoon geruisloos.</p>

<p>In dit artikel ontleden we de <strong>7 meest voorkomende technische bottlenecks</strong> die een WooCommerce checkout vertragen in Nederland en België, en hoe we deze structureel oplossen.</p>

<hr>

<h2>1. Cart Fragments AJAX Request (Het beruchte wc-ajax=get_refreshed_fragments)</h2>
<p>WooCommerce gebruikt standaard een script genaamd <code>cart-fragments.js</code>. Dit script vuurt bij elke paginalading een AJAX-verzoek af naar <code>/?wc-ajax=get_refreshed_fragments</code> om het winkelmand-icoon in je header bij te werken.</p>

<div class="callout warning">
  <strong>Het probleem:</strong> Dit verzoek omzeilt je volledige pagina-caching. Zelfs als je een supersnelle caching-plugin hebt, moet je server bij elke bezoeker een zware WordPress PHP-thread opstarten. Op drukke webshops leidt dit tot servercongestie en trage laadtijden.
</div>

<p><strong>De oplossing:</strong> Schakel cart fragments uit op alle pagina's behalve de winkelwagen en checkout via een lichtgewicht snippet in <code>functions.php</code>, of vervang het door moderne browser <code>sessionStorage</code>.</p>

<hr>

<h2>2. Trage Externe Koppelingen (PostNL, MyParcel, Exact Online)</h2>
<p>In Nederland maken vrijwel alle webshops gebruik van plugins voor verzendlabels en boekhouding. Wanneer een klant zijn postcode en huisnummer intikt, vuurt WooCommerce live API-verzoeken af naar externe servers om verzendmethoden en tarieven te berekenen.</p>

<p>Als de API van PostNL of Exact Online een vertraging heeft van 1.500 milliseconden, <strong>staat je checkout 1.5 seconde letterlijk stil</strong>. De browser wacht tot de server antwoord heeft.</p>

<p><strong>Oplossing:</strong> Implementeer slimme transient caching voor postcode-lookups en zorg dat verzendtarieven asynchroon worden berekend zonder het renderen van de betaalopties te blokkeren.</p>

<hr>

<h2>3. Mollie &amp; iDEAL 2.0 Webhook en Gateway Latency</h2>
<p>Mollie is de absolute standaard voor Nederlandse e-commerce betalingen. Maar als je checkout pagina zware scripts laadt die de Mollie iframe of payment components vertragen, bevriest het scherm zodra de klant een bank selecteert.</p>

<p>Zorg dat de payment gateway scripts niet geblokkeerd worden door zware tracking pixels (zoals TikTok Pixel, Hotjar of dubbele Google Tag Manager containers). Laat betalingsgateways altijd prioriteit krijgen op de main-thread.</p>

<hr>

<h2>4. Vervuilde wp_options Database Tabel &amp; Verlopen Transients</h2>
<p>Elke plugin die je installeert en verwijdert, laat sporen na in de <code>wp_options</code> tabel. Veel plugins zetten opties op <code>autoload = 'yes'</code>. Dit betekent dat bij <em>elk</em> checkout-verzoek megabytes aan onnodige data uit MySQL naar PHP wordt getrokken.</p>

<ul>
  <li>Verwijder verlopen WooCommerce transients (tijdelijke sessies) via <em>WooCommerce → Status → Hulpmiddelen</em>.</li>
  <li>Controleer met WP-CLI of phpMyAdmin welke opties meer dan 100KB groot zijn en ruim oude marketingdata op.</li>
</ul>

<hr>

<h2>5. Gebrek aan Object Caching (Redis of Memcached)</h2>
<p>Omdat de checkout pagina dynamisch is en niet als statische HTML gecached mag worden, moet WordPress bij elke stap de database raadplegen. Zonder <strong>Redis Object Caching</strong> moet MySQL tientallen queries per seconde opnieuw uitvoeren.</p>

<p>Door Redis te activeren op je hosting (bijvoorbeeld bij Hostinger, Cloudways of SiteGround), worden frequente database-queries in het supersnelle RAM-geheugen bewaard. Dit versnelt de checkout direct met 40% tot 60%.</p>

<hr>

<h2>6. Te Weinig PHP Memory Limit &amp; PHP Workers</h2>
<p>WooCommerce met Mollie, PostNL en een professioneel thema heeft minimaal <strong>512MB PHP Memory Limit</strong> nodig. Als je hostingbedrijf dit beperkt tot 128MB of 256MB, raakt PHP uitgeput en treedt er 'memory throttling' op.</p>

<p>Controleer ook het aantal <strong>PHP-workers</strong>. Als je maar 2 workers hebt en twee klanten rekenen tegelijk af, moet de derde klant wachten tot de server vrijkomt.</p>

<hr>

<h2>7. Render-Blocking Tracking &amp; Marketing Scripts</h2>
<p>Klaviyo popups, WhatsApp widgets, trust-badges, Google Analytics 4, Meta Conversions API... Veel winkeliers plakken tientallen scripts in de header. Op de checkout pagina heeft een klant geen popup of livechat nodig — ze willen alleen veilig betalen.</p>

<p><strong>Directe Actie:</strong> Schakel alle niet-essentiële marketing- en tracking-scripts uit op de checkout URL (<code>/afrekenen/</code>). Bewaar alleen de conversiepixel op de 'Bedankt'-pagina (Thank You page).</p>

<hr>

<h2>Conclusie &amp; Volgende Stap</h2>
<p>Een trage WooCommerce checkout kost je elke dag keiharde euro's aan verloren bestellingen. Het goede nieuws: 90% van deze problemen kan binnen 24 tot 48 uur worden verholpen zonder dat je een duur nieuw thema hoeft te kopen.</p>

<div class="callout" style="background:var(--card);border:1.5px solid var(--gold);padding:24px;border-radius:12px;margin-top:32px">
  <h3 style="margin:0 0 10px;font-size:20px;color:var(--gold-deep)">Wil je weten wat jouw kassa vertraagt?</h3>
  <p style="margin:0 0 16px;color:var(--ink-soft);font-size:15px">Stuur me je winkel-URL. Ik stuur je binnen 24 uur een <strong>persoonlijke 3-minuten video-analyse</strong> waarin ik precies aanwijs waar de vertraging zit op mobiel — 100% vrijblijvend.</p>
  <a href="/nl/amsterdam/#gratis-audit" class="btn">Vraag een Gratis Video Audit Aan &rarr;</a>
</div>
    </div>

    <div class="article-cta">
      <h3>Need this fixed on your store?</h3>
      <p>Forms aren't for everyone. Email me directly with your store URL and what's broken — I reply within 24 hours.</p>
      <a class="btn" href="mailto:jay@jaylakum.com">Email jay@jaylakum.com</a>
    </div>

    <div class="related-sect">
      <h3 style="font-family:var(--serif);font-size:22px">More Technical Field Guides</h3>
      <div class="blog-grid">
        
        <article class="card post-card" style="display:flex;flex-direction:column;justify-content:space-between">
          <div>
            <a href="/blog/wat-kost-webshop-versnellen-kosten-overzicht/" style="display:block;overflow:hidden;border-radius:8px;margin-bottom:12px;background:var(--bg-soft)">
              <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MDAgNDUwIiB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzE2MTgxRCIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMwRTEwMTMiLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImdvbGQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI0U1QzA3QiIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNENEFGMzciLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNDUwIiBmaWxsPSJ1cmwoI2JnKSIvPgogIDxyZWN0IHg9IjMwIiB5PSIzMCIgd2lkdGg9Ijc0MCIgaGVpZ2h0PSIzOTAiIHJ4PSIxNiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDIxMiwxNzUsNTUsMC4yKSIgc3Ryb2tlLXdpZHRoPSIxLjUiLz4KICA8cmVjdCB4PSI2MCIgeT0iNzAiIHdpZHRoPSIyNjAiIGhlaWdodD0iMzQiIHJ4PSIxNyIgZmlsbD0icmdiYSgyMTIsMTc1LDU1LDAuMTIpIiBzdHJva2U9InJnYmEoMjEyLDE3NSw1NSwwLjM1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgPHRleHQgeD0iODAiIHk9IjkyIiBmb250LWZhbWlseT0iLWFwcGxlLXN5c3RlbSxCbGlua01hY1N5c3RlbUZvbnQsJ1NlZ29lIFVJJyxSb2JvdG8sc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZm9udC13ZWlnaHQ9IjcwMCIgZmlsbD0iI0U1QzA3QiIgbGV0dGVyLXNwYWNpbmc9IjEiPlRBUklFVkVOICZhbXA7IFJPSTwvdGV4dD4KICA8dGV4dCB4PSI2MCIgeT0iMTcwIiBmb250LWZhbWlseT0iR2VvcmdpYSxzZXJpZiIgZm9udC1zaXplPSIzNCIgZm9udC13ZWlnaHQ9IjcwMCIgZmlsbD0iI0ZBRjdGMSI+V2F0IEtvc3QgV2Vic2hvcCBWZXJzbmVsbGVuPzwvdGV4dD4KICA8dGV4dCB4PSI2MCIgeT0iMjE1IiBmb250LWZhbWlseT0iR2VvcmdpYSxzZXJpZiIgZm9udC1zaXplPSIzNCIgZm9udC13ZWlnaHQ9IjcwMCIgZmlsbD0idXJsKCNnb2xkKSI+RWVybGlqa2UgUHJpanplbiAmYW1wOyBCZXJla2VuaW5nPC90ZXh0PgogIDxyZWN0IHg9IjYwIiB5PSIyNzAiIHdpZHRoPSI2ODAiIGhlaWdodD0iODAiIHJ4PSIxMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDgpIi8+CiAgPHRleHQgeD0iODUiIHk9IjMxOCIgZm9udC1mYW1pbHk9Ii1hcHBsZS1zeXN0ZW0sQmxpbmtNYWNTeXN0ZW1Gb250LCdTZWdvZSBVSScsUm9ib3RvLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZvbnQtd2VpZ2h0PSI2MDAiIGZpbGw9IiNFNUMwN0IiPvCfkrAgUk9JOiAxcyBzbmVsbGVyID0gZ2VtaWRkZWxkICs3JSBtZWVyIG9temV0PC90ZXh0Pgo8L3N2Zz4=" alt="Wat kost het versnellen van een webshop in Nederland? Eerlijk prijsoverzicht en markttarieven" width="600" height="338" style="aspect-ratio:16/9;width:100%;height:auto;object-fit:cover;display:block;border-radius:8px;" loading="lazy" />
            </a>
            <span class="p-cat">E-Commerce · Tarieven & ROI</span>
            <h3 style="font-size:18px;margin:8px 0"><a href="/blog/wat-kost-webshop-versnellen-kosten-overzicht/">Wat Kost Het Versnellen van een Webshop? Eerlijke Prijzen & ROI Gids</a></h3>
            <p style="font-size:14px;color:var(--ink-soft);line-height:1.5;margin-bottom:12px">Wat kost professionele webshop speed optimization in Nederland? Een eerlijk overzicht van freelance tarieven versus bure...</p>
          </div>
          <div>
            <p class="post-meta" style="font-size:13px;color:var(--ink-faint);margin-bottom:8px">October 2026 · 5 min leestijd</p>
            <a class="more" href="/blog/wat-kost-webshop-versnellen-kosten-overzicht/" style="font-size:14px;font-weight:600;color:var(--gold)">Read article →</a>
          </div>
        </article>
        
        <article class="card post-card" style="display:flex;flex-direction:column;justify-content:space-between">
          <div>
            <a href="/blog/how-to-fix-woocommerce-checkout-error/" style="display:block;overflow:hidden;border-radius:8px;margin-bottom:12px;background:var(--bg-soft)">
              <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MDAgNDUwIiB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzE2MTgxRCIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMwRTEwMTMiLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImdvbGQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI0U1QzA3QiIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNENEFGMzciLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNDUwIiBmaWxsPSJ1cmwoI2JnKSIvPgogIDxyZWN0IHg9IjMwIiB5PSIzMCIgd2lkdGg9Ijc0MCIgaGVpZ2h0PSIzOTAiIHJ4PSIxNiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDIxMiwxNzUsNTUsMC4yKSIgc3Ryb2tlLXdpZHRoPSIxLjUiLz4KICA8cmVjdCB4PSI2MCIgeT0iNzAiIHdpZHRoPSIyNjAiIGhlaWdodD0iMzQiIHJ4PSIxNyIgZmlsbD0icmdiYSgyMTIsMTc1LDU1LDAuMTIpIiBzdHJva2U9InJnYmEoMjEyLDE3NSw1NSwwLjM1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgPHRleHQgeD0iODAiIHk9IjkyIiBmb250LWZhbWlseT0iLWFwcGxlLXN5c3RlbSxCbGlua01hY1N5c3RlbUZvbnQsJ1NlZ29lIFVJJyxSb2JvdG8sc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZm9udC13ZWlnaHQ9IjcwMCIgZmlsbD0iI0U1QzA3QiIgbGV0dGVyLXNwYWNpbmc9IjEiPldPT0NPTU1FUkNFIMK3IERFQlVHR0lORzwvdGV4dD4KICA8dGV4dCB4PSI2MCIgeT0iMTcwIiBmb250LWZhbWlseT0iR2VvcmdpYSxzZXJpZiIgZm9udC1zaXplPSIzNCIgZm9udC13ZWlnaHQ9IjcwMCIgZmlsbD0iI0ZBRjdGMSI+V29vQ29tbWVyY2UgQ2hlY2tvdXQgRXJyb3I/PC90ZXh0PgogIDx0ZXh0IHg9IjYwIiB5PSIyMTUiIGZvbnQtZmFtaWx5PSJHZW9yZ2lhLHNlcmlmIiBmb250LXNpemU9IjM0IiBmb250LXdlaWdodD0iNzAwIiBmaWxsPSJ1cmwoI2dvbGQpIj5Dcml0aWNhbCBGaXhlcyBmb3IgUGF5bWVudCBEcm9wczwvdGV4dD4KICA8cmVjdCB4PSI2MCIgeT0iMjcwIiB3aWR0aD0iNjgwIiBoZWlnaHQ9IjgwIiByeD0iMTAiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMikiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA4KSIvPgogIDx0ZXh0IHg9Ijg1IiB5PSIzMTgiIGZvbnQtZmFtaWx5PSItYXBwbGUtc3lzdGVtLEJsaW5rTWFjU3lzdGVtRm9udCwnU2Vnb2UgVUknLFJvYm90byxzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmb250LXdlaWdodD0iNjAwIiBmaWxsPSIjRTVDMDdCIj7wn5uh77iPIEZpeCA1MDAgZXJyb3JzLCBzcGlubmluZyB3aGVlbHMgJmFtcDsgbm9uY2UgZmFpbHVyZXM8L3RleHQ+Cjwvc3ZnPg==" alt="How to fix WooCommerce checkout error and payment failures step by step" width="600" height="338" style="aspect-ratio:16/9;width:100%;height:auto;object-fit:cover;display:block;border-radius:8px;" loading="lazy" />
            </a>
            <span class="p-cat">WooCommerce · Troubleshooting</span>
            <h3 style="font-size:18px;margin:8px 0"><a href="/blog/how-to-fix-woocommerce-checkout-error/">How to Fix WooCommerce Checkout Error & Critical Payment Failures</a></h3>
            <p style="font-size:14px;color:var(--ink-soft);line-height:1.5;margin-bottom:12px">Customers clicking 'Place Order' only to see an endless spinning wheel, a generic 'Internal Server Error', or expired pa...</p>
          </div>
          <div>
            <p class="post-meta" style="font-size:13px;color:var(--ink-faint);margin-bottom:8px">October 2026 · 7 min read</p>
            <a class="more" href="/blog/how-to-fix-woocommerce-checkout-error/" style="font-size:14px;font-weight:600;color:var(--gold)">Read article →</a>
          </div>
        </article>
        
        <article class="card post-card" style="display:flex;flex-direction:column;justify-content:space-between">
          <div>
            <a href="/blog/trage-woocommerce-winkelwagen-postnl-exact-online/" style="display:block;overflow:hidden;border-radius:8px;margin-bottom:12px;background:var(--bg-soft)">
              <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MDAgNDUwIiB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzE2MTgxRCIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMwRTEwMTMiLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImdvbGRHcmFkIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIwJSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNENEFGNjciLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjQTk4NTQ4Ii8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgZmlsbD0idXJsKCNiZykiLz4KICA8ZyBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiIHN0cm9rZS13aWR0aD0iMSI+CiAgICA8bGluZSB4MT0iMCIgeTE9IjkwIiB4Mj0iODAwIiB5Mj0iOTAiLz4KICAgIDxsaW5lIHgxPSIwIiB5MT0iMTgwIiB4Mj0iODAwIiB5Mj0iMTgwIi8+CiAgICA8bGluZSB4MT0iMCIgeTE9IjI3MCIgeDI9IjgwMCIgeTI9IjI3MCIvPgogICAgPGxpbmUgeDE9IjAiIHkxPSIzNjAiIHgyPSI4MDAiIHkyPSIzNjAiLz4KICAgIDxsaW5lIHgxPSIxNjAiIHkxPSIwIiB4Mj0iMTYwIiB5Mj0iNDUwIi8+CiAgICA8bGluZSB4MT0iMzIwIiB5MT0iMCIgeDI9IjMyMCIgeTI9IjQ1MCIvPgogICAgPGxpbmUgeDE9IjQ4MCIgeTE9IjAiIHgyPSI0ODAiIHkyPSI0NTAiLz4KICAgIDxsaW5lIHgxPSI2NDAiIHkxPSIwIiB4Mj0iNjQwIiB5Mj0iNDUwIi8+CiAgPC9nPgogIDxyZWN0IHg9IjcwIiB5PSI3MCIgd2lkdGg9IjY2MCIgaGVpZ2h0PSIzMTAiIHJ4PSIxNCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDgpIiBzdHJva2Utd2lkdGg9IjEuNSIvPgogIDxyZWN0IHg9IjExMCIgeT0iMTIwIiB3aWR0aD0iMTk1IiBoZWlnaHQ9IjM2IiByeD0iNiIgZmlsbD0icmdiYSgyMTIsMTc1LDEwMywwLjEyKSIgc3Ryb2tlPSJyZ2JhKDIxMiwxNzUsMTAzLDAuMykiIHN0cm9rZS13aWR0aD0iMSIvPgogIDx0ZXh0IHg9IjEyNSIgeT0iMTQzIiBmaWxsPSIjRDRBRjY3IiBmb250LWZhbWlseT0iLWFwcGxlLXN5c3RlbSxCbGlua01hY1N5c3RlbUZvbnQsU2Vnb2UgVUksUm9ib3RvLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtd2VpZ2h0PSI3MDAiIGxldHRlci1zcGFjaW5nPSIxIj5MT0dJU1RJRUsgJmFtcDsgRVJQPC90ZXh0PgogIDxyZWN0IHg9IjMxNSIgeT0iMTIwIiB3aWR0aD0iMjIwIiBoZWlnaHQ9IjM2IiByeD0iNiIgZmlsbD0icmdiYSgxNiwxODUsMTI5LDAuMTIpIiBzdHJva2U9InJnYmEoMTYsMTg1LDEyOSwwLjMpIiBzdHJva2Utd2lkdGg9IjEiLz4KICA8dGV4dCB4PSIzMzAiIHk9IjE0MyIgZmlsbD0iIzEwQjk4MSIgZm9udC1mYW1pbHk9Ii1hcHBsZS1zeXN0ZW0sQmxpbmtNYWNTeXN0ZW1Gb250LFNlZ29lIFVJLFJvYm90byxzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmb250LXdlaWdodD0iNzAwIiBsZXR0ZXItc3BhY2luZz0iMC41Ij7inJMgUE9TVE5MICZhbXA7IEVYQUNUIE9OTElORTwvdGV4dD4KICA8dGV4dCB4PSIxMTAiIHk9IjIxMCIgZmlsbD0iI0Y1RjJFQiIgZm9udC1mYW1pbHk9Ikdlb3JnaWEsc2VyaWYiIGZvbnQtc2l6ZT0iMjUiIGZvbnQtd2VpZ2h0PSI3MDAiPlRyYWdlIFdvb0NvbW1lcmNlIFdpbmtlbHdhZ2VuIEZpeGVuPC90ZXh0PgogIDx0ZXh0IHg9IjExMCIgeT0iMjUwIiBmaWxsPSIjOUM5NDg1IiBmb250LWZhbWlseT0iLWFwcGxlLXN5c3RlbSxCbGlua01hY1N5c3RlbUZvbnQsU2Vnb2UgVUksUm9ib3RvLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTUiPlBvc3ROTCAmYW1wOyBFeGFjdCBPbmxpbmUga25lbHB1bnRlbiBpbiBSb3R0ZXJkYW0gZS1jb21tZXJjZSDCtyBKYXkgTGFrdW08L3RleHQ+CiAgPGxpbmUgeDE9IjExMCIgeTE9IjI5MCIgeDI9IjY5MCIgeTI9IjI5MCIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDgpIiBzdHJva2Utd2lkdGg9IjEiLz4KICA8dGV4dCB4PSIxMTAiIHk9IjMzMCIgZmlsbD0idXJsKCNnb2xkR3JhZCkiIGZvbnQtZmFtaWx5PSItYXBwbGUtc3lzdGVtLEJsaW5rTWFjU3lzdGVtRm9udCxTZWdvZSBVSSxSb2JvdG8sc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMyIgZm9udC13ZWlnaHQ9IjYwMCI+4pyTIFZhc3RlIHByaWpzIHZvb3JhZiDCtyBEaXJlY3QgY29udGFjdCBtZXQgZGV2ZWxvcGVyIMK3IEdlZW4gdXVydGplLWZhY3R1dXJ0amU8L3RleHQ+Cjwvc3ZnPg==" alt="Trage WooCommerce winkelwagen versnellen met PostNL en Exact Online koppelingen" width="600" height="338" style="aspect-ratio:16/9;width:100%;height:auto;object-fit:cover;display:block;border-radius:8px;" loading="lazy" />
            </a>
            <span class="p-cat">WooCommerce &middot; PostNL &amp; ERP Integraties</span>
            <h3 style="font-size:18px;margin:8px 0"><a href="/blog/trage-woocommerce-winkelwagen-postnl-exact-online/">Trage WooCommerce Winkelwagen Oplossen: PostNL &amp; Exact Online Knelpunten in Rotterdam &amp; Rijnmond</a></h3>
            <p style="font-size:14px;color:var(--ink-soft);line-height:1.5;margin-bottom:12px">Blijft je WooCommerce winkelwagen hangen bij het berekenen van verzendkosten of voorraad? Zo los je PostNL API latency e...</p>
          </div>
          <div>
            <p class="post-meta" style="font-size:13px;color:var(--ink-faint);margin-bottom:8px">October 2026 · 5 min leestijd</p>
            <a class="more" href="/blog/trage-woocommerce-winkelwagen-postnl-exact-online/" style="font-size:14px;font-weight:600;color:var(--gold)">Read article →</a>
          </div>
        </article>
        
      </div>
    </div>
  </article>
</main>

<footer class="site">
  <div class="wrap">
    <p>© 2026 Jay Lakum · Shopify & WooCommerce Performance Developer</p>
    <div class="foot-nav">
      <a href="/#services">Services</a>
      <a href="/#work">Work</a>
      <a href="/case-study/">Case Study</a>
      <a href="/privacy/">Privacy Policy</a>
      <a href="/blog/">All Articles</a>
      <a href="/nl/" style="color:var(--gold);font-weight:600">Nederlands (NL)</a>
      <a href="/nl/amsterdam/">Amsterdam</a>
      <a href="/nl/rotterdam/">Rotterdam</a>
      <a href="/nl/utrecht/">Utrecht</a>
      <a href="/nl/den-haag/">Den Haag</a>
      <a href="/nl/eindhoven/">Eindhoven</a>
      <a href="mailto:jay@jaylakum.com">jay@jaylakum.com</a>
    </div>
  </div>
</footer>

</body>
</html>
