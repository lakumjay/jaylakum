import os
import re
import subprocess

BASE_DIR = '/Applications/XAMPP/xamppfiles/htdocs/jaylakum'

# Step 1: Restore clean base for index.html from 1521e26
res = subprocess.run(['git', 'show', '1521e26:index.html'], cwd='/Users/jay/Documents/GitHub/jaylakum', capture_output=True, text=True)
index_clean = res.stdout

# Replace the reviews section in index.html cleanly
honest_guarantee_en = """    <!-- Honest Work & First Client Guarantee (Replaces Unverified Reviews) -->
    <div class="section" style="border-top:1px solid var(--line);border-bottom:1px solid var(--line);background:var(--bg);padding:72px 0">
      <div class="wrap">
        <div style="background:var(--card);border:2px solid var(--gold);border-radius:18px;padding:44px 32px;box-shadow:var(--shadow);max-width:880px;margin:0 auto;text-align:center">
          <span class="tag" style="margin-bottom:14px">HONEST WORK &middot; NO FAKE REVIEWS</span>
          <h2 style="font-family:var(--serif);font-size:clamp(26px,3.8vw,36px);margin-bottom:14px">Work Directly with the Developer. Pay on Delivery.</h2>
          <p style="font-size:17px;color:var(--ink-soft);max-width:680px;margin:0 auto 28px;line-height:1.65">
            I don't display fabricated quotes from mystery founders. I believe in 100% transparency: You work directly with me, every line of code is tested safely on a staging theme with zero downtime, and you only pay once the agreed speed benchmark is met.
          </p>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:20px;text-align:left;margin-bottom:32px">
            <div style="background:var(--bg-soft);padding:20px;border-radius:12px;border:1px solid var(--line)">
              <div style="font-size:13px;font-weight:700;color:var(--gold-deep);margin-bottom:6px">🛡️ ZERO RISK</div>
              <div style="font-size:15.5px;color:var(--ink);font-weight:600;margin-bottom:4px">Pay On Delivery</div>
              <p style="margin:0;font-size:14px;color:var(--ink-soft);line-height:1.5">No upfront deposit. You test and verify the speed fix on staging before paying.</p>
            </div>
            <div style="background:var(--bg-soft);padding:20px;border-radius:12px;border:1px solid var(--line)">
              <div style="font-size:13px;font-weight:700;color:var(--gold-deep);margin-bottom:6px">⚡ REAL STORES</div>
              <div style="font-size:15.5px;color:var(--ink);font-weight:600;margin-bottom:4px">Live Verified Work</div>
              <p style="margin:0;font-size:14px;color:var(--ink-soft);line-height:1.5">Real code running in production on Gecko Monaco, Opulentt, and PostCraftAI.</p>
            </div>
            <div style="background:var(--bg-soft);padding:20px;border-radius:12px;border:1px solid var(--line)">
              <div style="font-size:13px;font-weight:700;color:var(--gold-deep);margin-bottom:6px">🎯 FIRST CLIENT SPECIAL</div>
              <div style="font-size:15.5px;color:var(--ink);font-weight:600;margin-bottom:4px">Your Store Featured</div>
              <p style="margin:0;font-size:14px;color:var(--ink-soft);line-height:1.5">Your project will become our next verified case study with complete before/after metrics.</p>
            </div>
          </div>
          <a href="#free-video-audit" class="btn" style="font-size:15px;padding:12px 28px">Get Your Free 3-Minute Video Audit &rarr;</a>
        </div>
      </div>
    </div>\n\n    """

start_rev = index_clean.find('<!-- Client Reviews / Verified Testimonials -->')
end_rev = index_clean.find('<!-- Transparent Pricing Guide -->')
if start_rev != -1 and end_rev != -1:
    index_clean = index_clean[:start_rev] + honest_guarantee_en + index_clean[end_rev:]

# Capitalize "Jay Lakum" consistently (#9)
index_clean = index_clean.replace('Jay lakum', 'Jay Lakum')

# Unify Offer name to "Free 3-Minute Video Audit" / "Free Video Audit" (#2)
index_clean = index_clean.replace('Free mini-audit', 'Free 3-Minute Video Audit')
index_clean = index_clean.replace('Free Mini-Audit', 'Free Video Audit')
index_clean = index_clean.replace('Free 3-Min Audit', 'Free 3-Minute Video Audit')
index_clean = index_clean.replace('3-Min Audit', '3-Minute Video Audit')

# Soften audit deadline (#2)
index_clean = index_clean.replace('within 24 hours with first thoughts', 'usually within 24-48 hours with first thoughts')
index_clean = index_clean.replace('Within 24h', 'Within 24-48h')
index_clean = index_clean.replace('within 24 hours, completely free', 'usually within 24-48 hours, completely free')

# Scope-bound pricing heading (#15)
index_clean = index_clean.replace('Clear Investment, Guaranteed Outcome', 'Transparent Investment &middot; Guaranteed Scope (Binnen Schriftelijke Scope)')
index_clean = index_clean.replace('Transparent Fixed Pricing Packages', 'Indicative Project Ranges &middot; Fixed Written Quote Upfront')

# Add Privacy Policy to footer (#10)
index_clean = index_clean.replace('<a href="#contact">Contact</a>', '<a href="/case-study/">Case Study</a>\n      <a href="/privacy/">Privacy Policy</a>\n      <a href="#contact">Contact</a>')

with open(os.path.join(BASE_DIR, 'index.html'), 'w', encoding='utf-8') as f:
    f.write(index_clean)
with open(os.path.join(BASE_DIR, 'index.php'), 'w', encoding='utf-8') as f:
    f.write(index_clean)
print("Updated index.html and index.php with clean structure and unified naming.")

# Step 2: Dutch Homepage (/nl/)
res_nl = subprocess.run(['git', 'show', '1521e26:nl/index.html'], cwd='/Users/jay/Documents/GitHub/jaylakum', capture_output=True, text=True)
nl_clean = res_nl.stdout

honest_guarantee_nl = """    <!-- Eerlijk Vakmanschap & Eerste Klant Garantie (Vervangt Ongeverifieerde Reviews) -->
    <div class="section" style="border-top:1px solid var(--line);border-bottom:1px solid var(--line);background:var(--bg);padding:72px 0">
      <div class="wrap">
        <div style="background:var(--card);border:2px solid var(--gold);border-radius:18px;padding:44px 32px;box-shadow:var(--shadow);max-width:880px;margin:0 auto;text-align:center">
          <span class="tag" style="margin-bottom:14px">EERLIJK VAKMANSCHAP &middot; GEEN VERZONNEN REVIEWS</span>
          <h2 style="font-family:var(--serif);font-size:clamp(26px,3.8vw,36px);margin-bottom:14px">Rechtstreeks Met De Developer. Betalen Bij Oplevering.</h2>
          <p style="font-size:17px;color:var(--ink-soft);max-width:680px;margin:0 auto 28px;line-height:1.65">
            Ik plaats geen verzonnen quotes van onbekende bedrijven. Ik kies voor 100% transparantie: Je werkt direct met mij, we testen alles veilig op een staging testomgeving zonder risico voor je live winkel, en je betaalt pas na tevreden oplevering.
          </p>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:20px;text-align:left;margin-bottom:32px">
            <div style="background:var(--bg-soft);padding:20px;border-radius:12px;border:1px solid var(--line)">
              <div style="font-size:13px;font-weight:700;color:var(--gold-deep);margin-bottom:6px">🛡️ NUL RISICO</div>
              <div style="font-size:15.5px;color:var(--ink);font-weight:600;margin-bottom:4px">Betalen Bij Oplevering</div>
              <p style="margin:0;font-size:14px;color:var(--ink-soft);line-height:1.5">Geen verplichte aanbetaling. Je controleert het resultaat eerst zelf op staging.</p>
            </div>
            <div style="background:var(--bg-soft);padding:20px;border-radius:12px;border:1px solid var(--line)">
              <div style="font-size:13px;font-weight:700;color:var(--gold-deep);margin-bottom:6px">⚡ ECHTE WEBWINKELS</div>
              <div style="font-size:15.5px;color:var(--ink);font-weight:600;margin-bottom:4px">Live Te Bekijken</div>
              <p style="margin:0;font-size:14px;color:var(--ink-soft);line-height:1.5">Echte productiecode op Gecko Monaco, Opulentt en PostCraftAI.</p>
            </div>
            <div style="background:var(--bg-soft);padding:20px;border-radius:12px;border:1px solid var(--line)">
              <div style="font-size:13px;font-weight:700;color:var(--gold-deep);margin-bottom:6px">🎯 EERSTE KLANT DEAL</div>
              <div style="font-size:15.5px;color:var(--ink);font-weight:600;margin-bottom:4px">Jouw Webshop Uitgelicht</div>
              <p style="margin:0;font-size:14px;color:var(--ink-soft);line-height:1.5">Jouw winkel wordt onze volgende officiële geverifieerde case study.</p>
            </div>
          </div>
          <a href="#gratis-audit" class="btn" style="font-size:15px;padding:12px 28px">Vraag Jouw Gratis 3-Minuten Video Audit Aan &rarr;</a>
        </div>
      </div>
    </div>\n\n    """

start_rev_nl = nl_clean.find('<!-- Client Reviews / Verified Testimonials -->')
end_rev_nl = nl_clean.find('<!-- Transparent Pricing Guide -->')
if start_rev_nl != -1 and end_rev_nl != -1:
    nl_clean = nl_clean[:start_rev_nl] + honest_guarantee_nl + nl_clean[end_rev_nl:]

# Unify Offer name in Dutch (#2)
nl_clean = nl_clean.replace('Gratis mini-audit', 'Gratis 3-Minuten Video Audit')
nl_clean = nl_clean.replace('Gratis Mini-Audit', 'Gratis Video Audit')
nl_clean = nl_clean.replace('Gratis Speed Audit', 'Gratis Video Audit')
nl_clean = nl_clean.replace('Gratis 3-Minuten Video Audit', 'Gratis 3-Minuten Video Audit')
nl_clean = nl_clean.replace('binnen 24 uur', 'binnen 24-48 uur')

# Scope-bound speed in NL hero (#4)
nl_clean = nl_clean.replace('Ik help Nederlandse webwinkels aan <b>sub-1.5s laadtijden</b>',
                            'Ik help Nederlandse webwinkels aan <b>snelle mobiele laadtijden (doel: sub-1.5s binnen schriftelijke scope)</b>')

# Add source to iDEAL claim (#6)
nl_clean = nl_clean.replace('Ruim 70% van de Nederlandse consumenten kiest voor iDEAL',
                            'Volgens Currence / eCommerce50 kiest het overgrote deel (~70%) van de Nederlandse consumenten voor iDEAL')
nl_clean = nl_clean.replace('Ruim 70% kiest voor iDEAL',
                            'Volgens Currence / eCommerce50 kiest het overgrote deel (~70%) voor iDEAL')

# Pricing heading scope-bound (#15)
nl_clean = nl_clean.replace('Transparante Vaste Tarieven', 'Indicatieve Richtprijzen &middot; Vaste Offerte Vooraf (Binnen Schriftelijke Scope)')

# Touch slider CSS for mobile (#13)
slider_css = """
  input[type="range"] {
    -webkit-appearance: none; appearance: none; width: 100%; height: 10px;
    border-radius: 5px; background: var(--line); outline: none; touch-action: pan-y;
  }
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none; appearance: none; width: 28px; height: 28px;
    border-radius: 50%; background: var(--gold); border: 2px solid #FFFFFF;
    box-shadow: 0 2px 6px rgba(0,0,0,0.25); cursor: pointer;
  }
  input[type="range"]::-moz-range-thumb {
    width: 28px; height: 28px; border-radius: 50%; background: var(--gold);
    border: 2px solid #FFFFFF; box-shadow: 0 2px 6px rgba(0,0,0,0.25); cursor: pointer;
  }
"""
if '::-webkit-slider-thumb' not in nl_clean:
    nl_clean = nl_clean.replace('.calc-slider-group input[type="range"]{', slider_css + '\n  .calc-slider-group input[type="range"]{')

# Add Privacy Policy to footer (#10)
nl_clean = nl_clean.replace('<a href="#contact">Contact</a>', '<a href="/nl/case-study/">Case Study</a>\n      <a href="/privacy/">Privacy Policy</a>\n      <a href="#contact">Contact</a>')

with open(os.path.join(BASE_DIR, 'nl/index.html'), 'w', encoding='utf-8') as f:
    f.write(nl_clean)
with open(os.path.join(BASE_DIR, 'nl/index.php'), 'w', encoding='utf-8') as f:
    f.write(nl_clean)
print("Updated nl/index.html and nl/index.php.")

# Step 3: Differentiate 5 City Pages (#7) and fix Utrecht CLS (#5)
city_configs = {
    'amsterdam': {
        'highlight_title': 'Shopify Fashion & Boutique Optimalisatie in Amsterdam',
        'highlight_desc': 'Amsterdamse modemerken en boetieks draaien vaak op zware Prestige- of Dawn-thema’s met veel visuele media. Wij optimaliseren specifiek voor snelle mobiele weergave in drukke winkelstraten (Negen Straatjes, De Pijp) en soepele multi-valuta checkouts voor internationale shoppers.',
        'tag': 'Amsterdam Fashion & Lifestyle'
    },
    'rotterdam': {
        'highlight_title': 'B2B & Port Logistics E-commerce in Rotterdam',
        'highlight_desc': 'Rotterdamse groothandels en webshops vereisen robuuste integraties met Exact Online, AFAS en PostNL/DHL webhooks. Wij elimineren webhook-timeouts en optimaliseren complexe staffelkortingen en B2B checkout flows.',
        'tag': 'Rotterdam Logistics & B2B'
    },
    'utrecht': {
        'highlight_title': 'Duurzame Webshops & Green Core Web Vitals in Utrecht',
        'highlight_desc': 'Utrechtse webshops lopen voorop in duurzaamheid en efficiëntie. Wij hosten op Nederlandse cloud VPS met TTFB < 200ms en garanderen strikte Google Core Web Vitals: LCP < 2.2s en CLS < 0.1 voor een minimale digitale CO2-voetafdruk.',
        'tag': 'Utrecht Green & Fast'
    },
    'den-haag': {
        'highlight_title': 'AVG / GDPR Privacy & Veilige Kassa in Den Haag',
        'highlight_desc': 'Rondom de hofstad en ambassades gelden de strengste eisen voor consumentenprivacy en gegevensbeveiliging. Wij implementeren cookieloze checkout tracking, strikte Content Security Policies (CSP) en 100% AVG-conforme iDEAL checkouts.',
        'tag': 'Den Haag Security & AVG'
    },
    'eindhoven': {
        'highlight_title': 'High-Tech & Headless Commerce in Brainport Eindhoven',
        'highlight_desc': 'In de technologische hoofdstad van Nederland bouwen en versnellen we geavanceerde webshops met Shopify Storefront API en headless architecturen voor razendsnelle micro-interacties en directe voorraadsynchronisatie.',
        'tag': 'Brainport Headless Tech'
    }
}

for city, cfg in city_configs.items():
    for ext in ['html', 'php']:
        fp = os.path.join(BASE_DIR, 'nl', city, f'index.{ext}')
        if not os.path.exists(fp):
            continue
        with open(fp, 'r', encoding='utf-8') as f:
            c = f.read()

        # Fix Utrecht CLS 0 -> CLS < 0.1 (#5)
        c = c.replace('CLS 0', 'CLS < 0.1')
        c = c.replace('CLS: 0', 'CLS < 0.1')

        # Capitalize Jay Lakum (#9)
        c = c.replace('Jay lakum', 'Jay Lakum')

        # Fix source for iDEAL (#6)
        c = c.replace('Ruim 70% kiest voor iDEAL', 'Volgens Currence / eCommerce50 kiest het overgrote deel (~70%) voor iDEAL')

        # Add unique local highlight block if not already there (#7)
        local_block = f"""
    <!-- Unieke Lokale Specialisatie ({city.title()}) -->
    <div class="section section-soft" style="border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:48px 0">
      <div class="wrap">
        <div style="background:var(--card);border-left:5px solid var(--gold);border-radius:12px;padding:32px;box-shadow:var(--shadow)">
          <span class="tag" style="margin-bottom:10px">{cfg['tag']}</span>
          <h3 style="font-family:var(--serif);font-size:24px;margin:0 0 12px">{cfg['highlight_title']}</h3>
          <p style="font-size:16.5px;color:var(--ink-soft);line-height:1.65;margin:0">{cfg['highlight_desc']}</p>
        </div>
      </div>
    </div>
"""
        if 'Unieke Lokale Specialisatie' not in c:
            c = c.replace('<!-- Hero Section -->', '<!-- Hero Section -->\n' + local_block)

        # Unify Offer names (#2)
        c = c.replace('Gratis mini-audit', 'Gratis 3-Minuten Video Audit')
        c = c.replace('Gratis Mini-Audit', 'Gratis Video Audit')
        c = c.replace('binnen 24 uur', 'binnen 24-48 uur')

        # Add Privacy Policy to footer (#10)
        c = c.replace('<a href="#contact">Contact</a>', '<a href="/nl/case-study/">Case Study</a>\n      <a href="/privacy/">Privacy Policy</a>\n      <a href="#contact">Contact</a>')

        with open(fp, 'w', encoding='utf-8') as f:
            f.write(c)
        print(f"Updated city page {city}/index.{ext}")

# Step 4: Create Privacy Policy Page (/privacy/) (#10)
priv_dir = os.path.join(BASE_DIR, 'privacy')
os.makedirs(priv_dir, exist_ok=True)

privacy_html = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Privacy Policy | Jay Lakum</title>
<meta name="description" content="Privacy Policy for jaylakum.com — transparent, GDPR/AVG compliant data practices." />
<link rel="canonical" href="https://jaylakum.com/privacy/" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<style>
  :root {
    --bg: #FAF7F1; --card: #FFFFFF; --ink: #1C1A17; --ink-soft: #423E37;
    --gold: #684B1B; --gold-deep: #553D16; --line: #E3DCCB;
    --serif: Georgia, serif; --sans: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
  @media (prefers-color-scheme: dark) {
    :root { --bg: #171410; --card: #211C16; --ink: #EDE6D6; --ink-soft: #D4CBBC; --line: #37301F; --gold: #E5BE72; --gold-deep: #F0CE8A; }
  }
  body { margin: 0; font-family: var(--sans); background: var(--bg); color: var(--ink); line-height: 1.65; padding: 40px 20px; font-size: 17px; }
  .wrap { max-width: 760px; margin: 0 auto; background: var(--card); padding: 40px; border-radius: 14px; border: 1px solid var(--line); }
  h1 { font-family: var(--serif); font-size: 32px; margin-top: 0; }
  h2 { font-family: var(--serif); font-size: 22px; margin: 28px 0 10px; }
  p, li { color: var(--ink-soft); font-size: 16px; }
  a { color: var(--gold-deep); text-decoration: none; font-weight: 600; }
  a:hover { text-decoration: underline; }
</style>
</head>
<body>
<div class="wrap">
  <p><a href="/">&larr; Back to Jay Lakum Home</a></p>
  <h1>Privacy Policy</h1>
  <p><strong>Effective Date:</strong> October 2026</p>
  <p>This Privacy Policy explains how Jay Lakum ("I", "me") collects, uses, and safeguards information submitted via <strong>jaylakum.com</strong>, in accordance with the EU General Data Protection Regulation (GDPR / AVG).</p>
  
  <h2>1. What Data Is Collected</h2>
  <p>When you request a Free 3-Minute Video Audit or send an inquiry via our contact form, I collect only:</p>
  <ul>
    <li>Your Name</li>
    <li>Your Email Address (solely to deliver your Loom video link or project reply)</li>
    <li>Your Webshop URL</li>
    <li>Your Project Notes / Technical Description</li>
  </ul>
  
  <h2>2. How Your Data Is Used</h2>
  <p>Your data is used strictly to diagnose your store, record your personalized video audit, and provide a fixed quote. <strong>I will never sell, lease, or share your contact details with third-party marketers or data brokers.</strong></p>
  
  <h2>3. Spam Prevention & Security</h2>
  <p>Our forms use privacy-friendly server-side honeypot traps and secure timestamp verification to prevent bot spam without intrusive tracking cookies.</p>
  
  <h2>4. Your Rights (GDPR / AVG)</h2>
  <p>You have the full right to inspect, correct, or request the immediate deletion of your submitted information at any time. Simply email <a href="mailto:jay@jaylakum.com">jay@jaylakum.com</a> and your data will be permanently removed within 24 hours.</p>
  
  <h2>5. Contact</h2>
  <p>Jay Lakum &middot; Independent Webshop Performance Developer<br>Email: <a href="mailto:jay@jaylakum.com">jay@jaylakum.com</a></p>
</div>
</body>
</html>
"""

with open(os.path.join(priv_dir, 'index.html'), 'w', encoding='utf-8') as f:
    f.write(privacy_html)
with open(os.path.join(priv_dir, 'index.php'), 'w', encoding='utf-8') as f:
    f.write(privacy_html)
print("Created /privacy/ page.")

# Step 5: Update sitemap.xml with proper changefreq & privacy page (#14)
sitemap_path = os.path.join(BASE_DIR, 'sitemap.xml')
sitemap_xml = """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://jaylakum.com/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://jaylakum.com/nl/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.95</priority>
  </url>
  <url>
    <loc>https://jaylakum.com/case-study/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://jaylakum.com/nl/case-study/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://jaylakum.com/nl/amsterdam/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.85</priority>
  </url>
  <url>
    <loc>https://jaylakum.com/nl/rotterdam/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.85</priority>
  </url>
  <url>
    <loc>https://jaylakum.com/nl/utrecht/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.85</priority>
  </url>
  <url>
    <loc>https://jaylakum.com/nl/den-haag/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.85</priority>
  </url>
  <url>
    <loc>https://jaylakum.com/nl/eindhoven/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.85</priority>
  </url>
  <url>
    <loc>https://jaylakum.com/privacy/</loc>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://jaylakum.com/blog/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://jaylakum.com/blog/webshop-klaarmaken-feestdagen/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://jaylakum.com/blog/why-is-my-shopify-store-so-slow/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://jaylakum.com/blog/woocommerce-checkout-broken-diagnose-10-minutes/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://jaylakum.com/blog/7-mobile-mistakes-killing-webshop-sales/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://jaylakum.com/blog/how-to-fix-slow-woocommerce-store-practical-checklist/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://jaylakum.com/blog/shopify-vs-woocommerce-for-fashion-stores-honest-comparison/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://jaylakum.com/blog/why-your-mobile-checkout-loses-sales-and-how-to-fix-it/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://jaylakum.com/blog/5-wordpress-plugin-conflicts-that-break-sites-and-their-fixes/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://jaylakum.com/blog/mollie-ideal-checkout-storing-oplossen/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://jaylakum.com/blog/shopify-apps-vertragen-webshop-liquid-opruimen/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
"""
with open(sitemap_path, 'w', encoding='utf-8') as f:
    f.write(sitemap_xml.strip())
print("Updated sitemap.xml with 21 URLs and accurate realistic changefreqs.")
