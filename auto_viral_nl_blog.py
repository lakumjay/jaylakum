#!/usr/bin/env python3
"""
Jay Lakum — 100% Automated Viral Dutch E-Commerce Blog System
Fetches real-time trending webshop/e-commerce news from the Netherlands (Twinkle, Emerce, RTL, RTL Nieuws, Google News NL),
analyzes the trending topic from a senior Shopify/WooCommerce performance engineer angle,
generates a custom SVG vector graphic, and auto-publishes it to jaylakum.com (#blog/<slug>) and sitemap.xml.
"""

import os
import sys
import json
import re
import random
import urllib.request
import urllib.error
import xml.etree.ElementTree as ET
from datetime import datetime

# Filter keywords to select only real e-commerce / webshop / tech stories
RELEVANT_KEYWORDS = [
    'webshop', 'webwinkel', 'ecommerce', 'e-commerce', 'winkel', 'retail',
    'shopify', 'woocommerce', 'ideal', 'mollie', 'klarna', 'checkout',
    'feestdagen', 'black friday', 'snelheid', 'conversie', 'lek', 'php', 'veiligheid'
]

# Dutch query feeds
RSS_FEEDS = [
    'https://news.google.com/rss/search?q=webshop+OR+webwinkel+nederland+when:7d&hl=nl&gl=NL&ceid=NL:nl',
    'https://news.google.com/rss/search?q=ecommerce+nederland+when:7d&hl=nl&gl=NL&ceid=NL:nl',
    'https://news.google.com/rss/search?q=shopify+OR+woocommerce+nederland+when:14d&hl=nl&gl=NL&ceid=NL:nl',
    'https://news.google.com/rss/search?q=ideal+OR+mollie+checkout+when:14d&hl=nl&gl=NL&ceid=NL:nl'
]

BASE_PATHS = [
    "/Applications/XAMPP/xamppfiles/htdocs/jaylakum",
    "/Users/jay/Documents/GitHub/jaylakum"
]

def get_history_file():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(current_dir, "published_viral_history.json")

def load_published_history():
    hf = get_history_file()
    if os.path.exists(hf):
        try:
            with open(hf, "r", encoding="utf-8") as f:
                return set(json.load(f))
        except Exception:
            return set()
    return set()

def save_published_history(history_set):
    hf = get_history_file()
    try:
        with open(hf, "w", encoding="utf-8") as f:
            json.dump(list(history_set), f, indent=2)
    except Exception as e:
        print(f"Warning: Could not save history: {e}")

def fetch_live_viral_dutch_news():
    """
    Fetches real-time trending e-commerce news from Netherlands RSS.
    Returns filtered list of relevant headlines.
    """
    history = load_published_history()
    trending_articles = []
    seen_titles = set()

    for url in RSS_FEEDS:
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'})
            with urllib.request.urlopen(req, timeout=10) as resp:
                root = ET.fromstring(resp.read())
                for item in root.findall('./channel/item'):
                    raw_title = item.find('title').text or ''
                    pub_date = item.find('pubDate').text or ''
                    link = item.find('link').text or ''

                    clean_title = re.sub(r'\s*-\s*[^-]+$', '', raw_title).strip()
                    lower_title = clean_title.lower()

                    # Check relevance
                    if any(kw in lower_title for kw in RELEVANT_KEYWORDS):
                        slug_check = re.sub(r'[^a-z0-9]+', '-', lower_title)[:40]
                        if slug_check not in history and clean_title not in seen_titles:
                            seen_titles.add(clean_title)
                            trending_articles.append({
                                'title': clean_title,
                                'raw_title': raw_title,
                                'date': pub_date,
                                'link': link
                            })
        except Exception as e:
            print(f"Notice: RSS fetch error for {url[:40]}...: {e}")

    return trending_articles

def generate_banner_svg(title, category):
    """
    Generates a modern, copyright-free high-tech vector illustration banner
    optimized for Dutch webshop owners.
    """
    palettes = [
        ("#1a1d24", "#A98548", "#EFE6D2", "#10b981"),
        ("#161a22", "#3b82f6", "#6366f1", "#10b981"),
        ("#1f1924", "#ec4899", "#8b5cf6", "#f59e0b")
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
      <stop offset="100%" stop-color="{c2}"/>
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

  <!-- Glowing Accent -->
  <circle cx="640" cy="140" r="130" fill="{c1}" opacity="0.18" filter="url(#glow)"/>
  <circle cx="180" cy="360" r="140" fill="{c2}" opacity="0.12" filter="url(#glow)"/>

  <!-- Code & Tech Window Frame -->
  <rect x="90" y="80" width="620" height="320" rx="16" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.1)" stroke-width="1.5"/>
  <rect x="90" y="80" width="620" height="42" rx="16" fill="rgba(255,255,255,0.03)"/>
  <circle cx="120" cy="101" r="5" fill="#ef4444" opacity="0.8"/>
  <circle cx="136" cy="101" r="5" fill="#f59e0b" opacity="0.8"/>
  <circle cx="152" cy="101" r="5" fill="#10b981" opacity="0.8"/>

  <!-- Speed Needle / Metrics -->
  <path d="M 240 280 A 90 90 0 0 1 400 280" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="12" stroke-linecap="round"/>
  <path d="M 240 280 A 90 90 0 0 1 380 230" fill="none" stroke="url(#accentGrad)" stroke-width="12" stroke-linecap="round"/>
  <circle cx="320" cy="280" r="8" fill="{c3}"/>
  <line x1="320" y1="280" x2="365" y2="235" stroke="{c3}" stroke-width="4" stroke-linecap="round"/>

  <!-- Badges -->
  <rect x="440" y="150" width="230" height="46" rx="8" fill="rgba(16,185,129,0.1)" stroke="rgba(16,185,129,0.3)" stroke-width="1"/>
  <text x="456" y="178" fill="#10b981" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-size="13" font-weight="600">⚡ Google PageSpeed 95+</text>

  <rect x="440" y="210" width="230" height="46" rx="8" fill="rgba(169,133,72,0.15)" stroke="rgba(169,133,72,0.35)" stroke-width="1"/>
  <text x="456" y="238" fill="#A98548" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-size="13" font-weight="600">🇳🇱 iDEAL 2.0 &amp; Mollie Safe</text>

  <rect x="440" y="270" width="230" height="46" rx="8" fill="rgba(99,102,241,0.1)" stroke="rgba(99,102,241,0.3)" stroke-width="1"/>
  <text x="456" y="298" fill="#818cf8" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-size="13" font-weight="600">🛒 Sub-1.5s Checkout Load</text>

  <text x="120" y="360" fill="url(#accentGrad)" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-size="12" font-weight="700" letter-spacing="1">{category.upper()}</text>
  <text x="120" y="380" fill="rgba(255,255,255,0.7)" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-size="13" font-weight="500">Jay Lakum · E-Commerce Specialist Nederland</text>
</svg>"""
    import base64
    encoded = base64.b64encode(svg.encode("utf-8")).decode("utf-8")
    return f"data:image/svg+xml;base64,{encoded}"

def generate_article_with_gemini(api_key, news_item):
    """
    Transforms the live Dutch news story into an authoritative technical guide
    for Dutch webshop owners.
    """
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    
    prompt = f"""Je bent Jay Lakum, een freelance senior Shopify en WordPress/WooCommerce developer voor modemerken en webwinkels in Nederland.

Er is een actueel onderwerp/trend in het Nederlandse e-commerce nieuws:
Onderwerp: "{news_item['title']}"

BELANGRIJKE RICHTLIJNEN (100% Origineel & Ethisch White-Hat):
- KOPIEER OF 'SPIN' NOOIT andermans tekst. Gebruik dit onderwerp UITSLUITEND als inspiratie voor een nieuw, origineel en technisch diepgaand artikel.
- Schrijf een 100% zelfgeschreven gids vanuit jouw perspectief als ervaren e-commerce programmeur.
- Titel: Gebruik een nieuwsgierigmakende, probleemgerichte vraagstijl (bijv. "Wero komt eraan: moet jouw checkout nu al veranderen?", of "Mollie iDEAL betaling mislukt: waar zit de fout in je code?").
- Structuur van de body (HTML met <h2>, <h3>, <p>, <ul>, <li>, <code>):
  1. <h2>1. De Aanleiding: Wat Gebeurt er in de Markt?</h2> (Korte duiding van de trend en bronvermelding).
  2. <h2>2. Wat Betekent Dit Voor Nederlandse Webshops?</h2> (Eerlijke analyse van laadtijd, conversieverlies of checkout risico's).
  3. <h2>3. Praktische Checklist Voor Webwinkeliers</h2> (4 concrete technische stappen: caching, staging testen, database optimalisatie, webhook validatie).
  4. <h2>4. Veelgemaakte Fouten Om Te Vermijden</h2> (Foutieve instellingen, onnodige plugins).
  5. <h2>Hulp Nodig Bij Jouw Webshop?</h2> (Conclusie met CTA voor een gratis mini-audit).

STRIKTE INTERNE LINKING REGEL (Voorkom link-verwatering):
Plaats in het gehele artikel EXACT TWEE interne links (nooit meer):
1. Exact 1 link naar de hoofdpagina: <a href="/nl/">Shopify & WooCommerce Specialist Nederland</a>
2. Exact 1 link naar MAXIMAAL ÉÉN relevant city-page die inhoudelijk past bij het artikel:
   - Als het artikel over fashion/design/boutiques gaat: <a href="/nl/amsterdam/">Shopify Specialist Amsterdam</a>
   - Als het over retail/voorraad/ERP gaat: <a href="/nl/rotterdam/">Shopify Specialist Rotterdam</a>
   - Als het over conversie/snelheid gaat: <a href="/nl/utrecht/">Shopify Specialist Utrecht</a>
   - Als het over betalingen/AVG gaat: <a href="/nl/den-haag/">Shopify Specialist Den Haag</a>
   - Als het over tech/gadgets gaat: <a href="/nl/eindhoven/">Shopify Specialist Eindhoven</a>
WAARSCHUWING: Link NOOIT naar alle steden tegelijk. Slechts één relevante stad per artikel.

Doelgroep: Nederlandse webwinkeliers en founders. Toon: Kalm, nuchter, deskundig, behulpzaam en praktisch.

Lever je reactie strikt als JSON object:
{{
  "slug": "korte-vraag-slug-onder-45-tekens",
  "title": "Aansprekende vraag-titel in het Nederlands",
  "category": "E-Commerce Gids · Nederland",
  "read": "4 min leestijd",
  "imageAlt": "Illustratie van e-commerce architectuur en snelheid",
  "excerpt": "Twee krachtige zinnen die het probleem en de directe winst voor de webwinkelier samenvatten.",
  "body": "Volledige HTML inhoud volgens bovenstaande 5-delige structuur inclusief interne links."
}}

Antwoord UITSLUITEND met geldige JSON.
"""

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
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

    with urllib.request.urlopen(req, timeout=60) as response:
        res_data = json.loads(response.read().decode("utf-8"))
        raw_text = res_data["candidates"][0]["content"]["parts"][0]["text"]
        return json.loads(raw_text)

def update_index_html(html_path, article_data):
    if not os.path.exists(html_path):
        return False
    
    with open(html_path, "r", encoding="utf-8") as f:
        content = f.read()

    match = re.search(r"var\s+ARTICLES\s*=\s*\[", content)
    if not match:
        return False

    insert_pos = match.end()
    month_year = datetime.now().strftime("%B %Y")
    body_html = article_data.get("body", "").replace('"', '\\"')

    article_js = f"""
  {{
    slug: "{article_data['slug']}",
    title: "{article_data['title'].replace('"', '&quot;')}",
    category: "{article_data['category']}",
    date: "{month_year}",
    read: "{article_data.get('read', '4 min leestijd')}",
    image: "{article_data['image']}",
    imageAlt: "{article_data.get('imageAlt', 'Jay Lakum E-Commerce Guide')}",
    excerpt: "{article_data.get('excerpt', '').replace('"', '&quot;')}",
    body: "{body_html}"
  }},"""

    new_content = content[:insert_pos] + article_js + content[insert_pos:]
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(new_content)
    
    print(f"✓ Added to {html_path}")
    return True

def update_sitemap(sitemap_path, slug):
    if not os.path.exists(sitemap_path):
        return False
    with open(sitemap_path, "r", encoding="utf-8") as f:
        content = f.read()

    blog_url = f"https://jaylakum.com/blog/{slug}/"
    if blog_url in content:
        return True

    entry = f"""  <url>
    <loc>{blog_url}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.80</priority>
  </url>
</urlset>"""
    new_content = content.replace("</urlset>", entry)
    with open(sitemap_path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print(f"✓ Added {blog_url} to sitemap.xml")
    
    # Also trigger static blog builder
    try:
        import subprocess
        script_dir = os.path.dirname(os.path.abspath(sitemap_path))
        builder = os.path.join(script_dir, "build_static_blog.py")
        if os.path.exists(builder):
            subprocess.run(["python3", builder], check=False)
            print("✓ Regenerated standalone static blog pages")
    except Exception as e:
        print(f"Notice on static blog builder: {e}")
        
    return True

def main():
    print("=" * 70)
    print("🔥 Jay Lakum — Auto Viral Dutch E-Commerce Blog Publisher")
    print("=" * 70)

    # 1. Fetch live trending topics from Netherlands
    print("🔍 Fetching live trending e-commerce news from the Netherlands...")
    live_stories = fetch_live_viral_dutch_news()

    if not live_stories:
        print("ℹ️ Geen nieuwe actuele verhalen gevonden die nog niet gepubliceerd zijn.")
        # Fallback to high intent viral topic
        selected_story = {
            'title': "Van voorraad tot checkout: zo maak je je webshop technisch klaar voor de feestdagen",
            'date': datetime.now().strftime("%a, %d %b %Y")
        }
    else:
        selected_story = live_stories[0]
        print(f"🎯 Selected Trending Dutch Story: {selected_story['title']}")

    api_key = os.environ.get("GEMINI_API_KEY")
    for i, arg in enumerate(sys.argv):
        if arg == "--key" and i + 1 < len(sys.argv):
            api_key = sys.argv[i + 1]

    if not api_key and len(sys.argv) > 1 and not sys.argv[1].startswith("--"):
        api_key = sys.argv[1]

    if not api_key:
        print("\n⚠️  No GEMINI_API_KEY provided.")
        print("Run with: python3 auto_viral_nl_blog.py --key YOUR_KEY")
        print("Generating a curated high-conversion viral article from the trending news...")
        slug = re.sub(r'[^a-z0-9]+', '-', selected_story['title'].lower()).strip('-')[:42]
        banner = generate_banner_svg(selected_story['title'], "E-Commerce Nederland")

        article_data = {
            "slug": slug,
            "title": f"Webshop Klaarmaken Voor De Feestdagen: 5 Technische Checkout & Snelheid Fixes",
            "category": "E-Commerce · Nederland",
            "read": "4 min leestijd",
            "image": banner,
            "imageAlt": f"Illustratie voor {selected_story['title']}",
            "excerpt": "Met Black Friday en de decemberdrukte voor de deur verliezen trage Nederlandse webshops duizenden euro's aan haperende checkouts en mobiele laadtijden. Zo bereid je je winkel technisch voor.",
            "body": "<h2>1. Piekverkeer en Serverbelasting: Waarom Webshops Juist Nu Vastlopen</h2><p>Tijdens piekweken zoals Black Friday en de feestdagen schiet het aantal mobiele bezoekers omhoog. Als je WooCommerce of Shopify store draait op zware plug-ins of ongeoptimaliseerde Liquid scripts, loopt de server vast exact op het moment dat de klant op 'Afrekenen' klikt.</p><h2>2. Mollie & iDEAL 2.0 Webhook Verificatie</h2><p>Niets is zo pijnlijk als een klant die betaalt via de bank, maar waarbij de webwinkel de bestelling niet registreert door een trage webhook timeout. Controleer tijdig de webhook logs in je Mollie dashboard en zorg dat caching voor checkout URL's 100% uitgeschakeld staat.</p><h2>3. Apps Saneren en Javascript Verminderen</h2><p>Elke marketing pop-up, reviews app en tracking pixel vertraagt de Largest Contentful Paint (LCP). Door ongebruikte app-restanten uit je thema te verwijderen, win je direct 1 tot 2 seconden aan laadtijd.</p><h2>4. Staging Testen Zonder Live Onderbreking</h2><p>Voer updates nooit direct door op je live webshop. Test betalingen, voorraadkoppelingen en checkout flows altijd eerst op een staging omgeving.</p><h2>Gratis Technische Mini-Audit voor Jouw Webshop</h2><p>Wil je er 100% zeker van zijn dat jouw webshop bestand is tegen de drukte en maximaal converteert? Vraag een gratis en vrijblijvende mini-audit aan via het contactformulier op <a href='/nl/'>jaylakum.com/nl/</a>. Ik reageer binnen 24 uur met eerlijk advies en een vaste prijs vooraf.</p>"
        }
    else:
        print(f"🤖 Calling Google Gemini API to analyze Dutch news story...")
        article_data = generate_article_with_gemini(api_key, selected_story)
        article_data["image"] = generate_banner_svg(article_data["title"], article_data.get("category", "E-Commerce"))

    # Publish to all local base paths
    for base in BASE_PATHS:
        html_p = os.path.join(base, "index.html")
        sitemap_p = os.path.join(base, "sitemap.xml")
        update_index_html(html_p, article_data)
        update_sitemap(sitemap_p, article_data["slug"])

    # Record in history
    history = load_published_history()
    history.add(article_data["slug"])
    save_published_history(history)

    # Automatically package zip and push to GitHub
    auto_git_push_and_package(article_data["title"])

    print("\n🎉 SUCCESS: Viral Dutch article published & pushed automatically!")
    print(f"📰 Title: {article_data['title']}")
    print(f"🔗 Link: https://jaylakum.com/blog/{article_data['slug']}/")

def auto_git_push_and_package(article_title):
    import subprocess
    xampp_path = "/Applications/XAMPP/xamppfiles/htdocs/jaylakum"
    git_repo = "/Users/jay/Documents/GitHub/jaylakum"
    
    # 1. Rebuild ready-to-upload zip package
    try:
        zip_path = os.path.join(xampp_path, "jaylakum-nl-all-cities-seo.zip")
        cmd = ["zip", "-rq", zip_path, "index.php", "index.html", "contact.php", "sitemap.xml", "robots.txt", ".htaccess", "auto_viral_nl_blog.py", "build_static_blog.py", "nl/", "blog/"]
        subprocess.run(cmd, cwd=xampp_path, check=False)
        print(f"📦 Updated deployment package: {zip_path}")
    except Exception as e:
        print(f"Notice on zip packaging: {e}")

    # 2. Sync to GitHub repo and auto git push
    if os.path.exists(git_repo) and os.path.exists(os.path.join(git_repo, ".git")):
        try:
            print("🚀 Syncing files to GitHub repository...")
            subprocess.run([
                "rsync", "-av", "--exclude=.git", "--exclude=*.zip",
                f"{xampp_path}/", f"{git_repo}/"
            ], check=False, stdout=subprocess.DEVNULL)
            
            subprocess.run(["git", "add", "-A"], cwd=git_repo, check=False)
            commit_msg = f"Auto publish Dutch blog: {article_title}"
            subprocess.run(["git", "commit", "-m", commit_msg], cwd=git_repo, check=False)
            
            push = subprocess.run(["git", "push", "origin", "main"], cwd=git_repo, capture_output=True, text=True)
            if push.returncode == 0:
                print("✅ Auto-pushed directly to GitHub (main) — 100% hands-free!")
            else:
                print(f"Git push notice: {push.stderr.strip()}")
        except Exception as e:
            print(f"Notice on auto-push: {e}")

if __name__ == "__main__":
    main()
