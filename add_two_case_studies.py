#!/usr/bin/env python3
"""
Add two high-intent Dutch e-commerce case study blogs to jaylakum.com:
1. "Hoe los je een trage iDEAL / Mollie checkout op in WooCommerce & Shopify?"
   (Slug: mollie-ideal-checkout-storing-oplossen)
2. "5 Shopify apps die Nederlandse webshops vertragen (en hoe je achtergebleven Liquid code opruimt)"
   (Slug: shopify-apps-vertragen-webshop-liquid-opruimen)
"""

import os
import re
import json
import base64
from datetime import datetime

HTDOCS = "/Applications/XAMPP/xamppfiles/htdocs/jaylakum"
INDEX_HTML = os.path.join(HTDOCS, "index.html")
INDEX_PHP = os.path.join(HTDOCS, "index.php")
SITEMAP_XML = os.path.join(HTDOCS, "sitemap.xml")

def generate_svg_banner(badge1, badge2, title_short):
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">
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
  <rect x="110" y="120" width="180" height="36" rx="6" fill="rgba(212,175,103,0.12)" stroke="rgba(212,175,103,0.3)" stroke-width="1"/>
  <text x="125" y="143" fill="#D4AF67" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-size="12" font-weight="700" letter-spacing="1">{badge1}</text>
  <rect x="300" y="120" width="190" height="36" rx="6" fill="rgba(16,185,129,0.12)" stroke="rgba(16,185,129,0.3)" stroke-width="1"/>
  <text x="315" y="143" fill="#10B981" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-size="12" font-weight="700" letter-spacing="0.5">{badge2}</text>
  <text x="110" y="210" fill="#F5F2EB" font-family="Georgia,serif" font-size="26" font-weight="700">{title_short}</text>
  <text x="110" y="250" fill="#9C9485" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-size="15">Praktische technische gids voor Nederlandse webwinkels · Jay Lakum</text>
  <line x1="110" y1="290" x2="690" y2="290" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
  <text x="110" y="330" fill="url(#goldGrad)" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-size="13" font-weight="600">✓ Vaste prijs vooraf &middot; Direct contact met developer &middot; Geen uurtje-factuurtje</text>
</svg>"""
    return "data:image/svg+xml;base64," + base64.b64encode(svg.encode('utf-8')).decode('utf-8')

ARTICLES_TO_ADD = [
    {
        "slug": "mollie-ideal-checkout-storing-oplossen",
        "title": "Hoe los je een trage iDEAL / Mollie checkout op in WooCommerce &amp; Shopify?",
        "category": "WooCommerce &middot; iDEAL &amp; Mollie",
        "date": "October 2026",
        "read": "4 min leestijd",
        "badge1": "PAYMENT GATEWAY",
        "badge2": "✓ MOLLIE &amp; iDEAL 2.0",
        "title_short": "iDEAL &amp; Mollie Checkout Latency Fixen",
        "imageAlt": "Diagram van Mollie iDEAL webhook stroom en checkout optimalisatie",
        "excerpt": "Klant betaalt via de bank, maar de bestelling blijft op 'In behandeling' of 'Mislukt' staan? Dit is de technische oorzaak van webhook timeouts en zo los je het op.",
        "body": """<h2>Het Probleem: Betaling Geslaagd bij de Bank, Maar Geen Order in de Webshop</h2>
<p>Het is een van de meest frustrerende scenario's voor Nederlandse webwinkeliers: een klant kiest voor iDEAL (of Wero), autoriseert de betaling in de bank-app, het geld wordt afgeschreven, maar in WooCommerce blijft de orderstatus op <em>'In afwachting van betaling'</em> staan. De klant denkt dat de bestelling mislukt is en plaatst hem dubbel, of stuurt boos een e-mail naar de klantenservice.</p>

<h2>De Echte Technische Oorzaak: Webhook Timeouts</h2>
<p>In 90% van de gevallen ligt de schuld niet bij Mollie of de bank, maar bij server-side caching en trage webhook afhandeling:</p>
<ul>
  <li><strong>Agressieve Page Caching:</strong> Wanneer caching plugins (zoals WP Rocket, LiteSpeed Cache of Cloudflare) het endpoint <code>/?wc-api=WC_Gateway_Mollie</code> cachen, stuurt je server een verouderde HTTP 200 header terug zónder het PHP script uit te voeren. Mollie krijgt geen statusupdate binnen.</li>
  <li><strong>Synchronous Webhook Execution:</strong> Bij het ontvangen van de webhook probeert je webshop direct voorraad bij te werken, factuur-PDF's te genereren en drie bevestigingsmails te versturen. Als dit langer dan 10 seconden duurt, gooit Mollie een HTTP 504 Gateway Timeout en wordt de order niet gevalideerd.</li>
  <li><strong>Security Headers &amp; Firewall Blokkades:</strong> Strenge bot-protectie (Wordfence, Cloudflare Bot Fight Mode) die het IP-adres van Mollie aanziet voor verdacht verkeer en blokkeert met een 403 Forbidden.</li>
</ul>

<h2>Het 4-Stappen Stappenplan om Dit Definitief te Verhelpen</h2>
<ol>
  <li><strong>Mollie Webhooks Uitsluiten van Caching:</strong> Voeg <code>/wc-api/*</code> en <code>/checkout/*</code> toe aan de 'Never Cache URL's' lijst van je server en caching plugins.</li>
  <li><strong>IP Whitelist Activeren:</strong> Zorg dat de officiële IP-ranges van Mollie niet getriggerd worden door je firewall of Cloudflare WAF regels.</li>
  <li><strong>Asynchrone E-mail &amp; PDF Verwerking:</strong> Schakel achtergrondverwerking in via WooCommerce Action Scheduler, zodat de webhook binnen 200 milliseconden een 200 OK terugstuurt en e-mails op de achtergrond worden verzonden.</li>
  <li><strong>Mollie Dashboard Log Inspectie:</strong> Ga in je Mollie dashboard naar <em>Ontwikkelaars &gt; Webhooks</em> en inspecteer de exacte HTTP response codes (200, 403 of 500) van de laatste 24 uur.</li>
</ol>

<h2>Hulp Nodig bij een Haperende Kassa?</h2>
<p>Loopt jouw kassa vast of heb je last van onverklaarbare drop-offs bij iDEAL of creditcardbetalingen? Bekijk mijn <a href="/nl/">Shopify &amp; WooCommerce diensten in Nederland</a>. Ik inspecteer je webhook logs en serverconfiguratie, geef vooraf een vaste prijsopgave en los het probleem op zonder live onderbreking.</p>"""
    },
    {
        "slug": "shopify-apps-vertragen-webshop-liquid-opruimen",
        "title": "5 Shopify apps die Nederlandse webshops vertragen (en hoe je achtergebleven Liquid code opruimt)",
        "category": "Shopify &middot; Liquid &amp; Snelheid",
        "date": "October 2026",
        "read": "5 min leestijd",
        "badge1": "SHOPIFY THEME",
        "badge2": "⚡ SPEED AUDIT",
        "title_short": "Shopify App Bloat &amp; Spookcode Saneren",
        "imageAlt": "Illustratie van Shopify Liquid code inspectie en app scripts sanering",
        "excerpt": "Heb je apps verwijderd, maar voelt je Shopify webshop nog steeds traag? Waarom onzichtbare 'spookcode' in theme.liquid je mobiele PageSpeed keldert en hoe je dit opschoont.",
        "body": """<h2>Waarom Verwijderde Apps Je Webshop Nog Steeds Vertragen</h2>
<p>Veel Nederlandse Shopify winkels installeren in de loop der jaren tientallen apps: een review widget, een currency switcher, een pop-up voor nieuwsbrieven, een bundle app en een Instagram feed. Wat de meeste webwinkeliers niet weten: <strong>wanneer je een app verwijdert uit het Shopify admin paneel, verwijdert Shopify zelden de code die in je thema is geïnjecteerd.</strong></p>
<p>Deze achtergebleven Liquid snippets en externe JavaScript tags noemen we 'spookcode' (ghost scripts). Je browser probeert bij elk paginabezoek nog steeds verbinding te maken met niet-bestaande servers, wat leidt tot render-blocking vertragingen en een lage Largest Contentful Paint (LCP) score.</p>

<h2>De 5 Grootste Boosdoeners in Nederlandse Webshops</h2>
<ol>
  <li><strong>Oude Review Apps:</strong> Apps zoals Judge.me of Loox laden zware stylesheet- en fontbestanden vóórdat de producttitel zichtbaar is.</li>
  <li><strong>Meertaligheid &amp; Currency Switchers:</strong> Scripts die constant de wisselkoers ophalen, zelfs als je alleen binnen Nederland en België verkoopt.</li>
  <li><strong>Social Media &amp; Instagram Feeds:</strong> Externe widgets die 15+ ongecomprimeerde afbeeldingen en zware tracking libraries laden.</li>
  <li><strong>Marketing Pop-ups &amp; Sticky Banners:</strong> Zware jQuery libraries die op mobiele 4G verbindingen voor 1.5 tot 2 seconden layout shifts (CLS) zorgen.</li>
  <li><strong>Verouderde Tracking Pixels:</strong> Dubbele Google Analytics, TikTok en Meta pixels die niet via Google Tag Manager of Shopify Web Pixels API lopen.</li>
</ol>

<h2>Hoe Je Spookcode Veilig Opschoont (Zonder Je Winkel te Breken)</h2>
<ul>
  <li><strong>Dupliceer Eerst Altijd Je Thema:</strong> Voer nooit wijzigingen direct door op je live thema. Werk in een draft thema om veilig te testen.</li>
  <li><strong>Controleer <code>theme.liquid</code>:</strong> Zoek naar <code>{% include %}</code> of <code>{% render %}</code> tags met namen van apps die je al maanden geleden hebt gedeactiveerd.</li>
  <li><strong>Inspecteer de <code>assets/</code> en <code>snippets/</code> mappen:</strong> Verwijder overbodige <code>.js</code> en <code>.liquid</code> bestanden die niet meer worden aangeroepen.</li>
  <li><strong>Migreer Naar Shopify Online Store 2.0 App Blocks:</strong> Gebruik moderne apps die met App Blocks werken. Deze worden namelijk wél 100% automatisch en schoon verwijderd zodra je de app de-installeert.</li>
</ul>

<h2>Direct Hulp Nodig van een Shopify Specialist?</h2>
<p>Werk je aan een boutique webshop of modebrand in de Randstad? Bekijk mijn aanpak als <a href="/nl/amsterdam/">Shopify specialist in Amsterdam</a> en de rest van Nederland. Stuur me een berichtje met je webshop URL via <a href="/nl/">jaylakum.com/nl/</a> voor een gratis, vrijblijvende code scan.</p>"""
    }
]

def main():
    print("🚀 Publishing 2 new high-intent Dutch case-study blogs...")
    
    # 1. Update index.html and index.php ARTICLES array
    with open(INDEX_HTML, "r", encoding="utf-8") as f:
        html_content = f.read()

    match = re.search(r"var\s+ARTICLES\s*=\s*\[", html_content)
    if not match:
        print("Could not find ARTICLES in index.html")
        return

    insert_pos = match.end()
    
    js_blocks = []
    for art in ARTICLES_TO_ADD:
        banner = generate_svg_banner(art["badge1"], art["badge2"], art["title_short"])
        art["image"] = banner
        body_escaped = art["body"].replace('"', '\\"').replace('\n', ' ')
        
        js_code = f"""
  {{
    slug: "{art['slug']}",
    title: "{art['title']}",
    category: "{art['category']}",
    date: "{art['date']}",
    read: "{art['read']}",
    image: "{banner}",
    imageAlt: "{art['imageAlt']}",
    excerpt: "{art['excerpt']}",
    body: "{body_escaped}"
  }},"""
        js_blocks.append(js_code)

    all_js = "".join(js_blocks)
    
    # Only insert if not already present
    if ARTICLES_TO_ADD[0]["slug"] not in html_content:
        new_html = html_content[:insert_pos] + all_js + html_content[insert_pos:]
        with open(INDEX_HTML, "w", encoding="utf-8") as f:
            f.write(new_html)
        print("✓ Added articles to index.html")
        
        # Sync to index.php as well
        with open(INDEX_PHP, "w", encoding="utf-8") as f:
            f.write(new_html)
        print("✓ Synced articles to index.php")
    else:
        print("ℹ️ Articles already present in index.html/php")

    # 2. Update sitemap.xml
    with open(SITEMAP_XML, "r", encoding="utf-8") as f:
        sitemap_content = f.read()

    sitemap_entries = ""
    for art in ARTICLES_TO_ADD:
        url = f"https://jaylakum.com/blog/{art['slug']}/"
        if url not in sitemap_content:
            sitemap_entries += f"""  <url>
    <loc>{url}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.80</priority>
  </url>
"""

    if sitemap_entries:
        new_sitemap = sitemap_content.replace("</urlset>", sitemap_entries + "</urlset>")
        with open(SITEMAP_XML, "w", encoding="utf-8") as f:
            f.write(new_sitemap)
        print("✓ Added new blog URLs to sitemap.xml")
    else:
        print("ℹ️ Blog URLs already present in sitemap.xml")

    # 3. Trigger build_static_blog.py to generate standalone .html and .php pages
    import subprocess
    subprocess.run(["python3", os.path.join(HTDOCS, "build_static_blog.py")], check=True)
    print("✓ Regenerated all standalone blog pages (.html and .php)")

if __name__ == "__main__":
    main()
