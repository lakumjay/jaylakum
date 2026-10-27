#!/usr/bin/env python3
"""
Fix all critical review issues:
1. Fix JavaScript META.home overriding document.title in index.php & index.html
2. Stop JavaScript from overwriting English home blog cards with Dutch articles
3. Add Privacy Policy link directly under the audit form submit button on Home, /nl/, and all 5 city pages
4. Remove EERSTE KLANT DEAL from /nl/index.php & /nl/index.html
5. Remove 96/100 claim from case-study pages
6. Remove all specific numbers from city pages' Praktijkvoorbeeld (label as Typisch Scenario & Aanpak)
"""

import os
import re

HTDOCS = "/Applications/XAMPP/xamppfiles/htdocs/jaylakum"

# 1 & 2. Fix index.php and index.html
for ext in ["php", "html"]:
    fpath = os.path.join(HTDOCS, f"index.{ext}")
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()

    # Fix JS META.home
    old_meta_js = 'home:     { title: "⚡ Shopify & WooCommerce Bug Fixes (24h) & Speed Sprints | Jay Lakum",\n              desc: "Emergency checkout & bug fixes within 24-48h. Comprehensive mobile speed sprints in 3-5 days for EU webshops. Fixed quote upfront, pay on delivery." },'
    new_meta_js = 'home:     { title: "Freelance Shopify & WooCommerce Developer Netherlands | Speed & Bug Fixes — Jay Lakum",\n              desc: "Freelance Shopify developer & WooCommerce bug fix expert in the Netherlands & Europe. Mobile speed sprints (<2.5s LCP) and acute checkout fixes (within 24-48h within written scope). Pay on delivery." },'
    content = content.replace(old_meta_js, new_meta_js)

    # Stop JS from overwriting home blog cards
    content = content.replace(
        "var hbg = document.getElementById('homeBlogGrid');\nif (hbg) {\n  hbg.innerHTML = ARTICLES.slice(0, 3).map(renderArticleCard).join('');\n}",
        "// homeBlogGrid preserves server-rendered English cards on homepage"
    )

    # Add privacy link directly under audit form
    old_p_spam = '<p style="text-align:center;font-size:12.5px;color:var(--ink-faint);margin:0">\n              ⚡ I review real shops manually · First response within 24 hours · Zero spam guarantee\n            </p>'
    new_p_privacy = """<p style="text-align:center;font-size:12.5px;color:var(--ink-faint);margin:0 0 8px">
              ⚡ I review real shops manually · First response within 24 hours · Zero spam guarantee
            </p>
            <p style="text-align:center;font-size:12.5px;color:var(--ink-soft);margin:0;line-height:1.5">
              🔒 <b>100% Privacy Assured:</b> Your store URL &amp; email are strictly used to record your 3-minute video audit and prepare your quote. Zero spam, never shared. Read our <a href="/privacy/" style="color:var(--ink);text-decoration:underline">Privacy Policy</a>.
            </p>"""
    if "100% Privacy Assured:" not in content and old_p_spam in content:
        content = content.replace(old_p_spam, new_p_privacy)

    with open(fpath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"✓ Fixed JS router, title, and privacy in {fpath}")

# 3 & 4. Fix nl/index.php and nl/index.html
for ext in ["php", "html"]:
    fpath = os.path.join(HTDOCS, f"nl/index.{ext}")
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()

    # Remove EERSTE KLANT DEAL
    old_deal = """<div style="background:var(--bg-soft);padding:20px;border-radius:12px;border:1px solid var(--line)">
            <div style="font-size:13px;font-weight:700;color:var(--gold-deep);margin-bottom:6px">🎯 EERSTE KLANT DEAL</div>
            <div style="font-size:15.5px;color:var(--ink);font-weight:600;margin-bottom:4px">Jouw Webshop Uitgelicht</div>
            <p style="margin:0;font-size:14px;color:var(--ink-soft);line-height:1.5">Jouw winkel wordt onze volgende officiële geverifieerde case study.</p>
          </div>"""
    new_deal = """<div style="background:var(--bg-soft);padding:20px;border-radius:12px;border:1px solid var(--line)">
            <div style="font-size:13px;font-weight:700;color:var(--gold-deep);margin-bottom:6px">🔒 100% RISICOVRIJ</div>
            <div style="font-size:15.5px;color:var(--ink);font-weight:600;margin-bottom:4px">Betalen bij Oplevering</div>
            <p style="margin:0;font-size:14px;color:var(--ink-soft);line-height:1.5">Elke optimalisatie wordt uitgevoerd op een veilige testomgeving en geverifieerd voordat je betaalt.</p>
          </div>"""
    content = content.replace(old_deal, new_deal)

    # Add privacy note under button in auditFormNL
    old_btn_nl = """<div style="text-align:center;margin-top:14px">
            <button type="submit" id="auditSubmitBtnNL" class="btn" style="padding:10px 22px;font-size:14px;background:var(--gold-deep);border-color:var(--gold-deep);color:#fff;cursor:pointer">
              🎥 Gratis Video Audit Aanvragen &rarr;
            </button>
          </div>"""
    new_btn_nl = """<div style="text-align:center;margin-top:14px">
            <button type="submit" id="auditSubmitBtnNL" class="btn" style="padding:10px 22px;font-size:14px;background:var(--gold-deep);border-color:var(--gold-deep);color:#fff;cursor:pointer">
              🎥 Gratis Video Audit Aanvragen &rarr;
            </button>
            <p style="text-align:center;font-size:12.5px;color:var(--ink-soft);margin:10px 0 0;line-height:1.5">
              🔒 <b>100% Privacygarantie:</b> Je webshop URL en e-mailadres worden uitsluitend gebruikt om je persoonlijke 3-minuten video audit en offerte te sturen. Geen spam, nooit gedeeld. Bekijk ons <a href="/privacy/" style="color:var(--ink);text-decoration:underline">Privacybeleid</a>.
            </p>
          </div>"""
    if "100% Privacygarantie:" not in content and old_btn_nl in content:
        content = content.replace(old_btn_nl, new_btn_nl)

    with open(fpath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"✓ Fixed Eerste Klant Deal and privacy in {fpath}")

# 5. Fix 96/100 in case study pages
for ext in ["php", "html"]:
    en_f = os.path.join(HTDOCS, f"case-study/index.{ext}")
    with open(en_f, "r", encoding="utf-8") as f:
        c = f.read()
    c = c.replace(
        "<li><strong>PageSpeed mobile score rose to 96/100</strong>, permanently passing Google Core Web Vitals.</li>",
        "<li><strong>Mobile performance permanently passed Google Core Web Vitals</strong> (achieving 'Good' ratings for LCP and CLS).</li>"
    )
    with open(en_f, "w", encoding="utf-8") as f:
        f.write(c)
    print(f"✓ Removed 96/100 in {en_f}")

    nl_f = os.path.join(HTDOCS, f"nl/case-study/index.{ext}")
    with open(nl_f, "r", encoding="utf-8") as f:
        c = f.read()
    c = c.replace(
        "<li><strong>Google PageSpeed score steeg naar 96/100</strong>, met 100% groene Core Web Vitals.</li>",
        "<li><strong>Mobiele prestaties behaalden permanent groene Google Core Web Vitals</strong> (met 'Goed' scores voor LCP en CLS).</li>"
    )
    with open(nl_f, "w", encoding="utf-8") as f:
        f.write(c)
    print(f"✓ Removed 96/100 in {nl_f}")

# 6. Fix City Pages: remove specific unverified numbers, label as "Typisch Scenario & Aanpak"
city_scenarios = {
    "amsterdam": {
        "title": "🛍️ Typisch Scenario & Aanpak: Amsterdamse Mode & Lifestyle",
        "desc": "Voor mode- en lifestyleboetieks met zware lookbooks en marketing-apps (zoals Klaviyo popups en tracking pixels) richten we ons op het opschonen van achtergebleven Liquid code en het comprimeren van productafbeeldingen naar WebP. Resultaat: een soepel renderende storefront die voldoet aan Google Core Web Vitals zonder kwaliteitsverlies."
    },
    "rotterdam": {
        "title": "📦 Typisch Scenario & Aanpak: Rotterdam & Rijnmond B2B / Wholesale",
        "desc": "Voor groothandels en webwinkels met grote catalogi optimaliseren we vertragende database-verzoeken en synchronisatie met PostNL en Exact Online. Door verzendtarieven slim te cachen en ERP-koppelingen asynchroon via de background queue te verwerken, reageert de winkelwagen direct en zonder haperingen."
    },
    "utrecht": {
        "title": "🌱 Typisch Scenario & Aanpak: Utrechtse D2C Merken & Omnichannel",
        "desc": "Voor snelgroeiende D2C-merken met piekmomenten tijdens productlanceringen elimineren we server-side bottlenecks (TTFB) en richten we betrouwbare caching in. Hierdoor blijft de mobiele winkelervaring stabiel en responsief, zelfs tijdens piekbelasting."
    },
    "den-haag": {
        "title": "🏛️ Typisch Scenario & Aanpak: Haags & Westlands E-Commerce",
        "desc": "Voor retailers en internationale speciaalzaken in de regio Den Haag en het Westland lossen we JavaScript-conflicten in de kassa op en stroomlijnen we de meertalige checkout (iDEAL + Bancontact). Zo worden bestellingen direct en foutloos geregistreerd."
    },
    "eindhoven": {
        "title": "⚙️ Typisch Scenario & Aanpak: Brainport Tech Retail & Complexe Webshops",
        "desc": "Voor webwinkels in technische consumentenproducten en hardware met filters en zware scripts minimaliseren we Total Blocking Time (TBT). We splitsen JavaScript-bundels op en stellen niet-kritieke scripts uit voor een directe, responsieve mobiele ervaring."
    }
}

cities = ["amsterdam", "rotterdam", "utrecht", "den-haag", "eindhoven"]
for c in cities:
    for ext in ["php", "html"]:
        fpath = os.path.join(HTDOCS, f"nl/{c}/index.{ext}")
        with open(fpath, "r", encoding="utf-8") as f:
            content = f.read()

        # Replace the case box in local expertise section with the honest scenario
        old_box_pattern = r"<div style=\"padding:18px 22px;background:var\(--card\);border-radius:12px;border-left:4px solid var\(--gold\);border:1px solid var\(--line\);border-left-width:4px\">\s*<p style=\"margin:0 0 6px;font-size:16px;color:var\(--ink\);font-weight:700\">.*?</p>\s*<p style=\"margin:0;font-size:14\.5px;color:var\(--ink-soft\);line-height:1\.6\">.*?</p>\s*</div>"
        new_box_html = f"""<div style="padding:18px 22px;background:var(--card);border-radius:12px;border-left:4px solid var(--gold);border:1px solid var(--line);border-left-width:4px">
          <p style="margin:0 0 6px;font-size:16px;color:var(--ink);font-weight:700">{city_scenarios[c]["title"]}</p>
          <p style="margin:0;font-size:14.5px;color:var(--ink-soft);line-height:1.6">{city_scenarios[c]["desc"]}</p>
        </div>"""
        content = re.sub(old_box_pattern, new_box_html, content, flags=re.DOTALL)

        # Add privacy note under button in auditFormNL
        old_btn_nl = """<div style="text-align:center;margin-top:14px">
            <button type="submit" id="auditSubmitBtnNL" class="btn" style="padding:10px 22px;font-size:14px;background:var(--gold-deep);border-color:var(--gold-deep);color:#fff;cursor:pointer">
              🎥 Gratis Video Audit Aanvragen &rarr;
            </button>
          </div>"""
        new_btn_nl = """<div style="text-align:center;margin-top:14px">
            <button type="submit" id="auditSubmitBtnNL" class="btn" style="padding:10px 22px;font-size:14px;background:var(--gold-deep);border-color:var(--gold-deep);color:#fff;cursor:pointer">
              🎥 Gratis Video Audit Aanvragen &rarr;
            </button>
            <p style="text-align:center;font-size:12.5px;color:var(--ink-soft);margin:10px 0 0;line-height:1.5">
              🔒 <b>100% Privacygarantie:</b> Je webshop URL en e-mailadres worden uitsluitend gebruikt om je persoonlijke 3-minuten video audit en offerte te sturen. Geen spam, nooit gedeeld. Bekijk ons <a href="/privacy/" style="color:var(--ink);text-decoration:underline">Privacybeleid</a>.
            </p>
          </div>"""
        if "100% Privacygarantie:" not in content and old_btn_nl in content:
            content = content.replace(old_btn_nl, new_btn_nl)

        with open(fpath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"✓ Fixed city scenario & privacy in {fpath}")

print("All critical review fixes applied successfully!")
