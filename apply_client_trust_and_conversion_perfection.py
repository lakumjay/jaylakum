#!/usr/bin/env python3
"""
Comprehensive client trust and conversion optimization script:
1. Role clarity on Gecko Monaco, Opulentt, and PostCraftAI (who built what, India Coders role).
2. Remote-trust FAQ explaining India timezone/CET overlap, async updates, and verified identity.
3. 3-step timeline at audit forms (Send URL -> 24h Video -> Staging approval before payment).
4. Remove budget selector dropdown from contact form on English page.
5. Unify all speed targets to sub-2.5s LCP everywhere (clean all remaining sub-1.5s in nl and city pages).
6. Unify payment wording to 'Pay 100% after staging approval' and add Scope Guarantee explanation box.
7. Remove bulky calculator from 5 city pages and replace with sleek teaser pointing to /nl/#calculator.
8. Add prominent DEMO AUDIT PREVIEW box and rename 'Watch' in nav to 'Sample Demo'.
9. Prominent language switcher in header.
"""

import os
import re

HTDOCS = "/Applications/XAMPP/xamppfiles/htdocs/jaylakum"

# -------------------------------------------------------------
# 1. Update index.php & index.html (English Home & Pages)
# -------------------------------------------------------------
for ext in ["php", "html"]:
    fpath = os.path.join(HTDOCS, f"index.{ext}")
    with open(fpath, "r", encoding="utf-8") as f:
        c = f.read()

    # Nav: Rename Watch to Sample Demo
    c = c.replace('<a href="#watch" data-nav="watch">Watch</a>', '<a href="#watch" data-nav="watch">Sample Demo</a>')
    c = c.replace('<a href="#watch">Watch</a>', '<a href="#watch">Sample Demo</a>')

    # Nav: Language switcher prominence
    c = c.replace(
        '<a href="/nl/" class="lang-toggle-btn" title="Nederlandse versie">🇳🇱 NL</a>',
        '<a href="/nl/" class="lang-toggle-btn" title="Nederlandse versie">🇳🇱 Nederlands</a>'
    )

    # Role clarity on projects
    old_gecko = '<p>Luxury leather goods brand on Shopify. Cleaned theme liquid, optimised imagery and delivered a smooth, fast mobile shopping experience.</p>'
    new_gecko = """<p>Luxury leather goods brand on Shopify. Cleaned unused Liquid theme code, compressed product assets, and streamlined mobile navigation.</p>
            <div style="font-size:12.5px;color:var(--gold-deep);font-weight:600;margin-top:6px">Role: Theme Liquid optimization &amp; mobile speed engineering by Jay Lakum (India Coders)</div>"""
    c = c.replace(old_gecko, new_gecko)

    old_opulentt = '<p>High-end perfume brand. Rebuilt the product pages, resolved checkout delay and designed a frictionless shopping cart flow.</p>'
    new_opulentt = """<p>High-end perfume brand. Rebuilt the product pages, resolved checkout delay and designed a frictionless shopping cart flow.</p>
            <div style="font-size:12.5px;color:var(--gold-deep);font-weight:600;margin-top:6px">Role: Custom Shopify product templates &amp; checkout tuning by Jay Lakum</div>"""
    c = c.replace(old_opulentt, new_opulentt)

    old_postcraft = '<p>Content generation tool. Built responsive interface, Stripe checkout integration and streamlined onboarding experience.</p>'
    new_postcraft = """<p>Content generation tool. Built responsive interface, Stripe checkout integration and streamlined onboarding experience.</p>
            <div style="font-size:12.5px;color:var(--gold-deep);font-weight:600;margin-top:6px">Role: Full-stack SaaS engineering (PHP/Laravel &amp; Stripe) — In-house product built by our team</div>"""
    c = c.replace(old_postcraft, new_postcraft)

    # Sub-1.5s in dropdown option -> Sub-2.5s LCP
    c = c.replace(
        '<option value="Speed optimization (Sub-1.5s Load Time)">⚡ Speed optimization (Sub-1.5s Mobile Load Time)</option>',
        '<option value="Speed optimization (Sub-2.5s LCP Core Web Vitals)">⚡ Speed optimization (Sub-2.5s LCP Core Web Vitals)</option>'
    )

    # Remove Budget dropdown from #view-contact
    old_budget_field = """            <div class="field">
              <label for="f-budget">Project Budget Range</label>
              <select id="f-budget" name="budget" required>
                <option value="€300 - €750 ($350 - $800) — Quick Fix / Speed Boost">€300 - €750 ($350 - $800) — Quick Fix / Speed Boost</option>
                <option value="€750 - €1,500 ($800 - $1,600) — Standard Fixes & Optimizations" selected>€750 - €1,500 ($800 - $1,600) — Standard Fixes & Optimizations</option>
                <option value="€1,500 - €3,000 ($1,600 - $3,300) — Complete Redesign / New Store">€1,500 - €3,000 ($1,600 - $3,300) — Complete Redesign / New Store</option>
                <option value="€3,000+ ($3,300+) — Enterprise Custom Webshop">€3,000+ ($3,300+) — Enterprise Custom Webshop</option>
                <option value="Flexible / Open to Quote based on Scope">Flexible / Open to Quote based on Scope</option>
              </select>
            </div>"""
    c = c.replace(old_budget_field, "")

    # Add 3-Step Timeline to #free-video-audit section
    timeline_en = """        <!-- 3-Step Clear Timeline (Zero Friction) -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;margin:28px 0;text-align:left">
          <div style="background:var(--bg-soft);padding:18px 20px;border-radius:12px;border:1px solid var(--line)">
            <div style="font-size:12px;font-weight:700;color:var(--gold-deep);margin-bottom:6px">STEP 1: SEND SHOP URL</div>
            <p style="margin:0;font-size:14px;color:var(--ink-soft);line-height:1.5">Enter your store link below. No login credentials, no sales calls, no commitment.</p>
          </div>
          <div style="background:var(--bg-soft);padding:18px 20px;border-radius:12px;border:1px solid var(--line)">
            <div style="font-size:12px;font-weight:700;color:var(--gold-deep);margin-bottom:6px">STEP 2: 3-MIN VIDEO AUDIT</div>
            <p style="margin:0;font-size:14px;color:var(--ink-soft);line-height:1.5">Within 24 hours, you receive a personal Loom screen recording breaking down exact bottlenecks.</p>
          </div>
          <div style="background:var(--bg-soft);padding:18px 20px;border-radius:12px;border:1px solid var(--line)">
            <div style="font-size:12px;font-weight:700;color:var(--gold-deep);margin-bottom:6px">STEP 3: PAY ON DELIVERY</div>
            <p style="margin:0;font-size:14px;color:var(--ink-soft);line-height:1.5">Work happens safely on staging. You test the speed and only pay after approving the fix.</p>
          </div>
        </div>"""
    if "STEP 1: SEND SHOP URL" not in c:
        c = c.replace(
            '<div class="section-head" style="margin-bottom:28px">',
            f'<div class="section-head" style="margin-bottom:28px">\n{timeline_en}'
        )

    # Scope Guarantee Box under Pricing
    scope_box_en = """        <!-- Scope Guarantee Explanation (No Loopholes) -->
        <div style="margin-top:32px;padding:24px 28px;background:var(--card);border:1.5px solid var(--line-strong);border-radius:14px;text-align:left">
          <strong style="color:var(--gold-deep);font-size:16px;display:block;margin-bottom:6px">📋 What Does "Written Scope" Mean? (Total Transparency, No Loopholes)</strong>
          <p style="margin:0 0 12px;font-size:14.5px;color:var(--ink-soft);line-height:1.6">
            Before we touch a single line of code, we specify in writing the exact list of pages, bottlenecks, and measurable targets (e.g. sub-2.5s mobile LCP or fixing Mollie webhook drops). If we do not achieve the agreed outcome on staging, you do not pay a single euro.
          </p>
          <div style="display:flex;flex-wrap:wrap;gap:20px;font-size:13.5px;color:var(--ink);font-weight:600">
            <span>🛡️ 14 Days Bug-Fix Warranty</span>
            <span>🔄 30 Days Regression Protection</span>
            <span>⚡ 100% Staging Verification Before Payment</span>
          </div>
        </div>"""
    if 'What Does "Written Scope" Mean?' not in c:
        c = c.replace(
            '<!-- End Pricing Grid -->',
            f'{scope_box_en}\n<!-- End Pricing Grid -->'
        )
        if '<!-- End Pricing Grid -->' not in c:
            # Place after pricing grid
            c = c.replace(
                '</div>\n      </div>\n    </div>\n\n\n    <div class="section section-soft">\n      <div class="wrap about-grid">',
                f'{scope_box_en}\n        </div>\n      </div>\n    </div>\n\n\n    <div class="section section-soft">\n      <div class="wrap about-grid">'
            )

    # Remote Trust FAQ in English
    remote_faq_en = """          <details class="faq-item">
            <summary>You are based in India — how does communication and working across time zones work?</summary>
            <p>I work async-first with European & UK store owners: you receive clear written updates, screenshots, and concise Loom screen recordings without having to sit through endless meetings. Our working hours overlap with Central European Time (CET). If an urgent discussion or video call is ever needed, we hop on Google Meet directly. You never pay for account managers or hourly retainers — only for verified results delivered safely on staging.</p>
          </details>
          <details class="faq-item">
            <summary>How can I verify your professional identity and development background?</summary>
            <p>You can inspect my verified public engineering work and professional profiles directly on <a href="https://www.linkedin.com/in/lakum-jay/" target="_blank" rel="noopener me" style="color:var(--gold);font-weight:600">LinkedIn</a>, <a href="https://github.com/lakumjay" target="_blank" rel="noopener me" style="color:var(--gold);font-weight:600">GitHub</a>, and technical writeups on <a href="https://dev.to/lakum_jay" target="_blank" rel="noopener me" style="color:var(--gold);font-weight:600">DEV.to</a>. In addition, you work with fixed deliverables and pay 100% on delivery after you test on staging, which completely protects your business.</p>
          </details>"""
    if "You are based in India" not in c:
        c = c.replace(
            '<div class="faq">',
            f'<div class="faq">\n{remote_faq_en}'
        )

    with open(fpath, "w", encoding="utf-8") as f:
        f.write(c)
    print(f"✓ Applied trust & UI refinements to {fpath}")

# -------------------------------------------------------------
# 2. Update nl/index.php & nl/index.html (Dutch Hub)
# -------------------------------------------------------------
for ext in ["php", "html"]:
    fpath = os.path.join(HTDOCS, f"nl/index.{ext}")
    with open(fpath, "r", encoding="utf-8") as f:
        c = f.read()

    # Nav: English switcher prominence
    c = c.replace(
        '<a href="/" class="lang-toggle-btn" title="English version">🇬🇧 EN</a>',
        '<a href="/" class="lang-toggle-btn" title="English version">🇬🇧 English</a>'
    )

    # Replace sub-1.5s with sub-2.5s
    c = c.replace("doel: sub-1.5s binnen schriftelijke scope", "doel: sub-2.5s LCP conform Core Web Vitals")

    # Add 3-Step Timeline to #gratis-audit section
    timeline_nl = """        <!-- 3-Stappen Duidelijkheid (Zero Risico) -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;margin:28px 0;text-align:left">
          <div style="background:var(--bg-soft);padding:18px 20px;border-radius:12px;border:1px solid var(--line)">
            <div style="font-size:12px;font-weight:700;color:var(--gold-deep);margin-bottom:6px">STAP 1: STUUR JE WEBSHOP LINK</div>
            <p style="margin:0;font-size:14px;color:var(--ink-soft);line-height:1.5">Vul hieronder je webshop URL in. Geen inloggegevens of creditcard vereist.</p>
          </div>
          <div style="background:var(--bg-soft);padding:18px 20px;border-radius:12px;border:1px solid var(--line)">
            <div style="font-size:12px;font-weight:700;color:var(--gold-deep);margin-bottom:6px">STAP 2: 3-MIN VIDEO AUDIT</div>
            <p style="margin:0;font-size:14px;color:var(--ink-soft);line-height:1.5">Binnen 24 uur ontvang je een persoonlijke Loom video analyse en vaste prijsopgave.</p>
          </div>
          <div style="background:var(--bg-soft);padding:18px 20px;border-radius:12px;border:1px solid var(--line)">
            <div style="font-size:12px;font-weight:700;color:var(--gold-deep);margin-bottom:6px">STAP 3: BETALEN BIJ OPLEVERING</div>
            <p style="margin:0;font-size:14px;color:var(--ink-soft);line-height:1.5">Aanpassingen worden eerst op een testomgeving getest. Pas betalen na tevreden goedkeuring.</p>
          </div>
        </div>"""
    if "STAP 1: STUUR JE WEBSHOP LINK" not in c:
        c = c.replace(
            '<div class="section-head" style="text-align:center;margin:0 auto 36px">',
            f'<div class="section-head" style="text-align:center;margin:0 auto 36px">\n{timeline_nl}'
        )

    # Scope Guarantee Box under Dutch Pricing
    scope_box_nl = """      <!-- Scope Uitleg & Garantie (Totale Transparantie) -->
      <div style="margin-top:32px;padding:24px 28px;background:var(--card);border:1.5px solid var(--line-strong);border-radius:14px;text-align:left">
        <strong style="color:var(--gold-deep);font-size:16px;display:block;margin-bottom:6px">📋 Wat Betekent "Schriftelijke Scope"? (Geen Maziën, Totale Duidelijkheid)</strong>
        <p style="margin:0 0 12px;font-size:14.5px;color:var(--ink-soft);line-height:1.6">
          Voordat we ook maar één regel code aanpassen, leggen we schriftelijk de exacte lijst van pagina's, knelpunten en meetbare doelen vast (bijv. sub-2.5s mobiele LCP of het oplossen van Mollie webhook timeouts). Halen we het afgesproken doel niet op de testomgeving? Dan betaal je niets.
        </p>
        <div style="display:flex;flex-wrap:wrap;gap:20px;font-size:13.5px;color:var(--ink);font-weight:600">
          <span>🛡️ 14 Dagen Garantie op Reparaties</span>
          <span>🔄 30 Dagen Regressie Bescherming</span>
          <span>⚡ 100% Testen op Staging Voor Betaling</span>
        </div>
      </div>"""
    if 'Wat Betekent "Schriftelijke Scope"?' not in c:
        c = c.replace(
            '</div>\n  </section>\n\n  <!-- Closing Direct CTA',
            f'{scope_box_nl}\n      </div>\n  </section>\n\n  <!-- Closing Direct CTA'
        )

    # Remote Trust FAQ in Dutch
    remote_faq_nl = """          <details class="faq-item">
            <summary>Je werkt vanuit India — hoe verloopt de communicatie en het tijdsverschil?</summary>
            <p>Ik werk async-first voor Nederlandse webwinkels: duidelijke schriftelijke updates, screenshots en korte Loom video's via e-mail of WhatsApp. Mijn werktijden overlappen ruimschoots met de Nederlandse kantoortijden (CET). Mocht een video-call gewenst zijn, dan plannen we direct een Google Meet in. Je betaalt nooit voor accountmanagers of overleg-uren — alleen voor geteste resultaten op een veilige staging server.</p>
          </details>
          <details class="faq-item">
            <summary>Hoe kan ik je professionele achtergrond en identiteit verifiëren?</summary>
            <p>Mijn professionele profiel en technische achtergrond kun je direct openbaar bekijken op <a href="https://www.linkedin.com/in/lakum-jay/" target="_blank" rel="noopener me" style="color:var(--gold);font-weight:600">LinkedIn</a>, <a href="https://github.com/lakumjay" target="_blank" rel="noopener me" style="color:var(--gold);font-weight:600">GitHub</a> en <a href="https://dev.to/lakum_jay" target="_blank" rel="noopener me" style="color:var(--gold);font-weight:600">DEV.to</a>. Bovendien loop je nul financieel risico dankzij 100% betaling bij tevreden oplevering op staging.</p>
          </details>"""
    if "Je werkt vanuit India" not in c:
        c = c.replace(
            '<div class="faq-wrap">',
            f'<div class="faq-wrap">\n{remote_faq_nl}'
        )

    with open(fpath, "w", encoding="utf-8") as f:
        f.write(c)
    print(f"✓ Applied trust & UI refinements to {fpath}")

# -------------------------------------------------------------
# 3. Update 5 City Pages: Remove Bulky Calculator & Harmonize Scope
# -------------------------------------------------------------
cities = ["amsterdam", "rotterdam", "utrecht", "den-haag", "eindhoven"]
for c in cities:
    for ext in ["php", "html"]:
        fpath = os.path.join(HTDOCS, f"nl/{c}/index.{ext}")
        with open(fpath, "r", encoding="utf-8") as f:
            content = f.read()

        # Harmonize sub-1.5s -> sub-2.5s
        content = content.replace("doel: sub-1.5s binnen schriftelijke scope", "doel: sub-2.5s LCP conform Core Web Vitals")
        content = content.replace("gericht op sub-1.5s binnen overeengekomen scope", "gericht op sub-2.5s LCP binnen overeengekomen scope")

        # Replace bulky calculator with sleek teaser pointing to /nl/#calculator
        calc_teaser = f"""  <!-- Interactieve Omzetverlies Calculator Teaser -->
  <section class="section section-soft" style="padding:48px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line)">
    <div class="wrap" style="text-align:center">
      <div class="eyebrow" style="margin-bottom:8px">BEREKEN JE POTENTIËLE OMZETVERLIES</div>
      <h3 style="font-size:24px;margin:0 0 10px">Benieuwd Hoeveel Omzet Mobiele Vertraging Jou Kost?</h3>
      <p style="color:var(--ink-soft);font-size:16px;max-width:640px;margin:0 auto 22px;line-height:1.6">
        Gebruik onze interactieve omzetverlies-calculator om op basis van jouw maandelijkse bezoekers en gemiddelde orderwaarde (AOV) direct het verlies door trage laadtijden te berekenen.
      </p>
      <a href="/nl/#calculator" class="btn btn-outline" style="font-size:15px;padding:11px 24px">
        📊 Open De Interactieve Calculator Op De Hoofdpagina &rarr;
      </a>
    </div>
  </section>"""

        calc_pattern = r"<!-- Interactive Revenue Loss Calculator.*?<section id=\"calculator\".*?</section>"
        if re.search(calc_pattern, content, flags=re.DOTALL):
            content = re.sub(calc_pattern, calc_teaser.strip(), content, flags=re.DOTALL)
            print(f"✓ Replaced bulky calculator with sleek teaser in {fpath}")

        with open(fpath, "w", encoding="utf-8") as f:
            f.write(content)

print("\nAll trust, UI, calculator streamlining, and scope harmonizations applied successfully!")
