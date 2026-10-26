<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="color-scheme" content="light dark" />

<title>5 Shopify apps die Nederlandse webshops vertragen (en hoe je achtergebleven Liquid code opruimt) | Jay Lakum</title>
<meta name="description" content="Heb je apps verwijderd, maar voelt je Shopify webshop nog steeds traag? Waarom onzichtbare 'spookcode' in theme.liquid je mobiele PageSpeed keldert en hoe je dit opschoont." />
<meta name="author" content="Jay Lakum" />
<link rel="canonical" href="https://jaylakum.com/blog/shopify-apps-vertragen-webshop-liquid-opruimen/" />
<link rel="alternate" hreflang="en" href="https://jaylakum.com/blog/shopify-apps-vertragen-webshop-liquid-opruimen/" />
<link rel="alternate" hreflang="x-default" href="https://jaylakum.com/blog/shopify-apps-vertragen-webshop-liquid-opruimen/" />

<!-- Favicon -->
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="alternate icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="apple-touch-icon" href="/favicon.svg" />

<!-- Open Graph / Social -->
<meta property="og:type" content="article" />
<meta property="og:url" content="https://jaylakum.com/blog/shopify-apps-vertragen-webshop-liquid-opruimen/" />
<meta property="og:site_name" content="Jay Lakum — Webshop Performance & Development" />
<meta property="og:title" content="5 Shopify apps die Nederlandse webshops vertragen (en hoe je achtergebleven Liquid code opruimt)" />
<meta property="og:description" content="Heb je apps verwijderd, maar voelt je Shopify webshop nog steeds traag? Waarom onzichtbare 'spookcode' in theme.liquid je mobiele PageSpeed keldert en hoe je dit opschoont." />
<meta property="og:image" content="https://jaylakum.com/og-image.svg" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="5 Shopify apps die Nederlandse webshops vertragen (en hoe je achtergebleven Liquid code opruimt)" />
<meta name="twitter:description" content="Heb je apps verwijderd, maar voelt je Shopify webshop nog steeds traag? Waarom onzichtbare 'spookcode' in theme.liquid je mobiele PageSpeed keldert en hoe je dit opschoont." />
<meta name="twitter:image" content="https://jaylakum.com/og-image.svg" />

<!-- Structured Data (JSON-LD) -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BlogPosting",
      "@id": "https://jaylakum.com/blog/shopify-apps-vertragen-webshop-liquid-opruimen/#article",
      "headline": "5 Shopify apps die Nederlandse webshops vertragen (en hoe je achtergebleven Liquid code opruimt)",
      "description": "Heb je apps verwijderd, maar voelt je Shopify webshop nog steeds traag? Waarom onzichtbare 'spookcode' in theme.liquid je mobiele PageSpeed keldert en hoe je dit opschoont.",
      "datePublished": "2026-10-26T10:00:00+01:00",
      "dateModified": "2026-10-26T18:00:00+01:00",
      "inLanguage": "en",
      "mainEntityOfPage": "https://jaylakum.com/blog/shopify-apps-vertragen-webshop-liquid-opruimen/",
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
        { "@type": "ListItem", "position": 3, "name": "5 Shopify apps die Nederlandse webshops vertragen (en hoe je achtergebleven Liquid code opruimt)" }
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
    --ink-soft:#4A463F;
    --ink-faint:#6E6759;
    --gold:#A98548;
    --gold-deep:#8A6C33;
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
      --bg:#12110F;
      --bg-soft:#1A1916;
      --card:#211F1B;
      --ink:#F5F2EB;
      --ink-soft:#CCC5B8;
      --ink-faint:#9C9485;
      --gold:#D4AF67;
      --gold-deep:#E2C485;
      --gold-soft:#2E2718;
      --line:#2E2A23;
      --line-strong:#453E32;
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
  .btn{
    display:inline-flex;
    align-items:center;
    justify-content:center;
    padding:10px 22px;
    border-radius:var(--radius);
    background:var(--gold);
    color:#fff!important;
    font-weight:600;
    font-size:15px;
    transition:background .2s;
  }
  .btn:hover{background:var(--gold-deep)}
  
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
</style>
</head>
<body>

<header class="site">
  <div class="wrap head-row">
    <a class="brand" href="/">Jay <span>lakum</span></a>
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
      <a href="/">Home</a> › <a href="/blog/">Blog</a> › <span>5 Shopify apps die Nederlandse webshops vertragen (en hoe je achtergebleven Liquid code opruimt)</span>
    </nav>

    <span class="p-cat">Shopify &middot; Liquid &amp; Snelheid</span>
    <h1>5 Shopify apps die Nederlandse webshops vertragen (en hoe je achtergebleven Liquid code opruimt)</h1>
    <p class="article-meta">October 2026 · 5 min leestijd · by Jay Lakum, Senior Webshop & Performance Specialist</p>

    <img class="article-hero" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MDAgNDUwIiB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzE2MTgxRCIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMwRTEwMTMiLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImdvbGRHcmFkIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIwJSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNENEFGNjciLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjQTk4NTQ4Ii8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgZmlsbD0idXJsKCNiZykiLz4KICA8ZyBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiIHN0cm9rZS13aWR0aD0iMSI+CiAgICA8bGluZSB4MT0iMCIgeTE9IjkwIiB4Mj0iODAwIiB5Mj0iOTAiLz4KICAgIDxsaW5lIHgxPSIwIiB5MT0iMTgwIiB4Mj0iODAwIiB5Mj0iMTgwIi8+CiAgICA8bGluZSB4MT0iMCIgeTE9IjI3MCIgeDI9IjgwMCIgeTI9IjI3MCIvPgogICAgPGxpbmUgeDE9IjAiIHkxPSIzNjAiIHgyPSI4MDAiIHkyPSIzNjAiLz4KICAgIDxsaW5lIHgxPSIxNjAiIHkxPSIwIiB4Mj0iMTYwIiB5Mj0iNDUwIi8+CiAgICA8bGluZSB4MT0iMzIwIiB5MT0iMCIgeDI9IjMyMCIgeTI9IjQ1MCIvPgogICAgPGxpbmUgeDE9IjQ4MCIgeTE9IjAiIHgyPSI0ODAiIHkyPSI0NTAiLz4KICAgIDxsaW5lIHgxPSI2NDAiIHkxPSIwIiB4Mj0iNjQwIiB5Mj0iNDUwIi8+CiAgPC9nPgogIDxyZWN0IHg9IjcwIiB5PSI3MCIgd2lkdGg9IjY2MCIgaGVpZ2h0PSIzMTAiIHJ4PSIxNCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDgpIiBzdHJva2Utd2lkdGg9IjEuNSIvPgogIDxyZWN0IHg9IjExMCIgeT0iMTIwIiB3aWR0aD0iMTgwIiBoZWlnaHQ9IjM2IiByeD0iNiIgZmlsbD0icmdiYSgyMTIsMTc1LDEwMywwLjEyKSIgc3Ryb2tlPSJyZ2JhKDIxMiwxNzUsMTAzLDAuMykiIHN0cm9rZS13aWR0aD0iMSIvPgogIDx0ZXh0IHg9IjEyNSIgeT0iMTQzIiBmaWxsPSIjRDRBRjY3IiBmb250LWZhbWlseT0iLWFwcGxlLXN5c3RlbSxCbGlua01hY1N5c3RlbUZvbnQsU2Vnb2UgVUksUm9ib3RvLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtd2VpZ2h0PSI3MDAiIGxldHRlci1zcGFjaW5nPSIxIj5TSE9QSUZZIFRIRU1FPC90ZXh0PgogIDxyZWN0IHg9IjMwMCIgeT0iMTIwIiB3aWR0aD0iMTkwIiBoZWlnaHQ9IjM2IiByeD0iNiIgZmlsbD0icmdiYSgxNiwxODUsMTI5LDAuMTIpIiBzdHJva2U9InJnYmEoMTYsMTg1LDEyOSwwLjMpIiBzdHJva2Utd2lkdGg9IjEiLz4KICA8dGV4dCB4PSIzMTUiIHk9IjE0MyIgZmlsbD0iIzEwQjk4MSIgZm9udC1mYW1pbHk9Ii1hcHBsZS1zeXN0ZW0sQmxpbmtNYWNTeXN0ZW1Gb250LFNlZ29lIFVJLFJvYm90byxzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmb250LXdlaWdodD0iNzAwIiBsZXR0ZXItc3BhY2luZz0iMC41Ij7imqEgU1BFRUQgQVVESVQ8L3RleHQ+CiAgPHRleHQgeD0iMTEwIiB5PSIyMTAiIGZpbGw9IiNGNUYyRUIiIGZvbnQtZmFtaWx5PSJHZW9yZ2lhLHNlcmlmIiBmb250LXNpemU9IjI2IiBmb250LXdlaWdodD0iNzAwIj5TaG9waWZ5IEFwcCBCbG9hdCAmYW1wOyBTcG9va2NvZGUgU2FuZXJlbjwvdGV4dD4KICA8dGV4dCB4PSIxMTAiIHk9IjI1MCIgZmlsbD0iIzlDOTQ4NSIgZm9udC1mYW1pbHk9Ii1hcHBsZS1zeXN0ZW0sQmxpbmtNYWNTeXN0ZW1Gb250LFNlZ29lIFVJLFJvYm90byxzYW5zLXNlcmlmIiBmb250LXNpemU9IjE1Ij5QcmFrdGlzY2hlIHRlY2huaXNjaGUgZ2lkcyB2b29yIE5lZGVybGFuZHNlIHdlYndpbmtlbHMgwrcgSmF5IExha3VtPC90ZXh0PgogIDxsaW5lIHgxPSIxMTAiIHkxPSIyOTAiIHgyPSI2OTAiIHkyPSIyOTAiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA4KSIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgPHRleHQgeD0iMTEwIiB5PSIzMzAiIGZpbGw9InVybCgjZ29sZEdyYWQpIiBmb250LWZhbWlseT0iLWFwcGxlLXN5c3RlbSxCbGlua01hY1N5c3RlbUZvbnQsU2Vnb2UgVUksUm9ib3RvLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTMiIGZvbnQtd2VpZ2h0PSI2MDAiPuKckyBWYXN0ZSBwcmlqcyB2b29yYWYgJm1pZGRvdDsgRGlyZWN0IGNvbnRhY3QgbWV0IGRldmVsb3BlciAmbWlkZG90OyBHZWVuIHV1cnRqZS1mYWN0dXVydGplPC90ZXh0Pgo8L3N2Zz4=" alt="Illustratie van Shopify Liquid code inspectie en app scripts sanering" width="800" height="450" style="aspect-ratio:16/9;width:100%;height:auto;" loading="eager" />

    <div class="article-body">
      <h2>Waarom Verwijderde Apps Je Webshop Nog Steeds Vertragen</h2> <p>Veel Nederlandse Shopify winkels installeren in de loop der jaren tientallen apps: een review widget, een currency switcher, een pop-up voor nieuwsbrieven, een bundle app en een Instagram feed. Wat de meeste webwinkeliers niet weten: <strong>wanneer je een app verwijdert uit het Shopify admin paneel, verwijdert Shopify zelden de code die in je thema is geïnjecteerd.</strong></p> <p>Deze achtergebleven Liquid snippets en externe JavaScript tags noemen we 'spookcode' (ghost scripts). Je browser probeert bij elk paginabezoek nog steeds verbinding te maken met niet-bestaande servers, wat leidt tot render-blocking vertragingen en een lage Largest Contentful Paint (LCP) score.</p>  <h2>De 5 Grootste Boosdoeners in Nederlandse Webshops</h2> <ol>   <li><strong>Oude Review Apps:</strong> Apps zoals Judge.me of Loox laden zware stylesheet- en fontbestanden vóórdat de producttitel zichtbaar is.</li>   <li><strong>Meertaligheid &amp; Currency Switchers:</strong> Scripts die constant de wisselkoers ophalen, zelfs als je alleen binnen Nederland en België verkoopt.</li>   <li><strong>Social Media &amp; Instagram Feeds:</strong> Externe widgets die 15+ ongecomprimeerde afbeeldingen en zware tracking libraries laden.</li>   <li><strong>Marketing Pop-ups &amp; Sticky Banners:</strong> Zware jQuery libraries die op mobiele 4G verbindingen voor 1.5 tot 2 seconden layout shifts (CLS) zorgen.</li>   <li><strong>Verouderde Tracking Pixels:</strong> Dubbele Google Analytics, TikTok en Meta pixels die niet via Google Tag Manager of Shopify Web Pixels API lopen.</li> </ol>  <h2>Hoe Je Spookcode Veilig Opschoont (Zonder Je Winkel te Breken)</h2> <ul>   <li><strong>Dupliceer Eerst Altijd Je Thema:</strong> Voer nooit wijzigingen direct door op je live thema. Werk in een draft thema om veilig te testen.</li>   <li><strong>Controleer <code>theme.liquid</code>:</strong> Zoek naar <code>{% include %}</code> of <code>{% render %}</code> tags met namen van apps die je al maanden geleden hebt gedeactiveerd.</li>   <li><strong>Inspecteer de <code>assets/</code> en <code>snippets/</code> mappen:</strong> Verwijder overbodige <code>.js</code> en <code>.liquid</code> bestanden die niet meer worden aangeroepen.</li>   <li><strong>Migreer Naar Shopify Online Store 2.0 App Blocks:</strong> Gebruik moderne apps die met App Blocks werken. Deze worden namelijk wél 100% automatisch en schoon verwijderd zodra je de app de-installeert.</li> </ul>  <h2>Direct Hulp Nodig van een Shopify Specialist?</h2> <p>Werk je aan een boutique webshop of modebrand in de Randstad? Bekijk mijn aanpak als <a href="/nl/amsterdam/">Shopify specialist in Amsterdam</a> en de rest van Nederland. Stuur me een berichtje met je webshop URL via <a href="/nl/">jaylakum.com/nl/</a> voor een gratis, vrijblijvende code scan.</p>
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
            <span class="p-cat">E-Commerce · Nederland</span>
            <h3 style="font-size:18px;margin:8px 0"><a href="/blog/webshop-klaarmaken-feestdagen/">Webshop Klaarmaken Voor De Feestdagen: 5 Technische Checkout & Snelheid Fixes</a></h3>
            <p style="font-size:14px;color:var(--ink-soft);line-height:1.5;margin-bottom:12px">Met Black Friday en de decemberdrukte voor de deur verliezen trage Nederlandse webshops duizenden euro's aan haperende c...</p>
          </div>
          <div>
            <p class="post-meta" style="font-size:13px;color:var(--ink-faint);margin-bottom:8px">October 2026 · 4 min leestijd</p>
            <a class="more" href="/blog/webshop-klaarmaken-feestdagen/" style="font-size:14px;font-weight:600;color:var(--gold)">Read article →</a>
          </div>
        </article>
        
        <article class="card post-card" style="display:flex;flex-direction:column;justify-content:space-between">
          <div>
            <span class="p-cat">WooCommerce &middot; iDEAL &amp; Mollie</span>
            <h3 style="font-size:18px;margin:8px 0"><a href="/blog/mollie-ideal-checkout-storing-oplossen/">Hoe los je een trage iDEAL / Mollie checkout op in WooCommerce &amp; Shopify?</a></h3>
            <p style="font-size:14px;color:var(--ink-soft);line-height:1.5;margin-bottom:12px">Klant betaalt via de bank, maar de bestelling blijft op 'In behandeling' of 'Mislukt' staan? Dit is de technische oorzaa...</p>
          </div>
          <div>
            <p class="post-meta" style="font-size:13px;color:var(--ink-faint);margin-bottom:8px">October 2026 · 4 min leestijd</p>
            <a class="more" href="/blog/mollie-ideal-checkout-storing-oplossen/" style="font-size:14px;font-weight:600;color:var(--gold)">Read article →</a>
          </div>
        </article>
        
        <article class="card post-card" style="display:flex;flex-direction:column;justify-content:space-between">
          <div>
            <span class="p-cat">Shopify · Speed</span>
            <h3 style="font-size:18px;margin:8px 0"><a href="/blog/why-is-my-shopify-store-so-slow/">Why Is My Shopify Store So Slow? 5 Fixes That Actually Work</a></h3>
            <p style="font-size:14px;color:var(--ink-soft);line-height:1.5;margin-bottom:12px">Shopify itself is fast — so why does your store crawl? The five causes behind almost every slow Shopify store, and how t...</p>
          </div>
          <div>
            <p class="post-meta" style="font-size:13px;color:var(--ink-faint);margin-bottom:8px">October 2026 · 5 min read</p>
            <a class="more" href="/blog/why-is-my-shopify-store-so-slow/" style="font-size:14px;font-weight:600;color:var(--gold)">Read article →</a>
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
