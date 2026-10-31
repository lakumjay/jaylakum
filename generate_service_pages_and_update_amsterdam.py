#!/usr/bin/env python3
"""
Generate high-intent Dutch service pages:
- /diensten/woocommerce-bug-fix/
- /diensten/postnl-woocommerce-koppeling/
And optimize /nl/amsterdam/ as a true money page (Title/H1: WooCommerce specialist Amsterdam).
Update sitemap.xml and internal links.
"""

import os
import shutil

BASE_DIR = "/Users/jay/Documents/GitHub/jaylakum"
HTDOCS_DIR = "/Applications/XAMPP/xamppfiles/htdocs/jaylakum"

# Common head styles & elements for service pages
def get_service_page_html(
    title,
    meta_desc,
    canonical_url,
    h1,
    subhead,
    schema_service_name,
    badges,
    problems_list,
    steps_list,
    pricing_title,
    pricing_desc,
    price_tag,
    pricing_bullets,
    faqs,
    related_links
):
    faq_schema = []
    faq_html = []
    for q, a in faqs:
        faq_schema.append({
            "@type": "Question",
            "name": q,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": a
            }
        })
        faq_html.append(f"""
        <details class="faq-item">
          <summary>{q}</summary>
          <p>{a}</p>
        </details>
        """)
    
    import json
    faq_json_str = json.dumps(faq_schema, ensure_ascii=False, indent=6)

    badges_html = "".join([f'<span class="badge-item">{b}</span>' for b in badges])
    
    problems_html = "".join([f"""
      <div class="card problem-card">
        <div class="icon-circle">{p['icon']}</div>
        <h3>{p['title']}</h3>
        <p>{p['desc']}</p>
        <span class="fix-tag">{p['solution_tag']}</span>
      </div>
    """ for p in problems_list])

    steps_html = "".join([f"""
      <div class="step-card">
        <div class="step-num">{s['num']}</div>
        <div>
          <h4>{s['title']}</h4>
          <p>{s['desc']}</p>
        </div>
      </div>
    """ for s in steps_list])

    pricing_bullets_html = "".join([f'<li>✓ {b}</li>' for b in pricing_bullets])

    related_links_html = "".join([f"""
      <a href="{r['url']}" class="related-card">
        <span class="rel-tag">{r['tag']}</span>
        <h4>{r['title']} &rarr;</h4>
        <p>{r['desc']}</p>
      </a>
    """ for r in related_links])

    html = f"""<!doctype html>
<html lang="nl-NL">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="color-scheme" content="light dark" />

<!-- Favicon & Touch Icons -->
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
<link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
<link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

<!-- Primary SEO Meta -->
<title>{title}</title>
<meta name="description" content="{meta_desc}" />
<meta name="author" content="Jay Lakum" />
<link rel="canonical" href="{canonical_url}" />
<link rel="alternate" hreflang="nl-NL" href="{canonical_url}" />
<link rel="alternate" hreflang="nl" href="{canonical_url}" />
<link rel="sitemap" type="application/xml" title="Sitemap" href="https://jaylakum.com/sitemap.xml" />

<!-- Geo & Robots -->
<meta name="geo.region" content="NL" />
<meta name="geo.placename" content="Amsterdam, Rotterdam, Utrecht, Den Haag, Eindhoven, Nederland" />
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
<meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large" />

<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:url" content="{canonical_url}" />
<meta property="og:site_name" content="Jay Lakum — WooCommerce & E-Commerce Specialist Nederland" />
<meta property="og:title" content="{title}" />
<meta property="og:description" content="{meta_desc}" />
<meta property="og:image" content="https://jaylakum.com/og-image.png" />
<meta property="og:locale" content="nl_NL" />

<!-- Structured Data -->
<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@graph": [
    {{
      "@type": "WebPage",
      "@id": "{canonical_url}#webpage",
      "url": "{canonical_url}",
      "name": "{title}",
      "inLanguage": "nl-NL",
      "description": "{meta_desc}"
    }},
    {{
      "@type": "Person",
      "@id": "https://jaylakum.com/#person",
      "name": "Jay Lakum",
      "jobTitle": "Freelance WooCommerce & Performance Specialist",
      "url": "https://jaylakum.com/",
      "email": "jay@jaylakum.com",
      "sameAs": [
        "https://github.com/lakumjay",
        "https://www.linkedin.com/in/lakum-jay/",
        "https://dev.to/lakum_jay"
      ]
    }},
    {{
      "@type": ["Service", "ProfessionalService"],
      "@id": "{canonical_url}#service",
      "name": "{schema_service_name}",
      "provider": {{ "@id": "https://jaylakum.com/#person" }},
      "areaServed": {{
        "@type": "Country",
        "name": "Netherlands"
      }},
      "serviceType": "{schema_service_name}",
      "description": "{meta_desc}",
      "priceRange": "{price_tag}",
      "offers": {{
        "@type": "Offer",
        "priceCurrency": "EUR",
        "price": "{price_tag.replace('€', '').replace('+', '').split('–')[0].strip() if '€' in price_tag else '290'}",
        "availability": "https://schema.org/InStock",
        "validFrom": "2026-01-01"
      }}
    }},
    {{
      "@type": "FAQPage",
      "@id": "{canonical_url}#faq",
      "mainEntity": {faq_json_str}
    }}
  ]
}}
</script>

<style>
  :root{{
    --bg:#FAF7F1;
    --bg-soft:#F3EEE3;
    --card:#FFFFFF;
    --ink:#1C1A17;
    --ink-soft:#423E37;
    --ink-faint:#595347;
    --gold:#684B1B;
    --gold-deep:#553D16;
    --gold-btn:#745218;
    --gold-btn-text:#FFFFFF;
    --gold-soft:#EFE6D2;
    --line:#E3DCCB;
    --line-strong:#CFC4A6;
    --shadow:0 10px 30px rgba(28,26,23,.08);
    --radius:12px;
    --serif:Georgia,'Iowan Old Style','Times New Roman',serif;
    --sans:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;
  }}
  @media (prefers-color-scheme: dark){{
    :root{{
      --bg:#171410;
      --bg-soft:#1F1B15;
      --card:#211C16;
      --ink:#EDE6D6;
      --ink-soft:#D4CBBC;
      --ink-faint:#B5A894;
      --gold:#E5BE72;
      --gold-deep:#F0CE8A;
      --gold-btn:#E5BE72;
      --gold-btn-text:#171410;
      --gold-soft:#2C2517;
      --line:#37301F;
      --line-strong:#4A4028;
      --shadow:0 10px 30px rgba(0,0,0,.45);
    }}
  }}
  *{{box-sizing:border-box}}
  html{{scroll-behavior:smooth}}
  body{{
    margin:0;background:var(--bg);color:var(--ink);
    font-family:var(--sans);font-size:17px;line-height:1.65;
    -webkit-font-smoothing:antialiased;
  }}
  a{{color:var(--gold-deep);text-decoration:none}}
  a:hover{{text-decoration:underline}}
  h1,h2,h3,h4{{font-family:var(--serif);font-weight:600;line-height:1.2;color:var(--ink);margin:0}}
  .wrap{{max-width:1120px;margin:0 auto;padding:0 24px}}
  
  /* Buttons */
  .btn{{
    display:inline-flex;align-items:center;justify-content:center;gap:8px;
    font-family:var(--sans);font-weight:700;font-size:14.5px;line-height:1.2;
    padding:11px 22px;border-radius:999px;border:1.5px solid var(--gold);
    background:var(--gold-btn);color:var(--gold-btn-text)!important;cursor:pointer;
    transition:background .2s,border-color .2s,transform .15s,box-shadow .2s;
    box-shadow:0 2px 8px rgba(0,0,0,.08);text-decoration:none!important;
  }}
  .btn:hover{{background:var(--gold-deep);border-color:var(--gold-deep);transform:translateY(-1px);box-shadow:0 4px 14px rgba(0,0,0,.15)}}
  .btn-ghost{{background:transparent;color:var(--ink)!important;border-color:var(--line-strong)}}
  .btn-ghost:hover{{background:var(--bg-soft);border-color:var(--gold);color:var(--ink)!important}}
  .btn-wa{{
    background:#25D366!important;border-color:#25D366!important;color:#FFFFFF!important;
    font-weight:700;box-shadow:0 4px 14px rgba(37,211,102,.3)!important;
  }}
  .btn-wa:hover{{background:#20ba59!important;border-color:#20ba59!important;transform:translateY(-1px)}}

  /* Sticky Header */
  header.site{{
    position:sticky;top:0;z-index:60;
    background:color-mix(in srgb, var(--bg) 92%, transparent);
    backdrop-filter:blur(10px);border-bottom:1px solid var(--line);
  }}
  .nav{{display:flex;align-items:center;justify-content:space-between;gap:16px;height:66px}}
  .brand{{font-family:var(--serif);font-size:20px;font-weight:700;color:var(--ink);display:inline-flex;align-items:center;gap:8px}}
  .brand span span{{color:var(--gold-deep)}}
  .nav-links{{display:flex;align-items:center;gap:20px}}
  .nav-links a{{color:var(--ink-soft);font-size:15px;font-weight:500}}
  .nav-links a:hover{{color:var(--ink);text-decoration:none}}
  .lang-toggle-btn{{
    display:inline-flex;align-items:center;gap:4px;padding:6px 14px;border-radius:999px;
    border:1.5px solid var(--gold);color:var(--ink)!important;font-weight:700;font-size:13px;
    background:var(--gold-soft);text-decoration:none!important;
  }}

  /* Hero Section */
  .hero{{padding:68px 0 60px;border-bottom:1px solid var(--line)}}
  .hero-tag{{
    display:inline-block;font-size:12.5px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;
    color:var(--gold-deep);background:var(--gold-soft);border:1px solid var(--line);
    border-radius:999px;padding:4px 12px;margin-bottom:18px;
  }}
  .hero h1{{font-size:clamp(32px,4.5vw,48px);margin-bottom:18px}}
  .hero .sub{{font-size:19px;color:var(--ink-soft);max-width:820px;margin:0 0 28px;line-height:1.6}}
  .badges-row{{display:flex;flex-wrap:wrap;gap:8px 14px;margin-bottom:28px}}
  .badge-item{{
    display:inline-flex;align-items:center;font-size:13.5px;font-weight:600;
    color:var(--ink-soft);background:var(--card);border:1px solid var(--line);
    border-radius:8px;padding:5px 12px;
  }}
  .hero-ctas{{display:flex;flex-wrap:wrap;gap:12px;align-items:center}}

  /* Sections */
  .section{{padding:68px 0}}
  .section-soft{{background:var(--bg-soft)}}
  .eyebrow{{font-size:13px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--gold-deep);margin-bottom:12px}}
  .section-head{{margin-bottom:36px;max-width:760px}}
  .section-head h2{{font-size:clamp(26px,3.8vw,36px);margin-bottom:12px}}
  .section-head p{{color:var(--ink-soft);font-size:17.5px;margin:0}}

  /* Grid & Cards */
  .grid-2{{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:24px}}
  .card{{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:30px;box-shadow:var(--shadow)}}
  .problem-card{{position:relative;display:flex;flex-direction:column;gap:10px}}
  .problem-card h3{{font-size:20px;margin-top:6px}}
  .problem-card p{{color:var(--ink-soft);font-size:15px;line-height:1.6;margin:0;flex-grow:1}}
  .icon-circle{{
    width:42px;height:42px;border-radius:10px;background:var(--gold-soft);color:var(--gold-deep);
    display:flex;align-items:center;justify-content:center;font-size:20px;
  }}
  .fix-tag{{
    display:inline-block;margin-top:10px;font-size:12px;font-weight:700;
    color:var(--gold-deep);background:var(--bg-soft);padding:3px 8px;border-radius:6px;width:fit-content;
  }}

  /* Steps Timeline */
  .steps-wrap{{display:flex;flex-direction:column;gap:18px}}
  .step-card{{
    display:flex;gap:20px;align-items:flex-start;background:var(--card);
    border:1px solid var(--line);border-radius:12px;padding:22px 26px;box-shadow:var(--shadow);
  }}
  .step-num{{
    width:36px;height:36px;border-radius:50%;background:var(--gold);color:#FFF;
    display:flex;align-items:center;justify-content:center;font-weight:800;font-size:15px;flex-shrink:0;margin-top:2px;
  }}
  .step-card h4{{font-size:18px;margin-bottom:6px}}
  .step-card p{{color:var(--ink-soft);font-size:15px;line-height:1.6;margin:0}}

  /* Pricing Box */
  .pricing-box{{
    background:var(--card);border:2px solid var(--gold);border-radius:16px;
    padding:40px;box-shadow:var(--shadow);max-width:760px;margin:0 auto;text-align:center;
  }}
  .price-highlight{{font-size:clamp(32px,5vw,46px);font-weight:800;font-family:var(--serif);color:var(--gold-deep);margin:12px 0}}
  .pricing-bullets{{
    list-style:none;padding:0;margin:20px auto 28px;max-width:520px;text-align:left;
    display:flex;flex-direction:column;gap:10px;font-size:16px;color:var(--ink-soft);
  }}

  /* FAQs */
  .faq-wrap{{max-width:800px;margin:0 auto}}
  details.faq-item{{border-bottom:1px solid var(--line);padding:8px 0}}
  details.faq-item summary{{
    cursor:pointer;font-family:var(--serif);font-size:19px;font-weight:600;
    padding:12px 24px 12px 0;list-style:none;position:relative;color:var(--ink);
  }}
  details.faq-item summary::-webkit-details-marker{{display:none}}
  details.faq-item summary::after{{
    content:"+";position:absolute;right:0;top:10px;font-size:24px;color:var(--gold-deep);font-weight:400;
  }}
  details.faq-item[open] summary::after{{content:"–"}}
  details.faq-item p{{margin:0 0 16px;color:var(--ink-soft);font-size:16px;line-height:1.65}}

  /* Related Cards */
  .related-grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}}
  .related-card{{
    display:block;background:var(--card);border:1px solid var(--line);border-radius:12px;
    padding:22px;color:inherit;text-decoration:none!important;transition:transform .2s,border-color .2s;
  }}
  .related-card:hover{{transform:translateY(-2px);border-color:var(--gold)}}
  .rel-tag{{font-size:11px;font-weight:700;color:var(--gold-deep);text-transform:uppercase;letter-spacing:.05em}}
  .related-card h4{{font-size:17px;margin:8px 0 6px}}
  .related-card p{{color:var(--ink-soft);font-size:14px;line-height:1.5;margin:0}}

  /* WhatsApp Float */
  .whatsapp-float{{
    position:fixed;bottom:28px;right:28px;z-index:999;
    display:inline-flex;align-items:center;gap:10px;background:#25D366;color:#FFF!important;
    padding:11px 22px 11px 16px;border-radius:999px;font-size:14.5px;font-weight:700;
    text-decoration:none!important;box-shadow:0 8px 24px rgba(37,211,102,.45);transition:transform .2s;
  }}
  .whatsapp-float:hover{{transform:scale(1.05) translateY(-2px)}}
  .whatsapp-float svg{{width:22px;height:22px;fill:#FFF}}
  @media(max-width:720px){{
    .whatsapp-float{{bottom:80px;right:16px;padding:0;width:52px;height:52px;justify-content:center;border-radius:50%}}
    .whatsapp-float .wa-text{{display:none}}
    .whatsapp-float svg{{width:28px;height:28px}}
  }}

  /* Sticky Mobile Bar */
  .sticky-mobile-bar{{display:none}}
  @media (max-width: 720px){{
    .sticky-mobile-bar{{
      display:flex;gap:8px;position:fixed;left:12px;right:12px;
      bottom:calc(12px + env(safe-area-inset-bottom));z-index:90;
      box-shadow:0 10px 30px rgba(0,0,0,0.22);border-radius:999px;
      background:var(--card);padding:6px;border:1px solid var(--line-strong);
    }}
    .sticky-btn-audit{{flex:1.2;justify-content:center;padding:10px 14px!important;font-size:13.5px!important;white-space:nowrap}}
    .sticky-btn-wa{{flex:1;justify-content:center;padding:10px 14px!important;font-size:13.5px!important;white-space:nowrap}}
  }}

  /* Footer */
  footer{{padding:44px 0;border-top:1px solid var(--line);background:var(--bg-soft);font-size:14px;color:var(--ink-faint)}}
</style>
</head>
<body>

<header class="site">
  <div class="wrap nav">
    <a href="/nl/" class="brand">
      <img src="/favicon.svg" alt="Jay Lakum Logo" width="28" height="28" style="border-radius:6px;" />
      <span>Jay <span>Lakum</span></span>
    </a>
    <div class="nav-links">
      <a href="/nl/">Home (NL)</a>
      <a href="/nl/#diensten">Alle Diensten</a>
      <a href="/nl/amsterdam/">Amsterdam</a>
      <a href="/nl/rotterdam/">Rotterdam</a>
      <a href="/nl/case-study/">Case Study</a>
      <a href="/" class="lang-toggle-btn">🇬🇧 EN</a>
      <a href="#contact" class="btn" style="padding:8px 18px;font-size:13.5px">Direct Contact</a>
    </div>
  </div>
</header>

<main>
  <!-- Hero Section -->
  <section class="hero">
    <div class="wrap">
      <span class="hero-tag">🇳🇱 WooCommerce Specialist Nederland &middot; Acute Service</span>
      <h1>{h1}</h1>
      <p class="sub">{subhead}</p>
      <div class="badges-row">
        {badges_html}
      </div>
      <div class="hero-ctas">
        <a href="https://wa.me/916353116138?text=Hallo%20Jay,%20ik%20heb%20hulp%20nodig%20met%20mijn%20WooCommerce%20webshop" target="_blank" rel="noopener" class="btn btn-wa">
          💬 Meld Je Probleem Direct via WhatsApp &rarr;
        </a>
        <a href="#contact" class="btn btn-ghost">Vraag Vrijblijvende Offerte Aan</a>
      </div>
    </div>
  </section>

  <!-- Problem & Solution Cards Grid -->
  <section class="section">
    <div class="wrap">
      <div class="section-head">
        <div class="eyebrow">VEELVOORKOMENDE KNELPUNTEN</div>
        <h2>Welke Problemen Lossen Wij Binnen 24–48 Uur Op?</h2>
        <p>Elke minuut dat jouw checkout hapert of een plugin conflict geeft, haken betalende Nederlandse consumenten af. Wij isoleren en repareren de kernoorzaak.</p>
      </div>
      <div class="grid-2">
        {problems_html}
      </div>
    </div>
  </section>

  <!-- 4-Step Process -->
  <section class="section section-soft" style="border-top:1px solid var(--line);border-bottom:1px solid var(--line)">
    <div class="wrap">
      <div class="section-head" style="margin:0 auto 36px;text-align:center">
        <div class="eyebrow">VEILIGE WERKWIJZE</div>
        <h2>Hoe We Werken: 100% Veilig Op Staging</h2>
        <p>Jouw live webwinkel blijft 100% online en operationeel. We testen en verifiëren elke regel code op een kopie-omgeving.</p>
      </div>
      <div class="steps-wrap" style="max-width:760px;margin:0 auto">
        {steps_html}
      </div>
    </div>
  </section>

  <!-- Transparent Pricing Section -->
  <section class="section">
    <div class="wrap">
      <div class="pricing-box">
        <div class="eyebrow" style="margin-bottom:8px">TRANSPARANTE TARIEVEN &middot; GEEN NACALCULATIE</div>
        <h3 style="font-size:28px;margin:0">{pricing_title}</h3>
        <p style="color:var(--ink-soft);font-size:16px;margin:8px 0 0">{pricing_desc}</p>
        <div class="price-highlight">{price_tag}</div>
        <ul class="pricing-bullets">
          {pricing_bullets_html}
        </ul>
        <div style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap">
          <a href="https://wa.me/916353116138?text=Hallo%20Jay,%20ik%20wil%20een%20prijsopgave%20voor%20mijn%20webshop" target="_blank" rel="noopener" class="btn btn-wa" style="font-size:15px;padding:12px 24px">
            💬 Stuur Foutmelding via WhatsApp &rarr;
          </a>
          <a href="#contact" class="btn btn-ghost" style="font-size:15px;padding:12px 24px">
            Offerte Per E-mail Aanvragen
          </a>
        </div>
        <p style="margin:18px 0 0;font-size:13px;color:var(--ink-faint)">
          🛡️ No-cure-no-pay garantie binnen schriftelijke overeengekomen scope.
        </p>
      </div>
    </div>
  </section>

  <!-- FAQs -->
  <section class="section section-soft" style="border-top:1px solid var(--line)">
    <div class="wrap">
      <div class="section-head" style="text-align:center;margin:0 auto 36px">
        <div class="eyebrow">VEELGESTELDE VRAGEN</div>
        <h2>Vragen Over Deze Dienst</h2>
      </div>
      <div class="faq-wrap">
        {"".join(faq_html)}
      </div>
    </div>
  </section>

  <!-- Related Articles & Cities -->
  <section class="section" style="border-top:1px solid var(--line)">
    <div class="wrap">
      <div class="section-head">
        <div class="eyebrow">KENNIS & REGIO'S</div>
        <h2>Gerelateerde Handleidingen & Lokale Ondersteuning</h2>
        <p>Lees meer over specifieke WooCommerce optimalisaties of bekijk onze lokale dekking in de Randstad.</p>
      </div>
      <div class="related-grid">
        {related_links_html}
      </div>
    </div>
  </section>

  <!-- Contact Section -->
  <section id="contact" class="section section-soft" style="border-top:1px solid var(--line)">
    <div class="wrap" style="text-align:center;max-width:700px;margin:0 auto">
      <div class="eyebrow">DIRECT CONTACT</div>
      <h2 style="margin-bottom:12px">Hulp Nodig Bij Jouw WooCommerce Webshop?</h2>
      <p style="color:var(--ink-soft);font-size:17px;margin:0 0 26px">
        Stuur direct een bericht via WhatsApp of e-mail met jouw foutmelding of website-URL. Je ontvangt binnen 24 uur een heldere diagnose en vaste prijsopgave.
      </p>
      <div style="display:flex;justify-content:center;gap:14px;flex-wrap:wrap">
        <a href="https://wa.me/916353116138?text=Hallo%20Jay,%20ik%20heb%20een%20vraag%20over%20mijn%20WooCommerce%20winkel" target="_blank" rel="noopener" class="btn btn-wa" style="font-size:15.5px;padding:12px 26px">
          💬 WhatsApp: +91 6353116138
        </a>
        <a href="mailto:jay@jaylakum.com" class="btn btn-ghost" style="font-size:15px;padding:12px 24px">
          ✉️ jay@jaylakum.com
        </a>
      </div>
      <p style="margin:20px 0 0;font-size:13.5px;color:var(--ink-faint)">
        Direct contact met senior developer &middot; Geen accountmanager &middot; Vaste projectprijzen
      </p>
    </div>
  </section>
</main>

<footer>
  <div class="wrap">
    <div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:24px;margin-bottom:24px">
      <div style="flex:1;min-width:240px">
        <strong style="color:var(--ink);font-size:16px;display:block;margin-bottom:8px">Jay Lakum — WooCommerce & E-Commerce</strong>
        <p style="margin:0 0 8px">Snelle Shopify & WooCommerce webwinkels in Nederland. PostNL, Mollie & iDEAL 2.0 checkout integraties.</p>
        <p style="margin:0">Vaste prijs &middot; Staging tests &middot; Binnen 24u reactie</p>
      </div>
      <div style="flex:1;min-width:200px">
        <strong style="color:var(--ink);display:block;margin-bottom:8px">Gespecialiseerde Diensten</strong>
        <ul style="list-style:none;padding:0;margin:0;line-height:1.8">
          <li><a href="/diensten/woocommerce-bug-fix/">WooCommerce Bug Fix & Kassa Reparatie</a></li>
          <li><a href="/diensten/postnl-woocommerce-koppeling/">PostNL WooCommerce Koppeling</a></li>
          <li><a href="/nl/#diensten">Core Web Vitals Snelheidssprint</a></li>
        </ul>
      </div>
      <div style="flex:1;min-width:200px">
        <strong style="color:var(--ink);display:block;margin-bottom:8px">Lokale WooCommerce Regio's</strong>
        <ul style="list-style:none;padding:0;margin:0;line-height:1.8">
          <li><a href="/nl/amsterdam/">WooCommerce Specialist Amsterdam</a></li>
          <li><a href="/nl/rotterdam/">WooCommerce Specialist Rotterdam</a></li>
          <li><a href="/nl/utrecht/">WooCommerce Specialist Utrecht</a></li>
          <li><a href="/nl/den-haag/">WooCommerce Specialist Den Haag</a></li>
        </ul>
      </div>
    </div>
    <div style="border-top:1px solid var(--line);padding-top:20px;text-align:center">
      <p>© 2026 Jay Lakum &middot; <a href="/privacy/" style="text-decoration:underline">Privacybeleid</a> &middot; <a href="/nl/case-study/" style="text-decoration:underline">Case Study</a> &middot; <a href="/nl/">Nederlands</a> &middot; <a href="/">English</a></p>
    </div>
  </div>
</footer>

<!-- Floating WhatsApp Button -->
<a href="https://wa.me/916353116138?text=Hallo%20Jay,%20ik%20heb%20een%20vraag%20over%20mijn%20WooCommerce%20webshop" target="_blank" rel="noopener" class="whatsapp-float" aria-label="Chat direct via WhatsApp">
  <svg viewBox="0 0 32 32">
    <path d="M16 2a13.9 13.9 0 0 0-12 21L2 30l7.2-1.9A13.9 13.9 0 1 0 16 2zm0 25.4a11.5 11.5 0 0 1-5.9-1.6l-.4-.3-4.4 1.2 1.2-4.3-.3-.4A11.5 11.5 0 1 1 16 27.4zm6.3-8.6c-.3-.2-2-.1-2.3.1s-.6.3-.9.6-.5.4-.8.4-.7-.1-1.9-.8a9.4 9.4 0 0 1-2.4-2.2c-.3-.4 0-.6.2-.8s.4-.4.5-.6.2-.4.1-.6-.8-2-1.1-2.7c-.3-.7-.6-.6-.9-.6h-.8a1.6 1.6 0 0 0-1.2.6 4.9 4.9 0 0 0-1.5 3.6 8.5 8.5 0 0 0 1.8 4.6 19.5 19.5 0 0 0 7.6 6.7 8.9 8.9 0 0 0 3.7.8c1.3 0 2.5-.5 3.3-1.4a4.1 4.1 0 0 0 .9-2.7c0-.4-.3-.6-.6-.7z"/>
  </svg>
  <span class="wa-text">WhatsApp Direct</span>
</a>

<!-- Sticky Mobile Bar -->
<div class="sticky-mobile-bar">
  <a href="https://wa.me/916353116138?text=Hallo%20Jay,%20ik%20heb%20hulp%20nodig%20met%20mijn%20webshop" target="_blank" rel="noopener" class="btn btn-wa sticky-btn-wa">
    💬 WhatsApp
  </a>
  <a href="#contact" class="btn sticky-btn-audit">
    ⚡ Offerte Aanvragen
  </a>
</div>

</body>
</html>
"""
    return html

def main():
    print("Generating Service Page 1: /diensten/woocommerce-bug-fix/...")
    p1_problems = [
        {
            "icon": "⏳",
            "title": "Winkelwagen & Checkout Blijft Oneindig Laden",
            "desc": "Bij het wijzigen van verzendmethode of invoeren van adresgegevens bevriest de kassa op '?wc-ajax=update_order_review'. Bezoekers zien een grijze overlay en haken gefrustreerd af.",
            "solution_tag": "AJAX Conflict Opgelost"
        },
        {
            "icon": "💳",
            "title": "Mollie & iDEAL Betalingen Blijven 'Pending'",
            "desc": "Klanten rekenen succesvol af via hun bank-app, maar de bestelstatus in WooCommerce springt niet op 'In behandeling'. Webhook communicatie valt stil door firewall- of servertime-outs.",
            "solution_tag": "Webhook & SSL Fix"
        },
        {
            "icon": "⚠️",
            "title": "500 Internal Server Error & Witte Schermen",
            "desc": "Na een update van WooCommerce of WordPress crasht de afrekenpagina met een 'Er is een kritieke fout opgetreden'. PHP memory limits of verouderde custom code blokkeren orders.",
            "solution_tag": "PHP & Log Diagnose"
        },
        {
            "icon": "🧩",
            "title": "Conflicterende Plugins & Checkout Velden",
            "desc": "Verzendplugins (zoals PostNL of MyParcel) botsen met custom checkout field editors of one-page-checkout plugins. Foutieve veldvalidatie voorkomt dat klanten kunnen doorklikken.",
            "solution_tag": "Plugin Compatibiliteit"
        }
    ]

    p1_steps = [
        {
            "num": "1",
            "title": "Logboek & Query Diagnose (binnen 2 uur)",
            "desc": "We inspecteren de WooCommerce fatal error logs, debug.log en PHP query monitors om de exacte broncode-oorzaak te isoleren."
        },
        {
            "num": "2",
            "title": "Isolatie & Veilige Fix op Staging",
            "desc": "We werken op een geïsoleerde kopie-omgeving. Jouw live winkel blijft 100% operationeel en ontvangt gewoon bestellingen."
        },
        {
            "num": "3",
            "title": "End-to-End Testbetaling & Verificatie",
            "desc": "We voeren live tests uit met iDEAL en creditcard, controleren webhook statussen en verifiëren dat alle verzendmethoden foutloos laden."
        },
        {
            "num": "4",
            "title": "Veilige Livegang & Geen-Oplossing-Geen-Factuur",
            "desc": "Pas na jouw schriftelijke goedkeuring synchroniseren we de fix naar de live webshop. Betaling pas na tevredenheid."
        }
    ]

    p1_faqs = [
        ("Hoe snel kan een acute WooCommerce checkout storing worden opgelost?",
         "Acute kassa-storingen en iDEAL haperingen pakken we met prioriteit op. In 90% van de gevallen is de diagnose en fix binnen 24 tot maximaal 48 uur afgerond op staging."),
        ("Blijft mijn webwinkel online tijdens de reparatie?",
         "Jazeker. Wij passen nooit direct code aan op jouw actieve productiewebsite. We zetten een staging kopie op waar we de fout reproduceren en fixen. Jouw omzet loopt tijdens het werk gewoon door."),
        ("Wat kost een WooCommerce bug fix gemiddeld?",
         "Voor gerichte checkout bugs, AJAX conflicts en iDEAL storingen hanteren we een vaste prijs tussen €290 en €450 vooraf. Je ontvangt altijd eerst een vaste prijsopgave zonder verrassingen achteraf."),
        ("Wat houdt de no-cure-no-pay garantie in?",
         "Ligt het probleem binnen de schriftelijk overeengekomen scope en slagen wij er niet in de bug op te lossen? Dan vervalt de factuur volledig. Je loopt als ondernemer geen enkel financieel risico.")
    ]

    p1_related = [
        {
            "tag": "Verzending & Koppeling",
            "url": "/diensten/postnl-woocommerce-koppeling/",
            "title": "PostNL WooCommerce Koppeling Repareren",
            "desc": "Checkout vertragingen door PostNL API-calls en labelgeneratie structureel verhelpen."
        },
        {
            "tag": "Lokale Ondersteuning",
            "url": "/nl/amsterdam/",
            "title": "WooCommerce Specialist Amsterdam",
            "desc": "Snelle ondersteuning voor Amsterdamse webwinkels, boetieks en modemerken."
        },
        {
            "tag": "Handleiding & Gids",
            "url": "/blog/mollie-ideal-checkout-storing-oplossen/",
            "title": "Mollie & iDEAL Checkout Storing Oplossen",
            "desc": "Zelf stapsgewijs controleren waarom iDEAL betalingen haperen in 10 minuten."
        }
    ]

    p1_html = get_service_page_html(
        title="WooCommerce Bug Fix & Checkout Reparatie | Binnen 24u — Jay Lakum",
        meta_desc="Winkelwagen traag, fouten bij iDEAL betaling of haperende kassa in WooCommerce? Binnen 24-48 uur opgelost op staging. Vaste prijs vooraf & betalen bij oplevering.",
        canonical_url="https://jaylakum.com/diensten/woocommerce-bug-fix/",
        h1="WooCommerce Bug Fix & Acute Kassa Reparatie",
        subhead="Blijft je winkelwagen hangen, mislukken iDEAL betalingen of vertoont de kassa JavaScript conflicten? Wij lossen acute fouten binnen 24–48 uur op met no-cure-no-pay garantie op staging.",
        schema_service_name="WooCommerce Bug Fix & Checkout Reparatie",
        badges=[
            "✓ Binnen 24–48 uur gestart",
            "✓ Vaste prijs: €290 – €450",
            "✓ 100% Betalen bij oplevering",
            "✓ Live winkel blijft 100% online"
        ],
        problems_list=p1_problems,
        steps_list=p1_steps,
        pricing_title="Vaste Prijs Per Opgeloste Bug",
        pricing_desc="Geen uurtje-factuurtje of openstaande declaraties. Heldere vaste projectprijs.",
        price_tag="€290 – €450",
        pricing_bullets=[
            "Grondige error log & code inspectie",
            "Veilige staging kopie voor risicoloos testen",
            "Reparatie van AJAX / JavaScript / Webhook conflicten",
            "End-to-end verificatie met testtransactie",
            "14 dagen nazorg en monitoring na livegang"
        ],
        faqs=p1_faqs,
        related_links=p1_related
    )

    out_p1 = os.path.join(BASE_DIR, "diensten/woocommerce-bug-fix/index.html")
    with open(out_p1, "w", encoding="utf-8") as f:
        f.write(p1_html)
    print("Created:", out_p1)

    print("Generating Service Page 2: /diensten/postnl-woocommerce-koppeling/...")
    p2_problems = [
        {
            "icon": "🐢",
            "title": "Trage Checkout door Synchrone PostNL API Calls",
            "desc": "Elke keer dat een bezoeker een postcode of huisnummer intypt, vuurt de plugin een synchrone aanvraag naar de PostNL servers. Bij lichte vertraging bij PostNL bevriest jouw checkout 4+ seconden.",
            "solution_tag": "Async API & Transients"
        },
        {
            "icon": "📍",
            "title": "PostNL Pakketpunt Kiezer Verschijnt Niet",
            "desc": "De afhaallocatie-kaart laadt niet, toont een grijs vlak of gooit console errors ('google is not defined' of Leaflet CSS conflicts). Klanten kunnen geen afhaalpunt selecteren.",
            "solution_tag": "Map Widget Fix"
        },
        {
            "icon": "🏷️",
            "title": "Verzendlabels Mislukken of Printen Foutief",
            "desc": "Foutmeldingen bij bulk-labelgeneratie in het WooCommerce dashboard ('Invalid address' of 'Unauthorized API key'). Zendingen moeten handmatig worden overgetikt in Mijn PostNL.",
            "solution_tag": "Label Automation"
        },
        {
            "icon": "📦",
            "title": "Conflicten met MyParcel, Sendcloud of Exact Online",
            "desc": "Tegelijk draaiende logistieke extensies overschrijven elkaars checkout metadata. Verzendkosten worden dubbel berekend of orderstatussen worden niet gesynchroniseerd.",
            "solution_tag": "ERP & Verzendkoppeling"
        }
    ]

    p2_steps = [
        {
            "num": "1",
            "title": "API & Transients Audit",
            "desc": "We meten de API-reactietijden van PostNL en controleren de wp_options tabel op opgehoopte transients die de checkout vertragen."
        },
        {
            "num": "2",
            "title": "Asynchrone Caching & Script Optimalisatie",
            "desc": "We implementeren transient caching voor postcodecontroles en laden de pakketpuntkiezer asynchroon zodat de kassa direct responsief blijft."
        },
        {
            "num": "3",
            "title": "Label- & Barcode Flow Verificatie",
            "desc": "We testen het complete orderproces: van adresinvoer en pakketpuntselectie tot geautomatiseerde barcodegeneratie in PDF."
        },
        {
            "num": "4",
            "title": "Livegang & Performance Controle",
            "desc": "Na jouw akkoord zetten we de geoptimaliseerde koppeling live. Geen checkout haperingen meer tijdens piekdagen."
        }
    ]

    p2_faqs = [
        ("Waarom maakt de officiële PostNL plugin mijn kassa zo traag?",
         "De officiële PostNL plugin controleert adressen en pakketpunten via live API-aanroepen. Als deze aanroepen synchroon worden uitgevoerd, moet de browser van jouw bezoeker wachten op het antwoord van de PostNL server voordat de kassa verder kan. Met asynchrone validatie en slimme transient caching verhelpen we dit knelpunt volledig."),
        ("Werkt dit ook met MyParcel of Sendcloud?",
         "Jazeker. Wij hebben ruime ervaring met alle gangbare Nederlandse verzendoplossingen (PostNL, MyParcel, Sendcloud, Trunkrs en Fietskoeriers) en zorgen dat ze probleemloos integreren zonder database-vervuiling."),
        ("Wat kost een optimalisatie of reparatie van de PostNL koppeling?",
         "Voor een complete analyse, ontkoppeling van vertragende synchrone calls en het foutloos instellen van pakketpunten hanteren we een vaste projectprijs van €290 tot €490. No-cure-no-pay binnen overeengekomen scope."),
        ("Moet ik overstappen naar een andere hostingpartij?",
         "In 95% van de gevallen niet. De vertraging zit vrijwel altijd in de manier waarop de plugin API-calls afhandelt en niet in de serverhardware. Na de code-optimalisatie draait de checkout direct soepel op jouw bestaande hosting.")
    ]

    p2_related = [
        {
            "tag": "Algemene Kassa Reparatie",
            "url": "/diensten/woocommerce-bug-fix/",
            "title": "WooCommerce Bug Fix & Checkout Reparatie",
            "desc": "Acute hulp bij AJAX timeouts, iDEAL storingen en conflicterende winkelwagen plugins."
        },
        {
            "tag": "Diepgaand Blogartikel",
            "url": "/blog/trage-woocommerce-winkelwagen-postnl-exact-online/",
            "title": "Trage WooCommerce Winkelwagen door PostNL Oplossen",
            "desc": "Gedetailleerde technische handleiding over transients, API latency en Exact Online."
        },
        {
            "tag": "Lokale Ondersteuning",
            "url": "/nl/rotterdam/",
            "title": "WooCommerce Specialist Rotterdam",
            "desc": "E-commerce en logistieke koppelingen voor B2B en webshops in de Rijnmondregio."
        }
    ]

    p2_html = get_service_page_html(
        title="PostNL WooCommerce Koppeling Repareren & Versnellen | Jay Lakum",
        meta_desc="Hapert de PostNL plugin in WooCommerce of vertraagt het adresveld de checkout? Wij lossen API timeouts, label print errors en afhaallocatie bugs binnen 48u op.",
        canonical_url="https://jaylakum.com/diensten/postnl-woocommerce-koppeling/",
        h1="PostNL WooCommerce Koppeling: Reparatie & Versnelling",
        subhead="Geen haperende checkout meer bij adresinvoer of afhaallocaties. Wij lossen PostNL API time-outs, labelprint fouten en database-transient vervuiling binnen 48 uur structureel op.",
        schema_service_name="PostNL WooCommerce Koppeling Reparatie & Versnelling",
        badges=[
            "✓ Checkout vertraging opgelost",
            "✓ Vaste prijs: €290 – €490",
            "✓ 100% Betalen bij oplevering",
            "✓ Binnen 48 uur werkend"
        ],
        problems_list=p2_problems,
        steps_list=p2_steps,
        pricing_title="Vaste Prijs Voor PostNL Koppeling Optimalisatie",
        pricing_desc="Foutloze adresvalidatie, afhaallocaties en verzendlabels zonder checkout vertraging.",
        price_tag="€290 – €490",
        pricing_bullets=[
            "Volledige analyse van PostNL API wachttijden",
            "Transient caching voor razendsnelle postcodecheck",
            "Foutloze weergave van PostNL Pakketpunten & avondbezorging",
            "Reparatie van geautomatiseerde verzendlabels (PDF)",
            "Koppelingstest op veilige staging omgeving"
        ],
        faqs=p2_faqs,
        related_links=p2_related
    )

    out_p2 = os.path.join(BASE_DIR, "diensten/postnl-woocommerce-koppeling/index.html")
    with open(out_p2, "w", encoding="utf-8") as f:
        f.write(p2_html)
    print("Created:", out_p2)

    # Now update /nl/amsterdam/index.html
    print("Updating /nl/amsterdam/index.html with exact match Title & H1 and money page enhancements...")
    ams_file = os.path.join(BASE_DIR, "nl/amsterdam/index.html")
    with open(ams_file, "r", encoding="utf-8") as f:
        ams_content = f.read()

    # 1. Update Title and Meta
    ams_content = ams_content.replace(
        "<title>WooCommerce Developer Amsterdam | Shopify Dev — Jay Lakum</title>",
        "<title>WooCommerce specialist Amsterdam | Jay Lakum</title>"
    )
    ams_content = ams_content.replace(
        '<meta name="description" content="Trage Shopify of WooCommerce webshop in Amsterdam? Freelance developer voor mobiele laadtijden onder 2,5 seconden en acute checkout fixes. Betalen bij oplevering." />',
        '<meta name="description" content="WooCommerce specialist in Amsterdam nodig? Trage kassa, PostNL storing of checkout reparatie binnen 24–48u opgelost. Vaste prijs vooraf &amp; betalen bij oplevering." />'
    )

    # 2. Update H1 and subhead
    old_h1_block = '<h1>Shopify & WooCommerce Specialist Amsterdam</h1>\n        <p class="sub">Snelle mobiele laadtijden (&lt;1.5s), iDEAL 2.0 checkout fixes en custom Liquid thema\'s voor Amsterdamse boetieks en modemerken — zonder dure agency overhead.</p>'
    new_h1_block = '<h1>WooCommerce Specialist Amsterdam</h1>\n        <p class="sub">Snelle mobiele laadtijden (&lt;2.0s), foutloze iDEAL &amp; Mollie checkout en PostNL-koppelingen voor Amsterdamse webwinkels — zonder de bureau-overhead van een grachtenpand.</p>'
    if old_h1_block in ams_content:
        ams_content = ams_content.replace(old_h1_block, new_h1_block)
    else:
        # Fallback replacement
        ams_content = ams_content.replace('<h1>Shopify & WooCommerce Specialist Amsterdam</h1>', '<h1>WooCommerce Specialist Amsterdam</h1>')

    # 3. Add link to service pages in the Diensten section of Amsterdam
    old_services_head = '<div class="section-head">\n        <div class="eyebrow">DIENSTEN VOOR DE NEDERLANDSE MARKT</div>\n        <h2>Waarmee Kan Ik Jouw Webwinkel Helpen?</h2>'
    new_services_head = '<div class="section-head">\n        <div class="eyebrow">DIENSTEN VOOR DE NEDERLANDSE MARKT</div>\n        <h2>Waarmee Kan Ik Jouw Webwinkel Helpen?</h2>\n        <p style="margin-top:8px"><a href="/diensten/woocommerce-bug-fix/" style="font-weight:700;color:var(--gold-deep);text-decoration:underline">&rarr; Bekijk ook: Acute WooCommerce Bug Fix Service</a> &middot; <a href="/diensten/postnl-woocommerce-koppeling/" style="font-weight:700;color:var(--gold-deep);text-decoration:underline">&rarr; PostNL Koppeling Optimalisatie</a></p>'
    if old_services_head in ams_content and "/diensten/woocommerce-bug-fix/" not in ams_content:
        ams_content = ams_content.replace(old_services_head, new_services_head)

    with open(ams_file, "w", encoding="utf-8") as f:
        f.write(ams_content)
    print("Updated /nl/amsterdam/index.html")

    # Update sitemap.xml
    print("Updating sitemap.xml...")
    sitemap_file = os.path.join(BASE_DIR, "sitemap.xml")
    with open(sitemap_file, "r", encoding="utf-8") as f:
        sitemap_content = f.read()

    new_urls_xml = """  <url>
    <loc>https://jaylakum.com/diensten/woocommerce-bug-fix/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://jaylakum.com/diensten/postnl-woocommerce-koppeling/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>"""

    if "https://jaylakum.com/diensten/woocommerce-bug-fix/" not in sitemap_content:
        sitemap_content = sitemap_content.replace("</urlset>", new_urls_xml)
        with open(sitemap_file, "w", encoding="utf-8") as f:
            f.write(sitemap_content)
        print("Updated sitemap.xml with 2 service pages")

    # Sync to HTDOCS_DIR as well
    print("Synchronizing to htdocs...")
    for root, dirs, files in os.walk(os.path.join(BASE_DIR, "diensten")):
        rel = os.path.relpath(root, BASE_DIR)
        target_dir = os.path.join(HTDOCS_DIR, rel)
        os.makedirs(target_dir, exist_ok=True)
        for f in files:
            src_f = os.path.join(root, f)
            dst_f = os.path.join(target_dir, f)
            shutil.copy2(src_f, dst_f)

    shutil.copy2(ams_file, os.path.join(HTDOCS_DIR, "nl/amsterdam/index.html"))
    shutil.copy2(sitemap_file, os.path.join(HTDOCS_DIR, "sitemap.xml"))
    print("Sync complete!")

if __name__ == "__main__":
    main()
