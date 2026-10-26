#!/usr/bin/env python3
"""
Automated Gemini Blog Generator for Jay Lakum (jaylakum.com)
Targeting high-value Web Design, Shopify & WooCommerce Speed/Redesign clients in US, UK, Netherlands & EU.

Features:
- Gemini 2.5 Flash powered deep technical articles.
- High-intent SEO titles, schema, and meta for European & US store owners.
- 100% Non-copyright SVG vector graphic headers for every article.
- Automatically inserts new articles into index.html (ARTICLES array).
- Automatically updates sitemap.xml.
"""

import os
import sys
import json
import re
import random
import urllib.request
import urllib.error
from datetime import datetime

# Default high-converting topics targeting US, UK, Netherlands & EU E-commerce brands
HIGH_INTENT_TOPICS = [
    {
        "title": "Shopify Speed Optimization: Why UK & EU Webshops Lose 20% Sales to Mobile Lag",
        "category": "Shopify · Speed Optimization",
        "geo": "UK & Europe",
        "keywords": "Shopify speed optimization UK, core web vitals fashion store London, mobile checkout Shopify EU"
    },
    {
        "title": "How Dutch Webshops (WooCommerce + iDEAL) Can Hit 90+ Mobile PageSpeed Without Breaking Checkout",
        "category": "WooCommerce · Netherlands",
        "geo": "Netherlands",
        "keywords": "WooCommerce speed Netherlands, iDEAL checkout bug fixes, Dutch e-commerce web designer"
    },
    {
        "title": "The 2026 Boutique E-Commerce Redesign Blueprint: Modern UX for Fashion & Beauty Stores",
        "category": "Web Design · E-Commerce",
        "geo": "US & UK",
        "keywords": "fashion web design London New York, Shopify redesign agency, boutique store UX conversion"
    },
    {
        "title": "Fixing Broken International Checkouts: Multi-Currency & VAT Bugs in WooCommerce EU",
        "category": "WooCommerce · Bug Fixes",
        "geo": "EU & UK",
        "keywords": "WooCommerce VAT checkout fix, currency switcher bug, international webshop developer"
    },
    {
        "title": "Why Fast Shopify Themes Still Score Red on Mobile: The Hidden Cost of 15 Unused Apps",
        "category": "Shopify · Audit",
        "geo": "US & EU",
        "keywords": "Shopify app audit, remove render blocking scripts, Shopify speed consultant"
    },
    {
        "title": "High-Converting Mobile Cart Drawers: 5 UX Rules for European Fashion Stores",
        "category": "Web Design · Mobile CRO",
        "geo": "UK, Germany & Netherlands",
        "keywords": "mobile slide cart UX, fashion e-commerce developer, custom liquid drawer cart"
    }
]

# Dutch specific high-converting viral topics (Nederland / Google.nl)
DUTCH_VIRAL_TOPICS = [
    {
        "title": "Shopify Snelheid Optimalisatie: Waarom Nederlandse Webwinkels 25% Omzet Verliezen aan Mobiele Laadtijd",
        "category": "Shopify · Snelheid Optimalisatie",
        "geo": "Nederland (Amsterdam, Rotterdam)",
        "keywords": "Shopify webshop sneller maken, Core Web Vitals groen krijgen, PageSpeed 90+ Nederland, iDEAL checkout snelheid",
        "lang": "nl"
    },
    {
        "title": "Mollie & iDEAL 2.0 Checkout Fouten: Hoe Los Je 'Mislukte Betaling' Bugs Op in WooCommerce & Shopify?",
        "category": "E-Commerce · iDEAL Reparatie",
        "geo": "Nederland",
        "keywords": "Mollie iDEAL betaling mislukt WooCommerce, webhook error iDEAL 2.0, checkout repareren webshop Nederland",
        "lang": "nl"
    },
    {
        "title": "Trage Webshop Versnellen in Nederland: 7 Stappen Naar Een 90+ Score op Google PageSpeed",
        "category": "Webshop Optimalisatie · Google.nl",
        "geo": "Nederland",
        "keywords": "trage WooCommerce webshop versnellen, Shopify app audit, LCP onder 1.5s, Nederlandse webwinkel developer",
        "lang": "nl"
    },
    {
        "title": "Waarom Amsterdamse Modemerken Overstappen van Trage Thema's naar Custom Shopify Liquid",
        "category": "Shopify · Maatwerk Development",
        "geo": "Amsterdam & Randstad",
        "keywords": "Shopify specialist Amsterdam, custom Liquid developer Nederland, boutique webshop redesign",
        "lang": "nl"
    },
    {
        "title": "Shopify Specialist vs Duur Amsterdams Bureau: Wat Is De Slimste Keuze Voor Groeiende Webshops?",
        "category": "E-Commerce Advies · Nederland",
        "geo": "Nederland",
        "keywords": "freelance Shopify developer inhuren, e-commerce bureau Amsterdam kosten, vaste prijs webshop optimalisatie",
        "lang": "nl"
    }
]

def generate_non_copyright_svg(title, category):
    """
    Generates a crisp, modern, 100% copyright-free SVG illustration
    matching the dark minimalist aesthetic of jaylakum.com.
    """
    palettes = [
        ("#1a1d24", "#6366f1", "#a855f7", "#38bdf8"),
        ("#161a22", "#10b981", "#06b6d4", "#3b82f6"),
        ("#1e1b2e", "#ec4899", "#8b5cf6", "#6366f1"),
        ("#18181b", "#f59e0b", "#ef4444", "#fbbf24")
    ]
    bg, c1, c2, c3 = random.choice(palettes)
    
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{bg}"/>
      <stop offset="100%" stop-color="#0a0c10"/>
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="{c1}"/>
      <stop offset="50%" stop-color="{c2}"/>
      <stop offset="100%" stop-color="{c3}"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="30" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <rect width="800" height="480" fill="url(#bgGrad)"/>
  
  <!-- Subtle Grid lines -->
  <g stroke="rgba(255,255,255,0.04)" stroke-width="1">
    <line x1="0" y1="80" x2="800" y2="80"/>
    <line x1="0" y1="160" x2="800" y2="160"/>
    <line x1="0" y1="240" x2="800" y2="240"/>
    <line x1="0" y1="320" x2="800" y2="320"/>
    <line x1="0" y1="400" x2="800" y2="400"/>
    <line x1="160" y1="0" x2="160" y2="480"/>
    <line x1="320" y1="0" x2="320" y2="480"/>
    <line x1="480" y1="0" x2="480" y2="480"/>
    <line x1="640" y1="0" x2="640" y2="480"/>
  </g>

  <!-- Glowing accent orb -->
  <circle cx="620" cy="140" r="120" fill="{c1}" opacity="0.18" filter="url(#glow)"/>
  <circle cx="200" cy="360" r="140" fill="{c2}" opacity="0.12" filter="url(#glow)"/>

  <!-- Code & Device UI Window -->
  <rect x="90" y="80" width="620" height="320" rx="16" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.1)" stroke-width="1.5"/>
  <rect x="90" y="80" width="620" height="42" rx="16" fill="rgba(255,255,255,0.03)"/>
  <circle cx="120" cy="101" r="5" fill="#ef4444" opacity="0.8"/>
  <circle cx="136" cy="101" r="5" fill="#f59e0b" opacity="0.8"/>
  <circle cx="152" cy="101" r="5" fill="#10b981" opacity="0.8"/>

  <!-- Speed Gauge / Code visual -->
  <path d="M 240 280 A 90 90 0 0 1 400 280" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="12" stroke-linecap="round"/>
  <path d="M 240 280 A 90 90 0 0 1 380 230" fill="none" stroke="url(#accentGrad)" stroke-width="12" stroke-linecap="round"/>
  <circle cx="320" cy="280" r="8" fill="{c3}"/>
  <line x1="320" y1="280" x2="365" y2="235" stroke="{c3}" stroke-width="4" stroke-linecap="round"/>

  <!-- Metric badges -->
  <rect x="440" y="160" width="220" height="46" rx="8" fill="rgba(16,185,129,0.1)" stroke="rgba(16,185,129,0.3)" stroke-width="1"/>
  <text x="456" y="188" fill="#10b981" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-size="14" font-weight="600">⚡ 98/100 Core Web Vitals</text>

  <rect x="440" y="222" width="220" height="46" rx="8" fill="rgba(99,102,241,0.1)" stroke="rgba(99,102,241,0.3)" stroke-width="1"/>
  <text x="456" y="250" fill="#818cf8" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-size="14" font-weight="600">🛒 Sub-1.2s Checkout Load</text>

  <rect x="440" y="284" width="220" height="46" rx="8" fill="rgba(245,158,11,0.1)" stroke="rgba(245,158,11,0.3)" stroke-width="1"/>
  <text x="456" y="312" fill="#fbbf24" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-size="14" font-weight="600">🌍 UK · US · Netherlands</text>

  <!-- Category & Title preview -->
  <text x="120" y="360" fill="url(#accentGrad)" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-size="12" font-weight="700" letter-spacing="1">{category.upper()}</text>
  <text x="120" y="380" fill="rgba(255,255,255,0.7)" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-size="13" font-weight="500">Jay Lakum · Senior Webshop Developer</text>
</svg>"""
    import base64
    encoded = base64.b64encode(svg.encode("utf-8")).decode("utf-8")
    return f"data:image/svg+xml;base64,{encoded}"

def call_gemini_api(api_key, topic_info):
    """
    Calls Google Gemini API (gemini-2.5-flash) to generate high-intent, technical,
    practical blog articles for store owners in US, UK, Netherlands and EU.
    """
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    
    is_dutch = topic_info.get("lang") == "nl"
    
    if is_dutch:
        prompt = f"""Je bent Jay Lakum, een freelance Shopify en WordPress/WooCommerce specialist die webshops repareert, versnelt en herontwerpt voor modemerken en webwinkels in Nederland (Amsterdam, Rotterdam, Utrecht, Den Haag).

Schrijf een diepgaand, technisch en praktisch blogartikel in natuurlijk, vloeiend Nederlands over het volgende onderwerp:
Onderwerp suggestie: {topic_info['title']}
Doelgroep & Regio: {topic_info.get('geo', 'Nederland')}
Focus Zoekwoorden: {topic_info.get('keywords', '')}
Categorie: {topic_info['category']}

Doelgroep: Nederlandse webwinkeliers, e-commerce managers en founders van fashion/cosmetica webshops. Ze balen van trage laadtijden, mislukte Mollie/iDEAL transacties of verouderde logge thema's.
Toon: Kalm, deskundig, nuchter, eerlijk en direct (geen AI-clichés of holle marketingpraat).

Lever je antwoord strikt als JSON object met de volgende keys:
{{
  "slug": "korte-url-vriendelijke-slug-onder-50-tekens",
  "title": "Aansprekende Nederlandse titel voor maximale CTR en Google ranking",
  "category": "{topic_info['category']}",
  "read": "4 min leestijd",
  "imageAlt": "Omschrijving van de illustratie",
  "excerpt": "Een krachtige 2-zinnen samenvatting die het probleem en de directe winst in laadtijd/omzet benadrukt.",
  "body": "HTML string met <h2>, <h3>, <p>, <strong>, <code>, <ul>, <li> tags. Bevat 4-5 praktische secties (PageSpeed analyse, Mollie webhook verificatie, apps saneren, iDEAL checkout optimalisatie) en sluit af met een vriendelijke Call to Action om contact op te nemen via het contactformulier op jaylakum.com/nl/ voor een gratis mini-audit."
}}

Antwoord UITSLUITEND met geldige JSON.
"""
    else:
        prompt = f"""You are Jay Lakum, a world-class freelance Shopify and WordPress/WooCommerce developer who fixes, speeds up, and redesigns online stores for high-end fashion and beauty brands in Europe (UK, Netherlands, Germany) and the US.

Write an in-depth, deeply practical, and authoritative technical blog article based on the following topic:
Title suggestion: {topic_info['title']}
Target Geography: {topic_info.get('geo', 'UK & EU')}
Focus Keywords: {topic_info.get('keywords', '')}
Category: {topic_info['category']}

Audience: Fashion, apparel, cosmetics, and boutique webshop founders, e-commerce directors, and store managers in London, Amsterdam, Berlin, and New York. They are discerning, non-technical to semi-technical, and care about lost revenue from slow speeds, buggy checkouts, or clunky designs.

Tone: Calm, authoritative, technical yet accessible, honest, and direct (similar to Paul Graham meets a seasoned principal engineer). Never use generic fluff, AI buzzwords ("In today's fast-paced digital world..."), or cliches.

Provide your response strictly as a JSON object with the following keys:
{{
  "slug": "url-friendly-slug-under-50-chars",
  "title": "Exact compelling title for maximum CTR and SEO",
  "category": "{topic_info['category']}",
  "read": "5 min read",
  "imageAlt": "Descriptive accessibility text for the article banner",
  "excerpt": "A punchy, informative 2-sentence summary that highlights the problem and the direct financial/speed win.",
  "body": "HTML string containing <h2>, <h3>, <p>, <strong>, <code>, <ul>, <li> tags. Must have 4-5 core sections detailing real diagnostics (PageSpeed Insights, network watermarks, database queries, liquid/PHP script conflicts), actionable step-by-step fixes, and a concluding section with a clear Call To Action directing store owners to contact Jay Lakum via the contact form on jaylakum.com for a free 24-hour mini-audit."
}}

Respond ONLY with valid JSON. Do not wrap in markdown quotes if possible, or use standard ```json blocks.
"""

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 3000,
            "responseMimeType": "application/json"
        }
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )

    try:
        with urllib.request.urlopen(req, timeout=60) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            raw_text = res_data["candidates"][0]["content"]["parts"][0]["text"]
            return json.loads(raw_text)
    except urllib.error.HTTPError as e:
        error_msg = e.read().decode("utf-8")
        print(f"Gemini API HTTP Error {e.code}: {error_msg}", file=sys.stderr)
        raise
    except Exception as e:
        print(f"Error calling Gemini: {e}", file=sys.stderr)
        raise

def update_index_html(html_path, article_data):
    """
    Inserts the new article object into the ARTICLES array in index.html.
    """
    with open(html_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Match ARTICLES = [
    match = re.search(r"var\s+ARTICLES\s*=\s*\[", content)
    if not match:
        raise ValueError("Could not find 'var ARTICLES = [' in index.html")

    insert_pos = match.end()

    # Format the JS article object
    month_year = datetime.now().strftime("%B %Y")
    
    # Format body lines for clean JS concatenation
    body_html = article_data.get("body", "").replace('"', '\\"')
    
    article_js = f"""
  {{
    slug: "{article_data['slug']}",
    title: "{article_data['title'].replace('"', '&quot;')}",
    category: "{article_data['category']}",
    date: "{month_year}",
    read: "{article_data.get('read', '5 min read')}",
    image: "{article_data['image']}",
    imageAlt: "{article_data.get('imageAlt', 'Technical web development guide')}",
    excerpt: "{article_data.get('excerpt', '').replace('"', '&quot;')}",
    body: "{body_html}"
  }},"""

    new_content = content[:insert_pos] + article_js + content[insert_pos:]

    with open(html_path, "w", encoding="utf-8") as f:
        f.write(new_content)

    print(f"Successfully added article '{article_data['title']}' to {html_path}")

def update_sitemap(sitemap_path, slug):
    """
    Adds the new blog post URL into sitemap.xml for Google/Bing indexing.
    """
    if not os.path.exists(sitemap_path):
        return

    with open(sitemap_path, "r", encoding="utf-8") as f:
        content = f.read()

    new_url_entry = f"""  <url>
    <loc>https://jaylakum.com/#blog/{slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>"""

    if "</urlset>" in content:
        content = content.replace("</urlset>", new_url_entry)
        with open(sitemap_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated {sitemap_path} with new article slug: {slug}")

def main():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key and len(sys.argv) > 1 and not sys.argv[1].startswith("--"):
        api_key = sys.argv[1]

    # Check for flag --key
    for i, arg in enumerate(sys.argv):
        if arg == "--key" and i + 1 < len(sys.argv):
            api_key = sys.argv[i + 1]

    # Check for --nl or --lang nl flag
    use_dutch = "--nl" in sys.argv or ("--lang" in sys.argv and "nl" in sys.argv)

    # Select topic
    if use_dutch:
        topic = random.choice(DUTCH_VIRAL_TOPICS)
    else:
        topic = random.choice(HIGH_INTENT_TOPICS)

    for i, arg in enumerate(sys.argv):
        if arg == "--topic" and i + 1 < len(sys.argv):
            topic = {
                "title": sys.argv[i + 1],
                "category": "Webshop Optimalisatie" if use_dutch else "Web Development",
                "geo": "Nederland" if use_dutch else "US, UK & Netherlands",
                "keywords": "shopify, woocommerce, snelheid, ideal, mollie",
                "lang": "nl" if use_dutch else "en"
            }

    print("=" * 60)
    print("🚀 Jay Lakum — Gemini Auto Blog Generator")
    print(f"🎯 Target Topic: {topic['title']}")
    print(f"🌍 Target Region: {topic.get('geo', 'Global')}")
    print("=" * 60)

    if not api_key:
        print("\n⚠️  No GEMINI_API_KEY found!")
        print("Run with: python3 generate_blog.py --key YOUR_GEMINI_API_KEY")
        print("Or export GEMINI_API_KEY='your-key-here'")
        print("Creating a sample high-intent article to demonstrate structure...")
        
        # Sample generated article when offline or API key pending
        slug = re.sub(r"[^a-z0-9]+", "-", topic["title"].lower()).strip("-")[:45]
        sample_svg = generate_non_copyright_svg(topic["title"], topic["category"])
        
        article_data = {
            "slug": slug,
            "title": topic["title"],
            "category": topic["category"],
            "read": "5 min read",
            "image": sample_svg,
            "imageAlt": f"Vector illustration showing web speed and e-commerce architecture for {topic['title']}",
            "excerpt": f"Why luxury and boutique stores in {topic.get('geo', 'the UK and EU')} lose up to 20% of their mobile sales to invisible performance bottlenecks — and the exact diagnostic fixes to apply today.",
            "body": f"<h2>1. The Real Cost of Sub-Second Latency in European E-Commerce</h2><p>When an online shopper in London or Amsterdam visits your store on a 4G connection, every 500ms delay adds friction. If a checkout page takes longer than 2.5 seconds to load, mobile bounce rates jump over 30%.</p><h2>2. Auditing Third-Party Scripts and Bloated Apps</h2><p>Most Shopify stores carry leftovers from apps installed two years ago. Each unused widget still executes JavaScript in the critical rendering path. Auditing and removing these scripts gives the fastest, cleanest speed lift without touching your visual layout.</p><h2>3. Checkout Reliability Across Currencies and Gateways</h2><p>Whether accommodating Dutch iDEAL, UK Apple Pay, or German Klarna, international payment gateways fail when caching layers cache dynamic session cookies. Ensure all cart and checkout endpoints bypass full-page caching completely.</p><h2>Need Your Store Speed Audited?</h2><p>If your webshop is losing customers to sluggish mobile speeds or checkout bugs, reach out through the contact form below. I reply within 24 hours with honest first thoughts and a free technical mini-audit of your store.</p>"
        }
        
        # Paths (Current directory where script runs + local fallbacks)
        current_dir = os.path.dirname(os.path.abspath(__file__))
        base_paths = [
            current_dir,
            "/Users/jay/Documents/GitHub/jaylakum",
            "/Applications/XAMPP/xamppfiles/htdocs/jaylakum"
        ]
        
        seen_paths = set()
        for p in base_paths:
            if not p or p in seen_paths:
                continue
            seen_paths.add(p)
            html_file = os.path.join(p, "index.html")
            sitemap_file = os.path.join(p, "sitemap.xml")
            if os.path.exists(html_file):
                update_index_html(html_file, article_data)
            if os.path.exists(sitemap_file):
                update_sitemap(sitemap_file, article_data["slug"])
        
        print("\n✅ Sample article created with 100% non-copyright SVG banner and published to index.html!")
        return

    print("🤖 Calling Google Gemini API to write full article...")
    article_data = call_gemini_api(api_key, topic)
    print(f"Generated Article: {article_data['title']}")

    # Generate copyright-free vector banner
    print("🎨 Generating clean non-copyright SVG illustration banner...")
    article_data["image"] = generate_non_copyright_svg(article_data["title"], article_data["category"])

    # Update HTML and Sitemap in both repositories / cPanel directory
    current_dir = os.path.dirname(os.path.abspath(__file__))
    base_paths = [
        current_dir,
        "/Users/jay/Documents/GitHub/jaylakum",
        "/Applications/XAMPP/xamppfiles/htdocs/jaylakum"
    ]

    seen_paths = set()
    for p in base_paths:
        if not p or p in seen_paths:
            continue
        seen_paths.add(p)
        html_file = os.path.join(p, "index.html")
        sitemap_file = os.path.join(p, "sitemap.xml")
        if os.path.exists(html_file):
            update_index_html(html_file, article_data)
        if os.path.exists(sitemap_file):
            update_sitemap(sitemap_file, article_data["slug"])

    print("\n🎉 Done! New blog post is live and ready to commit & push.")

if __name__ == "__main__":
    main()
